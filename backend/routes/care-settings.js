const express = require("express");
const { readData, writeData } = require("../services/storage");
const { readRecentAlerts } = require("../services/caregiver-alerts");

const router = express.Router();

function normalizeFamily(data) {
  if (Array.isArray(data)) return { contacts: data };
  if (Array.isArray(data?.contacts)) return data;
  if (data?.primaryCaregiver) return { contacts: [data.primaryCaregiver] };
  return { contacts: [] };
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

router.get("/", async (req, res) => {
  const [familyRaw, places] = await Promise.all([
    readData("family.json", []),
    readData("places.json", [])
  ]);
  const family = normalizeFamily(familyRaw);
  const home = Array.isArray(places) ? places.find(p => p.id === "home") || null : null;
  return res.json({
    home,
    primaryCaregiver: family.contacts[0] || null,
    contacts: family.contacts
  });
});

router.post("/", async (req, res) => {
  try {
    const body = req.body || {};
    const places = await readData("places.json", []);
    const homeIndex = Array.isArray(places) ? places.findIndex(p => p.id === "home") : -1;
    const previousHome = homeIndex >= 0 ? places[homeIndex] : {};

    const home = {
      id: "home",
      name: "Home",
      lat: Number(body.home?.lat ?? previousHome.lat),
      lng: Number(body.home?.lng ?? previousHome.lng),
      radiusMeters: Number(body.home?.radiusMeters ?? previousHome.radiusMeters ?? 120),
      address: String(body.home?.address ?? previousHome.address ?? ""),
      meaning: String(body.home?.meaning ?? previousHome.meaning ?? "") || "This is your home. You are safe here."
    };

    if (!Number.isFinite(home.lat) || !Number.isFinite(home.lng)) {
      return res.status(400).json({ error: "Home latitude and longitude are required." });
    }

    const updatedPlaces = Array.isArray(places) ? [...places] : [];
    if (homeIndex >= 0) updatedPlaces[homeIndex] = home;
    else updatedPlaces.unshift(home);
    await writeData("places.json", updatedPlaces);

    const previousFamily = normalizeFamily(await readData("family.json", []));
    const incomingContacts = Array.isArray(body.contacts)
      ? body.contacts
      : [body.primaryCaregiver || previousFamily.contacts[0] || {}];
    let contacts = incomingContacts
      .map((contact, i) => normalizeContact(contact, previousFamily.contacts[i] || {}))
      .filter(c => c.name || c.phone || c.email);

    if (contacts.length === 0) {
      contacts.push(normalizeContact(body.primaryCaregiver, { name: "Family", relationship: "caregiver", notify: true }));
    }

    const family = { contacts };
    await writeData("family.json", family);

    return res.json({ home, primaryCaregiver: family.contacts[0] || null, contacts: family.contacts });
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
