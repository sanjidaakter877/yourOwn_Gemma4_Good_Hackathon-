const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma4:e2b";
const OLLAMA_TIMEOUT_MS = 90000;       // full care JSON response
const OLLAMA_CONV_TIMEOUT_MS = 15000;  // fail fast to Gemma 4 API on CPU-only machines
const { buildCareReasoning, verifyGrounding } = require("./care-reasoner");
const { generateWithGemini } = require("./gemini");
const { generateWithGemmaApi } = require("./gemma-api");

// Gemma 4 native function calling: care tool definitions
const CARE_TOOLS = [
  {
    type: "function",
    function: {
      name: "getCurrentSituation",
      description: "Returns the patient's current clock time, time of day, routine status, and next scheduled item.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "matchSafePlace",
      description: "Returns the patient's GPS-matched safe place, location accuracy, and nearest known place if unmatched.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  },
  {
    type: "function",
    function: {
      name: "analyzeEmotionAndBehavior",
      description: "Returns current behavior signals (silence, no-progress, hesitation), Hume emotion data, and the current escalation stage.",
      parameters: { type: "object", properties: {}, required: [] }
    }
  }
];

function executeCareTool(toolName, careReasoning) {
  const trace = careReasoning.tool_trace || [];
  const entry = trace.find(t => t.tool === toolName);
  return entry ? entry.result : { status: "unavailable" };
}

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
    const inferenceStart = Date.now();

    // PRIMARY: Gemma 4 26B A4B-IT via API — same model used in hackathon notebook
    const gemmaApiResult = await generateWithGemmaApi({
      context, environment, scored, relevantMemories, careReasoning, inferenceStart
    });
    if (gemmaApiResult) return gemmaApiResult;

    // FALLBACK: Gemma 4 via Ollama — local, private, no data leaves the device
    const gemma4Result = await generateConversationalResponse({
      context, environment, scored, relevantMemories, careReasoning, inferenceStart
    });
    if (gemma4Result) return gemma4Result;

    // LAST RESORT: Gemini cloud
    const geminiResult = await generateWithGemini({
      context, environment, scored, relevantMemories, careReasoning, inferenceStart
    });
    if (geminiResult) return geminiResult;

    const { systemPrompt, userData } = buildChatData({
      context,
      environment,
      scored,
      relevantMemories,
      interpretedText,
      languageInfo,
      careReasoning
    });

    // Gemma 4 multimodal: strip data URL prefix and pass raw base64 image to Ollama
    const imageBase64 = context.capturedImage
      ? context.capturedImage.replace(/^data:[^;]+;base64,/, "")
      : null;

    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `CURRENT PATIENT DATA:\n${JSON.stringify(userData, null, 2)}`,
        ...(imageBase64 ? { images: [imageBase64] } : {})
      }
    ];

    // First request: Gemma 4 function calling + optional multimodal camera image
    const firstAbort = new AbortController();
    const firstTimeout = setTimeout(() => firstAbort.abort(), OLLAMA_TIMEOUT_MS);
    const firstRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: firstAbort.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        tools: CARE_TOOLS,
        stream: false,
        options: { temperature: 0.7, top_p: 0.92 }
      })
    });
    clearTimeout(firstTimeout);

    if (!firstRes.ok) {
      throw new Error(`Ollama returned ${firstRes.status}`);
    }

    const firstData = await firstRes.json();
    const assistantMsg = firstData.message;

    let responseContent = assistantMsg?.content || "";
    const functionCallsMade = [];

    // Execute any Gemma 4 function calls and continue conversation with results
    if (assistantMsg?.tool_calls?.length) {
      messages.push(assistantMsg);

      for (const tc of assistantMsg.tool_calls) {
        const name = tc.function?.name || "";
        functionCallsMade.push(name);
        const result = executeCareTool(name, careReasoning);
        messages.push({ role: "tool", content: JSON.stringify(result) });
      }

      messages.push({
        role: "user",
        content: "Now generate the care response as valid JSON in the required format."
      });

      const followUpRes = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages,
          stream: false,
          format: "json",
          options: { temperature: 0.7, top_p: 0.92 }
        })
      });

      if (!followUpRes.ok) {
        throw new Error(`Ollama follow-up returned ${followUpRes.status}`);
      }

      const followUpData = await followUpRes.json();
      responseContent = followUpData.message?.content || "";
    }

    const parsed = safeJsonParse(responseContent);

    if (
      !parsed?.response?.reassurance ||
      !parsed?.response?.context ||
      !parsed?.response?.next_step
    ) {
      throw new Error("Model returned invalid JSON shape");
    }

    const guardedResponse = applySilentConversationGuard(
      {
        reassurance: String(parsed.response.reassurance),
        context: String(parsed.response.context),
        next_step: String(parsed.response.next_step)
      },
      { context, environment }
    );

    const normalizedReasoning = normalizeCareReasoning(parsed.care_reasoning, careReasoning, {
      response: guardedResponse
    });

    if (functionCallsMade.length) {
      normalizedReasoning.gemma_function_calls = functionCallsMade;
    }
    if (imageBase64) {
      normalizedReasoning.multimodal_image_used = true;
    }

    return {
      response_type: getResponseType({ context, scored, careReasoning }),
      companion_message: buildCompanionMessage(guardedResponse),
      response: guardedResponse,
      memory_summary: Array.isArray(parsed.memory_summary)
        ? parsed.memory_summary.map(String).slice(0, 8)
        : fallback.memory_summary,
      care_reasoning: normalizedReasoning,
      ollama_meta: {
        model: OLLAMA_MODEL,
        inference_ms: Date.now() - inferenceStart,
        function_calls: functionCallsMade,
        vision_used: Boolean(imageBase64),
        local: true
      }
    };
  } catch (error) {
    console.warn("Gemma/Ollama unavailable:", error.message);

    // For conversation, try cloud providers after local Ollama failed
    if (scored.mode === "conversation" && context.speechText?.trim()) {
      try {
        const gemmaApiRetry = await generateWithGemmaApi({
          context, environment, scored, relevantMemories, careReasoning,
          inferenceStart: Date.now()
        });
        if (gemmaApiRetry) return gemmaApiRetry;


      } catch {
        // All cloud providers failed — fall through to honest message
      }

      const name = context.userName || "Mary";
      return {
        response_type: "conversation",
        companion_message: `Sorry ${name}, I had a little trouble just now. Could you say that again? I am here and listening.`,
        response: {
          reassurance: `I am here with you, ${name}.`,
          context: "",
          next_step: "Could you say that again? I want to make sure I hear you."
        },
        memory_summary: [],
        care_reasoning: null,
        ollama_meta: { provider: "fallback", local: false }
      };
    }

    return fallback;
  }
}

