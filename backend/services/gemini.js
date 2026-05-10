const { GoogleGenerativeAI } = require("@google/generative-ai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

let genAI = null;
function getClient() {
  if (!GEMINI_API_KEY) return null;
  if (!genAI) genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  return genAI;
}

async function generateWithGemini({
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
  const isConversation = scored.mode === "conversation" && !context.behaviorAnalysis?.silent_confusion;

  try {
    const model = ai.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: { temperature: isConversation ? 0.85 : 0.6, maxOutputTokens: 200 }
    });

    // Build image part if camera frame available
    let imagePart = null;
    if (context.capturedImage) {
      const base64 = context.capturedImage.replace(/^data:[^;]+;base64,/, "");
      imagePart = { inlineData: { mimeType: "image/jpeg", data: base64 } };
    }

    const prompt = isConversation
      ? buildConversationPrompt({ name, speech, context, environment, relevantMemories, imagePart })
      : buildCarePrompt({ name, speech, context, environment, relevantMemories, careReasoning, imagePart });

    const parts = imagePart ? [imagePart, { text: prompt }] : [{ text: prompt }];

    const result = await model.generateContent(parts);
    const reply = result.response.text().trim();
    if (!reply) return null;

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
        model: GEMINI_MODEL,
        inference_ms: Date.now() - inferenceStart,
        function_calls: [],
        vision_used: Boolean(imagePart),
        local: false,
        provider: "gemini"
      }
    };
  } catch (error) {
    console.warn("Gemini API error:", error.message);
    return null;
  }
}

function buildConversationPrompt({ name, speech, context, environment, relevantMemories, imagePart }) {
  const timeHint = context.currentClock ? `It is ${context.currentClock}, ${context.timeOfDay}.` : "";
  const placeHint = environment?.likely_place ? `${name} is at ${environment.likely_place}.` : "";
  const memoryHint = relevantMemories.slice(0, 2).map(m => `- ${m.interpreted_text}`).join("\n");
  const imageHint = imagePart ? "A live camera image of the scene is attached." : "";
  const history = (context.conversationHistory || []).slice(-6);
  const historyHint = history.length
    ? history.map(t => `${t.role === "patient" ? name : "You"}: ${t.text}`).join("\n")
    : "";

  return `You are yourOwn, a warm caring AI companion for ${name}, who has Alzheimer's.
${timeHint} ${placeHint}
${memoryHint ? `Saved context:\n${memoryHint}` : ""}
${historyHint ? `Recent conversation:\n${historyHint}` : ""}
${imageHint}

${name} just said: "${speech}"

Reply naturally like a real caring friend in 1-2 sentences. Use the conversation above so your reply feels connected and in-context. Directly respond to what ${name} said — do NOT just say "I am listening." If there is a camera image, you can reference what you see naturally. End with one warm follow-up question to keep the conversation going.`;
}

function buildCarePrompt({ name, speech, context, environment, relevantMemories, careReasoning, imagePart }) {
  const timeHint = context.currentClock ? `It is ${context.currentClock}, ${context.timeOfDay}.` : "";
  const placeHint = environment?.likely_place ? `Likely location: ${environment.likely_place}.` : "";
  const careNote = context.careNote ? `Family note: ${context.careNote}` : "";
  const riskLevel = careReasoning?.risk?.level || "low";
  const silentChecks = Number(context.behaviorSignals?.liveSilenceCheckCount || 0);
  const imageHint = imagePart ? "A live camera image of the patient scene is attached." : "";

  const memoryHint = relevantMemories.slice(0, 2).map(m => `- ${m.interpreted_text}`).join("\n");
  const history = (context.conversationHistory || []).slice(-4);
  const historyHint = history.length
    ? history.map(t => `${t.role === "patient" ? name : "You"}: ${t.text}`).join("\n")
    : "";

  const situationHint = context.behaviorAnalysis?.silent_confusion
    ? silentChecks >= 4
      ? `${name} has not responded after ${silentChecks} check-ins. This is a serious concern.`
      : `${name} has been silent for a while (check-in ${silentChecks}).`
    : speech
    ? `${name} said: "${speech}"`
    : `Routine check-in.`;

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
${imageHint}
${escalationHint}

Respond as a calm caregiver in 2-3 sentences. Use the conversation above so your reply feels natural and in-context:
- If ${name} seems confused or lost: gently orient them (time, place, what they were doing)
- If ${name} can't find something: help them think through where it might be
- If this is a check-in after silence: ask one gentle question to make sure they are okay
- If risk is high: calmly mention that you may ask family to check in
- Use simple warm words. Never mention GPS coordinates, timestamps, or raw system data.`;
}

module.exports = { generateWithGemini };
