import { supabase } from "./supabase.js";
import { store, initStorage } from "./helpers.js";

const USE_SUPABASE = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function handleError(label, error) {
  console.error(`[dataService] ${label}:`, error?.message ?? error);
  throw new Error(error?.message ?? error);
}

// ─── CONVERSORES camelCase ↔ snake_case ───────────────────────────────────────

function taskToRow(t) {
  return {
    id:               t.id,
    nome:             t.nome,
    descricao:        t.descricao || null,
    categoria:        t.categoria,
    horario:          t.horario,
    frequencia:       t.frequencia,
    tempo_estimado:   t.tempoEstimado,
    peso:             t.peso,
    foto_obrigatoria: t.fotoObrigatoria,
    responsavel_id:   t.responsavelId || null,
    ativo:            t.ativo,
  };
}

function rowToTask(r) {
  return {
    id:              r.id,
    nome:            r.nome,
    descricao:       r.descricao,
    categoria:       r.categoria,
    horario:         r.horario,
    frequencia:      r.frequencia,
    tempoEstimado:   r.tempo_estimado,
    peso:            r.peso,
    fotoObrigatoria: r.foto_obrigatoria,
    responsavelId:   r.responsavel_id,
    ativo:           r.ativo,
  };
}

function execToRow(e) {
  // Garante que date é string YYYY-MM-DD
  const dateStr = typeof e.date === "string"
    ? e.date.split("T")[0]
    : new Date().toISOString().split("T")[0];
  return {
    id:         e.id,
    task_id:    e.taskId,
    user_id:    e.userId,
    date:       dateStr,
    timestamp:  e.timestamp,
    status:     e.status,
    observacao: e.observacao || null,
    photo_url:  e.photo || null,
  };
}

function rowToExec(r) {
  return {
    id:         r.id,
    taskId:     r.task_id,
    userId:     r.user_id,
    date:       typeof r.date === "string" ? r.date.split("T")[0] : r.date,
    timestamp:  r.timestamp,
    status:     r.status,
    observacao: r.observacao,
    photo:      r.photo_url,
  };
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
export async function loginUser(email, password) {
  if (!USE_SUPABASE) {
    initStorage();
    const users = store.get("go_users", []);
    const u = users.find(u => u.email === email && u.password === password && u.ativo);
    if (!u) throw new Error("E-mail ou senha incorretos.");
    return u;
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("E-mail ou senha incorretos.");

  const { data: profile, error: pe } = await supabase
    .from("usuarios")
    .select("*")
    .eq("auth_id", data.user.id)
    .maybeSingle();

  if (pe) { await supabase.auth.signOut(); throw new Error("Erro ao buscar perfil: " + pe.message); }
  if (!profile) { await supabase.auth.signOut(); throw new Error("Usuário não encontrado. Contate o administrador."); }
  if (!profile.ativo) { await supabase.auth.signOut(); throw new Error("Usuário inativo. Contate o administrador."); }
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
  if (error) { console.error("[fetchUsers]", error.message); return store.get("go_users", []); }
  return data ?? [];
}

export async function upsertUser(user) {
  if (!USE_SUPABASE) {
    const all = store.get("go_users", []);
    const updated = all.find(u => u.id === user.id)
      ? all.map(u => u.id === user.id ? user : u)
      : [...all, user];
    store.set("go_users", updated);
    return user;
  }
  const { id, auth_id, created_at, ...rest } = user;
  const { data, error } = await supabase
    .from("usuarios").update(rest).eq("id", user.id).select().maybeSingle();
  if (error) handleError("upsertUser", error);
  return data ?? user;
}

// ─── TAREFAS ──────────────────────────────────────────────────────────────────
export async function fetchTasks() {
  if (!USE_SUPABASE) return store.get("go_tasks", []);
  const { data, error } = await supabase.from("tarefas").select("*").order("horario");
  if (error) { console.error("[fetchTasks]", error.message); return []; }
  return (data ?? []).map(rowToTask);
}

export async function upsertTask(task) {
  if (!USE_SUPABASE) {
    const all = store.get("go_tasks", []);
    const updated = all.find(t => t.id === task.id)
      ? all.map(t => t.id === task.id ? task : t)
      : [...all, task];
    store.set("go_tasks", updated);
    return task;
  }
  const row = taskToRow(task);
  console.log("[upsertTask]", row.id, row.nome);
  const { data, error } = await supabase
    .from("tarefas").upsert(row, { onConflict: "id" }).select().maybeSingle();
  if (error) handleError("upsertTask", error);
  return data ? rowToTask(data) : task;
}

// ─── EXECUÇÕES ────────────────────────────────────────────────────────────────
export async function fetchExecucoes() {
  if (!USE_SUPABASE) return store.get("go_execs", []);
  const { data, error } = await supabase
    .from("execucoes")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(1000);
  if (error) {
    console.error("[fetchExecucoes]", error.message, error.code);
    return [];
  }
  console.log("[fetchExecucoes] total:", data?.length ?? 0);
  return (data ?? []).map(rowToExec);
}

export async function insertExecucao(exec) {
  if (!USE_SUPABASE) {
    const all = [...store.get("go_execs", []), exec];
    store.set("go_execs", all);
    return exec;
  }
  const row = execToRow(exec);
  console.log("[insertExecucao] tentando salvar:", row.id, "user:", row.user_id, "task:", row.task_id, "date:", row.date, "status:", row.status);
  const { data, error } = await supabase
    .from("execucoes")
    .insert(row)
    .select()
    .maybeSingle();
  if (error) {
    console.error("[insertExecucao] ERRO:", error.message, error.code, error.details, error.hint);
    handleError("insertExecucao", error);
  }
  console.log("[insertExecucao] SALVO com sucesso:", data?.id);
  return data ? rowToExec(data) : exec;
}

// ─── BÔNUS ────────────────────────────────────────────────────────────────────
export async function fetchBonusRules() {
  if (!USE_SUPABASE) return store.get("go_bonus", []);
  const { data, error } = await supabase
    .from("bonus_rules").select("*").order("min", { ascending: false });
  if (error) { console.error("[fetchBonusRules]", error.message); return []; }
  return data ?? [];
}

export async function saveBonusRules(rules) {
  if (!USE_SUPABASE) { store.set("go_bonus", rules); return rules; }
  await supabase.from("bonus_rules").delete().neq("id", 0);
  const rows = rules.map(({ id, ...r }) => r);
  const { data, error } = await supabase.from("bonus_rules").insert(rows).select();
  if (error) handleError("saveBonusRules", error);
  return data ?? rules;
}

export { USE_SUPABASE };
