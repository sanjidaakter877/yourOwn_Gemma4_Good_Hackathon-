const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname, "..", "data");

function readJson(fileName, fallback = {}) {
  try {
    const fullPath = path.join(dataDir, fileName);
    const raw = fs.readFileSync(fullPath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function buildContext({ profile = {}, signals = {} }) {
  const patient = readJson("patient.json", {});
  const family = readJson("family.json", []);
  const doctor = readJson("doctor.json", []);
  const reminders = readJson("reminders.json", []);
  const session = readJson("session.json", {});
  const schedule = readJson("schedule.json", []);

  // Always trust patient.json name — ignore stale "Mary" cached in browser localStorage
  const userName = patient.name || safeString(profile.userName, "John");
  const mainLanguage = safeString(
    profile.mainLanguage,
    patient.mainLanguage || "English"
  );

  return {
    userName,
    mainLanguage,

    speakerRole: safeString(signals.speakerRole, "patient"),
    spokenLanguage: safeString(signals.spokenLanguage, mainLanguage),

    speechText: safeString(signals.speechText, ""),
    room: safeString(signals.room, "auto-detected or unknown"),
    timeOfDay: safeString(signals.timeOfDay, "unknown"),
    locationName: safeString(signals.locationName, ""),
    nearbyPerson: safeString(signals.nearbyPerson, ""),
    lastEvent: safeString(signals.lastEvent, ""),

    latitude: safeNumber(signals.latitude),
    longitude: safeNumber(signals.longitude),
    locationAccuracy: safeNumber(signals.locationAccuracy),

    currentTime: safeString(signals.currentTime, ""),
    currentClock: safeString(signals.currentClock, ""),
    autoContext: safeString(signals.autoContext, ""),
    routineStatus: safeString(signals.routineStatus, ""),
    mealOrMedicationTime: Boolean(signals.mealOrMedicationTime),
    careNote: safeString(signals.careNote, ""),
    doctorNote: safeString(signals.doctorNote, ""),
    visualDescription: safeString(signals.visualDescription, ""),
    visualConcern: safeString(signals.visualConcern, ""),
    capturedImageAvailable: Boolean(signals.capturedImage),
    capturedImage: safeString(signals.capturedImage, ""),
    humeEmotion: signals.humeEmotion || null,
    behaviorAnalysis: signals.behaviorAnalysis || null,
    behaviorSignals: signals.behaviorSignals || {},
    conversationState: signals.conversationState || {},
    conversationHistory: Array.isArray(signals.conversationHistory) ? signals.conversationHistory.slice(-6) : [],
    escalation: signals.escalation || null,

    medicationPlan: safeString(signals.medicationPlan, ""),
    medicines: Array.isArray(signals.medicines) ? signals.medicines : [],

    scheduleNow: signals.scheduleNow || null,
    dailyLog: Array.isArray(signals.dailyLog) ? signals.dailyLog : [],
    patientNotes: Array.isArray(signals.patientNotes) ? signals.patientNotes : [],
    objects: Array.isArray(signals.objects) ? signals.objects : [],
    imageLabels: Array.isArray(signals.imageLabels) ? signals.imageLabels : [],

    patient,
    family,
    doctor,
    reminders,
    session,
    schedule
  };
}

module.exports = {
  buildContext
};
