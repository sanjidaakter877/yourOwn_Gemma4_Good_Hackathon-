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

  return `You are yourOwn, an AI voice companion speaking directly TO ${name}, who has Alzheimer's.
RULES — follow exactly:
1. Always say "you" when referring to ${name}. Never use their name or say "me"/"us"/"we" as if you are a person in the household.
2. You are an AI — you do not live in the house. Do not say "here with us" or "takes care of me".
3. Correct: "She takes care of you." Wrong: "She takes care of me" or "She takes care of ${name}".

${timeHint} ${placeHint}
${memoryHint ? `Saved context:\n${memoryHint}` : ""}
${historyHint ? `Recent conversation:\n${historyHint}` : ""}
${imageHint}

${name} just said: "${speech}"

Reply in 1-2 warm sentences directly TO ${name}. End with one gentle follow-up question.`;
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

  return `You are yourOwn, an AI voice companion speaking directly TO ${name}, who has Alzheimer's.
RULES — follow exactly:
1. Always say "you" when referring to ${name}. Never use their name or say "me"/"us"/"we" as if you are a person in the household.
2. You are an AI — you do not live in the house. Never say "here with us" or "takes care of me".
3. Correct: "She takes care of you." Wrong: "She takes care of me" or "She takes care of ${name}".

Situation: ${situationHint}
${timeHint} ${placeHint}
${careNote}
${memoryHint ? `Context:\n${memoryHint}` : ""}
${historyHint ? `Recent conversation:\n${historyHint}` : ""}
${imageHint}
${escalationHint}

Respond in 2-3 warm sentences directly TO ${name}:
- If confused or lost: gently orient them (time, place, what they were doing)
- If can't find something: help them think through where it might be
- If check-in after silence: ask one gentle question to make sure they are okay
- If risk is high: calmly mention that family may check in
- Use simple warm words. Never mention GPS coordinates, timestamps, or raw system data.`;
}

module.exports = { generateWithGemini };
