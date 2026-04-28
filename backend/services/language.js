function detectLanguages({ mainLanguage, spokenLanguage, speechText }) {
  const detectedLanguage = spokenLanguage || mainLanguage || "English";
  const interpretedLanguage = mainLanguage || "English";

  return {
    detectedLanguage,
    interpretedLanguage,
    mixedLanguage: hasMixedLanguageHint(speechText)
  };
}

function hasMixedLanguageHint(text) {
  const value = String(text || "").toLowerCase();

  const englishHints = ["where", "what", "doctor", "home"];
  const spanishHints = ["donde", "qué", "doctor", "casa", "estoy"];
  const hindiHints = ["dawai", "ghar", "doctor"];
  const bengaliHints = ["bari", "daktar"];

  const hasEnglish = englishHints.some((w) => value.includes(w));
  const hasSpanish = spanishHints.some((w) => value.includes(w));
  const hasHindi = hindiHints.some((w) => value.includes(w));
  const hasBengali = bengaliHints.some((w) => value.includes(w));

  const hits = [hasEnglish, hasSpanish, hasHindi, hasBengali].filter(Boolean)
    .length;

  return hits > 1;
}

function interpretForMainLanguage({
  speechText,
  spokenLanguage,
  mainLanguage,
  speakerRole
}) {
  if (!speechText) {
    return "No speech provided.";
  }

  if (spokenLanguage === mainLanguage) {
    return speechText;
  }

  return `Interpreted from ${spokenLanguage} for the ${speakerRole} in ${mainLanguage}: ${speechText}`;
}

module.exports = {
  detectLanguages,
  interpretForMainLanguage
};