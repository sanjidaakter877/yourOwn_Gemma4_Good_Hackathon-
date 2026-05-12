# yourOwn — AI Companion for Alzheimer's Patients

> *"It is 2 PM. John is making tea. He pauses, looks around, and goes quiet. yourOwn is already there."*

**yourOwn** is a voice-first, camera-aware AI companion powered by **Gemma 4** that watches, listens, and responds — not just when something goes wrong, but continuously, like a calm presence in the room.

Built for the **[Gemma 4 Good Hackathon 2026](https://www.kaggle.com/competitions/gemma-4-good-hackathon)**

**Live demo:** https://your-own-gemma4-good-hackathon.vercel.app

---

## The Problem

55 million people worldwide live with Alzheimer's. yourOwn targets the **middle stage** — the most common and most underserved phase, where patients are still at home, still able to speak, but confusion strikes without warning. They forget familiar faces, stop mid-task with no idea why, go silent after a fall. They need help but cannot ask for it.

Existing solutions are passive alarms — they detect crisis *after* it starts. yourOwn runs silently in the background, detects those moments using Gemma 4's multimodal reasoning, and bridges the gap between patient safety and family peace of mind.

---

## Features

### AI Voice Companion (Patient)
- **Natural voice conversation** — Patient speaks freely. The app transcribes via Web Speech API, reasons with Gemma 4, and replies in a warm spoken voice via ElevenLabs TTS
- **Care reasoning on every response** — Each reply goes through a full pipeline: risk score (0–100%), grounding status, safe-place check, and a three-way action plan (patient / family / doctor)
- **Two response modes** — *Conversation mode* (patient is engaged, warm and casual) vs *Care mode* (confusion detected, calm and grounding). The patient experiences it as one consistent voice
- **Context-aware responses** — Every response is grounded in current time, GPS-inferred location, daily schedule, doctor notes, and recent episodic memory
- **Quick prompts** — One-tap buttons for common patient needs: "Where am I?", "What time is it?", "What should I do now?"
- **Photo explanation** — Patient uploads any image (medicine bottle, unfamiliar object, room) and Gemma 4 describes and explains it

### Live Monitoring — Silent Pause Detection
- **Continuous microphone listening** — Detects when the patient has gone quiet
- **Two check-ins before alerting** — First check-in: gentle spoken question. Second check-in: follow-up if still no reply
- **5-second reply window** — After the second check-in, waits 5 seconds for the patient to respond before sending a Telegram alert
- **Reset on speech** — Any patient speech immediately cancels the pending alert and resets the check-in counter
- **Telegram notification** — If no reply after both check-ins + 5 seconds, family receives an instant Telegram message with patient name, check-in count, last camera observation, and timestamp

### Live Monitoring — Task Detection
- **Camera-based task recognition** — Gemma 4 vision identifies what the patient is doing: writing, eating, drinking tea, reading, brushing teeth, folding clothes, watching TV, doing puzzle, and more
- **Task stall detection** — If the patient stops doing the task (first idle camera frame), the app immediately asks if they finished or need help — without waiting for the silent pause timer
- **Task inquiry flow** — Sends a warm spoken question naming the specific task. Starts a 15-second timer waiting for a reply. If no reply, escalates as a silent pause
- **Suppresses silent pause during tasks** — While a task is active or a task inquiry is pending, the regular silent pause timer is paused so the patient isn't bombarded
- **Reduced API calls** — Gemma vision runs every 6 seconds during active tasks (every 2 seconds otherwise) and is skipped entirely while waiting for a task reply

### Live Monitoring — Camera Presence
- **Not-visible detection** — If the patient disappears from camera view, a spoken check-in fires after 8 seconds
- **Extended absence escalation** — After 30 seconds not visible: first spoken inquiry. After 55 seconds with no camera presence and no speech reply: Telegram alert sent to family
- **Camera stream cleanup** — Camera is fully released (stream tracks stopped) when live monitoring is stopped

### Emergency Detection
- **Real-time emergency phrase recognition** — Detects phrases like:
  - "I fell", "I fall", "I've fallen", "fell down"
  - "help me", "please help", "somebody help", "I need help"
  - "I'm hurt", "I am in pain", "it hurts"
  - "I can't get up", "I can't stand"
  - "chest pain", "I can't breathe"
  - "I'm dizzy", "I feel faint"
  - "I'm bleeding", "I think I broke my..."
- **Immediate Telegram alert** — Emergency bypasses all cooldowns. Alert is sent instantly with the exact phrase the patient said, marked as urgent
- **Urgent formatting** — Emergency Telegram messages use a distinct format: "🚨 EMERGENCY ALERT — please call or visit immediately"

### Identity Confusion — Family Photo Recall
- **Identity confusion detection** — Detects phrases like "who am I", "I don't know anyone", "I don't recognize these people", "I forgot everyone"
- **Family gallery shown in response** — When confusion is detected, the AI response card includes the full family photo gallery directly on screen
- **Gemma narrates the faces** — Gemma 4 responds by naming and describing the family members from context
- **Photo memories** — Separate memory photos with custom descriptions can be uploaded by family, shown when patient says they don't know anyone

### Telegram Notifications
- **All alerts go to Telegram** — No email required. Notifications arrive instantly on the family member's phone via Telegram bot
- **Two alert types:**
  - Standard: patient name, unanswered check-in count, last camera observation, timestamp
  - Emergency: patient name, exact phrase said, timestamp, call-immediately instruction
- **Single bot setup** — Family sets up once with a bot token and chat ID. No per-user configuration needed

### Family Dashboard
- **Family members panel** — Add people the patient knows: name, relationship, notes, and optional photo. Displayed as a photo card grid
- **Photo memories** — Upload photos with a description. Shown to the patient when they express identity confusion ("I don't know anyone")
- **Home GPS setup** — Set home coordinates, safe radius, and address note. Used to detect if the patient leaves a known safe area
- **Recent alerts log** — Shows the last 5 GPS-related alerts with timestamp and message

### Doctor Dashboard
- **MMSE cognitive score** — Doctor sets current severity and trend: collecting baseline / improving / stable / worsening
- **Clinical assessment** — Free-text notes that are injected into every Gemma 4 reasoning context
- **Medicine list** — Per-medicine: name, dosage, time to take, schedule notes, and appearance description
- **Medication reminders** — Spoken alarm at the scheduled time based on the doctor's medicine list. Uses patient name and medicine details
- **Medication plan** — Auto-generated from the medicine list, or manually overridden
- **Follow-up plan** — Doctor instruction text visible to Gemma 4 during patient interactions
- **Patient-facing instruction** — A note written by the doctor, read by Gemma 4 as direct guidance

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express |
| AI — primary | Gemma 4 via Google Gemini API |
| AI — local/private | Ollama (any local model) |
| Vision | Gemma 4 multimodal — camera frame analysis |
| Voice output | ElevenLabs TTS (base64 audio stream) |
| Voice input | Web Speech API (SpeechRecognition) |
| Memory | Supabase (episodic memory, people records, care data) |
| Notifications | Telegram Bot API |
| Deployment | Vercel (frontend + backend as multi-service) |

---

## Architecture

```
Browser (Next.js)
├── Web Speech API         — continuous mic, transcription
├── MediaDevices           — camera stream, frame capture
├── ElevenLabs TTS         — spoken voice output
└── page.tsx               — patient + family + doctor UI

Backend (Express)
├── /api/assist            — main Gemma 4 conversation endpoint
├── /api/vision            — camera frame analysis (Gemma 4 multimodal)
├── /api/alert/notify      — Telegram notification (silent pause + emergency)
├── /api/alert/tts         — ElevenLabs TTS proxy
├── /api/people            — family member CRUD + photo upload
├── /api/doctor            — doctor dashboard data
├── /api/notes             — episodic memory log
├── /api/care-settings     — GPS + alert settings
└── /api/app-data          — patient profile, medicine list, schedule

AI Services
├── gemma-api.js           — Gemma 4 API calls + vision + extractFinalAnswer
├── ollama.js              — full conversation pipeline + care reasoning
├── scorer.js              — risk score, grounding, safe-place classification
├── escalation-manager.js  — decides response stage (check-in / caregiver warning)
├── context.js             — builds prompt context from time/GPS/schedule/memory
├── people-memory.js       — Supabase people retrieval + episodic memory write
└── environment.js         — time of day, schedule inference, location context

Memory (Supabase)
├── people                 — family-added members + photo URLs
├── episodic_memories      — auto-saved interaction log per patient
└── Storage bucket         — people photos (public CDN)
```

---

## How the AI Pipeline Works

1. **Context builder** — Combines patient name, time of day, GPS location, current schedule item, doctor notes, medication list, recent episodic memories, and camera observation into a structured prompt
2. **Scorer** — Classifies the interaction: risk level (0–100%), grounding status (verified/unverified), safe-place status, whether this is distress or conversation
3. **Gemma 4 function calling** — First pass: Gemma 4 selects care tools and reasons about the situation
4. **Conversational response** — Second pass: tool results injected, Gemma 4 generates a warm patient-facing reply
5. **`extractFinalAnswer`** — Strips Gemma's planning/reasoning text from the output so only the clean response reaches the patient
6. **Escalation manager** — Tracks check-in stage and decides whether to escalate to caregiver

---

## Privacy

- Camera and microphone data is never streamed — only a single JPEG frame per Gemma 4 call
- **Ollama mode**: full local inference, nothing leaves the device
- Supabase stores only text summaries and family-uploaded photos — no raw audio or video

---

## Environment Variables

```env
# Gemma 4 (required)
GEMINI_API_KEY=
GEMMA_API_MODEL=gemma-2.0-flash

# Ollama local mode (optional)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=gemma3

# Supabase (required for memory + people)
SUPABASE_URL=
SUPABASE_ANON_KEY=

# ElevenLabs voice (optional — browser TTS used as fallback)
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=

# Telegram notifications (required for alerts)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

---

## Run Locally

```bash
# Backend (port 5000)
cd backend
npm install
node index.js

# Frontend (port 3000)
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`

---

## Dashboard Access

| Role | What they can do | Password |
|---|---|---|
| Patient | Speak with companion, live monitoring, photo upload | — (open) |
| Family | Add family members, photo memories, GPS home setup | `1234` |
| Doctor | Clinical notes, medicine list, MMSE score, care plan | `1234` |

---

## Safety Notice

yourOwn is a research prototype and hackathon submission. It is not a medical device, diagnostic tool, or emergency service. Alerts and care instructions should be reviewed and configured by qualified caregivers or clinicians.

---

*Gemma is a trademark of Google LLC. yourOwn is not affiliated with or endorsed by Google.*