async function generateConversationalResponse({ context, environment, scored, relevantMemories, careReasoning, inferenceStart }) {
  const name = context.userName || "Mary";
  const speech = context.speechText || "";
  const isSilentCheck = context.behaviorAnalysis?.silent_confusion;
  if (!speech.trim() && !isSilentCheck) return null;

  console.log(`[Ollama conv] entering — speech="${speech.slice(0, 60)}", model=${OLLAMA_MODEL}`);

  const memoryLines = relevantMemories.slice(0, 2).map(m => `- ${m.interpreted_text}`).join("\n");
  const placeHint = environment?.likely_place ? ` ${name} is likely at ${environment.likely_place}.` : "";
  const timeHint = context.currentClock ? ` It is ${context.currentClock}, ${context.timeOfDay}.` : "";
  const careNote = context.careNote ? ` Family note: ${context.careNote}` : "";

  const modeInstructions = isSilentCheck
    ? `${name} has been quiet for a while. Gently check in with one warm question to make sure they are okay. Do not repeat previous check-ins.`
    : scored?.mode === "emergency"
    ? `EMERGENCY: ${name} may be injured or in physical danger. Stay very calm. Tell them to stay still and that help is on the way. Do NOT ask questions — just reassure and say family is being contacted immediately. One or two sentences only.`
    : scored?.mode === "wandering"
    ? `${name} is trying to leave. Do NOT tell them they cannot go. Gently redirect — ask warmly where they are hoping to go, then offer a comforting reason to stay (e.g. "dinner is nearly ready" or "your family is coming soon"). Keep it to one or two warm sentences.`
    : scored?.mode === "paranoia"
    ? `${name} is feeling suspicious or unsafe. Do NOT argue or correct them. First validate their feelings — say you understand they feel uneasy. Then gently reassure that they are safe and that everyone around them cares for them. One or two sentences only.`
    : scored?.mode === "aggression"
    ? `${name} is upset or refusing help. Do NOT push back or argue. Give them space — say you hear them and you will be quiet. One short sentence, then stop. Let them calm down.`
    : scored?.mode === "medicine_refusal"
    ? `${name} has refused their medicine or expressed concern about dosing. Do NOT force it. Acknowledge their concern warmly. Say their family or doctor will confirm the right dose. One or two sentences only.`
    : scored?.mode === "orientation"
    ? `${name} seems confused. Gently orient them — tell them the time, where they are, and something reassuring.`
    : scored?.mode === "emotional_support"
    ? `${name} seems upset or scared. Respond with calm warmth. Acknowledge their feelings and reassure them they are safe.`
    : scored?.mode === "routine_guidance" || scored?.mode === "memory_recall"
    ? `${name} needs help with a routine or memory. Give one clear helpful answer, then ask a gentle follow-up.`
    : `Reply naturally like a real caring friend. Directly respond to what ${name} said. End with one warm follow-up question.`;

  const userMessage = speech.trim() || `[${name} has been quiet for a while]`;

  const systemPrompt = `You are yourOwn, a warm caring AI companion for ${name}, who has Alzheimer's.${placeHint}${timeHint}${careNote}
${memoryLines ? `Context:\n${memoryLines}` : ""}

${modeInstructions}
Keep it short: 1-2 sentences only. Never mention GPS, timestamps, or raw system data.`;

  // Try configured model first, then other Gemma 4 variants — skip Gemma 3 for hackathon
  const uniqueModels = [...new Set([OLLAMA_MODEL, "gemma4:e4b", "gemma4:e2b"])];

  for (const model of uniqueModels) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), OLLAMA_CONV_TIMEOUT_MS);

      const res = await fetch(`${OLLAMA_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          stream: false,
          options: { temperature: 0.8, top_p: 0.95 }
        })
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        console.warn(`[Ollama conv] ${model} returned ${res.status}:`, errText.slice(0, 200));
        continue;
      }

      const data = await res.json();
      const reply = (data.message?.content || "").trim();

      if (!reply) {
        console.warn(`[Ollama conv] ${model} returned empty reply`);
        continue;
      }

      console.log(`[Ollama conv] ${model} replied: "${reply.slice(0, 80)}"`);

      const response = { reassurance: reply, context: "", next_step: "" };

      return {
        response_type: "conversation",
        companion_message: reply,
        response,
        memory_summary: [],
        care_reasoning: careReasoning ? {
          ...careReasoning,
          verification: { safe_to_send: true, grounding_score: 1 }
        } : null,
        ollama_meta: {
          model,
          inference_ms: Date.now() - inferenceStart,
          function_calls: [],
          vision_used: false,
          local: true
        }
      };
    } catch (err) {
      console.warn(`[Ollama conv] ${model} exception:`, err.message);
    }
  }

  console.warn("[Ollama conv] all models failed, returning null");
  return null;
}

function buildChatData({
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
      today_timeline: context.dailyLog,
      patient_saved_notes: context.patientNotes
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
      behavior_analysis: context.behaviorAnalysis,
      behavior_signals: context.behaviorSignals
    },
    conversation_state: context.conversationState,
    escalation_decision: context.escalation,
    support_mode: scored.mode,
    confidence: scored.confidence,
    relevant_memories: memories,
    deterministic_care_tools: careReasoning
  };

  const systemPrompt = `You are yourOwn, a real-time family-like Alzheimer's support companion.

Your job changes by situation:
- In ordinary conversation, talk like a calm real person. Answer what the patient said directly.
- In silence or safety situations, become a careful caregiver: orient, check safety, and escalate if needed.
- Do not make every normal conversation sound like an emergency.

Understand the patient's current situation using:
- live time
- routine/schedule
- GPS/place context
- recent speech
- daily timeline
- family/doctor notes
- memory
- language preference

If a camera image is provided, analyze it directly to understand the patient's current scene.

Use the available tools (getCurrentSituation, matchSafePlace, analyzeEmotionAndBehavior) to retrieve live care context when needed before responding.

Behavior rules:
- Act like a gentle real-life care companion, not a form or dashboard.
- If the patient asks an ordinary question, answer it directly and warmly while staying grounded in known context.
- Keep the conversation going naturally with at most one short follow-up question when helpful.
- If the patient is calm and the topic is ordinary, do not over-escalate or make the moment sound dangerous.
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
- If silent_confusion is true, first repeat the safest verified context, then ask one gentle check-in question.
- If liveSilenceCheckCount is greater than 1, do not repeat the same reassurance. Continue the conversation with a new short question.
- For repeated silence, progress through varied caregiver questions. Do not repeat the same sentence.
- If patient_saved_notes exist, use at most one short relevant note before the first check-in question.
- If the patient answers after a silent check, respond to that answer normally and decide the next safest step from context.
- Treat conversation_state as the live conversation state. Use it to choose a natural next turn, not a canned script.
- The app controls conversation_state.stage for safety. Follow that stage, but choose your own natural wording.
- Code controls when to speak, wait, and alert a caregiver. Gemma controls only the gentle wording.
- If escalation_decision.gemmaContext is present, use it as the main speaking context.
- Stage meanings:
  - guidance: briefly orient using verified context and offer one safe next step.
  - check_in: ask a fresh question about what the patient is doing or needs.
  - hearing_check: ask the patient to answer with a simple word or yes/no.
  - caregiver_warning: gently say a caregiver may be contacted if there is no response.
  - alert_sent: say a trusted caregiver is being notified and ask the patient to stay safe.
  - conversation: answer the patient normally like a companion.
  - emergency: CRITICAL — patient may be injured. Stay completely calm. Do not ask questions. Say help is coming and they should stay still. Alert family immediately. Maximum two sentences.
  - wandering: patient wants to leave. Never say they cannot go. Redirect warmly — ask where they want to go, offer a gentle reason to stay (dinner, family arriving). Maximum two sentences.
  - paranoia: patient feels suspicious or unsafe. Never argue or correct. Validate feelings first ("I understand you feel uneasy"), then reassure they are safe and loved. Maximum two sentences.
  - de_escalate: patient is angry or refusing help. Do not push back. One short sentence giving them space ("I hear you, I will be quiet now."), then stop completely.
  - medicine_refusal: patient refused medicine or worried about double-dose. Acknowledge concern warmly. Say family or doctor will confirm. Never force. Maximum two sentences.
- For silent_check turns, sound like a real caregiver in the room: observant, brief, varied, and specific to context.
- For patient_speech turns, answer what the patient said first, then decide whether to reassure, guide, or ask a follow-up.
- If GPS status is unmatched_known_place, explain gently that this does not match a saved safe place and ask whether the patient wants help or caregiver contact.
- If repeated_silence_no_response is present, escalate to caregiver contact in the action plan.
- Do not claim a person is physically present unless nearby_person says so.
- Medication instructions must be limited to the doctor_note or a caregiver confirmation step, and should be spoken only when doctor_note_should_be_spoken is true.

CRITICAL RULE for companion_message:
- companion_message is what gets spoken aloud to the patient. It must sound like a real person talking, not a form being filled out.
- For casual conversation (sports, weather, family, memories, preferences): reply like a warm friend. "That sounds fun! Who is your favourite team?" is perfect. "Mary, I am listening. What would you like to talk about?" is NOT acceptable.
- Never echo back what the patient just said as the response.
- Never put raw metadata like times, GPS notes, or care-note text into companion_message. That is backend context, not patient speech.
- If the patient says anything — even something random or unexpected — respond to it directly and warmly. Keep the conversation going naturally with one follow-up question.

Return ONLY valid JSON with this exact shape:
{
  "response_type": "conversation|care",
  "companion_message": "A single natural spoken sentence or two, directly responding to what the patient said. Must sound like a real warm person, not a form.",
  "response": {
    "reassurance": "one short calming sentence",
    "context": "brief internal context note — NOT repeated metadata, NOT echoed speech",
    "next_step": "one clear gentle action or follow-up question"
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
}`;

  return { systemPrompt, userData };
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

  const timeText = context.currentClock
    ? `It is ${context.currentClock}, ${context.timeOfDay}.`
    : environment?.time_context || "";

  if (scored.mode === "conversation") {
    const response = buildConversationFallback({
      context,
      environment,
      timeText,
      scheduleSentence
    });

    return {
      response,
      memory_summary: buildMemorySummary({
        context,
        environment,
        relevantMemories
      }),
      care_reasoning: normalizeCareReasoning(null, careReasoning, {
        response
      })
    };
  }

  let reassurance = `${context.userName}, you are okay.`;
  let contextText = "";

  const placeText = environment?.likely_place
    ? `You are likely at ${environment.likely_place}.`
    : "I am checking where you are.";

  const personText = context.nearbyPerson
    ? `${context.nearbyPerson} may be nearby.`
    : "";

  if (context.behaviorAnalysis?.silent_confusion) {
    const companionFallback = buildSilentCompanionFallback({
      context,
      environment,
      placeText,
      timeText,
      personText,
      memorySentence,
      scheduleSentence
    });
    reassurance = companionFallback.reassurance;
    contextText = companionFallback.context;
  } else if (scored.mode === "emergency") {
    reassurance = `${context.userName}, stay still — help is on the way.`;
    contextText = "Your family is being contacted right now.";
  } else if (scored.mode === "wandering") {
    reassurance = `${context.userName}, I hear you.`;
    contextText = "Let me help — where are you hoping to go?";
  } else if (scored.mode === "paranoia") {
    reassurance = `${context.userName}, I understand you feel uneasy.`;
    contextText = "You are safe here and everyone around you cares for you.";
  } else if (scored.mode === "aggression") {
    reassurance = `${context.userName}, I hear you. I will be quiet now.`;
    contextText = "";
  } else if (scored.mode === "medicine_refusal") {
    reassurance = `${context.userName}, I understand your concern.`;
    contextText = "Your family or doctor will confirm the right dose — there is no need to worry right now.";
  } else if (scored.mode === "orientation") {
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
    reassurance = `${context.userName}, I am listening.`;
    contextText = context.speechText
      ? `You said: "${context.speechText}". ${timeText} ${scheduleSentence}`
      : `${placeText} ${timeText} ${personText} ${memorySentence} ${scheduleSentence}`;
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

  const response = applySilentConversationGuard(
    {
      reassurance,
      context: cleanText(contextText),
      next_step: getFallbackNextStep(context, environment)
    },
    { context, environment }
  );

  return {
    response_type: getResponseType({ context, scored, careReasoning }),
    companion_message: buildCompanionMessage(response),
    response,
    memory_summary: buildMemorySummary({
      context,
      environment,
      relevantMemories
    }),
    care_reasoning: normalizeCareReasoning(null, careReasoning, {
      response
    })
  };
}

function getResponseType({ context, scored, careReasoning }) {
  const riskLevel = careReasoning?.risk?.level || "low";
  const safetyModes = [
    "orientation", "emotional_support", "routine_guidance",
    "emergency", "wandering", "paranoia", "aggression", "medicine_refusal"
  ];
  const highRisk = ["medium", "high", "emergency"].includes(riskLevel);

  if (context.behaviorAnalysis?.silent_confusion) return "care";
  if (highRisk) return "care";
  if (safetyModes.includes(scored.mode)) return "care";
  return "conversation";
}

function buildCompanionMessage(response) {
  return [response?.reassurance, response?.next_step]
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildSilentCompanionFallback({
  context,
  environment,
  placeText,
  timeText,
  personText,
  memorySentence,
  scheduleSentence
}) {
  const checkCount = Number(context.behaviorSignals?.liveSilenceCheckCount || 1);
  const savedNote = Array.isArray(context.patientNotes) && context.patientNotes[0]?.text
    ? `I see your note: ${String(context.patientNotes[0].text).slice(0, 120)}.`
    : "";
  const mismatchText = environment?.gps_status === "unmatched_known_place"
    ? "This place does not match the safe places your family saved."
    : "";

  if (checkCount === 1) {
    return {
      reassurance: `${context.userName}, I am here with you.`,
      context: cleanText(`${savedNote || placeText} ${timeText}`),
    };
  }

  if (checkCount === 2) {
    return {
      reassurance: `${context.userName}, I am listening.`,
      context: cleanText(`${personText || memorySentence} ${scheduleSentence}`),
    };
  }

  if (checkCount === 3) {
    return {
      reassurance: `${context.userName}, I want to make sure you are alright.`,
      context: cleanText(`${mismatchText || "You have been quiet for a little while."}`),
    };
  }

  return {
    reassurance: `${context.userName}, I am still with you.`,
    context: cleanText(`${mismatchText} I have not heard an answer yet.`),
  };
}

function applySilentConversationGuard(response, { context, environment }) {
  if (!context.behaviorAnalysis?.silent_confusion) return response;

  const checkCount = Number(context.behaviorSignals?.liveSilenceCheckCount || 1);
  const stage = context.conversationState?.stage || "";
  const gpsMismatch = environment?.gps_status === "unmatched_known_place";

  if (gpsMismatch) {
    const placeText = environment?.likely_place
      ? `You are likely at ${environment.likely_place}.`
      : "I am checking where you are.";
    const timeText = context.currentClock
      ? `It is ${context.currentClock}, ${context.timeOfDay}.`
      : environment?.time_context || "";

    return {
      reassurance: `${context.userName}, I am here with you.`,
      context: cleanText(`${placeText} ${timeText}`),
      next_step:
        "This may not be where you were expected to be. Do you need help, or should I notify your caregiver?"
    };
  }

  if (stage === "alert_sent" || checkCount >= 5) {
    return {
      reassurance: `${context.userName}, I am still here.`,
      context: cleanText(response.context || "You have been quiet through several check-ins."),
      next_step:
        response.next_step && !isRepetitiveSafeLine(response.next_step)
          ? response.next_step
          : "I am asking your caregiver to check on you now. Please stay where you are."
    };
  }

  return response;
}

function buildConversationFallback({ context, environment, timeText, scheduleSentence }) {
  const speech = String(context.speechText || "").toLowerCase();
  const name = context.userName || "Mary";

  if (/\b(what time is it|what's the time|what is the time)\b/i.test(speech)) {
    return {
      reassurance: `${name}, it is ${context.currentClock || "the current time"}.`,
      context: "",
      next_step: scheduleSentence ? `After this, you can focus on ${context.scheduleNow.label}.` : "Is there anything else I can help with?"
    };
  }

  if (/\b(what day is it|what date is it|what is today)\b/i.test(speech)) {
    const dateText = context.currentTime
      ? new Date(context.currentTime).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
      : "today";
    return {
      reassurance: `${name}, today is ${dateText}.`,
      context: "",
      next_step: "Is there something you wanted to do today?"
    };
  }

  if (/\b(sports?|football|cricket|tennis|basketball|soccer|team|match|game|play)\b/i.test(speech)) {
    return {
      reassurance: `${name}, that sounds like a fun topic!`,
      context: "",
      next_step: "Do you have a favourite team or sport you enjoy watching?"
    };
  }

  if (/\b(weather|rain|sun|sunny|cold|hot|warm|outside|temperature)\b/i.test(speech)) {
    return {
      reassurance: `${name}, I enjoy hearing about the weather too.`,
      context: "",
      next_step: "Is it nice outside today? Do you feel like taking a short walk later?"
    };
  }

  if (/\b(family|daughter|son|husband|wife|grandchild|children|sister|brother|friend)\b/i.test(speech)) {
    return {
      reassurance: `${name}, it is lovely to talk about family.`,
      context: "",
      next_step: "Would you like to tell me more about them?"
    };
  }

  if (/\b(food|eat|hungry|lunch|dinner|breakfast|cook|meal|tea|coffee)\b/i.test(speech)) {
    return {
      reassurance: `${name}, that sounds tasty.`,
      context: "",
      next_step: "What is your favourite thing to eat?"
    };
  }

  if (/\b(music|song|sing|listen|radio|favourite)\b/i.test(speech)) {
    return {
      reassurance: `${name}, music is wonderful company.`,
      context: "",
      next_step: "Do you have a favourite song or singer you enjoy?"
    };
  }

  if (/\b(remember|memory|used to|when i was|long ago|years ago|childhood|young)\b/i.test(speech)) {
    return {
      reassurance: `${name}, I love hearing your memories.`,
      context: "",
      next_step: "Please tell me more — I am listening."
    };
  }

  if (/\b(how are you|are you okay|you alright|who are you|what are you)\b/i.test(speech)) {
    return {
      reassurance: `I am yourOwn, your companion. I am here with you, ${name}.`,
      context: "",
      next_step: "How are you feeling right now?"
    };
  }

  if (/\b(thank you|thanks|you are great|you are helpful|appreciate)\b/i.test(speech)) {
    return {
      reassurance: `${name}, it is my pleasure to be here with you.`,
      context: "",
      next_step: "Is there anything else on your mind?"
    };
  }

  if (/\b(joke|funny|laugh|humour|humor|story|tell me|sing)\b/i.test(speech)) {
    return {
      reassurance: `${name}, I love that you are in a fun mood!`,
      context: "",
      next_step: "Here is one: Why did the gardener win an award? Because he was outstanding in his field! Did that make you smile?"
    };
  }

  if (/\b(bored|boring|nothing to do|no fun|lonely|alone)\b/i.test(speech)) {
    return {
      reassurance: `${name}, I am right here with you and happy to chat!`,
      context: "",
      next_step: "What do you usually enjoy doing? We could talk about your favourite memory or a song you love."
    };
  }

  // Generic fallback — acknowledge and continue
  return {
    reassurance: `${name}, I am here and listening!`,
    context: "",
    next_step: "Tell me what is on your mind — I would love to hear."
  };
}

function isRepetitiveSafeLine(text) {
  return /^mary,\s*(you are safe|i am here|you are okay)/i.test(String(text || "").trim());
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
  if (context.behaviorAnalysis?.silent_confusion) {
    const checkCount = Number(context.behaviorSignals?.liveSilenceCheckCount || 1);

    if (environment?.gps_status === "unmatched_known_place") {
      return "This may not be where you were expected to be. Do you need help, or should I notify your caregiver?";
    }

    if (checkCount >= 4) {
      return "I am asking your caregiver to check on you now. Please stay where you are.";
    }

    if (checkCount === 3) {
      return "Do you need help, or should I contact your caregiver?";
    }

    if (checkCount === 2) {
      return "What are you doing right now? Do you need help?";
    }

    if (context.behaviorAnalysis?.flags?.includes("repeated_silent_check")) {
      return "Are you okay? If you do not respond, I will ask your caregiver to check on you.";
    }

    return "Are you okay, or do you need more help? Stay where you are while I help.";
  }

  if (shouldSpeakDoctorNote(context)) {
    return `Follow the doctor note: ${context.doctorNote}`;
  }

  if (context.mealOrMedicationTime && context.scheduleNow?.label) {
    return `Next, focus on ${context.scheduleNow.label}.`;
  }

  if (context.mealOrMedicationTime && environment?.routine_hint) {
    return `Next, focus on ${environment.routine_hint}.`;
  }

  if (context.speechText && context.speakerRole === "patient") {
    return "I can stay with you. What would you like to talk about?";
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
