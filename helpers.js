import { SEED_USERS, SEED_TASKS, BONUS_RULES } from "./tokens.js";

// ─── STORAGE ──────────────────────────────────────────────────────────────────
export const store = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

export function initStorage() {
  if (!store.get("go_v2")) {
    store.set("go_users", SEED_USERS);
    store.set("go_tasks", SEED_TASKS);
    store.set("go_execs", []);
    store.set("go_bonus", BONUS_RULES);
    store.set("go_v2",    true);
  }
}

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
export const todayStr    = () => new Date().toISOString().split("T")[0];
export const fmtDate     = (d) => new Date(d + "T00:00:00").toLocaleDateString("pt-BR");
export const fmtTime     = (d) => new Date(d).toLocaleTimeString("pt-BR", { hour:"2-digit", minute:"2-digit" });
export const fmtDateLong = () => new Date().toLocaleDateString("pt-BR", { weekday:"long", day:"numeric", month:"long" });
export const monthLabel  = () => new Date().toLocaleDateString("pt-BR", { month:"long", year:"numeric" });

export function getMonthRange(offset = 0) {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  const y = d.getFullYear(), m = d.getMonth();
  return {
    first: new Date(y, m, 1).toISOString().split("T")[0],
    last:  new Date(y, m + 1, 0).toISOString().split("T")[0],
  };
}

export function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d.toISOString().split("T")[0];
  });
}

// ─── PERFORMANCE MENSAL ───────────────────────────────────────────────────────
// Calcula quantas vezes cada tarefa deveria ter sido feita até hoje no mês
function occurrencesInMonth(frequencia, first, last) {
  // Calcula quantas vezes a tarefa ocorre no mês COMPLETO
  const start    = new Date(first + "T00:00:00");
  const end      = new Date(last  + "T00:00:00");
  const diffMs   = end - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  if (frequencia === "diaria")        return diffDays;
  if (frequencia === "semanal")       return Math.ceil(diffDays / 7);
  if (frequencia === "mensal")        return 1;
  if (frequencia === "personalizada") return 1;
  return diffDays;
}

// Mantido para compatibilidade com calcPerfForMonth de meses passados
function occurrencesUntilToday(frequencia, first, today) {
  return occurrencesInMonth(frequencia, first, today);
}

// Calcula desempenho para um mês específico (offset: 0=atual, -1=anterior, etc.)
export function calcPerfForMonth(userId, execs, tasks, pontosExtras = [], offset = 0) {
  const { first, last } = getMonthRange(offset);
  const mes = first.slice(0, 7);

  const ue = execs.filter(e => e.userId === userId && e.date >= first && e.date <= last);
  const ut = tasks.filter(t => t.responsavelId === userId && t.ativo);

  // Para meses passados, usamos o último dia do mês como referência
  const refDay = offset < 0 ? last : todayStr();

  const possiveis = ut.reduce((s, t) => {
    const occ = occurrencesUntilToday(t.frequencia, first, refDay > last ? last : refDay);
    return s + (t.peso * occ);
  }, 0);

  const obtidos = ue.filter(e => e.status === "concluida").reduce((s, e) => {
    const t = ut.find(t => t.id === e.taskId);
    return s + (t ? t.peso : 0);
  }, 0);

  const extras = (pontosExtras || [])
    .filter(p => p.user_id === userId && p.mes === mes)
    .reduce((s, p) => s + p.pontos, 0);

  const realizadas = ue.filter(e => e.status === "concluida").length;
  const perdidas   = ue.filter(e => e.status === "nao_concluida").length;

  if (!ut.length) return { index: 0, obtidos: 0, possiveis: 0, realizadas, perdidas, extras, mes };
  // extras NÃO entram no índice — são bônus separado
  const index = possiveis > 0 ? Math.min(Math.round((obtidos / possiveis) * 100), 100) : 0;
  return { index, obtidos, possiveis, realizadas, perdidas, extras, mes };
}

export function calcPerf(userId, execs, tasks, pontosExtras = [], advertencias = []) {
  const { first } = getMonthRange(0);
  const today = todayStr();
  const { last } = getMonthRange(0);
  const mesAtual = today.slice(0, 7);
  const ue = execs.filter(e => e.userId === userId && e.date >= first && e.date <= last);
  const ut = tasks.filter(t => t.responsavelId === userId && t.ativo);

  // Possíveis = soma de (peso × ocorrências do mês COMPLETO)
  const possiveis = ut.reduce((s, t) => {
    const occ = occurrencesInMonth(t.frequencia, first, last);
    return s + (t.peso * occ);
  }, 0);

  // Obtidos = tarefas concluídas
  const obtidos = ue.filter(e => e.status === "concluida").reduce((s, e) => {
    const t = ut.find(t => t.id === e.taskId);
    return s + (t ? t.peso : 0);
  }, 0);

  // Pontos extras do mês (bônus separado)
  const extras = (pontosExtras || [])
    .filter(p => p.user_id === userId && p.mes === mesAtual)
    .reduce((s, p) => s + p.pontos, 0);

  // Penalidades de advertências do mês
  const penalidades = (advertencias || [])
    .filter(a => a.user_id === userId && a.mes === mesAtual)
    .reduce((s, a) => s + (a.penalidade || 0), 0);

  const realizadas = ue.filter(e => e.status === "concluida").length;
  const perdidas   = ue.filter(e => e.status === "nao_concluida").length;

  if (!ut.length) return { index: 0, obtidos: 0, possiveis: 0, realizadas, perdidas, extras, penalidades };

  // Penalidades reduzem os pontos obtidos; extras são bônus separado
  const obtidosLiquido = Math.max(obtidos - penalidades, 0);
  const index = possiveis > 0
    ? Math.min(Math.round((obtidosLiquido / possiveis) * 100), 100)
    : 0;
  return { index, obtidos: obtidosLiquido, possiveis, realizadas, perdidas, extras, penalidades };
}

export function getBonus(index, rules) {
  const r = rules.find(r => index >= r.min && index <= r.max);
  return r ? r.valor : 0;
}

export function statusColor(v) { return v >= 90 ? "#10b981" : v >= 70 ? "#f59e0b" : "#ef4444"; }
export function statusLabel(v) { return v >= 90 ? "Meta atingida" : v >= 70 ? "Atenção" : "Abaixo da meta"; }

export function initials(name) {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
