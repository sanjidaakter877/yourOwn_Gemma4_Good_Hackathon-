const express = require("express");
const router = express.Router();
const https = require("https");

const TELEGRAM_BOT_TOKEN = (process.env.TELEGRAM_BOT_TOKEN || "").trim();
const TELEGRAM_CHAT_ID = (process.env.TELEGRAM_CHAT_ID || "").trim();

function sendTelegram(text) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text, parse_mode: "HTML" });
    const req = https.request({
      hostname: "api.telegram.org",
      path: `/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => data += chunk);
      res.on("end", () => resolve(JSON.parse(data)));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// POST /api/alert/notify
// Body: { patientName, reason, checkCount, lastSeen, detectedAt, urgent }
router.post("/notify", async (req, res) => {
  const { patientName, reason, checkCount, lastSeen, detectedAt, urgent } = req.body;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(503).json({ error: "Telegram not configured — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID" });
  }

  const name = patientName || "Your patient";
  const time = detectedAt || new Date().toLocaleString();
  const count = checkCount || 2;
  const seen = lastSeen || "No recent visual information";
  const reasonText = reason || "Patient has not responded to multiple check-ins";
  const isUrgent = Boolean(urgent);

  const text = isUrgent
    ? `🚨 <b>EMERGENCY ALERT</b>\n\n<b>${name}</b> may be in danger!\n\n<b>What was said:</b> ${reasonText}\n<b>Time:</b> ${time}\n\n⚠️ Please call or visit immediately.`
    : `⚠️ <b>yourOwn Care Alert</b>\n\n<b>${name}</b> may need your attention.\n\n<b>Unanswered check-ins:</b> ${count}\n<b>Last seen:</b> ${seen}\n<b>Time:</b> ${time}\n\nPlease check on ${name} as soon as possible.`;

  try {
    const result = await sendTelegram(text);
    console.log(`[Alert] Telegram sent for patient ${name} (urgent=${isUrgent})`);
    return res.json({ ok: true, result });
  } catch (err) {
    console.error("[Alert] Telegram send failed:", err.message);
    return res.status(500).json({ error: "Failed to send notification", detail: err.message });
  }
});

// GET /api/alert/telegram-test
router.get("/telegram-test", async (req, res) => {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return res.status(503).json({ ok: false, error: "Telegram not configured — set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID" });
  }
  try {
    const result = await sendTelegram("✅ <b>yourOwn test</b>\n\nTelegram notifications are working!");
    return res.json({ ok: true, result });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// POST /api/alert/tts  — convert text to ElevenLabs audio, return base64
router.post("/tts", async (req, res) => {
  const { textToSpeech } = require("../services/elevenlabs");
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: "Missing text" });
  try {
    const audioBase64 = await textToSpeech(text);
    if (!audioBase64) return res.status(503).json({ error: "TTS unavailable" });
    return res.json({ audio_base64: audioBase64, audio_mime_type: "audio/mpeg" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
