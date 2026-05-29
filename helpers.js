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
function occurrencesUntilToday(frequencia, first, today) {
  const start  = new Date(first + "T00:00:00");
  const end    = new Date(today + "T00:00:00");
  const diffMs = end - start;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1; // +1 inclui hoje

  if (frequencia === "diaria")       return diffDays;
  if (frequencia === "semanal")      return Math.ceil(diffDays / 7);
  if (frequencia === "mensal")       return 1;
  if (frequencia === "personalizada") return 1;
  return diffDays;
}

export function calcPerf(userId, execs, tasks, pontosExtras = []) {
  const { first } = getMonthRange(0);
  const today = todayStr();
  const { last } = getMonthRange(0);
  const mesAtual = today.slice(0, 7);
  const ue = execs.filter(e => e.userId === userId && e.date >= first && e.date <= last);
  const ut = tasks.filter(t => t.responsavelId === userId && t.ativo);

  // Possíveis = soma de (peso × ocorrências esperadas até hoje)
  const possiveis = ut.reduce((s, t) => {
    const occ = occurrencesUntilToday(t.frequencia, first, today);
    return s + (t.peso * occ);
  }, 0);

  // Obtidos = tarefas concluídas
  const obtidos = ue.filter(e => e.status === "concluida").reduce((s, e) => {
    const t = ut.find(t => t.id === e.taskId);
    return s + (t ? t.peso : 0);
  }, 0);

  // Pontos extras do mês
  const extras = pontosExtras
    .filter(p => p.user_id === userId && p.mes === mesAtual)
    .reduce((s, p) => s + p.pontos, 0);

  const realizadas = ue.filter(e => e.status === "concluida").length;
  const perdidas   = ue.filter(e => e.status === "nao_concluida").length;

  if (!ut.length) return { index: extras > 0 ? Math.min(extras, 100) : 0, obtidos: extras, possiveis: 0, realizadas, perdidas, extras };

  const index = possiveis > 0
    ? Math.min(Math.round(((obtidos + extras) / possiveis) * 100), 100)
    : 0;
  return { index, obtidos: obtidos + extras, possiveis, realizadas, perdidas, extras };
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
