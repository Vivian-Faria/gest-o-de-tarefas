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

// ─── PERFORMANCE ──────────────────────────────────────────────────────────────
export function calcPerf(userId, execs, tasks) {
  const { first, last } = getMonthRange(0);
  const ue = execs.filter(e => e.userId === userId && e.date >= first && e.date <= last);
  const ut = tasks.filter(t => t.responsavelId === userId && t.ativo);
  if (!ut.length) return { index:0, obtidos:0, possiveis:0, realizadas:0, perdidas:0 };
  const possiveis = ut.reduce((s, t) => s + t.peso, 0);
  const obtidos   = ue.filter(e => e.status === "concluida").reduce((s, e) => {
    const t = ut.find(t => t.id === e.taskId);
    return s + (t ? t.peso : 0);
  }, 0);
  const realizadas = ue.filter(e => e.status === "concluida").length;
  const perdidas   = ue.filter(e => e.status === "nao_concluida").length;
  const index = possiveis > 0 ? Math.round((obtidos / possiveis) * 100) : 0;
  return { index, obtidos, possiveis, realizadas, perdidas };
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
