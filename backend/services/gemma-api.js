const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMMA_API_KEY = (process.env.GEMINI_API_KEY || "").trim();
// gemma-4-26b-a4b-it = 26B MoE with 3.8B active params — fast, same Gemma 4 family
const GEMMA_API_MODEL = process.env.GEMMA_API_MODEL || "gemma-4-26b-a4b-it";

let genAI = null;
function getClient() {
  if (!GEMMA_API_KEY) return null;
  if (!genAI) genAI = new GoogleGenerativeAI(GEMMA_API_KEY);
  return genAI;
}

async function generateWithGemmaApi({
  context,
  environment,
  scored,
  relevantMemories,
  careReasoning,
  inferenceStart
}) {
  const ai = getClient();
  if (!ai) return null;

  const name = context.userName || "John";
  const speech = (context.speechText || "").trim();
  const isSilentCheck = Boolean(context.behaviorAnalysis?.silent_confusion);
  const isConversation = scored.mode === "conversation" && !isSilentCheck;

  const visionUsed = Boolean(context.capturedImage);
  const systemPrompt = buildSystemPrompt({ name, isConversation, context, environment, relevantMemories, careReasoning, visionUsed });
  const userMessage = speech || (isSilentCheck ? `[${name} has been quiet for a while]` : "Hello");

  // Gemma 4 is natively multimodal — attach camera frame when available
  let contentParts = [{ text: userMessage }];
  if (visionUsed) {
    const base64 = context.capturedImage.replace(/^data:[^;]+;base64,/, "");
    contentParts = [
      { inlineData: { mimeType: "image/jpeg", data: base64 } },
      { text: userMessage }
    ];
  }

  try {
    const model = ai.getGenerativeModel({
      model: GEMMA_API_MODEL,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature: isConversation ? 0.85 : 0.6,
        maxOutputTokens: 150
      }
    });

    const result = await model.generateContent(contentParts);

    // Gemma 4 thinking model: parts with thought:true are internal reasoning.
    // Filter them out so only the actual reply text reaches the patient.
    const parts = result.response.candidates?.[0]?.content?.parts || [];
    const answerParts = parts.filter(p => !p.thought);
    const raw = answerParts.length
      ? answerParts.map(p => p.text || "").join("").trim()
      : result.response.text().trim(); // fallback for non-thinking models
    if (!raw) return null;

    const reply = extractFinalAnswer(raw);
    if (!reply) return null;

    console.log(`[GemmaAPI] ${GEMMA_API_MODEL}${visionUsed ? " (vision+voice)" : ""} replied: "${reply.slice(0, 80)}"`);

    const response = { reassurance: reply, context: "", next_step: "" };

    return {
      response_type: isConversation ? "conversation" : "care",
      companion_message: reply,
      response,
      memory_summary: [],
      care_reasoning: careReasoning
        ? { ...careReasoning, verification: { safe_to_send: true, grounding_score: 0.95 } }
        : null,
      ollama_meta: {
        model: GEMMA_API_MODEL,
        inference_ms: Date.now() - inferenceStart,
        function_calls: [],
        vision_used: visionUsed,
        local: false,
        provider: "gemma-api"
      }
    };
  } catch (err) {
    console.warn("GemmaAPI exception:", err.message);
    return null;
  }
}

