const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "";

const LOCAL_PEOPLE_FILE = path.join(__dirname, "../data/people.json");

let _client = null;

function getClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  if (!_client) _client = createClient(SUPABASE_URL, SUPABASE_KEY);
  return _client;
}

function isAvailable() {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

// ── Local file helpers ────────────────────────────────────────────────────────

function readLocalPeople() {
  try {
    if (!fs.existsSync(LOCAL_PEOPLE_FILE)) return [];
    return JSON.parse(fs.readFileSync(LOCAL_PEOPLE_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeLocalPeople(people) {
  try {
    fs.mkdirSync(path.dirname(LOCAL_PEOPLE_FILE), { recursive: true });
    fs.writeFileSync(LOCAL_PEOPLE_FILE, JSON.stringify(people, null, 2), "utf8");
  } catch {
    // Read-only filesystem (Vercel) — skip local write
  }
}

// Convert photo buffer to base64 data URI — works everywhere, no storage bucket needed
function toDataUri(buffer, mimeType) {
  return `data:${mimeType || "image/jpeg"};base64,${buffer.toString("base64")}`;
}

// ── People ────────────────────────────────────────────────────────────────────

async function addPerson({ patientName, name, relationship, notes, photoBuffer, mimeType }) {
  const db = getClient();
  const photoUrl = photoBuffer ? toDataUri(photoBuffer, mimeType) : null;

  if (!db) {
    const people = readLocalPeople();
    const person = {
      id: crypto.randomUUID(),
      patient_name: patientName,
      name,
      relationship: relationship || "",
      notes: notes || "",
      photo_url: photoUrl,
      created_at: new Date().toISOString()
    };
    people.push(person);
    writeLocalPeople(people);
    return person;
  }

  const { data, error } = await db
    .from("people")
    .insert({ patient_name: patientName, name, relationship, notes, photo_url: photoUrl })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Mirror to local JSON
  const localPeople = readLocalPeople();
  localPeople.push(data);
  writeLocalPeople(localPeople);

  return data;
}

async function listPeople(patientName) {
  const db = getClient();
  const localPeople = readLocalPeople().filter(p => p.patient_name === patientName);

  if (!db) return localPeople;

  const { data, error } = await db
    .from("people")
    .select("*")
    .eq("patient_name", patientName)
    .order("name");

  if (error) return localPeople;
  const supabasePeople = data || [];

  // Merge: for each Supabase record, prefer local photo_url if set locally
  const merged = supabasePeople.map(sp => {
    const local = localPeople.find(lp => lp.id === sp.id);
    return local ? { ...sp, photo_url: local.photo_url ?? sp.photo_url } : sp;
  });
  console.log(`[listPeople] supabase=${supabasePeople.length} local=${localPeople.length} merged photo_urls=${merged.filter(p => p.photo_url).length}`);
  return merged;
}

async function findPerson(patientName, nameQuery) {
  const db = getClient();
  const clean = nameQuery.trim().toLowerCase();

  if (!db) {
    const people = readLocalPeople().filter(p => p.patient_name === patientName);
    return (
      people.find(p => p.name.toLowerCase() === clean) ||
      people.find(p => p.name.toLowerCase().includes(clean)) ||
      null
    );
  }

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

async function updatePersonPhoto(id, patientName, photoBuffer, mimeType) {
  const db = getClient();
  const photoUrl = toDataUri(photoBuffer, mimeType);

  // Update Supabase people record directly with the data URI
  if (db) {
    const { data: updated, error } = await db
      .from("people")
      .update({ photo_url: photoUrl })
      .eq("id", id)
      .select()
      .single();

    if (!error && updated) {
      // Mirror to local JSON
      const localPeople = readLocalPeople();
      const idx = localPeople.findIndex(p => p.id === id);
      if (idx >= 0) {
        localPeople[idx] = { ...localPeople[idx], photo_url: photoUrl };
      } else {
        localPeople.push({ ...updated });
      }
      writeLocalPeople(localPeople);
      return updated;
    }
  }

  // Local-only fallback (no Supabase)
  const localPeople = readLocalPeople();
  const idx = localPeople.findIndex(p => p.id === id);
  const person = idx >= 0
    ? { ...localPeople[idx], photo_url: photoUrl }
    : { id, patient_name: patientName, name: "", photo_url: photoUrl };

  if (idx >= 0) localPeople[idx] = person;
  else localPeople.push(person);
  writeLocalPeople(localPeople);
  return person;
}

async function deletePerson(id) {
  const db = getClient();

  if (!db) {
    const people = readLocalPeople().filter(p => p.id !== id);
    writeLocalPeople(people);
    return;
  }

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
  updatePersonPhoto,
  saveEpisodicMemory,
  findEpisodicMemories,
  getRecentMemories,
  detectPersonQuery,
  detectActivityQuery
};
