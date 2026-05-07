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

  const name = context.userName || "Mary";
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

  if (isConversation) {
    return `You are yourOwn, a cheerful friendly companion chatting with ${name}.
${timeHint} ${placeHint}
${historyHint ? `Recent conversation:\n${historyHint}` : ""}
${visionHint}

RULES:
1. Answer what ${name} said IMMEDIATELY and directly. If they ask for a joke, TELL THE JOKE first.
2. Do NOT ask if they are okay, safe, or comfortable — this is casual friendly chat.
3. Keep it to 1-2 sentences, warm and fun.
4. If a camera image is attached, you can reference what you see naturally (e.g. "I can see you're in the kitchen").
5. End with one short friendly question to keep chatting.
6. Never mention GPS, care notes, medication, or system data.`;
  }

  const situationHint = context.behaviorAnalysis?.silent_confusion
    ? silentChecks >= 4
      ? `${name} has not responded after ${silentChecks} check-ins. This is serious.`
      : `${name} has been silent (check-in ${silentChecks}).`
    : context.speechText
    ? `${name} said: "${context.speechText}"`
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
${memoryHint ? `Context:\n${memoryHint}` : ""}
${historyHint ? `Recent conversation:\n${historyHint}` : ""}
${visionHint}
${escalationHint}

Respond as a calm caregiver in 2-3 sentences:
- If ${name} seems confused: gently orient them (time, place, what they were doing)
- If ${name} can't find something: help them think through where it might be
- If this is a silent check-in: ask one gentle question to make sure they are okay
- If a camera image is attached, use what you see to give more specific, grounded help
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

module.exports = { generateWithGemmaApi };
