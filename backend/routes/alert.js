const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "").trim();

function getTransporter() {
  if (!EMAIL_USER || !EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS }
  });
}

// POST /api/alert/email
// Body: { to, patientName, reason, checkCount, lastSeen, detectedAt }
router.post("/email", async (req, res) => {
  const { to, patientName, reason, checkCount, lastSeen, detectedAt } = req.body;

  if (!to) return res.status(400).json({ error: "Missing recipient email" });

  const transporter = getTransporter();
  if (!transporter) {
    console.warn("[Alert] Email not configured — set EMAIL_USER and EMAIL_PASS in .env");
    return res.status(503).json({ error: "Email not configured on server" });
  }

  const name = patientName || "Your patient";
  const time = detectedAt || new Date().toLocaleString();
  const count = checkCount || 2;
  const seen = lastSeen || "No recent visual information";
  const reasonText = reason || "Patient has not responded to multiple check-ins";

  const subject = `[yourOwn Alert] ${name} may need attention`;

  const html = `
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #dc2626; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0;">⚠️ yourOwn Care Alert</h2>
  </div>
  <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 24px; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; color: #7f1d1d; margin-top: 0;">
      <strong>${name}</strong> may need your attention.
    </p>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr style="border-bottom: 1px solid #fecaca;">
        <td style="padding: 8px 0; color: #6b7280; width: 40%;">Detected at</td>
        <td style="padding: 8px 0; font-weight: 600;">${time}</td>
      </tr>
      <tr style="border-bottom: 1px solid #fecaca;">
        <td style="padding: 8px 0; color: #6b7280;">Reason</td>
        <td style="padding: 8px 0; font-weight: 600;">${reasonText}</td>
      </tr>
      <tr style="border-bottom: 1px solid #fecaca;">
        <td style="padding: 8px 0; color: #6b7280;">Unanswered check-ins</td>
        <td style="padding: 8px 0; font-weight: 600;">${count}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Last camera observation</td>
        <td style="padding: 8px 0;">${seen}</td>
      </tr>
    </table>
    <p style="color: #374151; margin: 0; font-size: 14px;">
      Please check on ${name} as soon as possible or call them directly.
    </p>
  </div>
  <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 12px;">
    Sent automatically by yourOwn Alzheimer's care companion
  </p>
</div>`;

  try {
    await transporter.sendMail({
      from: `"yourOwn Care" <${EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`[Alert] Email sent to ${to} for patient ${name}`);
    return res.json({ ok: true, to, subject });
  } catch (err) {
    console.error("[Alert] Email send failed:", err.message);
    return res.status(500).json({ error: "Failed to send email", detail: err.message });
  }
});

// GET /api/alert/email-test — verify Gmail credentials are working
router.get("/email-test", async (req, res) => {
  const transporter = getTransporter();
  if (!transporter) {
    return res.status(503).json({
      ok: false,
      error: "Email not configured",
      hint: "Set EMAIL_USER and EMAIL_PASS in your .env / Vercel environment variables"
    });
  }
  try {
    await transporter.verify();
    return res.json({ ok: true, user: EMAIL_USER, message: "Gmail credentials verified — ready to send" });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      user: EMAIL_USER,
      error: err.message,
      hint: "Use a Gmail App Password (not your regular password). Enable 2FA, then generate an App Password at myaccount.google.com/apppasswords"
    });
  }
});

// POST /api/alert/tts  — convert text to ElevenLabs audio, return base64
// Used by frontend for reminders and not-visible checks so they use the same voice as the companion
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
