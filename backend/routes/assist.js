const express = require("express");
const multer = require("multer");
const router = express.Router();

const { buildContext } = require("../services/context");
const { detectLanguages, interpretForMainLanguage } = require("../services/language");
const { detectEnvironment } = require("../services/environment");
const { scoreSupportMode } = require("../services/scorer");
const {
  readMemory,
  writeMemoryEvent,
  writeCareEvent,
  findRelevantMemories,
} = require("../services/memory");
const { generateSupportResponse } = require("../services/ollama");
const { textToSpeech, speechToText } = require("../services/elevenlabs");
const hume = require("../services/hume");
const { analyzeBehaviorSignals } = require("../services/behavior-detector");
const { notifyFamilyIfNeeded } = require("../services/caregiver-alerts");
const { evaluateEscalation } = require("../services/escalation-manager");
const {
  detectPersonQuery,
  detectActivityQuery,
  findPerson,
  findEpisodicMemories,
  saveEpisodicMemory,
  isAvailable: memoryAvailable
} = require("../services/people-memory");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
});

router.post("/", async (req, res) => {
  try {
    const result = await runAssistFlow(req.body || {}, req.app);
    return res.json(result);
  } catch (error) {
    console.error("Assist route error:", error);
    return res.status(500).json({
      error: "Something went wrong while generating support.",
    });
  }
});

router.post("/voice", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "No audio file received.",
      });
    }

    const bodyPayload = safeJsonParse(req.body.payload, {});
    const mimeType = req.file.mimetype || "audio/webm";

    const [transcriptResult, humeEmotion] = await Promise.all([
      speechToText(req.file.buffer, mimeType).catch((error) => {
        console.warn("ElevenLabs STT failed:", error.message);
        return null;
      }),
      hume
        .analyzeAudio(req.file.buffer, mimeType)
        .catch((error) => {
          console.warn("Hume audio analysis failed:", error.message);
          return null;
        })
    ]);

    if (!transcriptResult || !transcriptResult.text) {
      return res.status(503).json({
        error: "Voice transcription unavailable. Please check your ElevenLabs API key or type your message instead.",
      });
    }

    const transcript = transcriptResult;

    const body = {
      ...bodyPayload,
      signals: {
        ...(bodyPayload.signals || {}),
        speechText: transcript.text,
        humeEmotion,
        spokenLanguage:
          bodyPayload?.signals?.spokenLanguage ||
          transcript.language_code ||
          bodyPayload?.profile?.mainLanguage ||
          "English",
      },
    };

    const result = await runAssistFlow(body, req.app);

    return res.json({
      ...result,
      transcript: transcript.text,
      transcript_language_code: transcript.language_code,
    });
  } catch (error) {
    console.error("Voice assist route error:", error);
    return res.status(500).json({
      error: "Something went wrong while processing voice.",
    });
  }
});

