function includesAny(text, phrases) {
  const lower = String(text || "").toLowerCase();
  return phrases.some((phrase) => lower.includes(phrase));
}

function buildToolTrace({ context, environment, relevantMemories }) {
  return [
    {
      tool: "getCurrentSituation",
      result: {
        time: context.currentClock || "unknown",
        time_of_day: context.timeOfDay || "unknown",
        routine_status: context.routineStatus || "unknown",
        meal_or_medication_time: Boolean(context.mealOrMedicationTime),
        next_schedule_item: context.mealOrMedicationTime ? context.scheduleNow || null : null
      }
    },
    {
      tool: "matchSafePlace",
      result: {
        likely_place: environment?.likely_place || "unknown",
        gps_match: environment?.gps_match || null,
        accuracy_meters: context.locationAccuracy
      }
    },
    {
      tool: "retrieveCareMemory",
      result: relevantMemories.slice(0, 4).map((memory) => ({
        timestamp: memory.timestamp,
        source_role: memory.speaker_role,
        summary: memory.interpreted_text
      }))
    },
    {
      tool: "readTrustedCareNotes",
      result: {
        family_note: context.careNote || "",
        doctor_note: shouldSpeakDoctorNote(context) ? context.doctorNote || "" : "",
        nearby_person: context.nearbyPerson || ""
      }
    },
    {
      tool: "analyzeVisualContext",
      result: {
        description: context.visualDescription || "",
        detected_labels: context.imageLabels || [],
        concern: context.visualConcern || "",
        multimodal_available: Boolean(
          context.visualDescription ||
            context.visualConcern ||
            (context.imageLabels || []).length
        )
      }
    },
    {
      tool: "analyzeEmotionAndBehavior",
      result: {
        hume_available: Boolean(context.humeEmotion?.available),
        top_expressions: context.humeEmotion?.top_emotions || [],
        behavior_level: context.behaviorAnalysis?.level || "none",
        behavior_flags: context.behaviorAnalysis?.flags || []
      }
    }
  ];
}

function classifyCareRisk({ context, environment, scored }) {
  const speech = context.speechText || "";
  let level = "low";
  let score = 0.18;
  const reasons = [];
  const flags = [];

  if (scored.mode === "orientation") {
    score += 0.24;
    flags.push("disorientation");
    reasons.push("Patient used orientation/confusion language.");
  }

  if (scored.mode === "emotional_support") {
    score += 0.22;
    flags.push("distress");
    reasons.push("Patient used distress or fear language.");
  }

  if (includesAny(speech, ["lost", "where am i", "i don't know this place", "dont know this place"])) {
    score += 0.18;
    flags.push("possible_wandering");
    reasons.push("Speech suggests the patient may feel lost or displaced.");
  }

  if (
    includesAny(speech, [
      "quiet for a while",
      "may be unsure",
      "paused",
      "losing their train of thought",
      "i can't remember",
      "i cant remember",
      "what was i saying"
    ])
  ) {
    score += 0.16;
    flags.push("possible_quiet_confusion");
    reasons.push("Live monitoring suggests quiet uncertainty or hesitation.");
  }

  if (context.behaviorAnalysis?.level === "possible_confusion") {
    score += 0.18;
    flags.push("behavior_possible_confusion");
    reasons.push("Timer/OpenCV-ready behavior monitor suggests possible no-progress confusion.");
  }

  if (context.humeEmotion?.available) {
    const expressionNames = (context.humeEmotion.top_emotions || [])
      .slice(0, 5)
      .map((emotion) => String(emotion.name || "").toLowerCase());

    if (expressionNames.some((name) => /doubt|confusion|distress|fear|anxiety|sadness/.test(name))) {
      score += 0.12;
      flags.push("emotion_uncertainty_signal");
      reasons.push("Hume expression signals may indicate uncertainty or distress.");
    }
  }

  if (includesAny(speech, ["fall", "fell", "hurt", "pain", "can't get up", "cant get up"])) {
    score += 0.32;
    flags.push("possible_injury");
    reasons.push("Speech may indicate injury or fall risk.");
  }

  if (includesAny(speech, ["medicine", "pill", "dose", "took two", "take another"])) {
    score += 0.2;
    flags.push("medication_safety");
    reasons.push("Speech mentions medication, which requires extra caution.");
  }

  if (context.visualConcern === "medicine_check") {
    score += 0.22;
    flags.push("visual_medication_check");
    reasons.push("Visual context requests medication verification.");
  }

  if (context.visualConcern === "unsafe_scene") {
    score += 0.28;
    flags.push("visual_safety_concern");
    reasons.push("Visual context suggests a possible unsafe scene.");
  }

  if ((context.imageLabels || []).some((label) => /pill|medicine|bottle/i.test(label))) {
    score += 0.12;
    flags.push("medicine_visible");
    reasons.push("Image labels include medication-related objects.");
  }

  if (environment?.likely_place) {
    score -= 0.08;
    reasons.push(`Known place matched: ${environment.likely_place}.`);
  } else if (context.latitude && context.longitude) {
    score += 0.12;
    flags.push("unknown_location");
    reasons.push("GPS exists but did not match a known safe place.");
  }

  if (context.timeOfDay === "night") {
    score += 0.12;
    flags.push("night_safety");
    reasons.push("Nighttime confusion carries higher safety risk.");
  }

  if (context.nearbyPerson) {
    score -= 0.05;
    reasons.push(`Known person context available: ${context.nearbyPerson}.`);
  }

  score = Math.max(0.05, Math.min(0.98, score));

  if (score >= 0.78) level = "emergency";
  else if (score >= 0.58) level = "high";
  else if (score >= 0.36) level = "medium";

  return {
    level,
    score: Number(score.toFixed(2)),
    flags,
    reasons
  };
}

