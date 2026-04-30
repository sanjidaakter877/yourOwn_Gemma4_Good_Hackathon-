const HUME_API_KEY = process.env.HUME_API_KEY || process.env.HUMEAI_API_KEY;
const HUME_API_URL = process.env.HUME_API_URL || "https://api.hume.ai";
const HUME_POLL_ATTEMPTS = Number(process.env.HUME_POLL_ATTEMPTS || 8);
const HUME_POLL_INTERVAL_MS = Number(process.env.HUME_POLL_INTERVAL_MS || 900);

function isConfigured() {
  return Boolean(HUME_API_KEY);
}

async function analyzeImage(imageDataUrl) {
  if (!imageDataUrl || !isConfigured()) return null;

  const image = dataUrlToBuffer(imageDataUrl);
  if (!image) return null;

  return analyzeMedia({
    buffer: image.buffer,
    mimeType: image.mimeType,
    fileName: "camera-frame.jpg",
    models: {
      face: {
        fps_pred: 1,
        identify_faces: false,
        min_face_size: 60,
        prob_threshold: 0.9,
        save_faces: false
      }
    }
  });
}

async function analyzeAudio(audioBuffer, mimeType = "audio/webm") {
  if (!audioBuffer || !isConfigured()) return null;

  return analyzeMedia({
    buffer: audioBuffer,
    mimeType,
    fileName: "voice.webm",
    models: {
      prosody: {
        granularity: "utterance",
        identify_speakers: false
      },
      burst: {}
    },
    transcription: {
      language: "en"
    }
  });
}

async function analyzeText(text) {
  if (!text || !isConfigured()) return null;

  const job = await startJsonJob({
    text: [text],
    models: {
      language: {
        granularity: "sentence",
        identify_speakers: false
      }
    },
    notify: false
  });

  return waitForPredictions(job.job_id, "language");
}

async function analyzeMedia({ buffer, mimeType, fileName, models, transcription }) {
  const formData = new FormData();
  const blob = new Blob([buffer], { type: mimeType });

  formData.append(
    "json",
    JSON.stringify({
      models,
      transcription,
      notify: false
    })
  );
  formData.append("file[]", blob, fileName);

  const response = await fetch(`${HUME_API_URL}/v0/batch/jobs`, {
    method: "POST",
    headers: {
      "X-Hume-Api-Key": HUME_API_KEY
    },
    body: formData
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Hume media job failed: ${response.status} ${errText}`);
  }

  const job = await response.json();
  return waitForPredictions(job.job_id, Object.keys(models || {}).join(","));
}

async function startJsonJob(payload) {
  const response = await fetch(`${HUME_API_URL}/v0/batch/jobs`, {
    method: "POST",
    headers: {
      "X-Hume-Api-Key": HUME_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Hume text job failed: ${response.status} ${errText}`);
  }

  return response.json();
}

async function waitForPredictions(jobId, source) {
  if (!jobId) return null;

  for (let attempt = 0; attempt < HUME_POLL_ATTEMPTS; attempt += 1) {
    const details = await getJobDetails(jobId);
    const status = details?.state?.status;

    if (status === "COMPLETED") {
      const predictions = await getJobPredictions(jobId);
      return summarizePredictions({ jobId, source, predictions });
    }

    if (status === "FAILED") {
      return {
        provider: "hume",
        job_id: jobId,
        source,
        status,
        available: false,
        top_emotions: [],
        note: "Hume analysis failed for this sample."
      };
    }

    await sleep(HUME_POLL_INTERVAL_MS);
  }

  return {
    provider: "hume",
    job_id: jobId,
    source,
    status: "PENDING",
    available: false,
    top_emotions: [],
    note: "Hume job is still processing."
  };
}

async function getJobDetails(jobId) {
  const response = await fetch(`${HUME_API_URL}/v0/batch/jobs/${jobId}`, {
    headers: {
      "X-Hume-Api-Key": HUME_API_KEY
    }
  });

  if (!response.ok) return null;
  return response.json();
}

async function getJobPredictions(jobId) {
  const response = await fetch(`${HUME_API_URL}/v0/batch/jobs/${jobId}/predictions`, {
    headers: {
      "X-Hume-Api-Key": HUME_API_KEY
    }
  });

  if (!response.ok) return [];
  return response.json();
}

function summarizePredictions({ jobId, source, predictions }) {
  const emotions = collectEmotions(predictions);
  const averaged = new Map();

  emotions.forEach((emotion) => {
    const key = emotion.name;
    const current = averaged.get(key) || { name: key, score: 0, count: 0 };
    current.score += Number(emotion.score || 0);
    current.count += 1;
    averaged.set(key, current);
  });

  const topEmotions = Array.from(averaged.values())
    .map((emotion) => ({
      name: emotion.name,
      score: Number((emotion.score / emotion.count).toFixed(3))
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  return {
    provider: "hume",
    job_id: jobId,
    source,
    status: "COMPLETED",
    available: topEmotions.length > 0,
    top_emotions: topEmotions,
    expression_summary: topEmotions
      .slice(0, 3)
      .map((emotion) => `${emotion.name} ${emotion.score}`)
      .join(", ")
  };
}

function collectEmotions(value, output = []) {
  if (!value) return output;

  if (Array.isArray(value)) {
    value.forEach((item) => collectEmotions(item, output));
    return output;
  }

  if (typeof value !== "object") return output;

  if (Array.isArray(value.emotions)) {
    value.emotions.forEach((emotion) => {
      if (emotion?.name && Number.isFinite(Number(emotion.score))) {
        output.push({
          name: String(emotion.name),
          score: Number(emotion.score)
        });
      }
    });
  }

  Object.values(value).forEach((child) => collectEmotions(child, output));
  return output;
}

function dataUrlToBuffer(dataUrl) {
  const match = String(dataUrl).match(/^data:(.+?);base64,(.+)$/);
  if (!match) return null;

  return {
    mimeType: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  isConfigured,
  analyzeAudio,
  analyzeImage,
  analyzeText
};
