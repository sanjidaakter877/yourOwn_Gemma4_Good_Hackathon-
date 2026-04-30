const express = require("express");
const fs = require("fs");
const path = require("path");
const { readRecentAlerts } = require("../services/caregiver-alerts");

const router = express.Router();
const placesPath = path.join(__dirname, "..", "data", "places.json");
const familyPath = path.join(__dirname, "..", "data", "family.json");

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2));
}

function normalizeFamily(data) {
  if (Array.isArray(data)) return { contacts: data };
  if (Array.isArray(data.contacts)) return data;
  if (data.primaryCaregiver) return { contacts: [data.primaryCaregiver] };
  return { contacts: [] };
}

function getHomePlace() {
  const places = readJson(placesPath, []);
  return places.find((place) => place.id === "home") || null;
}

function normalizeContact(contact, fallback = {}) {
  return {
    name: String(contact?.name ?? fallback.name ?? ""),
    relationship: String(contact?.relationship ?? fallback.relationship ?? "caregiver"),
    phone: String(contact?.phone ?? fallback.phone ?? ""),
    email: String(contact?.email ?? fallback.email ?? ""),
    language: String(contact?.language ?? fallback.language ?? "English"),
    notes: String(contact?.notes ?? fallback.notes ?? ""),
    notify: contact?.notify ?? fallback.notify ?? true
  };
}

router.get("/", (req, res) => {
  const family = normalizeFamily(readJson(familyPath, []));
  return res.json({
    home: getHomePlace(),
    primaryCaregiver: family.contacts[0] || null,
    contacts: family.contacts
  });
});

router.post("/", (req, res) => {
  try {
    const body = req.body || {};
    const places = readJson(placesPath, []);
    const homeIndex = places.findIndex((place) => place.id === "home");
    const previousHome = homeIndex >= 0 ? places[homeIndex] : {};

    const home = {
      id: "home",
      name: "Home",
      lat: Number(body.home?.lat ?? previousHome.lat),
      lng: Number(body.home?.lng ?? previousHome.lng),
      radiusMeters: Number(body.home?.radiusMeters ?? previousHome.radiusMeters ?? 120),
      address: String(body.home?.address ?? previousHome.address ?? ""),
      meaning:
        String(body.home?.meaning ?? previousHome.meaning ?? "") ||
        "This is your home. You are safe here."
    };

    if (!Number.isFinite(home.lat) || !Number.isFinite(home.lng)) {
      return res.status(400).json({ error: "Home latitude and longitude are required." });
    }

    if (homeIndex >= 0) places[homeIndex] = home;
    else places.unshift(home);
    writeJson(placesPath, places);

    const previousFamily = normalizeFamily(readJson(familyPath, []));
    const incomingContacts = Array.isArray(body.contacts)
      ? body.contacts
      : [body.primaryCaregiver || previousFamily.contacts[0] || {}];
    const contacts = incomingContacts
      .map((contact, index) =>
        normalizeContact(contact, previousFamily.contacts[index] || {})
      )
      .filter((contact) => contact.name || contact.phone || contact.email);

    if (contacts.length === 0) {
      contacts.push(
        normalizeContact(body.primaryCaregiver, {
          name: "Family",
          relationship: "caregiver",
          notify: true
        })
      );
    }

    const family = { contacts };
    writeJson(familyPath, family);

    return res.json({
      home,
      primaryCaregiver: family.contacts[0] || null,
      contacts: family.contacts
    });
  } catch (error) {
    console.error("Care settings save error:", error.message);
    return res.status(500).json({ error: "Failed to save care settings." });
  }
});

router.get("/alerts/:patientId", (req, res) => {
  return res.json({
    patientId: req.params.patientId,
    alerts: readRecentAlerts(req.params.patientId.toLowerCase(), 20)
  });
});

module.exports = router;
