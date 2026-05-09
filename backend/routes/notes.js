const express = require("express");
const router = express.Router();
const { saveEpisodicMemory, isAvailable } = require("../services/people-memory");

router.post("/", async (req, res) => {
  const { patientName, text, timestamp } = req.body;
  if (!text) return res.status(400).json({ error: "No note text" });

  if (isAvailable() && patientName) {
    await saveEpisodicMemory({
      patientName,
      type: "patient_note",
      content: text,
      context: { timestamp: timestamp || new Date().toISOString() }
    }).catch(() => {});
  }

  return res.json({ saved: true });
});

module.exports = router;