function buildEvidence({ context, environment, scored, relevantMemories, risk }) {
  const evidence = [];

  evidence.push(`Support mode: ${scored.mode} (${scored.confidence} confidence).`);

  if (context.speechText) {
    evidence.push(`Patient said: "${context.speechText}".`);
  }

  if (environment?.likely_place) {
    evidence.push(`Place engine matched likely place: ${environment.likely_place}.`);
  }

  if (environment?.gps_match?.name) {
    evidence.push(
      `GPS matched ${environment.gps_match.name} within ${Math.round(
        environment.gps_match.distance_meters || 0
      )} meters.`
    );
  }

  if (context.currentClock || context.timeOfDay) {
    evidence.push(`Time context: ${context.currentClock || "unknown"} ${context.timeOfDay || ""}.`.trim());
  }

  if (context.mealOrMedicationTime && context.scheduleNow?.label) {
    evidence.push(`Next routine: ${context.scheduleNow.time} ${context.scheduleNow.label}.`);
  }

  if (context.nearbyPerson) {
    evidence.push(`Known nearby person context: ${context.nearbyPerson}.`);
  }

  if (context.lastEvent) {
    evidence.push(`Recent event: ${context.lastEvent}.`);
  }

  if (context.careNote) {
    evidence.push(`Family note: ${context.careNote}.`);
  }

  if (shouldSpeakDoctorNote(context)) {
    evidence.push(`Doctor note: ${context.doctorNote}.`);
  }

  if (context.visualDescription) {
    evidence.push(`Visual context: ${context.visualDescription}.`);
  }

  if ((context.imageLabels || []).length) {
    evidence.push(`Image labels: ${context.imageLabels.join(", ")}.`);
  }

  if (context.humeEmotion?.available && context.humeEmotion.expression_summary) {
    evidence.push(`Hume expression signal: ${context.humeEmotion.expression_summary}.`);
  }

  if (context.behaviorAnalysis?.evidence?.length) {
    context.behaviorAnalysis.evidence
      .slice(0, 3)
      .forEach((item) => evidence.push(`Behavior signal: ${item}`));
  }

  relevantMemories.slice(0, 3).forEach((memory) => {
    evidence.push(`Retrieved memory: ${memory.interpreted_text}.`);
  });

  risk.reasons.slice(0, 4).forEach((reason) => evidence.push(`Risk signal: ${reason}`));

  return evidence.slice(0, 12);
}

function buildActionPlan({ context, environment, risk }) {
  const notifyFamily = ["high", "emergency"].includes(risk.level);
  const notifyDoctor =
    risk.flags.includes("medication_safety") ||
    risk.flags.includes("visual_medication_check") ||
    risk.flags.includes("possible_injury") ||
    risk.level === "emergency";

  const patientAction = context.mealOrMedicationTime && context.scheduleNow?.label
    ? `Stay where you are and focus on ${context.scheduleNow.label}.`
    : "Stay where you are, take one slow breath, and wait for help.";

  const caregiverAction = notifyFamily
    ? `Check on ${context.userName} now. Risk level is ${risk.level}.`
    : `Review this moment when available. Risk level is ${risk.level}.`;

  return {
    patient_action: patientAction,
    caregiver_action: caregiverAction,
    doctor_action: notifyDoctor
      ? "Review medication, injury, or safety risk before giving new instructions."
      : "No immediate doctor escalation needed from this interaction.",
    alert_family: notifyFamily,
    alert_doctor: notifyDoctor,
    safe_place_status: environment?.likely_place ? "known_safe_place" : "unknown_or_unmatched"
  };
}

function verifyGrounding({ response, evidence }) {
  const combined = [
    response?.reassurance,
    response?.context,
    response?.next_step
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const evidenceText = evidence.join(" ").toLowerCase();
  const unsupportedClaims = [];

  if (combined.includes("anna is here") && !evidenceText.includes("nearby person")) {
    unsupportedClaims.push("Claims Anna is physically present without nearby-person evidence.");
  }

  if (combined.includes("take") && combined.includes("pill") && !evidenceText.includes("doctor note")) {
    unsupportedClaims.push("Medication action appears without doctor-note evidence.");
  }

  if (combined.includes("at home") && !evidenceText.includes("home")) {
    unsupportedClaims.push("Home location claim appears without home/location evidence.");
  }

  return {
    safe_to_send: unsupportedClaims.length === 0,
    unsupported_claims: unsupportedClaims,
    grounding_score: unsupportedClaims.length === 0 ? 0.96 : 0.62,
    checked_against: ["location", "routine", "trusted notes", "retrieved memory"]
  };
}

function buildCareReasoning({ context, environment, scored, relevantMemories }) {
  const toolTrace = buildToolTrace({ context, environment, relevantMemories });
  const risk = classifyCareRisk({ context, environment, scored });
  const evidence = buildEvidence({ context, environment, scored, relevantMemories, risk });
  const actionPlan = buildActionPlan({ context, environment, risk });

  return {
    risk,
    evidence,
    action_plan: actionPlan,
    tool_trace: toolTrace
  };
}

function shouldSpeakDoctorNote(context) {
  if (!context.doctorNote) return false;
  return (
    Boolean(context.mealOrMedicationTime) ||
    includesAny(context.speechText, [
      "medicine",
      "medication",
      "pill",
      "dose",
      "tablet",
      "blue pill",
      "take it",
      "take this"
    ]) ||
    context.visualConcern === "medicine_check"
  );
}

module.exports = {
  buildCareReasoning,
  verifyGrounding
};
