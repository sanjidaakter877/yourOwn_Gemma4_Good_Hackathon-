const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || "";
const dataDir = path.join(__dirname, "..", "data");

let _client = null;
function getClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;
  if (!_client) _client = createClient(SUPABASE_URL, SUPABASE_KEY);
  return _client;
}

async function readData(key, fallback = null) {
  const db = getClient();
  if (db) {
    try {
      const { data, error } = await db
        .from("app_data")
        .select("value")
        .eq("key", key)
        .single();
      if (!error && data?.value !== undefined) return data.value;
    } catch {}
  }
  // Fall back to local JSON file (works locally, not on Vercel)
  try {
    const raw = fs.readFileSync(path.join(dataDir, key), "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeData(key, value) {
  const db = getClient();
  if (db) {
    try {
      const { error } = await db
        .from("app_data")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) console.warn(`[storage] Supabase write failed for ${key}:`, error.message);
    } catch (err) {
      console.warn(`[storage] Supabase exception for ${key}:`, err.message);
    }
  }
  // Also write local file as backup (silent fail on Vercel read-only fs)
  try {
    fs.writeFileSync(path.join(dataDir, key), JSON.stringify(value, null, 2));
  } catch {}
}

module.exports = { readData, writeData };
