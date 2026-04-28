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
    "what was i doing",
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