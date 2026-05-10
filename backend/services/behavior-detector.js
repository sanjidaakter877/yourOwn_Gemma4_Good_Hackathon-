function analyzeBehaviorSignals({ speechText, signals = {}, humeEmotion = null }) {
  const behaviorSignals = signals.behaviorSignals || {};
  const speech = String(speechText || "");
  const flags = [];
  const evidence = [];
  const signalWeights = {};
  let score = 0;

  // ── Physical distress / emergency ────────────────────────────────────────
  if (hasPhysicalDistress(speech)) {
    score += 0.60;
    signalWeights.physical_distress = 0.60;
    flags.push("physical_distress");
    evidence.push("Speech contains physical emergency signals (fall, pain, can't breathe).");
  }

  // ── Wandering intent ─────────────────────────────────────────────────────
  if (hasWanderingIntent(speech)) {
    score += 0.35;
    signalWeights.wandering_intent = 0.35;
    flags.push("wandering_intent");
    evidence.push("Patient expressed intent to leave or wander.");
  }

  // ── Paranoia ─────────────────────────────────────────────────────────────
  if (hasParanoia(speech)) {
    score += 0.30;
    signalWeights.paranoia = 0.30;
    flags.push("paranoia");
    evidence.push("Speech contains paranoid or suspicious language.");
  }

  // ── Aggression / refusal ─────────────────────────────────────────────────
  if (hasAggression(speech)) {
    score += 0.25;
    signalWeights.aggression = 0.25;
    flags.push("aggression");
    evidence.push("Patient expressed refusal or aggressive language.");
  }

  // ── Medicine refusal / double-dose concern ───────────────────────────────
  if (hasMedicineRefusal(speech)) {
    score += 0.28;
    signalWeights.medicine_refusal = 0.28;
    flags.push("medicine_refusal");
    evidence.push("Patient refused medicine or expressed dosing concern.");
  }

  // ── Existing signals ─────────────────────────────────────────────────────
  if (behaviorSignals.noProgress) {
    score += 0.26;
    signalWeights.no_progress = 0.26;
    flags.push("no_progress");
    evidence.push("Timer/OpenCV monitor reported no progress during the interaction.");
  }

  if (behaviorSignals.quietPause) {
    score += 0.24;
    signalWeights.quiet_pause = 0.24;
    flags.push("quiet_pause");
    evidence.push("Live monitor reported an extended quiet pause.");
  }

  if (behaviorSignals.hesitation) {
    score += 0.18;
    signalWeights.hesitation = 0.18;
    flags.push("hesitation");
    evidence.push("Live monitor reported hesitation or interrupted speech.");
  }

  if (behaviorSignals.repeatedSilentCheck) {
    score += 0.2;
    signalWeights.repeated_silent_check = 0.2;
    flags.push("repeated_silent_check");
    evidence.push(
      `Patient remained silent across ${behaviorSignals.liveSilenceCheckCount || "multiple"} live checks.`
    );
  }

  if (behaviorSignals.gpsAvailable) {
    flags.push("gps_checked");
    evidence.push("Live monitor included GPS context for safety matching.");
  }

  if (behaviorSignals.cameraAvailable || behaviorSignals.capturedImageAvailable) {
    flags.push("camera_context_checked");
    evidence.push("Live monitor included camera or captured-image context.");
  }

  if (behaviorSignals.microphoneStatus) {
    flags.push(`mic_${String(behaviorSignals.microphoneStatus).toLowerCase()}`);
    evidence.push(`Microphone status during live monitor: ${behaviorSignals.microphoneStatus}.`);
  }

  if (hasFragmentedSpeech(speech)) {
    score += 0.18;
    signalWeights.fragmented_speech = 0.18;
    flags.push("fragmented_speech");
    evidence.push("Speech appears fragmented or repetitive.");
  }

  if (behaviorSignals.repeatedPrompt || repeatedOrientationQuestion(speech)) {
    score += 0.14;
    signalWeights.repeated_orientation = 0.14;
    flags.push("repeated_orientation");
    evidence.push("Recent language suggests repeated orientation support may be needed.");
  }

  if (behaviorSignals.unknownLocation) {
    score += 0.12;
    signalWeights.unknown_location_context = 0.12;
    flags.push("unknown_location_context");
    evidence.push("Behavior monitor was paired with unknown or unmatched location context.");
  }

  if (behaviorSignals.nightContext) {
    score += 0.08;
    signalWeights.night_context = 0.08;
    flags.push("night_context");
    evidence.push("Behavior monitor was active during a higher-risk nighttime context.");
  }

  const emotionNames = (humeEmotion?.top_emotions || []).map((emotion) =>
    String(emotion.name || "").toLowerCase()
  );

  if (emotionNames.some((name) => /confusion|doubt|distress|fear|anxiety|sadness/.test(name))) {
    score += 0.16;
    signalWeights.expression_uncertainty = 0.16;
    flags.push("expression_uncertainty");
    evidence.push("Hume expression signals include possible uncertainty or distress cues.");
  }

  // ── Episode type classification ───────────────────────────────────────────
  const isEmergency = flags.includes("physical_distress");
  const isWandering = flags.includes("wandering_intent");
  const isParanoia = flags.includes("paranoia");
  const isAggression = flags.includes("aggression");
  const isMedicineRefusal = flags.includes("medicine_refusal");

  const isSilentEpisode = Boolean(
    behaviorSignals.quietPause ||
    behaviorSignals.noProgress ||
    (!speech.trim() && score > 0)
  );

  const episodeType = isEmergency ? "emergency"
    : isWandering ? "wandering"
    : isParanoia ? "paranoia"
    : isAggression ? "aggression"
    : isMedicineRefusal ? "medicine_refusal"
    : isSilentEpisode ? "silent_confusion"
    : flags.includes("fragmented_speech") || flags.includes("repeated_orientation") ? "spoken_confusion"
    : "none";

  const level = isEmergency ? "emergency"
    : score >= 0.45 ? "possible_confusion"
    : score > 0 ? "watch"
    : "none";

  return {
    provider: "opencv_ready_behavior_detector",
    level,
    score: Number(Math.min(score, 0.98).toFixed(2)),
    episode_type: episodeType,
    silent_confusion: isSilentEpisode && !isEmergency,
    flags,
    evidence,
    signal_weights: signalWeights,
    note: "Behavior signals are support cues only. They are fused with context and should not be treated as diagnosis."
  };
}

