const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "";

let _client = null;

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  if (!_client) _client = createClient(SUPABASE_URL, SUPABASE_KEY);
  return _client;
}

function isAvailable() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

// ── People ────────────────────────────────────────────────────────────────────

async function addPerson({ patientName, name, relationship, notes, photoBuffer, mimeType }) {
  const db = getClient();
  if (!db) throw new Error("Supabase not configured");

  let photoUrl = null;

  if (photoBuffer) {
    const fileName = `${patientName}/${Date.now()}_${name.replace(/\s+/g, "_")}.jpg`;
    const { error: uploadError } = await db.storage
      .from("people-photos")
      .upload(fileName, photoBuffer, { contentType: mimeType || "image/jpeg", upsert: true });

    if (!uploadError) {
      const { data } = db.storage.from("people-photos").getPublicUrl(fileName);
      photoUrl = data.publicUrl;
    }
  }

  const { data, error } = await db
    .from("people")
    .insert({ patient_name: patientName, name, relationship, notes, photo_url: photoUrl })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

async function listPeople(patientName) {
  const db = getClient();
  if (!db) return [];

  const { data, error } = await db
    .from("people")
    .select("*")
    .eq("patient_name", patientName)
    .order("name");

  if (error) return [];
  return data || [];
}

async function findPerson(patientName, nameQuery) {
  const db = getClient();
  if (!db) return null;

  const clean = nameQuery.trim().toLowerCase();

  // Exact match first
  const { data: exact } = await db
    .from("people")
    .select("*")
    .eq("patient_name", patientName)
    .ilike("name", clean)
    .limit(1);

  if (exact?.length) return exact[0];

  // Partial match fallback
  const { data: partial } = await db
    .from("people")
    .select("*")
    .eq("patient_name", patientName)
    .ilike("name", `%${clean}%`)
    .limit(1);

  return partial?.[0] || null;
}

async function deletePerson(id) {
  const db = getClient();
  if (!db) throw new Error("Supabase not configured");
  const { error } = await db.from("people").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Episodic memories ─────────────────────────────────────────────────────────

async function saveEpisodicMemory({ patientName, type, content, context }) {
  const db = getClient();
  if (!db) return null;

  const { data, error } = await db
    .from("episodic_memories")
    .insert({ patient_name: patientName, type, content, context: context || {} })
    .select()
    .single();

  if (error) {
    console.warn("[PeopleMemory] episodic save failed:", error.message);
    return null;
  }
  return data;
}

async function findEpisodicMemories(patientName, query, limit = 5) {
  const db = getClient();
  if (!db) return [];

  // Simple keyword search — upgrade to pgvector later
  const { data, error } = await db
    .from("episodic_memories")
    .select("*")
    .eq("patient_name", patientName)
    .ilike("content", `%${query}%`)
    .order("timestamp", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data || [];
}

async function getRecentMemories(patientName, limit = 10) {
  const db = getClient();
  if (!db) return [];

  const { data } = await db
    .from("episodic_memories")
    .select("*")
    .eq("patient_name", patientName)
    .order("timestamp", { ascending: false })
    .limit(limit);

  return data || [];
}

// ── Person query detection ────────────────────────────────────────────────────
// Returns the name the patient is asking about, or null

function detectPersonQuery(speechText) {
  const text = String(speechText || "").toLowerCase().trim();

  const patterns = [
    /^who is ([a-z\s.'-]+)\??$/i,
    /^who(?:'s| is| was) ([a-z\s.'-]+)\??$/i,
    /^do you know ([a-z\s.'-]+)\??$/i,
    /^tell me about ([a-z\s.'-]+)$/i,
    /^who(?:'s| is) (?:that |this )?([a-z\s.'-]+)\??$/i,
    /\bwho is ([a-z\s.'-]+)\b/i,
    /\btell me about ([a-z\s.'-]+)\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const name = match[1].trim().replace(/[?.,]$/, "");
      if (name.length > 1 && name.length < 40) return name;
    }
  }
  return null;
}

// ── What was I doing? ─────────────────────────────────────────────────────────

function detectActivityQuery(speechText) {
  const text = String(speechText || "").toLowerCase();
  return /what was i doing|what did i do|what happened earlier|what were we doing|where was i|where did i go/.test(text);
}

module.exports = {
  isAvailable,
  addPerson,
  listPeople,
  findPerson,
  deletePerson,
  saveEpisodicMemory,
  findEpisodicMemories,
  getRecentMemories,
  detectPersonQuery,
  detectActivityQuery
};