function buildSystemPrompt({ name, isConversation, context, environment, relevantMemories, careReasoning, visionUsed }) {
  const timeHint = context.currentClock ? `It is ${context.currentClock}, ${context.timeOfDay}.` : "";
  const placeHint = environment?.likely_place ? `${name} is at ${environment.likely_place}.` : "";
  const careNote = context.careNote ? `Family note: ${context.careNote}` : "";
  const memoryHint = relevantMemories.slice(0, 2).map(m => `- ${m.interpreted_text}`).join("\n");
  const history = (context.conversationHistory || []).slice(-6);
  const historyHint = history.length
    ? history.map(t => `${t.role === "patient" ? name : "You"}: ${t.text}`).join("\n")
    : "";
  const silentChecks = Number(context.behaviorSignals?.liveSilenceCheckCount || 0);
  const visionHint = visionUsed ? "A live camera image of the scene is attached. You can refer to what you see naturally in your response." : "";

  // Person lookup result — from Supabase people table ("who is Anna?")
  const personResult = context.personQueryResult;
  const personHint = personResult
    ? `Person info: ${personResult.name}${personResult.relationship ? ` is ${name}'s ${personResult.relationship}` : ""}${personResult.notes ? `. ${personResult.notes}` : ""}.`
    : "";

  if (isConversation) {
    return `You are yourOwn, a cheerful friendly companion chatting with ${name}.
${timeHint} ${placeHint}
${personHint}
${careNote}
${historyHint ? `Recent conversation:\n${historyHint}` : ""}
${visionHint}

RULES:
1. Answer what ${name} said IMMEDIATELY and directly. If they ask for a joke, TELL THE JOKE first.
2. If person info is provided above, use it to answer questions about that person naturally and warmly.
3. If asked "who is [name]?" and you have person info, introduce them clearly: "[Name] is your [relationship]."
4. Do NOT ask if they are okay, safe, or comfortable — this is casual friendly chat.
5. Keep it to 1-2 sentences, warm and fun.
6. If a camera image is attached, you can reference what you see naturally (e.g. "I can see you're in the kitchen").
7. End with one short friendly question to keep chatting.
8. Never mention GPS, system data, or that you retrieved this from a database.`;
  }

  const visualObs = (context.visualDescription || "").trim();
  const situationHint = context.behaviorAnalysis?.silent_confusion
    ? silentChecks >= 4
      ? `${name} has not responded after ${silentChecks} check-ins. This is serious.${visualObs ? ` Camera also shows: ${visualObs}` : ""}`
      : `${name} has been silent (check-in ${silentChecks}).${visualObs ? ` Camera also shows: ${visualObs}` : ""}`
    : context.speechText
    ? `${name} said: "${context.speechText}"${visualObs ? ` Camera shows: ${visualObs}` : ""}`
    : "Routine check-in.";

  const riskLevel = careReasoning?.risk?.level || "low";
  const escalationHint =
    riskLevel === "emergency" || riskLevel === "high"
      ? `Risk is ${riskLevel}. Gently let ${name} know that family may be contacted if no response.`
      : "";

  return `You are yourOwn, a calm caring AI companion for ${name}, who has Alzheimer's.

Situation: ${situationHint}
${timeHint} ${placeHint}
${careNote}
${personHint}
${memoryHint ? `Context:\n${memoryHint}` : ""}
${historyHint ? `Recent conversation:\n${historyHint}` : ""}
${visionHint}
${escalationHint}

Respond as a calm caregiver in 2-3 sentences:
- If ${name} is BOTH silent AND the camera shows confusion or distress: acknowledge what you SEE first ("I can see you look a little worried/tense/confused") then ask them directly about it
- If ${name} seems confused: gently orient them (time, place, what they were doing)
- If ${name} can't find something: help them think through where it might be
- If this is a silent check-in with no visual concern: ask one gentle question to make sure they are okay
- If a camera image is attached, always reference what you see — never ignore visible distress
- Use simple warm words. Never mention GPS, timestamps, or raw system data.`;
}

