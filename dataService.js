import { supabase } from "./supabase.js";
import sql from "./db.js";
import { store, initStorage } from "./helpers.js";

const USE_SUPABASE_AUTH = !!(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const USE_NEON = !!import.meta.env.VITE_NEON_URL;
export const USE_SUPABASE = USE_NEON || USE_SUPABASE_AUTH;

function handleError(label, error) {
  console.error(`[dataService] ${label}:`, error?.message ?? error);
  throw new Error(error?.message ?? error);
}

function rowToTask(r) {
  return {
    id: r.id, nome: r.nome, descricao: r.descricao,
    categoria: r.categoria, horario: r.horario, frequencia: r.frequencia,
    tempoEstimado: r.tempo_estimado, peso: r.peso,
    fotoObrigatoria: r.foto_obrigatoria,
    responsavelId: r.responsavel_id, ativo: r.ativo,
  };
}

function rowToExec(r) {
  return {
    id: r.id, taskId: r.task_id, userId: r.user_id,
    date: typeof r.date === "string" ? r.date.split("T")[0] : r.date,
    timestamp: r.timestamp, status: r.status,
    observacao: r.observacao, photo: r.photo_url,
  };
}

// AUTH
const LOCAL_USERS = [
  { id:"u-vivian", email:"vivian@orioncloudkitchens.com.br", pass:"75807375Vi", name:"Vivian", role:"admin", nivel:"admin", cargo:"Gestao e Tecnologia", setor:"Gestao", avatar:"VI", ativo:true, elegivel_bonus:true },
  { id:"u-rafael", email:"rafael@orion.com.br", pass:"123456", name:"Rafael", role:"colaborador", nivel:"supervisor", cargo:"Supervisor", setor:"Operacional", avatar:"RA", ativo:true, elegivel_bonus:true },
  { id:"u-eduardo", email:"eduardo@orion.com.br", pass:"123456", name:"Eduardo", role:"colaborador", nivel:"lider", cargo:"Lider Operacional", setor:"Operacional", avatar:"ED", ativo:true, elegivel_bonus:true },
  { id:"u-adala", email:"adala@orion.com.br", pass:"123456", name:"Adala", role:"colaborador", nivel:"lider", cargo:"Lider Operacional", setor:"Operacional", avatar:"AD", ativo:true, elegivel_bonus:true },
  { id:"u-lucas", email:"lucas@orion.com.br", pass:"123456", name:"Lucas", role:"colaborador", nivel:"operador", cargo:"Auxiliar Operacional", setor:"Operacional", avatar:"LU", ativo:true, elegivel_bonus:true },
];

export async function loginUser(email, password) {
  const emailNorm = (email || "").toLowerCase().trim();
  const passNorm = (password || "").trim();

  // 1) Tenta credenciais locais (fallback offline)
  const localUser = LOCAL_USERS.find(u => u.email === emailNorm && u.pass === passNorm);

  // 2) Se nao achou localmente, busca no banco Neon
  if (!localUser) {
    if (!USE_NEON) throw new Error("E-mail ou senha incorretos.");
    try {
      const rows = await sql`SELECT * FROM usuarios WHERE email = ${emailNorm} AND password = ${passNorm} LIMIT 1`;
      if (!rows[0]) throw new Error("E-mail ou senha incorretos.");
      const dbUser = rows[0];
      if (!dbUser.ativo) throw new Error("Usuario inativo. Contate o administrador.");
      try { localStorage.setItem("go_session", JSON.stringify({ userId: dbUser.id, email: dbUser.email, profile: dbUser, ts: Date.now() })); } catch(e) {}
      return dbUser;
    } catch(ex) {
      if (ex.message === "E-mail ou senha incorretos." || ex.message === "Usuario inativo. Contate o administrador.") throw ex;
      throw new Error("E-mail ou senha incorretos.");
    }
  }

  // 3) Achou localmente — busca perfil atualizado no Neon (se disponivel)
  let profile = { ...localUser };
  if (USE_NEON) {
    try {
      const rows = await sql`SELECT * FROM usuarios WHERE email = ${emailNorm} LIMIT 1`;
      if (rows[0]) profile = rows[0];
    } catch(e) {
      console.warn("[login] Neon indisponivel, usando dados locais:", e.message);
    }
  }

  if (!profile.ativo) throw new Error("Usuario inativo. Contate o administrador.");
  try { localStorage.setItem("go_session", JSON.stringify({ userId: profile.id, email: profile.email, profile, ts: Date.now() })); } catch(e) {}
  return profile;
}

export async function logoutUser() {
  try { localStorage.removeItem("go_session"); } catch(e) {}
  try { await supabase.auth.signOut(); } catch(e) {}
}

export async function getSession() {
  try {
    const raw = localStorage.getItem("go_session");
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() - session.ts > 8 * 60 * 60 * 1000) {
      localStorage.removeItem("go_session");
      return null;
    }
    return session;
  } catch(e) { return null; }
}

