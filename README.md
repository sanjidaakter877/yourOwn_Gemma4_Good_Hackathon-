# yourOwn

A local-first Gemma 4 care companion for Alzheimer's patients, families, and doctors.

yourOwn is a hackathon prototype for the Gemma 4 Good Hackathon. It helps an Alzheimer's patient during moments of confusion by combining voice, text, GPS, meal and medication schedules, family memory notes, doctor instructions, camera context, and severity tracking over time.

The goal is not to replace caregivers or clinicians. The goal is to give patients calm, grounded support between human care moments while giving families and doctors better context.

## Why It Matters

Alzheimer's patients can become scared, lost, or unsure about basic daily events:

- Where am I?
- Did I eat?
- Is it time for my medicine?
- Who is this person?
- Why am I scared?

Generic chatbots do not know the patient's care context. Simple reminder apps do not reason about the moment. yourOwn uses Gemma 4 with structured patient context so responses can be safer, calmer, and more personal.

## Core Features

- Patient companion with voice, text, GPS, camera context, and live monitoring
- Mobile-first patient UI with large actions and simple language
- Meal and medication alarms for breakfast, lunch, dinner, and medication times
- Family dashboard for memories, safe places, schedules, and family photos
- Doctor dashboard for care notes, medication guidance, follow-up, and severity trends
- Local care-event history to track whether confusion/risk appears stable, improving, or worsening
- Grounded care reasoning layer that checks schedule, context, and risk before responding
- Local-first Gemma usage through Ollama

## How Gemma 4 Is Used

Gemma 4 is used as the care reasoning and language layer. The backend does not send only a raw chat message. It builds a structured care context containing:

- patient speech or typed message
- current time and schedule
- GPS/location status
- safe places
- doctor notes
- family notes and memory summaries
- visual concern selected by the patient
- recent care events
- risk and grounding signals

Gemma then generates a short, patient-facing response. The app also applies deterministic care checks so it does not repeat medication or meal instructions when they are not due.

## Local-First Design

yourOwn is designed to run Gemma locally through Ollama. This matters because Alzheimer's care data can include sensitive location, medication, family, and medical context.

Local-first means patient context can be processed close to the user instead of relying on a hosted AI API for every interaction.

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
- Optional fine-tuning/domain adaptation notebook under `backend/finetune_colab.ipynb`
- Optional adapter artifacts under `backend/models/gemma4-medical-ft/`

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
      advanced-alert-ml.js   Risk and alert support
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

Create `backend/.env`:

```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:e4b

# Optional voice provider
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here
```

Do not commit real API keys.

## Run Locally

Install backend dependencies:

```bash
cd backend
npm install
npm start
```

The backend runs on:

```text
http://localhost:5000
```

Install frontend dependencies:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:3000
```

## Demo Flow

A strong demo scenario:

1. Open the patient mobile view.
2. Simulate a patient saying: "I'm scared. Where am I?"
3. Start live monitoring or press Speak.
4. Show the app using voice, GPS, time, and care context to respond calmly.
5. Trigger or show meal/medication schedule logic.
6. Open the family dashboard and upload family memory/photo information.
7. Open the doctor dashboard and show care notes plus severity trend.
8. Explain that Gemma 4 is running locally through Ollama.

## Hackathon Tracks

Best-fit tracks:

- Health & Sciences
- Safety & Trust
- Ollama Special Technology Track

Potentially relevant if the fine-tuning work is polished and published:

- Unsloth Special Technology Track

## Safety Note

yourOwn is a prototype care-support system. It is not a medical device, diagnostic tool, emergency service, or replacement for professional clinical judgment. Medication and care instructions should be configured and reviewed by qualified caregivers or clinicians.

## Submission Assets To Prepare

- Kaggle writeup under 1,500 words
- Public YouTube demo video under 3 minutes
- Public GitHub repository
- Public live demo or downloadable demo files
- Cover image and media gallery assets

## License

This hackathon submission is licensed under Creative Commons Attribution 4.0
International (CC-BY 4.0), except for third-party dependencies, models, tools,
and assets, which remain under their respective licenses.

Full license text:

```text
https://creativecommons.org/licenses/by/4.0/
```