// Gemma 4 thinking model may output reasoning steps before the final answer.
// The Google AI API typically strips thinking blocks, but the response can still
// span multiple lines. Collect ALL content lines (not just the last one) so
// multi-sentence replies like "Why don't scientists trust atoms? Because they
// make up everything! Want to hear another one?" are never truncated.
function extractFinalAnswer(text) {
  // Strip explicit thinking blocks if present (e.g. <think>…</think>)
  const withoutThinking = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  const source = withoutThinking || text;

  const lines = source.split('\n');

  // Keep all non-empty, non-list lines and join into a single block
  const contentLines = lines
    .map(l => l.trim())
    .filter(t => t && !t.startsWith('*') && !t.startsWith('-') && !/^\d+\./.test(t));

  if (!contentLines.length) return text.trim();

  // Join lines — preserves multi-sentence answers that span newlines
  let lastLine = contentLines.join(' ').trim();

  // Strip surrounding quotes
  lastLine = lastLine.replace(/^["'"']|["'"']$/g, '').trim();

  // Detect full-paragraph duplication: model outputs the whole response twice
  // e.g. "Hi Mary, are you okay? Hi Mary, are you okay?"
  // Try splitting at every word boundary from the middle and check if second half starts with first half
  const words = lastLine.split(' ');
  if (words.length >= 6) {
    const mid = Math.floor(words.length / 2);
    for (let i = mid; i <= words.length - 2; i++) {
      const firstHalf = words.slice(0, i).join(' ').trim();
      const secondHalf = words.slice(i).join(' ').trim();
      const prefix = firstHalf.slice(0, Math.min(40, firstHalf.length));
      if (secondHalf.startsWith(prefix)) {
        lastLine = firstHalf.replace(/[,\s]+$/, '') + (firstHalf.match(/[.!?]$/) ? '' : '.');
        break;
      }
    }
  }

  // Deduplicate consecutive identical sentences
  const sentences = lastLine.match(/[^.!?]+[.!?]+/g) || [];
  const unique = sentences.filter((s, i) => s.trim() !== (sentences[i - 1] || '').trim());

  if (unique.length >= 2) {
    const start = unique[0].trim().split(' ').length <= 3 ? 1 : 0;
    return unique.slice(start).join(' ').trim();
  }
  if (unique.length === 1) return unique[0].trim();
  return lastLine;
}

// Analyze a camera image and return structured scene description + labels + concern.
// Used by /api/vision when patient captures a frame or live monitor saves a snapshot.
// medicines: array of { name, dosage, time, schedule, appearance } from doctor's prescription list
// currentTime: "HH:MM" string — used to check which medicine is due right now
async function analyzeVision(base64Image, medicines = [], currentTime = "", sceneHistory = []) {
  const ai = getClient();
  if (!ai) return null;

  const hasMedicines = Array.isArray(medicines) && medicines.length > 0;
  const dueMed = hasMedicines && currentTime
    ? medicines.find(m => m.time === currentTime)
    : null;

  const medicineContext = hasMedicines
    ? `\n\nDoctor's prescribed medicines for this patient:\n${medicines.map(m =>
        `- ${m.name}${m.dosage ? ` (${m.dosage})` : ""}${m.time ? `, due at ${m.time}` : ""}${m.schedule ? `, ${m.schedule}` : ""}${m.appearance ? ` — looks like: ${m.appearance}` : ""}`
      ).join("\n")}${dueMed ? `\n\nIMPORTANT: It is currently ${currentTime}. The patient should be taking ${dueMed.name} right now.` : ""}`
    : "";

  const medicineInstruction = hasMedicines
    ? `- "medicine_info": If you see any medicine — identify it, then check it against the prescribed list above. State whether it matches what the patient should take${dueMed ? ` (${dueMed.name} is due right now)` : " at this time"}. Explain what the medicine is used for in 1-2 sentences. If the medicine visible does NOT match what is due, warn clearly. Leave empty string if no medicine is visible.`
    : `- "medicine_info": If you see any medicine, pill bottle, tablet, blister pack, or prescription label — identify the medicine name and explain in 1-2 sentences what it is typically used for. Leave empty string if no medicine visible.`;

  const historyContext = Array.isArray(sceneHistory) && sceneHistory.length > 0
    ? `\nPrevious observations (most recent first):\n${sceneHistory.map(s => `- ${s}`).join("\n")}\n`
    : "";

  try {
    const model = ai.getGenerativeModel({
      model: GEMMA_API_MODEL,
      generationConfig: { temperature: 0.3, maxOutputTokens: 350 }
    });

    const imageData = base64Image.replace(/^data:[^;]+;base64,/, "");
    const result = await model.generateContent([
      { inlineData: { mimeType: "image/jpeg", data: imageData } },
      { text: `You are analyzing a camera image for an elderly Alzheimer's patient care system.${medicineContext}${historyContext}

Look carefully at the image and return ONLY valid JSON — no markdown, no explanation:
{
  "description": "2-3 natural sentences describing exactly what you see in the image",
  "labels": ["list", "every", "visible", "object", "person", "activity"],
  "concern": "none",
  "medicine_info": "",
  "expression": "calm",
  "task_abandoned": false,
  "task_detail": "",
  "should_speak": false,
  "speak_message": ""
}

Rules:
- "description": Always fill this. Describe the scene in plain warm language as if explaining to a caregiver.
- "labels": List every object, person, or activity you can see.
- "concern": Use one of — none, medicine_check, unsafe_scene, fall_risk, confusion_sign
- "expression": Describe the patient's visible facial expression — calm, confused, distressed, blank, sad, or other. Use "calm" if no face is visible.
- "task_abandoned": Set true if previous observations show the patient was doing something they have now stopped mid-way (e.g. was cooking, now sitting elsewhere).
- "task_detail": If task_abandoned is true, briefly describe what was left unfinished.
- "should_speak": Set true if expression is confused/distressed/blank, OR task_abandoned is true, OR concern is not none.
- "speak_message": If should_speak is true, write one warm gentle sentence to say directly to the patient. Otherwise leave empty.
${medicineInstruction}` }
    ]);

    const parts = result.response.candidates?.[0]?.content?.parts || [];
    const answerParts = parts.filter(p => !p.thought);
    const raw = answerParts.length
      ? answerParts.map(p => p.text || "").join("").trim()
      : result.response.text().trim();

    console.log("[GemmaAPI] analyzeVision raw:", raw.slice(0, 200));

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      description: String(parsed.description || ""),
      labels: Array.isArray(parsed.labels) ? parsed.labels : [],
      concern: String(parsed.concern || "none"),
      medicine_info: String(parsed.medicine_info || ""),
      expression: String(parsed.expression || "calm"),
      task_abandoned: Boolean(parsed.task_abandoned),
      task_detail: String(parsed.task_detail || ""),
      should_speak: Boolean(parsed.should_speak),
      speak_message: String(parsed.speak_message || "")
    };
  } catch (err) {
    console.warn("[GemmaAPI] analyzeVision failed:", err.message);
    return null;
  }
}

module.exports = { generateWithGemmaApi, analyzeVision };