async function runAssistFlow(body, app) {
  const profile = body.profile || {};
  const signals = body.signals || {};

  const humeEmotion =
    signals.humeEmotion ||
    (signals.capturedImage
      ? await hume
          .analyzeImage(signals.capturedImage)
          .catch((error) => {
            console.warn("Hume image analysis failed:", error.message);
            return null;
          })
      : null);

  const behaviorAnalysis = analyzeBehaviorSignals({
    speechText: signals.speechText,
    signals,
    humeEmotion
  });

  const escalation = evaluateEscalation({
    profile,
    signals,
    behaviorAnalysis
  });

  const context = buildContext({
    profile,
    signals: {
      ...signals,
      humeEmotion,
      behaviorAnalysis,
      escalation,
      conversationState: {
        ...(signals.conversationState || {}),
        stage: escalation.stage,
        escalationStage: escalation.stage,
        shouldSpeak: escalation.shouldSpeak,
        shouldWait: escalation.shouldWait,
        shouldAlertCaregiver: escalation.shouldAlertCaregiver,
        gemmaContext: escalation.gemmaContext
      }
    }
  });

  const languageInfo = detectLanguages({
    mainLanguage: context.mainLanguage,
    spokenLanguage: context.spokenLanguage,
    speechText: context.speechText,
  });

  const environment = detectEnvironment(context);

  const scored = scoreSupportMode({
    speechText: context.speechText,
    speakerRole: context.speakerRole,
    timeOfDay: context.timeOfDay,
    environment,
    lastEvent: context.lastEvent,
  });

  const memories = readMemory();
  const relevantMemories = findRelevantMemories({
    memories,
    userName: context.userName,
    speechText: context.speechText,
    locationName: context.locationName,
    nearbyPerson: context.nearbyPerson,
  });

  const interpretedText = interpretForMainLanguage({
    speechText: context.speechText,
    spokenLanguage: languageInfo.detectedLanguage,
    mainLanguage: languageInfo.interpretedLanguage,
    speakerRole: context.speakerRole,
  });

  // ── People memory: "Who is Anna?" / "What was I doing?" ───────────────────
  let personResult = null;
  let activityMemories = [];

  if (memoryAvailable() && context.speechText) {
    const personName = detectPersonQuery(context.speechText);
    if (personName) {
      personResult = await findPerson(context.userName, personName).catch(() => null);
    }

    if (detectActivityQuery(context.speechText)) {
      activityMemories = await findEpisodicMemories(context.userName, "", 5).catch(() => []);
    }
  }

  // Inject person info into context so Gemma 4 knows who they are
  if (personResult) {
    context.personQueryResult = personResult;
    const desc = [
      personResult.name,
      personResult.relationship ? `(${personResult.relationship})` : "",
      personResult.notes || ""
    ].filter(Boolean).join(" — ");
    context.nearbyPerson = desc;
  }

  if (activityMemories.length) {
    context.activityMemories = activityMemories;
  }

  const aiResult = await generateSupportResponse({
    context,
    environment,
    scored,
    relevantMemories,
    interpretedText,
    languageInfo,
  });

  const speechOutputText = aiResult.companion_message ||
    [aiResult.response.reassurance, aiResult.response.next_step]
      .filter(Boolean)
      .join(" ");

  let audioBase64 = null;

  try {
    audioBase64 = await textToSpeech(speechOutputText);
  } catch (error) {
    console.warn("ElevenLabs voice failed:", error.message);
  }

  const storedEvent = {
    id: `evt_${Date.now()}`,
    userName: context.userName,
    timestamp: new Date().toISOString(),
    speaker_role: context.speakerRole,
    original_language: languageInfo.detectedLanguage,
    interpreted_language: languageInfo.interpretedLanguage,
    original_text: context.speechText,
    interpreted_text: interpretedText,
    location_name: context.locationName,
    room: context.room,
    nearby_person: context.nearbyPerson,
    last_event: context.lastEvent,
    objects: context.objects,
    risk_level: aiResult.care_reasoning?.risk?.level,
    evidence: aiResult.care_reasoning?.evidence || [],
  };

  writeMemoryEvent(storedEvent);
  writeCareEvent({
    id: `care_${Date.now()}`,
    timestamp: storedEvent.timestamp,
    patient: context.userName,
    role: context.speakerRole,
    transcript: context.speechText,
    episode_type: behaviorAnalysis.episode_type,
    silent_confusion: Boolean(behaviorAnalysis.silent_confusion),
    response: aiResult.response,
    risk: aiResult.care_reasoning?.risk,
    evidence: aiResult.care_reasoning?.evidence || [],
    action_plan: aiResult.care_reasoning?.action_plan,
    verification: aiResult.care_reasoning?.verification,
    environment,
    location_name: context.locationName,
    nearby_person: context.nearbyPerson,
    visual_context: {
      description: context.visualDescription,
      labels: context.imageLabels,
      concern: context.visualConcern
    },
    hume_emotion: humeEmotion,
    behavior_analysis: behaviorAnalysis
  });

  const familyAlert = await notifyFamilyIfNeeded({
    app,
    context,
    environment,
    aiResult
  });

  // Auto-save this interaction as an episodic memory
  if (memoryAvailable() && context.speechText) {
    saveEpisodicMemory({
      patientName: context.userName,
      type: personResult ? "person_asked" : scored.mode,
      content: context.speechText,
      context: {
        location: context.locationName || environment?.likely_place,
        time: context.currentClock,
        response_summary: aiResult.companion_message?.slice(0, 120),
        risk_level: aiResult.care_reasoning?.risk?.level
      }
    }).catch(() => {});
  }

  return {
    mode: scored.mode,
    confidence: scored.confidence,
    detected_language: languageInfo.detectedLanguage,
    interpreted_language: languageInfo.interpretedLanguage,
    environment,
    response: aiResult.response,
    care_reasoning: aiResult.care_reasoning,
    ollama_meta: aiResult.ollama_meta || null,
    hume_emotion: humeEmotion,
    behavior_analysis: behaviorAnalysis,
    escalation,
    family_alert: familyAlert,
    memory_summary: aiResult.memory_summary,
    score_reasons: scored.reasons,
    stored_event: {
      speaker_role: storedEvent.speaker_role,
      original_language: storedEvent.original_language,
      interpreted_text: storedEvent.interpreted_text,
    },
    audio_base64: audioBase64,
    audio_mime_type: audioBase64 ? "audio/mpeg" : null,
    person_result: personResult
      ? { name: personResult.name, relationship: personResult.relationship, notes: personResult.notes, photo_url: personResult.photo_url }
      : null,
  };
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

module.exports = router;