// USUARIOS
export async function fetchUsers() {
  if (!USE_NEON) return store.get("go_users", []);
  const rows = await sql`SELECT * FROM usuarios ORDER BY name`;
  return rows;
}

export async function upsertUser(user) {
  if (!USE_NEON) {
    const all = store.get("go_users", []);
    const upd = all.find(u => u.id === user.id) ? all.map(u => u.id === user.id ? user : u) : [...all, user];
    store.set("go_users", upd); return user;
  }
  const { id, auth_id, password, created_at, ...r } = user;
  await sql`
    INSERT INTO usuarios (id, auth_id, name, email, password, role, cargo, setor, nivel, avatar, ativo, elegivel_bonus)
    VALUES (${id}, ${auth_id || null}, ${r.name}, ${r.email}, ${password || '123456'}, ${r.role}, ${r.cargo}, ${r.setor}, ${r.nivel || 'operador'}, ${r.avatar}, ${r.ativo}, ${r.elegivel_bonus !== false})
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name, email = EXCLUDED.email, role = EXCLUDED.role,
      cargo = EXCLUDED.cargo, setor = EXCLUDED.setor, nivel = EXCLUDED.nivel,
      avatar = EXCLUDED.avatar, ativo = EXCLUDED.ativo, elegivel_bonus = EXCLUDED.elegivel_bonus
  `;
  return user;
}

export async function deleteUser(id) {
  if (!USE_NEON) {
    store.set("go_users", store.get("go_users", []).filter(u => u.id !== id));
    return true;
  }
  await sql`DELETE FROM usuarios WHERE id = ${id}`;
  return true;
}

// TAREFAS
export async function fetchTasks() {
  if (!USE_NEON) return store.get("go_tasks", []);
  const rows = await sql`SELECT * FROM tarefas ORDER BY horario`;
  return rows.map(rowToTask);
}

export async function upsertTask(task) {
  if (!USE_NEON) {
    const all = store.get("go_tasks", []);
    const upd = all.find(t => t.id === task.id) ? all.map(t => t.id === task.id ? task : t) : [...all, task];
    store.set("go_tasks", upd); return task;
  }
  await sql`
    INSERT INTO tarefas (id, nome, descricao, categoria, horario, frequencia, tempo_estimado, peso, foto_obrigatoria, responsavel_id, ativo)
    VALUES (${task.id}, ${task.nome}, ${task.descricao || null}, ${task.categoria}, ${task.horario},
    ${task.frequencia}, ${task.tempoEstimado}, ${task.peso}, ${task.fotoObrigatoria},
    ${task.responsavelId || null}, ${task.ativo})
    ON CONFLICT (id) DO UPDATE SET
      nome = EXCLUDED.nome, descricao = EXCLUDED.descricao, categoria = EXCLUDED.categoria,
      horario = EXCLUDED.horario, frequencia = EXCLUDED.frequencia,
      tempo_estimado = EXCLUDED.tempo_estimado, peso = EXCLUDED.peso,
      foto_obrigatoria = EXCLUDED.foto_obrigatoria, responsavel_id = EXCLUDED.responsavel_id,
      ativo = EXCLUDED.ativo
  `;
  return task;
}

// EXECUCOES
export async function fetchExecucoes() {
  if (!USE_NEON) return store.get("go_execs", []);
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const fromDate = threeMonthsAgo.toISOString().split("T")[0];
  const rows = await sql`
    SELECT id, task_id, user_id, date, timestamp, status, observacao
    FROM execucoes WHERE date >= ${fromDate}
    ORDER BY date DESC LIMIT 500
  `;
  return rows.map(rowToExec);
}

export async function fetchExecucaoPhoto(id) {
  if (!USE_NEON) return null;
  const rows = await sql`SELECT photo_url FROM execucoes WHERE id = ${id} LIMIT 1`;
  return rows[0]?.photo_url || null;
}

