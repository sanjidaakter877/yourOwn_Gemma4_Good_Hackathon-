function includesAny(text, phrases) {
  const lower = String(text || "").toLowerCase();
  return phrases.some((phrase) => lower.includes(phrase));
}

function scoreSupportMode({
  speechText,
  speakerRole,
  timeOfDay,
  environment,
  lastEvent
}) {
  const reasons = [];
  let confidence = 0.55;
  let mode = "general_support";

  const orientationClues = [
    "where am i",
    "what's happening",
    "what is happening",
    "i'm confused",
    "im confused",
    "unsure",
    "don't know",
    "dont know",
    "what was i doing",
    "losing their train of thought",
    "quiet for a while",
    "paused",
    "who is this",
    "where is this"
  ];

  const emotionalClues = [
    "i feel scared",
    "scared",
    "afraid",
    "worried",
    "lost",
    "help me",
    "panic",
    "anxious"
  ];

  const memoryClues = [
    "what happened earlier",
    "what did the doctor say",
    "who was here",
    "did i come here yesterday",
    "what did i do",
    "who visited"
  ];

  const routineClues = [
    "what do i do now",
    "what next",
    "what now",
    "what should i do now"
  ];

  const medicationClues = [
    "can't find the pill", "cannot find the pill", "don't find the pill",
    "can't find my pill", "can't find my medicine", "can't find my medication",
    "lost my pill", "lost my medicine", "lost my medication",
    "where is my pill", "where are my pills", "where is my medicine",
    "where is my tablet", "where are my tablets",
    "did i take my pill", "did i take my medicine", "did i take my tablet",
    "forgot my pill", "forgot my medicine", "forgot to take my"
  ];

  if (includesAny(speechText, orientationClues)) {
    mode = "orientation";
    confidence += 0.14;
    reasons.push("Detected confusion/orientation language");
  }

  if (includesAny(speechText, emotionalClues)) {
    mode = "emotional_support";
    confidence += 0.12;
    reasons.push("Detected emotional distress language");
  }

  if (includesAny(speechText, memoryClues)) {
    mode = "memory_recall";
    confidence += 0.14;
    reasons.push("Detected memory recall request");
  }

  if (includesAny(speechText, routineClues)) {
    mode = "routine_guidance";
    confidence += 0.1;
    reasons.push("Detected routine guidance request");
  }

  if (includesAny(speechText, medicationClues)) {
    mode = "routine_guidance";
    confidence += 0.14;
    reasons.push("Detected medication concern");
  }

  // Any speech that isn't a safety/care signal is normal conversation
  if (mode === "general_support" && speechText && speechText.trim().length > 0) {
    mode = "conversation";
    confidence += 0.1;
    reasons.push("No safety signals — treating as companion conversation");
  }

  if (speakerRole === "doctor") {
    confidence += 0.05;
    reasons.push("Doctor role provided");
  }

  if (environment.likely_place) {
    confidence += 0.05;
    reasons.push(`Environment matched likely place "${environment.likely_place}"`);
  }

  if (environment.likely_people.length) {
    confidence += 0.05;
    reasons.push("Nearby person context available");
  }

  if (timeOfDay) {
    confidence += 0.03;
    reasons.push(`Used time-of-day signal "${timeOfDay}"`);
  }

  if (lastEvent) {
    confidence += 0.03;
    reasons.push("Recent event context available");
  }

  confidence = Number(Math.min(confidence, 0.98).toFixed(2));

  return {
    mode,
    confidence,
    reasons
  };
}

module.exports = {
  scoreSupportMode
};
