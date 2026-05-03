const STAGES = {
  NONE: "none",
  GUIDANCE: "guidance",
  CHECK_IN: "check_in",
  HEARING_CHECK: "hearing_check",
  CAREGIVER_WARNING: "caregiver_warning",
  ALERT_SENT: "alert_sent"
};

const ORDERED_STAGES = [
  STAGES.GUIDANCE,
  STAGES.CHECK_IN,
  STAGES.HEARING_CHECK,
  STAGES.CAREGIVER_WARNING,
  STAGES.ALERT_SENT
];

function getStageForSilentCheck(checkCount = 0) {
  const index = Math.max(0, Math.min(ORDERED_STAGES.length - 1, Number(checkCount || 1) - 1));
  return ORDERED_STAGES[index];
}

function getNextStage(currentStage = STAGES.NONE) {
  if (currentStage === STAGES.NONE) return STAGES.GUIDANCE;

  const index = ORDERED_STAGES.indexOf(currentStage);
  if (index === -1) return STAGES.GUIDANCE;

  return ORDERED_STAGES[Math.min(index + 1, ORDERED_STAGES.length - 1)];
}

function evaluateEscalation({ profile = {}, signals = {}, behaviorAnalysis = null }) {
  const conversationState = signals.conversationState || {};
  const explicitStage = normalizeStage(conversationState.stage || signals.escalationStage);
  const checkCount = Number(
    conversationState.silentCheckCount ||
      signals.behaviorSignals?.liveSilenceCheckCount ||
      signals.silentCheckCount ||
      0
  );
  const silentNoProgress = Boolean(
    behaviorAnalysis?.silent_confusion ||
      signals.behaviorSignals?.quietPause ||
      signals.behaviorSignals?.noProgress
  );

  const stage =
    explicitStage ||
    (silentNoProgress ? getStageForSilentCheck(checkCount || 1) : STAGES.NONE);

  const patientName = profile.userName || signals.patientName || "Mary";
  const task = signals.task || conversationState.task || "making tea";
  const room = signals.room || conversationState.room || "kitchen";

  return {
    stage,
    previousStage: normalizeStage(conversationState.previousStage) || STAGES.NONE,
    shouldSpeak: stage !== STAGES.NONE,
    shouldWait: [STAGES.GUIDANCE, STAGES.CHECK_IN, STAGES.HEARING_CHECK, STAGES.CAREGIVER_WARNING].includes(stage),
    waitSeconds: stage === STAGES.GUIDANCE ? 15 : 8,
    shouldAlertCaregiver: stage === STAGES.ALERT_SENT,
    risk: getRiskForStage(stage),
    gemmaContext: {
      stage,
      patient_name: patientName,
      task,
      room,
      tone: "calm and gentle",
      instruction: getGemmaInstruction(stage, patientName, task)
    }
  };
}

function normalizeStage(stage) {
  const value = String(stage || "").trim().toLowerCase();
  if (!value) return "";
  if (value === "initial_guidance") return STAGES.GUIDANCE;
  if (value === "alert") return STAGES.ALERT_SENT;
  return Object.values(STAGES).includes(value) ? value : "";
}

function getRiskForStage(stage) {
  if (stage === STAGES.ALERT_SENT) return "high";
  if (stage === STAGES.CAREGIVER_WARNING) return "high";
  if (stage === STAGES.HEARING_CHECK) return "medium";
  if (stage === STAGES.CHECK_IN) return "medium";
  if (stage === STAGES.GUIDANCE) return "medium";
  return "low";
}

function getGemmaInstruction(stage, patientName, task) {
  if (stage === STAGES.GUIDANCE) {
    return `Orient ${patientName} to the ${task} routine and offer one gentle next step.`;
  }

  if (stage === STAGES.CHECK_IN) {
    return `Ask if ${patientName} is okay and whether she needs help.`;
  }

  if (stage === STAGES.HEARING_CHECK) {
    return `Ask ${patientName} to answer with a simple yes or no so you know she can hear you.`;
  }

  if (stage === STAGES.CAREGIVER_WARNING) {
    return `Tell ${patientName} that a caregiver may be contacted if she cannot respond.`;
  }

  if (stage === STAGES.ALERT_SENT) {
    return `Say a trusted caregiver is being notified and ask ${patientName} to stay in place.`;
  }

  return `Respond naturally and gently to ${patientName}.`;
}

module.exports = {
  STAGES,
  getStageForSilentCheck,
  getNextStage,
  evaluateEscalation
};
