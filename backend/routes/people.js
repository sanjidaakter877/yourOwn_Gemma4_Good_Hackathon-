const express = require("express");
const multer = require("multer");
const router = express.Router();
const {
  addPerson,
  listPeople,
  findPerson,
  deletePerson,
  updatePersonPhoto,
  getRecentMemories
} = require("../services/people-memory");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// List all saved people for a patient
router.get("/", async (req, res) => {
  try {
    const patientName = req.query.patient || "John";
    const people = await listPeople(patientName);
    res.json({ people });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a person (family action)
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { patientName, name, relationship, notes } = req.body;
    if (!name) return res.status(400).json({ error: "name is required" });

    const person = await addPerson({
      patientName: patientName || "John",
      name,
      relationship: relationship || "",
      notes: notes || "",
      photoBuffer: req.file?.buffer || null,
      mimeType: req.file?.mimetype || "image/jpeg"
    });

    res.json({ ok: true, person });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Look up a person by name
router.get("/find", async (req, res) => {
  try {
    const { patient, name } = req.query;
    if (!name) return res.status(400).json({ error: "name is required" });
    const person = await findPerson(patient || "John", name);
    res.json({ person: person || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a person's photo
router.patch("/:id/photo", upload.single("photo"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No photo provided" });
    const { patientName } = req.body;
    const person = await updatePersonPhoto(
      req.params.id,
      patientName || "John",
      req.file.buffer,
      req.file.mimetype
    );
    res.json({ ok: true, person });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a person
router.delete("/:id", async (req, res) => {
  try {
    await deletePerson(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Recent activity memories
router.get("/memories", async (req, res) => {
  try {
    const patientName = req.query.patient || "John";
    const memories = await getRecentMemories(patientName, 20);
    res.json({ memories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
