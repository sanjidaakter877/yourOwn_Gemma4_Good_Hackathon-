function analyzeBehaviorSignals({ speechText, signals = {}, humeEmotion = null }) {
  const behaviorSignals = signals.behaviorSignals || {};
  const speech = String(speechText || "");
  const flags = [];
  const evidence = [];
  let score = 0;

  if (behaviorSignals.noProgress) {
    score += 0.26;
    flags.push("no_progress");
    evidence.push("Timer/OpenCV-ready monitor reported no progress during the interaction.");
  }

  if (behaviorSignals.quietPause) {
    score += 0.24;
    flags.push("quiet_pause");
    evidence.push("Live monitor reported an extended quiet pause.");
  }

  if (behaviorSignals.hesitation) {
    score += 0.18;
    flags.push("hesitation");
    evidence.push("Live monitor reported hesitation or interrupted speech.");
  }

  if (hasFragmentedSpeech(speech)) {
    score += 0.18;
    flags.push("fragmented_speech");
    evidence.push("Speech appears fragmented or repetitive.");
  }

  const emotionNames = (humeEmotion?.top_emotions || []).map((emotion) =>
    String(emotion.name || "").toLowerCase()
  );

  if (emotionNames.some((name) => /confusion|doubt|distress|fear|anxiety|sadness/.test(name))) {
    score += 0.16;
    flags.push("expression_uncertainty");
    evidence.push("Hume expression signals include possible uncertainty or distress cues.");
  }

  const level = score >= 0.45 ? "possible_confusion" : score > 0 ? "watch" : "none";

  return {
    provider: "opencv_ready_behavior_detector",
    level,
    score: Number(Math.min(score, 0.95).toFixed(2)),
    flags,
    evidence,
    note:
      "Behavior signals are support cues only. They should not be treated as diagnosis."
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

module.exports = {
  analyzeBehaviorSignals
};