export async function insertExecucao(exec) {
  if (!USE_NEON) {
    const all = [...store.get("go_execs", []), exec];
    store.set("go_execs", all); return exec;
  }
  const dateStr = typeof exec.date === "string" ? exec.date.split("T")[0] : exec.date;
  await sql`
    INSERT INTO execucoes (id, task_id, user_id, date, timestamp, status, observacao, photo_url)
    VALUES (${exec.id}, ${exec.taskId}, ${exec.userId}, ${dateStr},
    ${exec.timestamp}, ${exec.status}, ${exec.observacao || null}, ${exec.photo || null})
  `;
  return exec;
}

// BONUS
export const DEFAULT_BONUS_RULES = [
  {min:90,max:100,valor:300},{min:80,max:89,valor:250},{min:70,max:79,valor:200},
  {min:60,max:69,valor:150},{min:50,max:59,valor:100},{min:0,max:49,valor:0}
];

export async function fetchBonusRules() {
  if (!USE_NEON) return store.get("go_bonus", DEFAULT_BONUS_RULES);
  const rows = await sql`SELECT * FROM bonus_rules ORDER BY min DESC`;
  return rows.length ? rows : DEFAULT_BONUS_RULES;
}

export async function saveBonusRules(rules) {
  if (!USE_NEON) { store.set("go_bonus", rules); return rules; }
  await sql`DELETE FROM bonus_rules WHERE id > 0`;
  for (const r of rules) {
    await sql`INSERT INTO bonus_rules (min, max, valor) VALUES (${r.min}, ${r.max}, ${r.valor})`;
  }
  return rules;
}

export const DEFAULT_EXTRA_RULES = [
  { pontos:5, valor:25 }, { pontos:10, valor:50 }, { pontos:15, valor:75 }
];

export async function fetchExtraRules() {
  if (!USE_NEON) return store.get("go_extra_rules", DEFAULT_EXTRA_RULES);
  const rows = await sql`SELECT * FROM extra_rules ORDER BY pontos`;
  return rows.length ? rows : DEFAULT_EXTRA_RULES;
}

export async function saveExtraRules(rules) {
  if (!USE_NEON) { store.set("go_extra_rules", rules); return rules; }
  await sql`DELETE FROM extra_rules WHERE id > 0`;
  for (const r of rules) {
    await sql`INSERT INTO extra_rules (pontos, valor) VALUES (${r.pontos}, ${r.valor})`;
  }
  return rules;
}

// PONTOS EXTRAS
export async function fetchPontosExtras() {
  if (!USE_NEON) return store.get("go_pontos", []);
  const rows = await sql`SELECT * FROM pontos_extras ORDER BY created_at DESC`;
  return rows;
}

export async function insertPontosExtras(entry) {
  if (!USE_NEON) { store.set("go_pontos", [...store.get("go_pontos",[]), entry]); return entry; }
  await sql`
    INSERT INTO pontos_extras (id, user_id, given_by_id, pontos, justificativa, mes, created_at)
    VALUES (${entry.id}, ${entry.user_id}, ${entry.given_by_id}, ${entry.pontos},
    ${entry.justificativa}, ${entry.mes}, ${entry.created_at})
  `;
  return entry;
}

export async function deletePontosExtras(id) {
  if (!USE_NEON) { store.set("go_pontos", store.get("go_pontos",[]).filter(p=>p.id!==id)); return true; }
  await sql`DELETE FROM pontos_extras WHERE id = ${id}`;
  return true;
}

// ADVERTENCIAS
export async function fetchAdvertencias() {
  if (!USE_NEON) return store.get("go_adv", []);
  const rows = await sql`SELECT * FROM advertencias ORDER BY created_at DESC`;
  return rows;
}

export async function insertAdvertencia(entry) {
  if (!USE_NEON) { store.set("go_adv", [...store.get("go_adv",[]), entry]); return entry; }
  await sql`
    INSERT INTO advertencias (id, user_id, colaborador_nome, dado_por_id, motivo, descricao, penalidade, mes, created_at)
    VALUES (${entry.id}, ${entry.user_id||null}, ${entry.colaborador_nome}, ${entry.dado_por_id},
    ${entry.motivo}, ${entry.descricao||null}, ${entry.penalidade}, ${entry.mes}, ${entry.created_at})
  `;
  return entry;
}

export async function deleteAdvertencia(id) {
  if (!USE_NEON) { store.set("go_adv", store.get("go_adv",[]).filter(a=>a.id!==id)); return true; }
  await sql`DELETE FROM advertencias WHERE id = ${id}`;
  return true;
}
