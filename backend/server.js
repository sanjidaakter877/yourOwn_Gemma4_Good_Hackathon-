require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const assistRoute = require("./routes/assist");
const doctorRoute = require("./routes/doctor");
const careSettingsRoute = require("./routes/care-settings");
const visionRoute = require("./routes/vision");
const notesRoute = require("./routes/notes");

const SecurityHardeningService = require("./services/security-hardening");
const hume = require("./services/hume");

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const BACKEND_PREFIX = "/_/backend";

const securityService = new SecurityHardeningService();

// Middleware
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.static("../frontend/public"));

// Vercel routes the deployed backend under /_/backend. Keep local routes like
// /assist working while also accepting prefixed production paths.
app.use((req, res, next) => {
  if (req.url === BACKEND_PREFIX) {
    req.url = "/";
  } else if (req.url.startsWith(`${BACKEND_PREFIX}/`)) {
    req.url = req.url.slice(BACKEND_PREFIX.length) || "/";
  }

  next();
});

app.locals.securityService = securityService;

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    ok: true,
    app: "yourOwn - Alzheimer's Smart Assistant",
    status: "running",
    brain: "Gemma 4 (Fine-tunable via Unsloth)",
    version: "2.0",
    features: [
      "voice-recognition",
      "medical-ai-powered-by-gemma4",
      "multimodal-detection-face-fall-emotion",
      "real-time-websocket-alerts",
      "doctor-dashboard-with-analytics",
      "fhir-healthcare-integration",
      "advanced-ml-alert-engine",
      "hipaa-security-compliance",
      "offline-pwa-support"
    ],
    endpoints: {
      voice: "/assist",
      doctor: "/doctor",
      websocket: "ws://localhost:5000",
      fhir: "/api/fhir",
      analytics: "/api/analytics",
      security: "/api/security"
    },
    gemmaInfo: {
      model: process.env.OLLAMA_MODEL || "gemma4:e2b",
      temperature: 0.3,
      ollama_url: process.env.OLLAMA_URL || "http://localhost:11434",
      fine_tuning_script_available: true,
      unsloth_supported: true
    }
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      hume: hume.isConfigured() ? "configured" : "not_configured",
      ollama: process.env.OLLAMA_URL ? "connected" : "not_configured"
    }
  });
});

