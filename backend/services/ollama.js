const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma4:e4b";
const { buildCareReasoning, verifyGrounding } = require("./care-reasoner");

async function generateSupportResponse({
  context,
  environment,
  scored,
  relevantMemories,
  interpretedText,
  languageInfo
}) {
  const careReasoning = buildCareReasoning({
    context,
    environment,
    scored,
    relevantMemories
  });

  const fallback = buildFallbackResponse({
    context,
    environment,
    scored,
    relevantMemories,
    interpretedText,
    languageInfo,
    careReasoning
  });

  try {
    const prompt = buildPrompt({
      context,
      environment,
      scored,
      relevantMemories,
      interpretedText,
      languageInfo,
      careReasoning
    });

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        format: "json",
        options: {
          temperature: 0.25,
          top_p: 0.85
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama returned ${response.status}`);
    }

    const data = await response.json();
    const parsed = safeJsonParse(data.response || "");

    if (
      !parsed?.response?.reassurance ||
      !parsed?.response?.context ||
      !parsed?.response?.next_step
    ) {
      throw new Error("Model returned invalid JSON shape");
    }

    return {
      response: {
        reassurance: String(parsed.response.reassurance),
        context: String(parsed.response.context),
        next_step: String(parsed.response.next_step)
      },
      memory_summary: Array.isArray(parsed.memory_summary)
        ? parsed.memory_summary.map(String).slice(0, 8)
        : fallback.memory_summary,
      care_reasoning: normalizeCareReasoning(parsed.care_reasoning, careReasoning, {
        response: parsed.response
      })
    };
  } catch (error) {
    console.warn("Gemma/Ollama unavailable, using fallback:", error.message);
    return fallback;
  }
}

function buildPrompt({
  context,
  environment,
  scored,
  relevantMemories,
  interpretedText,
  languageInfo,
  careReasoning
}) {
  const memories = relevantMemories.map((memory, index) => ({
    number: index + 1,
    time: memory.timestamp,
    speaker_role: memory.speaker_role,
    location: memory.location_name,
    person: memory.nearby_person,
    summary: memory.interpreted_text
  }));

  const userData = {
    patient: {
      name: context.userName,
      main_language: context.mainLanguage
    },
    role: context.speakerRole,
    language: {
      detected_language: languageInfo.detectedLanguage,
      interpreted_language: languageInfo.interpretedLanguage,
      interpreted_text: interpretedText
    },
    live_situation_engine: {
      current_clock: context.currentClock,
      current_time_iso: context.currentTime,
      time_of_day: context.timeOfDay,
      routine_status: context.routineStatus,
      meal_or_medication_time: context.mealOrMedicationTime,
      next_schedule_item: context.scheduleNow,
      auto_created_context: context.autoContext,
      today_timeline: context.dailyLog
    },
    environment,
    current_signals: {
      original_speech: context.speechText,
      nearby_person: context.nearbyPerson,
      last_event: context.lastEvent,
      gps: {
        latitude: context.latitude,
        longitude: context.longitude,
        accuracy_meters: context.locationAccuracy
      },
      care_note: context.careNote,
      doctor_note: context.doctorNote,
      doctor_note_should_be_spoken: shouldSpeakDoctorNote(context)
    },
    multimodal_context: {
      visual_description: context.visualDescription,
      image_labels: context.imageLabels,
      visual_concern: context.visualConcern,
      camera_frame_available: context.capturedImageAvailable,
      hume_expression_signal: context.humeEmotion,
      behavior_analysis: context.behaviorAnalysis
    },
    support_mode: scored.mode,
    confidence: scored.confidence,
    relevant_memories: memories,
    deterministic_care_tools: careReasoning
  };

  return `
You are yourOwn, a real-time family-like Alzheimer’s support companion.

Your job is NOT just to answer a question.
Your job is to understand the patient's current situation using:
- live time
- routine/schedule
- GPS/place context
- recent speech
- daily timeline
- family/doctor notes
- memory
- language preference

Behavior rules:
- Speak warmly, simply, and calmly.
- Reassure first if the patient is confused, scared, or asks "where am I?"
- Use familiar words like home, daughter, doctor, lunch, medicine, rest.
- Keep the response short enough to be spoken out loud.
- Do not overload the patient.
- Never pretend to know something with certainty if the signal is weak.
- Use phrases like "It looks like..." or "I think..." when uncertain.
- Treat Hume and behavior analysis as possible expression/support cues, not proof of the patient's inner feelings or a diagnosis.
- Do not invent medical instructions.
- Use doctor notes as safety context, but do not repeat medication instructions unless medication is due or the patient asks about medicine.
- If a family note exists, use it as trusted context.
- If there is a schedule/routine match, include it naturally.
- Only mention meals or medication when meal_or_medication_time is true, the patient asks about it, or visual concern is medicine_check.
- If meal_or_medication_time is false, do not tell the patient the next meal/medicine time.
- If GPS is unavailable, do not mention coordinates.
- If GPS has a known match, describe the place in human terms.
- Use the patient's main language for the final response.
- Treat deterministic_care_tools as trusted tool/function output.
- Use risk, evidence, and action_plan to decide the safest next step.
- Do not claim a person is physically present unless nearby_person says so.
- Medication instructions must be limited to the doctor_note or a caregiver confirmation step, and should be spoken only when doctor_note_should_be_spoken is true.

Return ONLY valid JSON with this exact shape:
{
  "response": {
    "reassurance": "one short calming sentence",
    "context": "1-3 short sentences explaining what is happening right now",
    "next_step": "one clear gentle action"
  },
  "memory_summary": [
    "short useful memory/context item",
    "short useful memory/context item"
  ],
  "care_reasoning": {
    "risk": {
      "level": "low|medium|high|emergency",
      "score": 0.0,
      "flags": ["short flag"],
      "reasons": ["short reason"]
    },
    "evidence": ["grounding evidence used"],
    "action_plan": {
      "patient_action": "clear safe action",
      "caregiver_action": "clear caregiver action",
      "doctor_action": "clear doctor action",
      "alert_family": false,
      "alert_doctor": false,
      "safe_place_status": "known_safe_place|unknown_or_unmatched"
    },
    "tool_trace": [
      { "tool": "toolName", "result": {} }
    ]
  }
}

CURRENT DATA:
${JSON.stringify(userData, null, 2)}
`;
}

function buildFallbackResponse({
  context,
  environment,
  scored,
  relevantMemories,
  interpretedText,
  languageInfo,
  careReasoning
}) {
  const bestMemory = relevantMemories[0];

  const memorySentence = bestMemory
    ? bestMemory.interpreted_text
    : context.lastEvent
      ? `Earlier, you ${context.lastEvent}.`
      : "I am using the current situation to help you.";

  const scheduleSentence = context.mealOrMedicationTime && context.scheduleNow
    ? `Your next routine is ${context.scheduleNow.label}.`
    : "";

  let reassurance = `${context.userName}, you are okay.`;
  let contextText = "";

  const placeText = environment?.likely_place
    ? `You are likely at ${environment.likely_place}.`
    : "I am checking where you are.";

  const timeText = context.currentClock
    ? `It is ${context.currentClock}, ${context.timeOfDay}.`
    : environment?.time_context || "";

  const personText = context.nearbyPerson
    ? `${context.nearbyPerson} may be nearby.`
    : "";

  if (scored.mode === "orientation") {
    reassurance = `${context.userName}, you are safe.`;
    contextText = `${placeText} ${timeText} ${personText} ${memorySentence} ${scheduleSentence}`;
  } else if (scored.mode === "emotional_support") {
    reassurance = `${context.userName}, you are safe and not alone.`;
    contextText = `${placeText} ${timeText} ${personText} ${scheduleSentence}`;
  } else if (scored.mode === "memory_recall") {
    reassurance = "I remember this for you.";
    contextText = `${memorySentence} ${timeText} ${scheduleSentence}`;
  } else if (scored.mode === "routine_guidance") {
    reassurance = "I can guide you step by step.";
    contextText = `${timeText} ${scheduleSentence} ${placeText}`;
  } else {
    contextText = `${placeText} ${timeText} ${personText} ${memorySentence} ${scheduleSentence}`;
  }

  if (context.careNote) {
    contextText += ` ${context.careNote}`;
  }

  if (shouldSpeakDoctorNote(context)) {
    contextText += ` Doctor instruction: ${context.doctorNote}`;
  }

  if (languageInfo.detectedLanguage !== languageInfo.interpretedLanguage) {
    contextText += ` I interpreted this from ${languageInfo.detectedLanguage} into ${languageInfo.interpretedLanguage}.`;
  }

  if (interpretedText && context.speakerRole !== "patient") {
    contextText += ` ${interpretedText}`;
  }

  return {
    response: {
      reassurance,
      context: cleanText(contextText),
      next_step: getFallbackNextStep(context, environment)
    },
    memory_summary: buildMemorySummary({
      context,
      environment,
      relevantMemories
    }),
    care_reasoning: normalizeCareReasoning(null, careReasoning, {
      response: {
        reassurance,
        context: cleanText(contextText),
        next_step: getFallbackNextStep(context, environment)
      }
    })
  };
}

function normalizeCareReasoning(modelReasoning, deterministicReasoning, { response }) {
  const risk = {
    ...deterministicReasoning.risk,
    ...(modelReasoning?.risk || {})
  };

  const evidence = Array.isArray(modelReasoning?.evidence) && modelReasoning.evidence.length
    ? modelReasoning.evidence.map(String).slice(0, 12)
    : deterministicReasoning.evidence;

  const actionPlan = {
    ...deterministicReasoning.action_plan,
    ...(modelReasoning?.action_plan || {})
  };

  const toolTrace = Array.isArray(modelReasoning?.tool_trace) && modelReasoning.tool_trace.length
    ? modelReasoning.tool_trace.slice(0, 8)
    : deterministicReasoning.tool_trace;

  return {
    risk,
    evidence,
    action_plan: actionPlan,
    tool_trace: toolTrace,
    verification: verifyGrounding({
      response,
      evidence
    })
  };
}

function getFallbackNextStep(context, environment) {
  if (shouldSpeakDoctorNote(context)) {
    return `Follow the doctor note: ${context.doctorNote}`;
  }

  if (context.mealOrMedicationTime && context.scheduleNow?.label) {
    return `Next, focus on ${context.scheduleNow.label}.`;
  }

  if (context.mealOrMedicationTime && environment?.routine_hint) {
    return `Next, focus on ${environment.routine_hint}.`;
  }

  return "Take one slow breath and stay where you are while I help.";
}

function buildMemorySummary({ context, environment, relevantMemories }) {
  const items = [];

  if (environment?.likely_place) {
    items.push(`Likely place: ${environment.likely_place}`);
  }

  if (context.currentClock) {
    items.push(`Current time: ${context.currentClock}`);
  }

  if (context.routineStatus && context.mealOrMedicationTime) {
    items.push(`Routine status: ${context.routineStatus}`);
  }

  if (context.mealOrMedicationTime && context.scheduleNow?.label) {
    items.push(`Next routine: ${context.scheduleNow.label}`);
  }

  if (context.nearbyPerson) {
    items.push(`Nearby person: ${context.nearbyPerson}`);
  }

  if (context.lastEvent) {
    items.push(`Recent event: ${context.lastEvent}`);
  }

  if (context.careNote) {
    items.push(`Family note: ${context.careNote}`);
  }

  if (shouldSpeakDoctorNote(context)) {
    items.push(`Doctor note: ${context.doctorNote}`);
  }

  relevantMemories.slice(0, 3).forEach((memory) => {
    items.push(`Past memory: ${memory.interpreted_text}`);
  });

  return items.slice(0, 8);
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    const match = String(value).match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function cleanText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldSpeakDoctorNote(context) {
  if (!context.doctorNote) return false;
  return (
    Boolean(context.mealOrMedicationTime) ||
    mentionsMedication(context.speechText) ||
    context.visualConcern === "medicine_check"
  );
}

function mentionsMedication(text) {
  return /\b(medicine|medication|pill|dose|tablet|blue pill|take it|take this)\b/i.test(
    String(text || "")
  );
}

module.exports = {
  generateSupportResponse
};
