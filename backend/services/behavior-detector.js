function analyzeBehaviorSignals({ speechText, signals = {}, humeEmotion = null }) {
  const behaviorSignals = signals.behaviorSignals || {};
  const speech = String(speechText || "");
  const flags = [];
  const evidence = [];
  const signalWeights = {};
  let score = 0;

  if (behaviorSignals.noProgress) {
    score += 0.26;
    signalWeights.no_progress = 0.26;
    flags.push("no_progress");
    evidence.push("Timer/OpenCV-ready monitor reported no progress during the interaction.");
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

  const level = score >= 0.45 ? "possible_confusion" : score > 0 ? "watch" : "none";
  const isSilentEpisode = Boolean(
    behaviorSignals.quietPause ||
      behaviorSignals.noProgress ||
      (!speech.trim() && score > 0)
  );
  const episodeType = isSilentEpisode
    ? "silent_confusion"
    : flags.includes("fragmented_speech") || flags.includes("repeated_orientation")
      ? "spoken_confusion"
      : "none";

  return {
    provider: "opencv_ready_behavior_detector",
    level,
    score: Number(Math.min(score, 0.95).toFixed(2)),
    episode_type: episodeType,
    silent_confusion: isSilentEpisode,
    flags,
    evidence,
    signal_weights: signalWeights,
    note:
      "Behavior signals are support cues only. They are fused with context and should not be treated as diagnosis."
  };
}

function hasFragmentedSpeech(text) {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  if (words.length < 3) return false;

  const repeatedWords = words.filter(
    (word, index) => index > 0 && word === words[index - 1]
  );

  return (
    repeatedWords.length >= 2 ||
    /\b(um|uh|wait|i forgot|i can't remember|i cant remember|what was i saying|never mind)\b/i.test(
      text
    )
  );
}

function repeatedOrientationQuestion(text) {
  return /\b(where am i|what day is it|what year is it|who are you|i am lost|i'm lost)\b/i.test(
    String(text || "")
  );
}

module.exports = {
  analyzeBehaviorSignals
};
