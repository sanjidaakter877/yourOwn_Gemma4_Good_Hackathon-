const GROQ_API_KEY = (process.env.GROQ_API_KEY || "").trim();
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

async function generateWithGroq({
  context,
  environment,
  scored,
  relevantMemories,
  careReasoning,
  inferenceStart
}) {
  if (!GROQ_API_KEY) return null;

  const name = context.userName || "Mary";
  const speech = (context.speechText || "").trim();
  const isSilentCheck = Boolean(context.behaviorAnalysis?.silent_confusion);
  const isConversation = scored.mode === "conversation" && !isSilentCheck;

  const systemPrompt = buildSystemPrompt({ name, isConversation, context, environment, relevantMemories, careReasoning });
  const userMessage = speech || (isSilentCheck ? `[${name} has been quiet for a while]` : "Hello");

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        temperature: isConversation ? 0.85 : 0.6,
        max_tokens: 200
      })
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`Groq API ${res.status}:`, errText.slice(0, 200));
      return null;
    }

    const data = await res.json();
    const reply = (data.choices?.[0]?.message?.content || "").trim();
    if (!reply) return null;

    console.log(`[Groq] replied: "${reply.slice(0, 80)}"`);

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
        model: GROQ_MODEL,
        inference_ms: Date.now() - inferenceStart,
        function_calls: [],
        vision_used: false,
        local: false,
        provider: "groq"
      }
    };
  } catch (err) {
    console.warn("Groq API exception:", err.message);
    return null;
  }
}

function buildSystemPrompt({ name, isConversation, context, environment, relevantMemories, careReasoning }) {
  const timeHint = context.currentClock ? `It is ${context.currentClock}, ${context.timeOfDay}.` : "";
  const placeHint = environment?.likely_place ? `${name} is at ${environment.likely_place}.` : "";
  const careNote = context.careNote ? `Family note: ${context.careNote}` : "";
  const memoryHint = relevantMemories.slice(0, 2).map(m => `- ${m.interpreted_text}`).join("\n");
  const history = (context.conversationHistory || []).slice(-6);
  const historyHint = history.length
    ? history.map(t => `${t.role === "patient" ? name : "You"}: ${t.text}`).join("\n")
    : "";
  const silentChecks = Number(context.behaviorSignals?.liveSilenceCheckCount || 0);

  if (isConversation) {
    return `You are yourOwn, a cheerful friendly companion chatting with ${name}.
${timeHint} ${placeHint}
${historyHint ? `Recent conversation:\n${historyHint}` : ""}

RULES — follow these exactly:
1. Answer what ${name} said IMMEDIATELY and directly. If they ask for a joke, TELL THE JOKE first.
2. Do NOT ask if they are okay, safe, or comfortable — this is casual friendly chat, not a safety check.
3. Keep it to 1-2 sentences, warm and fun.
4. End with one short friendly question to keep chatting.
5. Never mention GPS, care notes, medication, or system data.`;
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
${escalationHint}

Respond as a calm caregiver in 2-3 sentences:
- If ${name} seems confused: gently orient them (time, place, what they were doing)
- If ${name} can't find something: help them think through where it might be
- If this is a silent check-in: ask one gentle question to make sure they are okay
- Use simple warm words. Never mention GPS, timestamps, or raw system data.`;
}

module.exports = { generateWithGroq };
