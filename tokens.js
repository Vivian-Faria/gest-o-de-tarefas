// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
export const T = {
  indigo:  { 50:"#eef2ff", 100:"#e0e7ff", 200:"#c7d2fe", 400:"#818cf8", 500:"#6366f1", 600:"#4f46e5", 700:"#4338ca" },
  emerald: { 50:"#ecfdf5", 100:"#d1fae5", 400:"#34d399", 500:"#10b981", 600:"#059669" },
  amber:   { 50:"#fffbeb", 100:"#fef3c7", 400:"#fbbf24", 500:"#f59e0b", 600:"#d97706" },
  rose:    { 50:"#fff1f2", 100:"#ffe4e6", 400:"#fb7185", 500:"#f43f5e", 600:"#e11d48" },
  slate:   { 50:"#f8fafc", 100:"#f1f5f9", 200:"#e2e8f0", 300:"#cbd5e1", 400:"#94a3b8", 500:"#64748b", 600:"#475569", 700:"#334155", 800:"#1e293b", 900:"#0f172a" },
  sky:     { 50:"#f0f9ff", 100:"#e0f2fe", 400:"#38bdf8", 500:"#0ea5e9", 600:"#0284c7" },
  violet:  { 50:"#f5f3ff", 100:"#ede9fe", 400:"#a78bfa", 500:"#8b5cf6", 600:"#7c3aed" },
};

export const CAT_COLORS = {
  Limpeza:    { text: T.indigo[600],  bg: T.indigo[50],  dot: T.indigo[400] },
  Inspeção:   { text: T.sky[600],     bg: T.sky[50],     dot: T.sky[400] },
  Controle:   { text: T.amber[600],   bg: T.amber[50],   dot: T.amber[400] },
  Manutenção: { text: T.rose[600],    bg: T.rose[50],    dot: T.rose[400] },
  Relatório:  { text: T.emerald[600], bg: T.emerald[50], dot: T.emerald[400] },
  Outro:      { text: T.slate[600],   bg: T.slate[100],  dot: T.slate[400] },
};

// ─── SEED DATA ────────────────────────────────────────────────────────────────
export const SEED_USERS = [
  { id:"u1", name:"Admin Geral",   email:"admin@empresa.com",   password:"admin123", role:"admin",       cargo:"Gestor",   setor:"Gestão",    ativo:true, avatar:"AG" },
  { id:"u2", name:"Carlos Silva",  email:"carlos@empresa.com",  password:"123456",   role:"colaborador", cargo:"Operador", setor:"Produção",  ativo:true, avatar:"CS" },
  { id:"u3", name:"Ana Souza",     email:"ana@empresa.com",     password:"123456",   role:"colaborador", cargo:"Técnica",  setor:"Qualidade", ativo:true, avatar:"AS" },
  { id:"u4", name:"Roberto Lima",  email:"roberto@empresa.com", password:"123456",   role:"colaborador", cargo:"Operador", setor:"Produção",  ativo:true, avatar:"RL" },
];

export const SEED_TASKS = [
  { id:"t1", nome:"Limpeza da Seladora",         descricao:"Limpar e higienizar a seladora após uso",              categoria:"Limpeza",    horario:"08:00", frequencia:"diaria",  tempoEstimado:15, peso:5,  fotoObrigatoria:true,  responsavelId:"u2", ativo:true },
  { id:"t2", nome:"Checklist Câmara Fria",        descricao:"Verificar temperatura e condições da câmara fria",    categoria:"Inspeção",   horario:"07:00", frequencia:"diaria",  tempoEstimado:10, peso:3,  fotoObrigatoria:true,  responsavelId:"u3", ativo:true },
  { id:"t3", nome:"Controle de Estoque",          descricao:"Registrar entradas e saídas do estoque",              categoria:"Controle",   horario:"09:00", frequencia:"diaria",  tempoEstimado:30, peso:8,  fotoObrigatoria:false, responsavelId:"u2", ativo:true },
  { id:"t4", nome:"Higienização de Equipamentos", descricao:"Limpeza completa dos equipamentos da linha",          categoria:"Limpeza",    horario:"17:00", frequencia:"diaria",  tempoEstimado:45, peso:6,  fotoObrigatoria:true,  responsavelId:"u4", ativo:true },
  { id:"t5", nome:"Relatório de Produção",        descricao:"Preencher relatório diário de produção",              categoria:"Relatório",  horario:"18:00", frequencia:"diaria",  tempoEstimado:20, peso:4,  fotoObrigatoria:false, responsavelId:"u3", ativo:true },
  { id:"t6", nome:"Manutenção Preventiva",        descricao:"Lubrificação e verificação semanal dos equipamentos", categoria:"Manutenção", horario:"08:00", frequencia:"semanal", tempoEstimado:60, peso:10, fotoObrigatoria:true,  responsavelId:"u4", ativo:true },
];

export const BONUS_RULES = [
  { min:90, max:100, valor:300 },
  { min:80, max:89,  valor:150 },
  { min:70, max:79,  valor:50  },
  { min:0,  max:69,  valor:0   },
];
