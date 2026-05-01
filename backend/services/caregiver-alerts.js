const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const familyPath = path.join(__dirname, "..", "data", "family.json");
const alertsDir = path.join(__dirname, "..", "data", "alerts");
const runtimeAlerts = {};

function readFamilyContacts() {
  try {
    const data = JSON.parse(fs.readFileSync(familyPath, "utf8"));
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.contacts)) return data.contacts;
    if (data.primaryCaregiver) return [data.primaryCaregiver];
    return [];
  } catch {
    return [];
  }
}

function getPrimaryCaregiver() {
  return (
    readFamilyContacts().find((contact) => contact.notify !== false) ||
    readFamilyContacts()[0] ||
    null
  );
}

function getNotificationContacts() {
  return readFamilyContacts().filter(
    (contact) => contact.notify !== false && (contact.phone || contact.email)
  );
}

function isDistressedSpeech(text) {
  return /\b(scared|afraid|lost|confused|where am i|help|panic|worried|unsafe|don't know where|cant find|can't find)\b/i.test(
    String(text || "")
  );
}

function isHomeMatch(environment) {
  const match = environment?.gps_match;
  if (!match) return false;
  return (
    String(match.id || "").toLowerCase() === "home" ||
    String(match.name || "").toLowerCase() === "home"
  );
}

function shouldNotifyFamily({ context, environment, aiResult }) {
  const hasGps =
    typeof context.latitude === "number" && typeof context.longitude === "number";
  if (!hasGps) return { notify: false, reason: "gps_unavailable" };

  const distressed =
    isDistressedSpeech(context.speechText) ||
    aiResult?.care_reasoning?.risk?.flags?.some((flag) =>
      /confusion|distress|lost|wandering|unknown_location/i.test(String(flag))
    );

  if (!distressed) return { notify: false, reason: "no_distress_signal" };
  if (isHomeMatch(environment)) return { notify: false, reason: "patient_at_home" };

  return { notify: true, reason: "distressed_away_from_home" };
}

function writeAlert(patientId, alert) {
  const fullAlert = {
    id: alert.id || `family_alert_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    patientId,
    timestamp: new Date().toISOString(),
    resolved: false,
    ...alert
  };

  runtimeAlerts[patientId] = [fullAlert, ...(runtimeAlerts[patientId] || [])].slice(0, 100);

  try {
    const patientAlertDir = path.join(alertsDir, patientId);
    fs.mkdirSync(patientAlertDir, { recursive: true });
    fs.writeFileSync(
      path.join(patientAlertDir, `${fullAlert.id}.json`),
      JSON.stringify(fullAlert, null, 2)
    );
  } catch (error) {
    console.warn("Alert file write unavailable; using runtime alerts only:", error.message);
  }

  return fullAlert;
}

function readRecentAlerts(patientId, limit = 20) {
  if (runtimeAlerts[patientId]?.length) {
    return runtimeAlerts[patientId].slice(0, limit);
  }

  try {
    const patientAlertDir = path.join(alertsDir, patientId);
    if (!fs.existsSync(patientAlertDir)) return [];

    return fs
      .readdirSync(patientAlertDir)
      .filter((file) => file.endsWith(".json"))
      .map((file) =>
        JSON.parse(fs.readFileSync(path.join(patientAlertDir, file), "utf8"))
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  } catch (error) {
    console.error("Failed to read family alerts:", error.message);
    return [];
  }
}

async function notifyFamilyIfNeeded({ app, context, environment, aiResult }) {
  const decision = shouldNotifyFamily({ context, environment, aiResult });
  if (!decision.notify) return { sent: false, reason: decision.reason };

  const patientId = String(context.userName || "patient").toLowerCase();
  const caregiver = getPrimaryCaregiver();
  const notificationContacts = getNotificationContacts();
  const placeText = environment?.gps_match
    ? `near ${environment.gps_match.name}`
    : "outside saved home/safe places";
  const message = `${context.userName || "The patient"} may be scared or confused and is ${placeText}. Check in now. GPS: ${context.latitude}, ${context.longitude}.`;

  const alert = writeAlert(patientId, {
    type: "PATIENT_AWAY_AND_DISTRESSED",
    severity: "HIGH",
    message,
    description: message,
    caregiverName: caregiver?.name || "",
    caregiverNames: notificationContacts.map((contact) => contact.name).filter(Boolean),
    notificationContactCount: notificationContacts.length,
    location: {
      latitude: context.latitude,
      longitude: context.longitude,
      accuracyMeters: context.locationAccuracy || null,
      matchedPlace: environment?.gps_match || null
    },
    trigger: {
      reason: decision.reason,
      speechText: context.speechText,
      risk: aiResult?.care_reasoning?.risk || null
    }
  });

  app?.locals?.realtimeAlerts?.broadcastAlert(patientId, alert);

  const smsResults = [];
  if (app?.locals?.healthcareIntegration) {
    for (const contact of notificationContacts) {
      if (!contact.phone) continue;
      try {
        const result = await app.locals.healthcareIntegration.sendSmsAlert(
          contact.phone,
          message,
          patientId
        );
        smsResults.push({
          name: contact.name,
          attempted: true,
          success: Boolean(result?.success),
          result
        });
      } catch (error) {
        smsResults.push({
          name: contact.name,
          attempted: true,
          success: false,
          error: error.message
        });
      }
    }
  }

  const sms = {
    attempted: smsResults.length > 0,
    success: smsResults.some((item) => item.success),
    results: smsResults
  };

  return { sent: true, alert, sms };
}

module.exports = {
  notifyFamilyIfNeeded,
  readRecentAlerts,
  shouldNotifyFamily
};