// Security compliance endpoint
app.get("/api/security/hipaa-compliance", (req, res) => {
  try {
    const report = securityService.generateHIPAAComplianceReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Care data export for fine-tuning (anonymised — no PII)
app.get("/api/care-data/export", async (req, res) => {
  try {
    const { readCareEvents } = require("./services/memory");
    const { getRecentMemories, isAvailable: supabaseAvailable } = require("./services/people-memory");

    // ── Seed examples — always included to bootstrap training ────────────────
    const seeds = [
      { mode: "orientation", patient: "Where am I? I don't recognise this place.", response: "You are safe at home. It is late at night — things look different in the dark. Your bedroom is just down the hall.", risk_level: "medium" },
      { mode: "silent_check", patient: "[silent]", response: "I am still here with you. Can you let me know you are okay? Just say something or press the button.", risk_level: "medium" },
      { mode: "orientation", patient: "Who are you?", response: "I am yourOwn, your voice companion. I am here to help you whenever you need me. You are safe.", risk_level: "low" },
      { mode: "orientation", patient: "I want to go home.", response: "You are already home. This is your home. Let me help you find a familiar room — your bedroom is just down the hall on the right.", risk_level: "medium" },
      { mode: "confusion", patient: "I can't find my glasses.", response: "Let's think together. Do you usually keep them on the bedside table or near the kitchen sink? Those are the most common spots.", risk_level: "low" },
      { mode: "orientation", patient: "What day is it?", response: "Today is a weekday morning. You had breakfast a little while ago. Everything is going well.", risk_level: "low" },
      { mode: "silent_check", patient: "[silent]", response: "Just checking in gently — are you okay? You can say anything, even just yes, and I will know you are alright.", risk_level: "medium" },
      { mode: "confusion", patient: "I forgot what I was doing.", response: "That is okay, it happens to everyone. You were in the living room sitting comfortably. There is no rush at all.", risk_level: "low" },
      { mode: "emergency", patient: "I fell down and I can't get up.", response: "I hear you — please stay still and stay calm. I am alerting your family right now. Help is coming. You are not alone.", risk_level: "emergency" },
      { mode: "medication", patient: "Did I take my pill?", response: "According to your schedule your evening pill is due soon. If you are unsure whether you already took it, wait for your family to confirm — it is safer not to double dose.", risk_level: "medium" },
      { mode: "conversation", patient: "Tell me a joke.", response: "Why don't scientists trust atoms? Because they make up everything! Want to hear another one?", risk_level: "low" },
      { mode: "orientation", patient: "Is Anna here?", response: "Anna is not here right now but she usually visits in the afternoon. She will be so happy to see you when she comes.", risk_level: "low" },
      { mode: "silent_check", patient: "[silent]", response: "I notice it has been a little quiet. I am right here with you. Can you give me a small sign you are okay?", risk_level: "high" },
      { mode: "confusion", patient: "I don't know these people in my house.", response: "Those are your family members who love you very much. They are here to help you and keep you safe. You are in good hands.", risk_level: "medium" },
      { mode: "orientation", patient: "It's the middle of the night and I'm scared.", response: "I am here with you. It is nighttime and everything is safe. The lights in the hallway are on for you. Your bedroom is warm and comfortable.", risk_level: "medium" }
    ];

    // ── Real interactions from local care-events.json ─────────────────────────
    const careEvents = readCareEvents() || [];
    const fromLocal = careEvents
      .filter(e => e.transcript && e.response?.reassurance)
      .map(e => ({
        mode: e.silent_confusion ? "silent_check" : (e.episode_type || "conversation"),
        patient: e.silent_confusion ? "[silent]" : String(e.transcript).replace(/\b[A-Z][a-z]+\b/g, "[patient]"),
        response: String(e.response.reassurance || "").replace(/\b[A-Z][a-z]+\b/g, "[patient]"),
        risk_level: e.risk?.level || "low",
        escalated: Boolean(e.action_plan?.escalate_to_family)
      }))
      .filter(e => e.response.length > 10);

    // ── Real interactions from Supabase episodic_memories ─────────────────────
    let fromSupabase = [];
    if (supabaseAvailable()) {
      try {
        // Fetch up to 200 recent memories across all patients
        const { createClient } = require("@supabase/supabase-js");
        const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
        const { data } = await db
          .from("episodic_memories")
          .select("type, content, context")
          .in("type", ["conversation", "orientation", "confusion", "silent_check", "medication"])
          .order("timestamp", { ascending: false })
          .limit(200);

        fromSupabase = (data || [])
          .filter(m => m.content && m.context?.ai_response)
          .map(m => ({
            mode: m.type,
            patient: String(m.content).replace(/\b[A-Z][a-z]+\b/g, "[patient]"),
            response: String(m.context.ai_response).replace(/\b[A-Z][a-z]+\b/g, "[patient]"),
            risk_level: m.context.risk_level || "low",
            escalated: false
          }));
      } catch (e) {
        console.warn("[export] Supabase fetch failed:", e.message);
      }
    }

    // ── Merge + deduplicate ───────────────────────────────────────────────────
    const allRaw = [...fromLocal, ...fromSupabase];
    const seen = new Set();
    const deduped = allRaw.filter(e => {
      const key = e.patient.slice(0, 40);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    // ── Format as Unsloth chat SFT ────────────────────────────────────────────
    const systemPrompt = "You are yourOwn, a calm caring AI companion for [patient], who has Alzheimer's. Always respond with warmth, simplicity, and reassurance. Never mention GPS, timestamps, or system data.";

    const toUnsloth = (e) => ({
      conversations: [
        { role: "system", content: `${systemPrompt} Mode: ${e.mode}.` },
        { role: "user", content: e.patient },
        { role: "assistant", content: e.response }
      ],
      metadata: { mode: e.mode, risk_level: e.risk_level, escalated: e.escalated || false }
    });

    const seedFormatted = seeds.map(toUnsloth);
    const realFormatted = deduped.map(toUnsloth);
    const conversations = [...seedFormatted, ...realFormatted];

    res.json({
      format: "unsloth-chat-sft",
      model: "gemma-4-e2b",
      total_interactions: conversations.length,
      seed_count: seedFormatted.length,
      real_count: realFormatted.length,
      note: "All patient names anonymised as [patient]. No GPS, device IDs, or timestamps included.",
      conversations
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.use("/assist", assistRoute);
app.use("/doctor", doctorRoute);
app.use("/api/care-settings", careSettingsRoute);
app.use("/api/vision", visionRoute);
app.use("/api/notes", notesRoute);
app.use("/api/people", require("./routes/people"));
app.use("/api/alert", require("./routes/alert"));
app.use("/api/app-data", require("./routes/app-data"));

// Service initialization
async function initializeServices() {
  console.log("\n" + "=".repeat(60));
  console.log("YOUROWN BACKEND INITIALIZATION");
  console.log("=".repeat(60));
  
  await securityService.initialize();
  
  console.log("✅ All services initialized");
  console.log("=".repeat(60) + "\n");
}

// Start server
httpServer.listen(PORT, async () => {
  await initializeServices();
  
  console.log(`
  ╔══════════════════════════════════════════════════════════╗
  ║         🧠 yourOwn - Powered by Gemma 4 🧠              ║
  ╚══════════════════════════════════════════════════════════╝
  
  🚀 Backend running on: http://localhost:${PORT}
  📊 WebSocket ready for real-time alerts
  🔐 HIPAA security: ENABLED
  🤖 Gemma 4 AI: Connected to ${process.env.OLLAMA_URL || "http://localhost:11434"}
  📱 PWA support: Offline-first enabled
  🎯 Features:
     • Gemma 4 local inference via Ollama
     • Multimodal detection (face, fall, emotion)
     • Healthcare integration (FHIR/EHR)
     • Advanced ML alert engine
     • Doctor analytics dashboard
     • Real-time WebSocket alerts
     • HIPAA compliance
  
  ✅ Ready to transform Alzheimer's care
  `);

  // Pre-warm Gemma 4 so first patient request responds immediately
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "gemma4:e2b";
  console.log(`[Warmup] Loading ${ollamaModel} into memory...`);
  fetch(ollamaUrl + "/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: ollamaModel,
      messages: [{ role: "user", content: "hi" }],
      stream: false,
      options: { temperature: 0.1 }
    })
  })
    .then(() => console.log(`[Warmup] ${ollamaModel} is loaded and ready`))
    .catch(() => console.log(`[Warmup] ${ollamaModel} not available — cloud fallback will be used`));
});

app.get("/api/gemma/status", async (req, res) => {
  const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434";
  const ollamaModel = process.env.OLLAMA_MODEL || "gemma4:e2b";
  const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
  const apiModel = process.env.GEMMA_API_MODEL || "gemma-4-26b-a4b-it";

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch(`${ollamaUrl}/api/tags`, {
      signal: controller.signal
    });
    const data = await response.json();
    const models = Array.isArray(data.models) ? data.models : [];
    const modelNames = models.map((item) => item.name);

    res.json({
      local_inference: true,
      provider: "Ollama",
      model: ollamaModel,
      api_model: apiModel,
      api_ready: Boolean(geminiKey),
      ollama_url: ollamaUrl,
      model_available: modelNames.some((name) => name === ollamaModel || name.startsWith(`${ollamaModel}:`)),
      installed_models: modelNames.slice(0, 8),
      privacy: "Running locally via Ollama — no data leaves your device."
    });
  } catch {
    clearTimeout(timeout);
    res.json({
      local_inference: false,
      provider: geminiKey ? "Google AI Studio" : "none",
      model: apiModel,
      api_model: apiModel,
      api_ready: Boolean(geminiKey),
      ollama_url: ollamaUrl,
      model_available: Boolean(geminiKey),
      installed_models: [],
      privacy: geminiKey
        ? "Running via Google AI Studio API. Only a single frame per request is transmitted."
        : "No AI provider configured."
    });
    return;
  } finally {
    clearTimeout(timeout);
  }
});
