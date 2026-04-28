const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11435";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "gemma4:e4b";

// Medical Knowledge Base (simulated - integrate with PubMed API for production)
const medicalKB = {
  dementiaStages: {
    1: {
      name: "No Cognitive Decline",
      mmseScore: "30",
      characteristics: ["Normal aging", "No memory problems"],
      management: "Regular check-ups, healthy lifestyle"
    },
    2: {
      name: "Very Mild Cognitive Decline",
      mmseScore: "29-27",
      characteristics: ["Memory lapses", "Misplacing items"],
      management: "Observation, cognitive training"
    },
    3: {
      name: "Mild Cognitive Decline",
      mmseScore: "26-24",
      characteristics: ["Noticeable memory problems", "Difficulty with complex tasks"],
      management: "Doctor consultation, cognitive activities"
    },
    4: {
      name: "Moderate Cognitive Decline (Mild Dementia)",
      mmseScore: "23-20",
      characteristics: [
        "Clear cognitive decline",
        "Memory loss noticeable in daily activities",
        "Difficulty with recent events",
        "Mood changes possible"
      ],
      management: "Medications (Donepezil, Memantine), support systems, safety measures"
    },
    5: {
      name: "Moderately Severe Cognitive Decline (Moderate Dementia)",
      mmseScore: "19-10",
      characteristics: [
        "Significant memory loss",
        "Behavioral changes",
        "Need for assistance",
        "Confusion about time/place"
      ],
      management: "Increased supervision, activities of daily living support, medication optimization"
    }
  },

  medications: {
    "Donepezil": {
      class: "Acetylcholinesterase Inhibitor",
      mechanism: "Increases acetylcholine in brain",
      efficacy: "Modest slowing of decline",
      dosage: "5-10mg daily",
      sideEffects: ["GI upset", "bradycardia"],
      interactions: ["NSAIDs", "anticholinergics"],
      recommendations: "Take at bedtime"
    },
    "Memantine": {
      class: "NMDA Antagonist",
      mechanism: "Regulates glutamate activity",
      efficacy: "Effective in moderate to severe dementia",
      dosage: "5-20mg daily",
      sideEffects: ["Dizziness", "confusion"],
      interactions: ["Cimetidine", "amantadine"],
      recommendations: "Can be combined with Donepezil"
    }
  },

  symptoms: {
    "memory_loss": {
      description: "Inability to recall recent or distant memories",
      stage_typical: [3, 4, 5],
      management: ["External reminders", "photo albums", "consistent routines"],
      red_flags: ["Sudden onset", "affecting daily function"]
    },
    "confusion": {
      description: "Disorientation to time, place, or person",
      stage_typical: [4, 5],
      management: ["Familiar environments", "clear communication", "consistent caregivers"],
      red_flags: ["Rapid progression", "combined with hallucinations"]
    },
    "wandering": {
      description: "Aimless movement, getting lost",
      stage_typical: [4, 5],
      management: ["GPS tracking", "safe environment", "identification items"],
      red_flags: ["Going outdoors alone", "at night"]
    },
    "anxiety": {
      description: "Excessive worry or fear",
      stage_typical: [3, 4, 5],
      management: ["Calm environment", "reassurance", "medication if severe"],
      red_flags: ["Panic attacks", "violent behavior"]
    }
  }
};

async function generateMedicalResponse({
  patientData,
  medicalHistory,
  currentSymptoms,
  userInput,
  conversationContext
}) {
  try {
    // Build rich medical context
    const medicalContext = buildMedicalContext({
      patientData,
      medicalHistory,
      currentSymptoms
    });

    // Create specialized prompt for Gemma 4
    const medicalPrompt = buildMedicalPrompt({
      userInput,
      medicalContext,
      conversationContext,
      medicalKB
    });

    console.log("🧠 Querying Gemma 4 with medical context...");

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: medicalPrompt,
        stream: false,
        format: "json",
        options: {
          temperature: 0.3, // Lower for medical accuracy
          top_p: 0.8,
          top_k: 40
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.response || "{}");

    return {
      response: parsed.response || "I'm here to help. Please tell me more.",
      medicalInsights: parsed.medical_insights || [],
      alerts: parsed.alerts || [],
      recommendations: parsed.recommendations || [],
      confidence: parsed.confidence || 0.7
    };
  } catch (error) {
    console.error("❌ Gemma 4 medical query failed:", error.message);
    return getFallbackMedicalResponse(currentSymptoms);
  }
}

function buildMedicalContext({ patientData, medicalHistory, currentSymptoms }) {
  const stage = medicalHistory?.gdsStagingHistory?.[0]?.stage || 3;
  const stageInfo = medicalKB.dementiaStages[stage] || {};
  const mmseScore = medicalHistory?.mmseScores?.[0]?.score || 0;

  return {
    patientAge: patientData?.age,
    diagnosisDuration: calculateMonthsSinceDiagnosis(patientData?.diagnosisDate),
    currentStage: stageInfo.name,
    mmseScore,
    medications: medicalHistory?.medications?.map(m => m.name) || [],
    comorbidities: medicalHistory?.comorbidities || [],
    recentSymptoms: currentSymptoms || [],
    progressionTrend: "gradual_decline" // from analysis
  };
}

function buildMedicalPrompt({
  userInput,
  medicalContext,
  conversationContext,
  medicalKB
}) {
  return `You are a specialized AI assistant for Alzheimer's patient support and family care coordination.

PATIENT CONTEXT:
- Age: ${medicalContext.patientAge}
- Cognitive Stage: ${medicalContext.currentStage}
- MMSE Score: ${medicalContext.mmseScore}/30
- Current Medications: ${medicalContext.medications.join(", ")}
- Recent Symptoms: ${medicalContext.recentSymptoms.join(", ")}
- Comorbidities: ${medicalContext.comorbidities.join(", ")}

MEDICAL KNOWLEDGE:
${JSON.stringify(medicalKB.symptoms, null, 2)}

CONVERSATION HISTORY:
${conversationContext || "First interaction"}

USER INPUT:
"${userInput}"

INSTRUCTIONS:
1. Respond with empathy and clarity appropriate for Alzheimer's stage
2. Identify any concerning symptoms requiring medical attention
3. Provide evidence-based recommendations
4. Format response as JSON with:
   - response: Your empathetic message
   - medical_insights: Array of clinical observations
   - alerts: Array of urgent concerns if any
   - recommendations: Array of suggested actions
   - confidence: Your confidence in this assessment (0-1)

RESPOND WITH VALID JSON ONLY.`;
}

function calculateMonthsSinceDiagnosis(diagnosisDate) {
  if (!diagnosisDate) return 0;
  const now = new Date();
  const diagnosis = new Date(diagnosisDate);
  return Math.floor((now - diagnosis) / (1000 * 60 * 60 * 24 * 30));
}

function getFallbackMedicalResponse(symptoms) {
  return {
    response: "I'm here to support you. If you're experiencing any concerning symptoms, please reach out to your healthcare provider.",
    medicalInsights: [],
    alerts: symptoms && symptoms.length > 0 ? ["Notable symptoms detected - consider medical consultation"] : [],
    recommendations: [
      "Maintain consistent medication schedule",
      "Ensure proper sleep and nutrition",
      "Engage in cognitive activities",
      "Stay in touch with family"
    ],
    confidence: 0.5
  };
}

module.exports = {
  generateMedicalResponse,
  buildMedicalContext,
  medicalKB
};
