import { T } from "./tokens.js";
import { calcPerf, getBonus, statusColor, getMonthRange, getLast7Days, monthLabel } from "./helpers.js";
import { Ic } from "./Icon.jsx";
import { Avatar, Chip, ProgressRing, StatCard, Page } from "./UI.jsx";
import { USE_SUPABASE } from "./dataService.js";

export function AdminDashboard({ users, tasks, executions, bonusRules }) {
  const colabs = users.filter(u => u.role === "colaborador" && u.ativo);
  const { first, last } = getMonthRange(0);
  const monthExecs = executions.filter(e => e.date >= first && e.date <= last);
  const totalConcl = monthExecs.filter(e => e.status === "concluida").length;
  const totalNao   = monthExecs.filter(e => e.status === "nao_concluida").length;

  // Taxa correta: soma dos pontos obtidos ÷ soma dos pontos possíveis de todos os colaboradores
  const ranking = colabs.map(u => {
    const p = calcPerf(u.id, executions, tasks);
    return { ...u, ...p, bonus: getBonus(p.index, bonusRules) };
  }).sort((a, b) => b.index - a.index);

  const totalObtidos  = ranking.reduce((s, u) => s + u.obtidos,  0);
  const totalPossiveis = ranking.reduce((s, u) => s + u.possiveis, 0);
  const taxa = totalPossiveis > 0 ? Math.round((totalObtidos / totalPossiveis) * 100) : 0;

  const days7     = getLast7Days();
  const chartData = days7.map(d => ({
    d,
    v: executions.filter(e => e.date === d && e.status === "concluida").length,
  }));

  const medals = ["🥇","🥈","🥉"];

  return (
    <Page title="Dashboard" sub={`Visão geral · ${monthLabel()}`}>

      {/* Aviso quando sem banco de dados */}
      {!USE_SUPABASE && (
        <div style={{ display:"flex", alignItems:"flex-start", gap:12, background:"#fffbeb", border:"1px solid #fde68a", borderRadius:12, padding:"12px 16px", marginBottom:20 }}>
          <Ic n="alert_tri" s={18} c={T.amber[500]} />
          <div>
            <p style={{ fontSize:13, fontWeight:700, color:T.amber[600], marginBottom:2 }}>
              Dados salvos apenas neste navegador
            </p>
            <p style={{ fontSize:12, color:T.amber[600] }}>
              Mobile e desktop têm dados separados porque o banco de dados (Supabase) ainda não foi configurado.
              Siga o <strong>SUPABASE_SETUP.md</strong> para sincronizar todos os dispositivos.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:28 }}>
        <StatCard label="Taxa de Execução"   value={`${taxa}%`}    icon="chart"  color={T.indigo[500]}  sub="Mês atual" chart={chartData} />
        <StatCard label="Tarefas Concluídas" value={totalConcl}    icon="check"  color={T.emerald[500]} sub="Este mês" />
        <StatCard label="Não Concluídas"     value={totalNao}      icon="slash"  color={T.rose[500]}    sub="Este mês" />
        <StatCard label="Colaboradores"      value={colabs.length} icon="users"  color={T.sky[500]}     sub="Ativos" />
      </div>

      {/* Ranking */}
      <div style={{ background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:18, overflow:"hidden" }}>
        <div style={{ padding:"20px 24px 16px", borderBottom:`1px solid ${T.slate[100]}`, display:"flex", alignItems:"center", gap:10 }}>
          <Ic n="trophy" s={18} c={T.amber[500]} />
          <h3 style={{ fontSize:16, fontWeight:800, color:T.slate[800] }}>Ranking de Colaboradores</h3>
          <Chip color={T.slate[500]} bg={T.slate[100]}>{monthLabel()}</Chip>
        </div>

        <div style={{ padding:"0 8px 8px" }}>
          {ranking.length === 0 && (
            <div style={{ padding:40, textAlign:"center", color:T.slate[400] }}>
              Sem colaboradores cadastrados
            </div>
          )}
          {ranking.map((u, i) => {
            const isTop = i === 0;
            return (
              <div key={u.id} className="ranking-row" style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:12, margin:"4px 0", background:isTop?T.amber[50]:"transparent", border:isTop?`1px solid ${T.amber[200]}`:"1px solid transparent", transition:"all 0.15s" }}>
                <div style={{ width:30, textAlign:"center", flexShrink:0 }}>
                  <span style={{ fontSize:i<3?18:14, fontWeight:800, color:i===0?T.amber[500]:i===1?T.slate[400]:i===2?"#b45309":T.slate[300] }}>
                    {i < 3 ? medals[i] : i + 1}
                  </span>
                </div>
                <Avatar user={u} size={42} ring={isTop} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, color:T.slate[800], fontSize:14 }}>{u.name}</div>
                  <div style={{ fontSize:12, color:T.slate[400], marginTop:2, display:"flex", gap:6, flexWrap:"wrap" }}>
                    <span>{u.cargo}</span><span>·</span><span>{u.setor}</span>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:11, color:T.slate[400], fontWeight:600, marginBottom:2 }}>Realizadas</div>
                    <div style={{ fontSize:14, fontWeight:800, color:T.emerald[500] }}>{u.realizadas}</div>
                  </div>
                  <div style={{ textAlign:"center", marginLeft:4 }}>
                    <div style={{ fontSize:11, color:T.slate[400], fontWeight:600, marginBottom:2 }}>Perdidas</div>
                    <div style={{ fontSize:14, fontWeight:800, color:T.rose[400] }}>{u.perdidas}</div>
                  </div>
                  <ProgressRing value={u.index} size={56} sw={5} />
                  <div style={{ textAlign:"right", minWidth:80 }}>
                    <div style={{ fontSize:11, color:T.slate[400], fontWeight:600 }}>Bônus est.</div>
                    <div style={{ fontSize:16, fontWeight:900, color:u.bonus>0?T.emerald[500]:T.slate[300] }}>R$ {u.bonus}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
}