function hasPhysicalDistress(text) {
  return /\b(i fell|i've fallen|i have fallen|fell down|can't get up|cannot get up|i'm hurt|i am hurt|i hurt myself|i'm bleeding|i am bleeding|chest pain|can't breathe|cannot breathe|hard to breathe|i collapsed|on the floor|lying on the floor|call an ambulance|call 999|call 911|i'm dying|i am dying|i passed out|i feel faint|going to faint|hit my head|i feel dizzy|i'm dizzy|i am dizzy|feeling dizzy|so dizzy|i feel sick|i feel very sick|i feel nauseous|i am nauseous|i feel unwell|i don't feel well|i do not feel well|i feel ill|i feel very ill|i'm going to be sick|i am going to be sick)\b/i.test(text);
}

function hasWanderingIntent(text) {
  return /\b(i want to go home|i need to go home|take me home|i'm going out|i am going out|i need to leave|i have to go|i must go|let me out|i'm leaving|i am leaving|i want to leave|get me out of here|i need to get out)\b/i.test(text);
}

function hasParanoia(text) {
  return /\b(someone stole|they stole|someone took my|someone is in my|there's someone|there's a stranger|i don't know these people|who are these people|someone is following|they are watching|i'm being watched|someone broke in|intruder|i don't trust|you're not real|this is a trick|they want to hurt me)\b/i.test(text);
}

function hasAggression(text) {
  return /\b(leave me alone|go away|stop talking|shut up|i don't want to talk|i don't want help|stop bothering me|you're annoying|i'm angry|i am angry|i refuse|i won't do it|don't touch me|get away from me)\b/i.test(text);
}

function hasMedicineRefusal(text) {
  return /\b(i won't take it|i refuse to take|i don't want to take|i'm not taking|i am not taking|i don't need medicine|i don't need my pill|that medicine makes me sick|i already took it|i took it already|i took two|i took too many|i took extra)\b/i.test(text);
}

function hasFragmentedSpeech(text) {
  const words = text.toLowerCase().replace(/[^\w\s']/g, " ").split(/\s+/).filter(Boolean);
  if (words.length < 3) return false;
  const repeatedWords = words.filter((word, index) => index > 0 && word === words[index - 1]);
  return (
    repeatedWords.length >= 2 ||
    /\b(um|uh|wait|i forgot|i can't remember|i cant remember|what was i saying|never mind)\b/i.test(text)
  );
}

function repeatedOrientationQuestion(text) {
  return /\b(where am i|what day is it|what year is it|who are you|i am lost|i'm lost|what is this place)\b/i.test(String(text || ""));
}

module.exports = { analyzeBehaviorSignals };
