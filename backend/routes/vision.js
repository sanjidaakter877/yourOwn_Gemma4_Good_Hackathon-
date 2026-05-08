const express = require("express");
const router = express.Router();
const { analyzeVision } = require("../services/gemma-api");
const { saveEpisodicMemory, isAvailable } = require("../services/people-memory");

router.post("/", async (req, res) => {
  const { image, patientName, source = "capture" } = req.body;

  if (!image) return res.status(400).json({ error: "No image provided" });

  const analysis = await analyzeVision(image);
  if (!analysis) {
    return res.status(503).json({ error: "Vision analysis unavailable" });
  }

  // Save privately to Supabase so it can be retrieved later as patient context
  if (isAvailable() && patientName) {
    saveEpisodicMemory({
      patientName,
      type: "visual_capture",
      content: analysis.description,
      context: {
        labels: analysis.labels,
        concern: analysis.concern,
        source,
        time: new Date().toISOString()
      }
    }).catch(() => {});
  }

  return res.json(analysis);
});

module.exports = router;
