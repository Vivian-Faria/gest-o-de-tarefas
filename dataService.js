/**
 * dataService.js
 * Camada de acesso a dados.
 * Usa Supabase quando as variáveis de ambiente estão configuradas.
 * Faz fallback para localStorage em dev sem .env.
 */
import { supabase } from "./supabase.js";
import { store, initStorage } from "../utils/helpers.js";

const USE_SUPABASE = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function handleError(label, error) {
  console.error(`[dataService] ${label}:`, error?.message ?? error);
  throw error;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export async function loginUser(email, password) {
  if (!USE_SUPABASE) {
    // fallback localStorage
    initStorage();
    const users = store.get("go_users", []);
    const u = users.find(u => u.email === email && u.password === password && u.ativo);
    if (!u) throw new Error("E-mail ou senha incorretos.");
    return u;
  }

  // Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("E-mail ou senha incorretos.");

  // Busca perfil do usuário na tabela `usuarios`
  const { data: profile, error: pe } = await supabase
    .from("usuarios")
    .select("*")
    .eq("auth_id", data.user.id)
    .single();
  if (pe) handleError("loginUser/profile", pe);
  return profile;
}

export async function logoutUser() {
  if (USE_SUPABASE) await supabase.auth.signOut();
}

export async function getSession() {
  if (!USE_SUPABASE) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ─── USUÁRIOS ─────────────────────────────────────────────────────────────────
export async function fetchUsers() {
  if (!USE_SUPABASE) return store.get("go_users", []);
  const { data, error } = await supabase.from("usuarios").select("*").order("name");
  if (error) handleError("fetchUsers", error);
  return data;
}

export async function upsertUser(user) {
  if (!USE_SUPABASE) {
    const all = store.get("go_users", []);
    const exists = all.find(u => u.id === user.id);
    const updated = exists
      ? all.map(u => u.id === user.id ? user : u)
      : [...all, user];
    store.set("go_users", updated);
    return user;
  }
  const { data, error } = await supabase
    .from("usuarios")
    .upsert(user, { onConflict: "id" })
    .select()
    .single();
  if (error) handleError("upsertUser", error);
  return data;
}

// ─── TAREFAS ──────────────────────────────────────────────────────────────────
export async function fetchTasks() {
  if (!USE_SUPABASE) return store.get("go_tasks", []);
  const { data, error } = await supabase.from("tarefas").select("*").order("horario");
  if (error) handleError("fetchTasks", error);
  return data;
}

export async function upsertTask(task) {
  if (!USE_SUPABASE) {
    const all = store.get("go_tasks", []);
    const exists = all.find(t => t.id === task.id);
    const updated = exists
      ? all.map(t => t.id === task.id ? task : t)
      : [...all, task];
    store.set("go_tasks", updated);
    return task;
  }
  const { data, error } = await supabase
    .from("tarefas")
    .upsert(task, { onConflict: "id" })
    .select()
    .single();
  if (error) handleError("upsertTask", error);
  return data;
}

// ─── EXECUÇÕES ────────────────────────────────────────────────────────────────
export async function fetchExecucoes(filters = {}) {
  if (!USE_SUPABASE) {
    let all = store.get("go_execs", []);
    if (filters.userId) all = all.filter(e => e.userId === filters.userId);
    if (filters.date)   all = all.filter(e => e.date   === filters.date);
    return all;
  }
  let query = supabase.from("execucoes").select("*").order("timestamp", { ascending: false });
  if (filters.userId) query = query.eq("user_id", filters.userId);
  if (filters.date)   query = query.eq("date", filters.date);
  if (filters.from)   query = query.gte("date", filters.from);
  if (filters.to)     query = query.lte("date", filters.to);
  const { data, error } = await query;
  if (error) handleError("fetchExecucoes", error);
  return data;
}

export async function insertExecucao(exec) {
  if (!USE_SUPABASE) {
    const all = [...store.get("go_execs", []), exec];
    store.set("go_execs", all);
    return exec;
  }
  // Mapeia campos camelCase → snake_case do banco
  const row = {
    id:          exec.id,
    task_id:     exec.taskId,
    user_id:     exec.userId,
    date:        exec.date,
    timestamp:   exec.timestamp,
    status:      exec.status,
    observacao:  exec.observacao ?? null,
    photo_url:   exec.photo ?? null,   // no Supabase storage seria uma URL; aqui guardamos base64 em dev
  };
  const { data, error } = await supabase.from("execucoes").insert(row).select().single();
  if (error) handleError("insertExecucao", error);
  // Retorna no formato camelCase que o app usa
  return {
    id:          data.id,
    taskId:      data.task_id,
    userId:      data.user_id,
    date:        data.date,
    timestamp:   data.timestamp,
    status:      data.status,
    observacao:  data.observacao,
    photo:       data.photo_url,
  };
}

// ─── BÔNUS ────────────────────────────────────────────────────────────────────
export async function fetchBonusRules() {
  if (!USE_SUPABASE) return store.get("go_bonus", []);
  const { data, error } = await supabase.from("bonus_rules").select("*").order("min", { ascending: false });
  if (error) handleError("fetchBonusRules", error);
  return data;
}

export async function saveBonusRules(rules) {
  if (!USE_SUPABASE) { store.set("go_bonus", rules); return rules; }
  // Deleta tudo e reinseresupport com upsert
  await supabase.from("bonus_rules").delete().neq("id", 0);
  const { data, error } = await supabase.from("bonus_rules").insert(rules).select();
  if (error) handleError("saveBonusRules", error);
  return data;
}

export { USE_SUPABASE };
