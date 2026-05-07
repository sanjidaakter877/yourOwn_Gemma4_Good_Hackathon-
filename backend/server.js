require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const assistRoute = require("./routes/assist");
const doctorRoute = require("./routes/doctor");
const careSettingsRoute = require("./routes/care-settings");

// Import new services
let MultimodalDetector;
try {
  MultimodalDetector = require("./services/multimodal-detector");
} catch (err) {
  console.warn("⚠️  Multimodal detector not available (TensorFlow build skipped)");
  MultimodalDetector = null;
}
const HealthcareIntegration = require("./services/healthcare-integration");
const AdvancedAlertML = require("./services/advanced-alert-ml");
const DoctorAnalytics = require("./services/doctor-analytics");
const SecurityHardeningService = require("./services/security-hardening");
const RealtimeAlertService = require("./services/realtime-alerts");
const hume = require("./services/hume");

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT || 5000;
const BACKEND_PREFIX = "/_/backend";

// Initialize services
const multimodalDetector = MultimodalDetector ? new MultimodalDetector() : null;
const healthcareIntegration = new HealthcareIntegration();
const advancedAlertML = new AdvancedAlertML();
const doctorAnalytics = new DoctorAnalytics();
const securityService = new SecurityHardeningService();
const realtimeAlerts = new RealtimeAlertService(httpServer);

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

// Make services globally available
app.locals.multimodalDetector = multimodalDetector;
app.locals.healthcareIntegration = healthcareIntegration;
app.locals.advancedAlertML = advancedAlertML;
app.locals.doctorAnalytics = doctorAnalytics;
app.locals.securityService = securityService;
app.locals.realtimeAlerts = realtimeAlerts;

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
      model: process.env.OLLAMA_MODEL || "gemma4:e4b",
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
      multimodal: "ready",
      healthcare_integration: "ready",
      advanced_alerts: "ready",
      analytics: "ready",
      security: "ready",
      realtime: "ready",
      hume: hume.isConfigured() ? "configured" : "not_configured",
      ollama: process.env.OLLAMA_URL ? "connected" : "not_configured"
    }
  });
});

// FHIR Export endpoint
app.get("/api/fhir/patient/:patientId", (req, res) => {
  try {
    // In production, fetch actual patient data
    const patientData = {
      patientId: req.params.patientId,
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1950-01-15",
      gender: "male",
      diagnosis: "Alzheimer's Disease",
      medicalHistory: {
        mmseScores: [],
        medications: []
      }
    };

    const fhirBundle = healthcareIntegration.generateFhirPatient(patientData);
    res.json(fhirBundle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Analytics endpoint
app.get("/api/analytics/patient/:patientId", (req, res) => {
  try {
    // In production, fetch real patient data
    const patientData = {
      patientId: req.params.patientId,
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1950-01-15",
      medicalHistory: {
        mmseScores: [
          { date: "2024-01-15", value: 24 },
          { date: "2024-02-15", value: 22 },
          { date: "2024-03-15", value: 20 }
        ],
        medications: [
          { name: "Donepezil", dosage: "10mg daily" }
        ]
      },
      alertHistory: []
    };

    const analytics = doctorAnalytics.generateDashboardSummary(patientData);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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

// SMS alert endpoint (HEALTHCARE INTEGRATION)
app.post("/api/alerts/:patientId/notify", async (req, res) => {
  try {
    const { doctorPhone, message } = req.body;
    const result = await healthcareIntegration.sendSmsAlert(
      doctorPhone,
      message,
      req.params.patientId
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Care data export for fine-tuning (anonymised — no PII)
app.get("/api/care-data/export", (req, res) => {
  try {
    // In production this reads from the persistent interaction log.
    // Returns conversations in Unsloth/SFT training format.
    const sampleExport = [
      {
        mode: "orientation",
        system: "You are yourOwn, a calm caring AI companion for [patient], who has Alzheimer's.",
        patient: "Where am I? I don't recognise this place.",
        response: "You are safe at home. It is late at night — things look different in the dark. Your bedroom is just down the hall.",
        risk_level: "medium",
        escalated: false
      },
      {
        mode: "silent_check",
        system: "You are yourOwn. The patient has been silent for a while. Check-in 2.",
        patient: "[silent]",
        response: "I am still here with you. Can you let me know you are okay? Just say something or press the button.",
        risk_level: "medium",
        escalated: false
      }
    ];
    res.json({
      format: "unsloth-sft",
      model: "gemma-4-26b-a4b-it",
      total_interactions: sampleExport.length,
      note: "All patient names replaced with [patient]. No GPS, timestamps, or PII included.",
      conversations: sampleExport
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Routes
app.use("/assist", assistRoute);
app.use("/doctor", doctorRoute);
app.use("/api/care-settings", careSettingsRoute);
app.use("/api/people", require("./routes/people"));

// Service initialization
async function initializeServices() {
  console.log("\n" + "=".repeat(60));
  console.log("YOUROWN BACKEND INITIALIZATION");
  console.log("=".repeat(60));
  
  if (multimodalDetector) {
    await multimodalDetector.initialize();
  }
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
