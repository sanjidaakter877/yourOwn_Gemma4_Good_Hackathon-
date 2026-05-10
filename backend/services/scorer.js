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

  // ── EMERGENCY — highest priority, overrides everything ───────────────────
  const emergencyClues = [
    "i fell", "i've fallen", "i have fallen", "fell down", "i fell down",
    "i can't get up", "i cannot get up", "can't get up",
    "i'm hurt", "i am hurt", "i hurt myself",
    "i'm bleeding", "i am bleeding", "there's blood",
    "i hit my head", "hit my head",
    "i can't breathe", "i cannot breathe", "hard to breathe", "can't breathe",
    "chest pain", "my chest hurts", "heart hurts",
    "i think i'm dying", "i'm dying", "help me i fell",
    "i feel faint", "i'm going to faint", "i passed out",
    "i collapsed", "i'm on the floor", "lying on the floor",
    "call an ambulance", "call 999", "call 911", "emergency",
    "i feel dizzy", "i'm dizzy", "i am dizzy", "feeling dizzy", "so dizzy",
    "i feel sick", "i feel very sick", "i feel nauseous", "i am nauseous",
    "i feel unwell", "i don't feel well", "i do not feel well",
    "i feel ill", "i feel very ill", "i'm going to be sick", "i am going to be sick"
  ];

  // ── WANDERING — patient wants to physically leave ────────────────────────
  const wanderingClues = [
    "i want to go home", "i need to go home", "take me home",
    "i'm going out", "i am going out", "i need to leave",
    "i have to go", "i must go", "let me out",
    "i'm leaving", "i am leaving", "i want to leave",
    "i need to find my way", "i'm going to walk",
    "i'm going to the shops", "going to the bus stop",
    "i need to get out of here", "get me out of here"
  ];

  // ── PARANOIA — suspicion, fear of others ────────────────────────────────
  const paranoiaClues = [
    "someone stole", "they stole", "someone took my",
    "someone is in my house", "someone is in my room", "there's someone here",
    "there's a stranger", "i don't know these people", "who are these people",
    "someone is following me", "they are watching me", "people are watching",
    "i'm being watched", "someone broke in", "there's an intruder",
    "i don't trust", "i don't know you", "you're not real",
    "this is a trick", "you're lying to me", "i'm being tricked",
    "they want to hurt me", "i'm not safe here"
  ];

  // ── AGGRESSION / REFUSAL — patient pushing back ──────────────────────────
  const aggressionClues = [
    "leave me alone", "go away", "stop talking", "be quiet", "shut up",
    "i don't want to talk", "i don't want help", "i don't need help",
    "stop bothering me", "you're annoying me", "you're annoying",
    "i'm angry", "i am angry", "i'm frustrated", "stop it",
    "don't touch me", "get away from me", "leave me be",
    "i refuse", "no i won't", "i won't do it"
  ];

  // ── MEDICINE REFUSAL ─────────────────────────────────────────────────────
  const medicineRefusalClues = [
    "i won't take it", "i refuse to take", "i don't want to take",
    "i'm not taking", "i am not taking", "i don't need medicine",
    "i don't need my pill", "i don't need that tablet",
    "that medicine makes me sick", "the pill makes me sick",
    "i already took it", "i took it already", "i took two",
    "i took too many", "i took extra"
  ];

  // ── Existing clues ───────────────────────────────────────────────────────
  const orientationClues = [
    "where am i", "what's happening", "what is happening",
    "i'm confused", "im confused", "unsure", "don't know", "dont know",
    "what was i doing", "losing their train of thought",
    "quiet for a while", "paused", "who is this", "where is this",
    "what is this place", "i don't recognise", "i don't recognize"
  ];

  const emotionalClues = [
    "i feel scared", "scared", "afraid", "worried",
    "lost", "help me", "panic", "anxious",
    "i'm frightened", "i am frightened", "terrified",
    "i'm alone", "i feel alone", "nobody is here",
    "i'm sad", "i am sad", "i'm crying", "i'm upset"
  ];

  const memoryClues = [
    "what happened earlier", "what did the doctor say",
    "who was here", "did i come here yesterday",
    "what did i do", "who visited",
    "i can't remember", "i cannot remember",
    "i forgot", "i've forgotten", "i have forgotten",
    "what was i supposed to do", "what did you say"
  ];

  const routineClues = [
    "what do i do now", "what next", "what now", "what should i do now"
  ];

  const medicationClues = [
    "can't find the pill", "cannot find the pill",
    "can't find my pill", "can't find my medicine", "can't find my medication",
    "lost my pill", "lost my medicine", "lost my medication",
    "where is my pill", "where are my pills", "where is my medicine",
    "where is my tablet", "where are my tablets",
    "did i take my pill", "did i take my medicine", "did i take my tablet",
    "forgot my pill", "forgot my medicine", "forgot to take my",
    "time to take", "medicine reminder", "pill reminder"
  ];

  // ── Priority scoring — emergency first ───────────────────────────────────
  if (includesAny(speechText, emergencyClues)) {
    mode = "emergency";
    confidence = 0.98;
    reasons.push("EMERGENCY: physical distress or fall detected");
    return { mode, confidence, reasons };
  }

  if (includesAny(speechText, wanderingClues)) {
    mode = "wandering";
    confidence += 0.20;
    reasons.push("Detected wandering / wanting to leave");
  }

  if (includesAny(speechText, paranoiaClues)) {
    mode = "paranoia";
    confidence += 0.18;
    reasons.push("Detected paranoid or suspicious language");
  }

  if (includesAny(speechText, aggressionClues)) {
    mode = "aggression";
    confidence += 0.16;
    reasons.push("Detected refusal or aggressive language");
  }

  if (includesAny(speechText, medicineRefusalClues)) {
    mode = "medicine_refusal";
    confidence += 0.16;
    reasons.push("Detected medicine refusal or dosing concern");
  }

  if (includesAny(speechText, orientationClues)) {
    if (mode === "general_support") mode = "orientation";
    confidence += 0.14;
    reasons.push("Detected confusion/orientation language");
  }

  if (includesAny(speechText, emotionalClues)) {
    if (mode === "general_support") mode = "emotional_support";
    confidence += 0.12;
    reasons.push("Detected emotional distress language");
  }

  if (includesAny(speechText, memoryClues)) {
    if (mode === "general_support") mode = "memory_recall";
    confidence += 0.14;
    reasons.push("Detected memory recall request");
  }

  if (includesAny(speechText, routineClues)) {
    if (mode === "general_support") mode = "routine_guidance";
    confidence += 0.1;
    reasons.push("Detected routine guidance request");
  }

  if (includesAny(speechText, medicationClues)) {
    if (mode === "general_support") mode = "routine_guidance";
    confidence += 0.14;
    reasons.push("Detected medication concern");
  }

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

  return { mode, confidence, reasons };
}

module.exports = { scoreSupportMode };
