const express = require("express");
const { readData, writeData } = require("../services/storage");

const router = express.Router();

// Allowed keys — prevents arbitrary file writes
const ALLOWED_KEYS = new Set([
  "profile",
  "doctor-profile",
  "patient-notes",
  "care-schedule",
  "medicines",
  "photo-memories"
]);

// GET /api/app-data/:key
router.get("/:key", async (req, res) => {
  const key = req.params.key;
  if (!ALLOWED_KEYS.has(key)) return res.status(400).json({ error: "Unknown key" });
  const value = await readData(`appdata/${key}`, null);
  return res.json({ value });
});

// POST /api/app-data/:key  — body: { value: <any> }
router.post("/:key", async (req, res) => {
  const key = req.params.key;
  if (!ALLOWED_KEYS.has(key)) return res.status(400).json({ error: "Unknown key" });
  const { value } = req.body || {};
  if (value === undefined) return res.status(400).json({ error: "Missing value" });
  await writeData(`appdata/${key}`, value);
  return res.json({ ok: true });
});

module.exports = router;
