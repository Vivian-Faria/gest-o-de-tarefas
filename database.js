import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const TABLE = "app_state";

export const hasRemoteDb = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasRemoteDb
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function loadRemoteState(defaultState) {
  if (!supabase) return defaultState;

  const keys = Object.keys(defaultState);
  const { data, error } = await supabase
    .from(TABLE)
    .select("key,value")
    .in("key", keys);

  if (error) throw error;

  const remoteState = { ...defaultState };
  for (const row of data || []) {
    remoteState[row.key] = row.value;
  }

  const missing = keys.filter(key => !data?.some(row => row.key === key));
  if (missing.length) {
    await supabase.from(TABLE).upsert(
      missing.map(key => ({
        key,
        value: defaultState[key],
        updated_at: new Date().toISOString(),
      })),
      { onConflict: "key" },
    );
  }

  return remoteState;
}

export async function saveRemoteValue(key, value) {
  if (!supabase) return;

  const { error } = await supabase
    .from(TABLE)
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: "key" },
    );

  if (error) throw error;
}
