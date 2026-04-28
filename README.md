# yourOwn

A Gemma 4 care companion for Alzheimer's patients, families, and doctors.

Live demo: https://your-own-gemma4-good-hackathon.vercel.app

yourOwn is a Gemma 4 Good Hackathon prototype designed to support Alzheimer's patients during moments of confusion. It combines patient messages, voice, GPS context, meal and medication schedules, family memory notes, doctor instructions, camera context, and severity tracking into one calm care assistant experience.

The goal is not to replace caregivers, clinicians, or emergency services. The goal is to give patients grounded support between human care moments while giving families and doctors clearer context about what is happening over time.

## Why It Matters

Alzheimer's patients may become scared, lost, or unsure about daily events:

- Where am I?
- Did I eat?
- Is it time for my medicine?
- Who is this person?
- Why am I scared?

Generic chatbots do not know the patient's care context. Reminder apps can notify, but they do not reason about the patient's current situation. yourOwn uses Gemma 4 with structured patient context so responses can be calmer, safer, and more personal.

## Core Features

- Patient companion with text, voice, location, camera context, and live monitoring
- Mobile-first patient interface with large actions and simple language
- Meal and medication schedule awareness
- Family memory support for familiar people, safe places, and routines
- Doctor dashboard for care notes, medication guidance, follow-up, and severity trends
- Local care-event history to track whether confusion and risk appear stable, improving, or worsening
- Grounded care reasoning layer that checks schedule, context, and risk before responding
- Local-first Gemma 4 usage through Ollama for sensitive care data

## How Gemma 4 Is Used

Gemma 4 powers the care reasoning and patient-facing response layer. The backend builds a structured care context before asking the model to respond. That context can include:

- Patient speech or typed message
- Current time and schedule
- GPS/location status
- Safe places
- Doctor notes
- Family notes and memory summaries
- Visual concern selected by the patient
- Recent care events
- Risk and grounding signals

Gemma 4 then generates a short, supportive response. The app also applies deterministic checks around meals, medication, and risk so the answer is grounded in the patient's care context.

## Local-First Design

yourOwn is designed to run Gemma locally through Ollama. This matters because Alzheimer's care data can include sensitive location, medication, family, and medical context.

The deployed Vercel app provides the public frontend experience. For the full AI-assisted demo, run the backend locally with Ollama or host the backend separately.

## Tech Stack

Frontend:

- Next.js 16
- React 19
- Tailwind CSS
- Browser microphone, speech recognition, GPS, and camera APIs

Backend:

- Node.js
- Express
- WebSocket support
- Ollama for local Gemma inference
- Local JSON data store for prototype care data

AI / Model:

- Gemma 4 through Ollama
- Optional fine-tuning/domain adaptation notebook in `backend/finetune_colab.ipynb`
- Optional adapter artifacts in `backend/models/gemma4-medical-ft/`

## Project Structure

```text
yourOwn/
  backend/
    data/                    Demo patient, family, schedule, and care-event data
    models/                  Optional fine-tuned adapter artifacts
    routes/
      assist.js              Patient assistance API
      doctor.js              Doctor dashboard and severity APIs
    services/
      care-reasoner.js       Grounded care reasoning and verification
      context.js             Builds live patient context
      memory.js              Reads/writes care events and memory data
      ollama.js              Gemma/Ollama integration
      realtime-alerts.js     WebSocket alert foundation
    server.js                Express backend entry point
  frontend/
    app/
      page.tsx               Main patient/family/doctor experience
      doctor/dashboard.tsx   Doctor dashboard route
      patient/dashboard.tsx  Patient dashboard route
    public/
      manifest.json          PWA manifest
      service-worker.js      Offline/PWA support
```

## Requirements

- Node.js 20+ recommended
- npm
- Ollama installed and running
- A local Gemma model available in Ollama

Example Ollama setup:

```bash
ollama serve
ollama pull gemma4:e4b
```

If your local model name is different, update `OLLAMA_MODEL` in `backend/.env`.

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:e4b

# Optional voice provider
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here
```

Do not commit real API keys, tokens, passwords, or private environment files.

## Run Locally

Start the backend:

```bash
cd backend
npm install
npm start
```

Start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

## Demo Flow

A strong demo scenario:

1. Open the patient view.
2. Simulate a patient saying, "I'm scared. Where am I?"
3. Show the app using voice, location, time, and care context to respond calmly.
4. Show meal or medication schedule awareness.
5. Open the family dashboard and show memory or safe-place context.
6. Open the doctor dashboard and show notes plus severity trends.
7. Explain that Gemma 4 can run locally through Ollama for privacy-sensitive care support.

## Hackathon Tracks

Best-fit tracks:

- Health & Sciences
- Safety & Trust
- Ollama Special Technology Track

Potentially relevant if the fine-tuning work is polished and published:

- Unsloth Special Technology Track

## Safety Note

yourOwn is a prototype care-support system. It is not a medical device, diagnostic tool, emergency service, or replacement for professional clinical judgment. Medication and care instructions should be configured and reviewed by qualified caregivers or clinicians.

## Submission Assets

- Public GitHub repository
- Public live demo
- Public YouTube demo video under 3 minutes
- Kaggle writeup under 1,500 words
- Cover image and media gallery assets

## License

This hackathon submission is licensed under Creative Commons Attribution 4.0 International (CC-BY 4.0), except for third-party dependencies, models, tools, and assets, which remain under their respective licenses.

Full license text:

```text
https://creativecommons.org/licenses/by/4.0/
```
