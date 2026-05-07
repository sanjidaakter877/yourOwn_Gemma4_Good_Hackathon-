# 🧠 yourOwn — AI Companion for Alzheimer's Patients

> *"It is 2 PM. Mary is making tea. She pauses, looks around, and goes quiet. yourOwn is already there."*

**yourOwn** is a voice-first AI companion powered entirely by **Gemma 4** that watches, listens, and responds — not just when something goes wrong, but continuously, like a calm presence in the room.

Built for the **[Gemma 4 Good Hackathon](https://www.kaggle.com/competitions/gemma-4-good-hackathon)** 🏆

🌐 **Live Demo**: https://your-own-gemma4-good-hackathon.vercel.app

---

## 💡 The Problem

55 million people worldwide live with Alzheimer's and related dementia. **yourOwn targets the middle stage** — the most common and most underserved phase of the disease.

In the middle stage, patients are still at home, still able to speak, still able to drink tea and watch television. But confusion strikes without warning, often when no one is watching. They forget familiar faces. They go quiet mid-activity with no idea why. They need help — but cannot ask for it.

This is the gap yourOwn fills:

- Get confused mid-activity and not know where they are
- Forget a family member's face — "Who is Anna?"
- Go silent for dangerous amounts of time after a fall or episode
- Need gentle orientation — not an alarm, not a hospital

Existing solutions are **passive alarms**. They detect crisis after it starts. yourOwn is different: it is always present, always listening, always ready.

### 👨‍👩‍👧 Designed for Families, Not Just Patients

A patient with middle-stage Alzheimer's cannot be expected to manage technology. **yourOwn is set up once by a caregiver.** Before leaving for work, a family member opens the app, starts the live monitor, and the companion takes over. The patient only ever sees a warm voice that speaks their name — never a settings screen, never a toggle.

---

## ✨ What yourOwn Does

| Feature | Description |
|---|---|
| 🎙️ **Voice companion** | Patient speaks naturally, Gemma 4 responds in warm plain language |
| 👁️ **Live camera + vision** | Gemma 4 sees what the patient sees and references it in responses |
| 🔇 **Silent detection** | 5-tier escalation when patient goes quiet or stops moving |
| 📸 **Movement detection** | Pixel-diff analysis on 80×60 canvas, flags stillness in real time |
| 🧬 **Episodic memory** | Every interaction auto-saved; patient can ask "what was I doing?" |
| 👨‍👩‍👧 **People recall** | "Who is Anna?" → shows Anna's photo + description from family |
| 📷 **Photo upload** | Patient uploads any image; Gemma 4 describes and explains it |
| 🏠 **Local/offline mode** | Full Ollama fallback — nothing leaves the device |
| 📋 **Caregiver dashboard** | Family adds people, reviews memory log, exports FHIR data |
| 🤖 **Fine-tuned model** | Unsloth QLoRA adapter on 14 clinically grounded care scenarios |

---

## 🔮 How Gemma 4 Powers Everything

The **entire AI stack is Gemma 4**. No other model is used.

```
1. Primary   →  gemma-4-26b-a4b-it  (Google AI Studio API)
2. Fallback  →  gemma4:e2b          (Ollama — fully local, 100% private)
3. Failsafe  →  Gemini API          (same Gemma 4 model family)
```

### 🎯 Two-Mode Prompting

Before every Gemma 4 call, a scorer classifies the interaction:

**Conversation mode** `(temp 0.85)` — Patient is engaged. Gemma 4 acts like a cheerful companion: tells jokes, chats about the family, asks about their day. No clinical language. No mention of Alzheimer's.

**Care mode** `(temp 0.6)` — Something is wrong. Gemma 4 becomes a calm caregiver: gently orients the patient with time, place, and familiar context. Uses the patient's name. Grounds every statement in real facts.

The patient experiences it as **one consistent warm voice**. The mode shift is invisible.

### 🧩 Care Reasoning Pipeline

Every care interaction passes through four stages before Gemma 4 generates a response:

```
Scorer → Risk Classifier → Evidence Builder → Action Planner → Gemma 4
```

Gemma 4 receives structured grounding context — current time, GPS-inferred location, episodic memories, family care notes — and generates responses anchored in facts about the patient's actual situation.

### 🔇 5-Tier Silent Escalation

| Check | What yourOwn Says |
|---|---|
| 1 | "Mary, are you there?" |
| 2 | "Mary, I just want to make sure you're okay." |
| 3 | "Mary, I'm a little worried. Can you say something?" |
| 4 | "I haven't heard from you. I may need to let your family know." |
| 5+ | 🚨 Caregiver alert triggered |

Real movement is tracked via **pixel-diff on an 80×60 canvas** sampled every 2.5 seconds. If the camera fails, audio silence detection takes over — the escalation ladder runs either way.

---

## 🧬 Episodic Memory

### 👨‍👩‍👧 "Who Is Anna?"

1. Family opens the caregiver dashboard
2. Adds: "Anna — your daughter. Visits every Sunday. Loves bringing flowers."
3. Uploads Anna's photo → stored in **Supabase Storage**

When the patient says "Who is Anna?":
- yourOwn retrieves Anna's record + photo from Supabase
- **Displays her face on screen**
- Gemma 4 says: *"That's Anna, your daughter. She visits you every Sunday and loves bringing you flowers."*

The patient sees the face and hears the name at the same time. Grounded, specific, real.

### 📖 Interaction Memory

Every interaction is auto-saved:
- What the patient said
- What yourOwn replied
- Time + inferred location
- Care or conversation mode

Patient: *"What was I doing last night?"*
yourOwn: *"Last night around 10 PM you were in the living room. We had a lovely chat about your garden."*

---

## 🏗️ Architecture

```
Browser
├── Next.js 14 (App Router)
├── Web Speech API (mic input)
├── MediaDevices (camera + pixel-diff movement detection)
├── ElevenLabs / Web Speech (voice output)
└── Hume (optional emotion detection)

Backend (Node.js / Express)
├── /api/assist       ← main AI endpoint
├── /api/people       ← people memory CRUD + photo upload
├── care-reasoner     ← scorer + risk + evidence + action plan
├── gemma-api.js      ← Google AI Studio (primary)
├── ollama.js         ← Ollama local fallback
└── gemini.js         ← Gemini API failsafe

Memory (Supabase)
├── episodic_memories ← auto-saved interaction log
├── people            ← family-added people + notes
└── Storage bucket    ← people photos (public CDN)
```

---

## 🔒 Privacy by Design

- 📵 Camera + microphone data **never streams** — only a single JPEG frame per API call
- 🏠 **Ollama mode**: nothing leaves the device, full local Gemma 4 inference
- 🗄️ Supabase stores **only text summaries** and family-uploaded photos — no raw audio, no video
- 👁️ Visible on/off controls for mic and camera — patient is always in control

---

## 🤖 Fine-Tuning with Unsloth

Fine-tuned `gemma-4-26b-a4b-it` using **Unsloth QLoRA** (4-bit, LoRA rank 16) on 14 clinically grounded care scenarios:

- 🌙 Waking up confused (night orientation)
- 💊 Medication safety refusal
- 🔇 Silent escalation — all 5 tiers
- 💙 Emotional support during distress ("I want to go home")
- 📍 GPS mismatch (patient believes they're somewhere else)
- 💬 Natural conversation (keeping engagement high)
- 👤 Person recall ("Who is that in the photo?")
- 📅 Activity recall ("What was I doing just now?")

Full training notebook with loss curves and example completions is included in this repo.

---

## 🚀 Run Locally

### Requirements

- Node.js 20+
- npm
- Ollama (optional, for local mode)

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/yourOwn.git
cd yourOwn

cd backend && npm install
cd ../frontend && npm install
```

### 2. Set up environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
# Gemma 4 — Primary AI (required)
# Get a free key at https://aistudio.google.com/apikey
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemma-4-26b-a4b-it
GEMMA_API_MODEL=gemma-4-26b-a4b-it

# Ollama — Local fallback (optional)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:e2b

# Supabase — Memory + photos (required for memory features)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# ElevenLabs — Voice output (optional)
ELEVENLABS_API_KEY=your_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here

# Hume — Emotion detection (optional)
HUME_API_KEY=your_key_here
```

### 3. Set up Supabase (for memory features)

Run the SQL in `backend/scripts/setup-supabase.sql` in your Supabase SQL editor. Creates:
- `people` table — family-added people + photos
- `episodic_memories` table — auto-saved interaction log

Create a Storage bucket named `people-photos` (public: true).

### 4. Start the app

```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev
```

Open: `http://localhost:3000`

### 5. (Optional) Local Ollama mode

```bash
ollama serve
ollama pull gemma4:e2b
```

yourOwn will automatically fall back to Ollama when the API is unavailable.

---

## 📋 Caregiver Dashboard

The dashboard at `/dashboard` gives families:

- 👨‍👩‍👧 **People directory** — add names, relationships, notes, photos
- 📖 **Memory log** — timestamped record of every patient interaction
- 📊 **Live status** — last heard, last movement, current risk level
- 📤 **FHIR export** — structured data for EHR system integration

---

## 🎬 Demo Video

> 3-minute walkthrough: voice companion → silent confusion → 5-tier escalation → caregiver alert → "Who is Anna?" memory recall → photo upload + Gemma 4 vision

[YouTube link coming soon]

---

## ⚠️ Safety Note

yourOwn is a research prototype and hackathon submission. It is not a medical device, diagnostic tool, or emergency service. It is not a replacement for professional clinical judgment. Alerts and care instructions should be reviewed and configured by qualified caregivers or clinicians.

---

## 📄 License

Licensed under **Creative Commons Attribution 4.0 International (CC-BY 4.0)** except for third-party dependencies, models, and APIs which remain under their respective licenses.

---

*Gemma is a trademark of Google LLC. yourOwn is not affiliated with or endorsed by Google.*
