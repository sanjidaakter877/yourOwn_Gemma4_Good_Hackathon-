const STAGES = {
  NONE: "none",
  GUIDANCE: "guidance",
  CHECK_IN: "check_in",
  HEARING_CHECK: "hearing_check",
  CAREGIVER_WARNING: "caregiver_warning",
  ALERT_SENT: "alert_sent",
  EMERGENCY: "emergency",           // physical distress — bypasses all stages
  WANDERING: "wandering",           // patient trying to leave
  PARANOIA: "paranoia",             // suspicious / paranoid episode
  DE_ESCALATE: "de_escalate",       // aggression — calm down first
  MEDICINE_REFUSAL: "medicine_refusal" // refused or double-dosed medicine
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

  const patientName = profile.userName || signals.patientName || "Mary";
  const task = signals.task || conversationState.task || "resting";
  const room = signals.room || conversationState.room || "the room";

  // ── Special episode types take immediate priority ─────────────────────────
  const episodeType = behaviorAnalysis?.episode_type || "";

  if (episodeType === "emergency" || behaviorAnalysis?.level === "emergency") {
    return buildResult(STAGES.EMERGENCY, patientName, task, room, conversationState);
  }

  if (episodeType === "wandering") {
    return buildResult(STAGES.WANDERING, patientName, task, room, conversationState);
  }

  if (episodeType === "paranoia") {
    return buildResult(STAGES.PARANOIA, patientName, task, room, conversationState);
  }

  if (episodeType === "aggression") {
    return buildResult(STAGES.DE_ESCALATE, patientName, task, room, conversationState);
  }

  if (episodeType === "medicine_refusal") {
    return buildResult(STAGES.MEDICINE_REFUSAL, patientName, task, room, conversationState);
  }

  // ── Normal silent confusion escalation ───────────────────────────────────
  const silentNoProgress = Boolean(
    behaviorAnalysis?.silent_confusion ||
    signals.behaviorSignals?.quietPause ||
    signals.behaviorSignals?.noProgress
  );

  const stage =
    explicitStage ||
    (silentNoProgress ? getStageForSilentCheck(checkCount || 1) : STAGES.NONE);

  return buildResult(stage, patientName, task, room, conversationState);
}

function buildResult(stage, patientName, task, room, conversationState = {}) {
  const isSpecial = [
    STAGES.EMERGENCY, STAGES.WANDERING, STAGES.PARANOIA,
    STAGES.DE_ESCALATE, STAGES.MEDICINE_REFUSAL
  ].includes(stage);

  return {
    stage,
    previousStage: normalizeStage(conversationState.previousStage) || STAGES.NONE,
    shouldSpeak: stage !== STAGES.NONE,
    shouldWait: !isSpecial && [
      STAGES.GUIDANCE, STAGES.CHECK_IN, STAGES.HEARING_CHECK, STAGES.CAREGIVER_WARNING
    ].includes(stage),
    waitSeconds: stage === STAGES.GUIDANCE ? 15 : 8,
    shouldAlertCaregiver: stage === STAGES.ALERT_SENT || stage === STAGES.EMERGENCY || stage === STAGES.WANDERING,
    shouldAlertEmergency: stage === STAGES.EMERGENCY,
    risk: getRiskForStage(stage),
    gemmaContext: {
      stage,
      patient_name: patientName,
      task,
      room,
      tone: stage === STAGES.DE_ESCALATE ? "very calm and non-confrontational" : "calm and gentle",
      instruction: getGemmaInstruction(stage, patientName, task, room)
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
  if (stage === STAGES.EMERGENCY) return "emergency";
  if (stage === STAGES.ALERT_SENT) return "high";
  if (stage === STAGES.CAREGIVER_WARNING) return "high";
  if (stage === STAGES.WANDERING) return "high";
  if (stage === STAGES.PARANOIA) return "medium";
  if (stage === STAGES.DE_ESCALATE) return "medium";
  if (stage === STAGES.MEDICINE_REFUSAL) return "high";
  if (stage === STAGES.HEARING_CHECK) return "medium";
  if (stage === STAGES.CHECK_IN) return "medium";
  if (stage === STAGES.GUIDANCE) return "medium";
  return "low";
}

function getGemmaInstruction(stage, patientName, task, room) {
  if (stage === STAGES.EMERGENCY) {
    return `${patientName} may be injured or in physical danger. Stay very calm. Tell them to stay still and that help is coming. Alert their family immediately. Do not ask questions — just reassure and keep them calm.`;
  }

  if (stage === STAGES.WANDERING) {
    return `${patientName} is trying to leave. Do NOT tell them they cannot go. Gently redirect — ask where they are going, then guide them back with a warm reason (e.g. dinner is ready, their family is coming soon). Alert family quietly.`;
  }

  if (stage === STAGES.PARANOIA) {
    return `${patientName} is feeling suspicious or unsafe. Do NOT argue or correct them. Validate their feelings first — say you understand they feel uneasy. Gently reassure that they are safe and that everyone around them cares for them.`;
  }

  if (stage === STAGES.DE_ESCALATE) {
    return `${patientName} is upset or refusing help. Do NOT push back. Give them space — say you hear them and you will be quiet. Wait for them to calm down. One short sentence only, then stop talking.`;
  }

  if (stage === STAGES.MEDICINE_REFUSAL) {
    return `${patientName} has refused medicine or expressed concern about dosing. Do NOT force it. Acknowledge their concern warmly. Say their family or doctor will confirm the right dose. Alert family so they can follow up.`;
  }

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
