# yourOwn

yourOwn detects silent disorientation, restores reality, and escalates safely when the patient cannot respond.

Live demo: https://your-own-gemma4-good-hackathon.vercel.app

This prototype is built for the Gemma 4 Good Hackathon. The core demo is one focused care moment: Mary is making tea, silently pauses, does not respond to gentle check-ins, and yourOwn escalates to a trusted caregiver.

The goal is not to replace caregivers, clinicians, or emergency services. The goal is to catch a quiet failure mode in Alzheimer's care: moments when a patient is disoriented but cannot ask for help out loud.

## Core Story

Many care tools react when someone presses a button, speaks a distress phrase, misses a medication, or leaves a geofence. But Alzheimer's confusion is often quieter than that.

In the demo, yourOwn watches for weak signals:

- no progress in a familiar routine
- extended silence
- hesitation or uncertainty cues
- room and task context
- repeated lack of response

The code decides when to speak, wait, and alert a caregiver. Gemma 4 controls the wording, so the response can stay calm, short, and human.

## Demo Flow

1. Patient is making tea.
2. Patient silently pauses.
3. System detects no progress.
4. AI gives a grounding response.
5. Patient does not respond.
6. AI checks in.
7. Still no response.
8. AI warns that a caregiver may be contacted.
9. Alert is sent to family/caregiver.

The patient dashboard route, `frontend/app/patient/dashboard.tsx`, is a controllable demo console for this sequence.

## Evidence Panel

The demo screen shows the judge-visible decision trace:

- Task: Making tea
- Room: Kitchen
- Signal: No progress for 15 seconds
- Emotion: Uncertainty detected
- Risk: Medium -> High
- Stage: Check-in / Alert sent

## Escalation Logic

Escalation stages live in `backend/services/escalation-manager.js`:

```js
const STAGES = {
  NONE: "none",
  GUIDANCE: "guidance",
  CHECK_IN: "check_in",
  HEARING_CHECK: "hearing_check",
  CAREGIVER_WARNING: "caregiver_warning",
  ALERT_SENT: "alert_sent"
};
```

The flow is:

```text
GUIDANCE -> CHECK_IN -> HEARING_CHECK -> CAREGIVER_WARNING -> ALERT_SENT
```

Example Gemma context:

```json
{
  "stage": "check_in",
  "patient_name": "Mary",
  "task": "making tea",
  "room": "kitchen",
  "tone": "calm and gentle",
  "instruction": "Ask if Mary is okay and whether she needs help."
}
```

## Architecture

Core reasoning runs locally with Gemma 4 via Ollama. Optional cloud APIs support voice and emotion detection.

Frontend:

- Next.js 16
- React 19
- Tailwind CSS
- Browser microphone, speech recognition, GPS, and camera APIs

Backend:

- Node.js
- Express
- Ollama for local Gemma inference
- Local JSON data store for prototype care data
- WebSocket alert foundation

AI / signal services:

- Gemma 4 (E4B) through Ollama — multimodal image input, native function calling, grounded response wording
- Deterministic escalation manager for stage and alert decisions
- Optional ElevenLabs for voice
- Optional Hume for emotion/expression cues

Gemma 4 features in use:

- **Multimodal**: camera frames are passed as raw base64 images directly to Gemma 4 via `/api/chat`, not text labels
- **Function calling**: three care tools (`getCurrentSituation`, `matchSafePlace`, `analyzeEmotionAndBehavior`) are declared as Gemma 4 function tools; the model calls them and receives grounded results before generating a response
- **128K context**: the full patient memory timeline, schedule, care notes, and conversation history fit within a single context window without truncation

## Fine-tuned model

`backend/models/gemma4-medical-ft/` contains a LoRA adapter trained with Unsloth on dementia care dialogue.

Note: the current adapter was trained on `gemma-2-9b` as a baseline. To qualify for the Unsloth special prize, retrain this adapter on a Gemma 4 base model (e.g. `gemma-4-9b`) using the same medical training data in `backend/data/medical-training/`. Publish the updated weights and benchmarks to HuggingFace before the May 18 deadline.

## Run Locally

Requirements:

- Node.js 20+ recommended
- npm
- Ollama installed and running
- A local Gemma model available in Ollama

Example Ollama setup:

```bash
ollama serve
ollama pull gemma4:e4b
```

Create `backend/.env` from `backend/.env.example`:

```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=gemma4:e4b

# Optional cloud APIs
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_VOICE_ID=your_voice_id_here
HUME_API_KEY=your_api_key_here
```

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

Open the focused demo:

```text
http://localhost:3000/patient/dashboard
```

## Video Structure

Target length: 3 minutes.

- 0:00-0:25 Problem
- 0:25-0:55 Patient confusion scene
- 0:55-1:35 yourOwn responds
- 1:35-2:10 No response -> escalation
- 2:10-2:35 Caregiver alert
- 2:35-3:00 Architecture: Gemma 4 + Ollama + voice + detection

## Future Work

These features are useful, and some are already represented in the repo, but they are not the central hackathon story:

- Doctor dashboard
- Medication tracking
- GPS wandering
- FHIR/EHR
- HIPAA claims
- Apple Watch
- 12 languages
- Severity analytics
- Fall detection

## Safety Note

yourOwn is a prototype care-support system. It is not a medical device, diagnostic tool, emergency service, or replacement for professional clinical judgment. Alerts and care instructions should be reviewed and configured by qualified caregivers or clinicians.

## License

This hackathon submission is licensed under Creative Commons Attribution 4.0 International (CC-BY 4.0), except for third-party dependencies, models, tools, and assets, which remain under their respective licenses.
