import { useState, useMemo } from "react";
import { T } from "./tokens.js";
import { calcPerfForMonth, getMonthRange, statusColor } from "./helpers.js";
import { Ic } from "./Icon.jsx";
import { Avatar, ProgressRing, Page, Modal, Chip } from "./UI.jsx";

// Gera labels dos últimos 6 meses
function getLast6Months() {
  return Array.from({ length: 6 }, (_, i) => {
    const offset = -(5 - i); // -5, -4, -3, -2, -1, 0
    const { first } = getMonthRange(offset);
    const date = new Date(first + "T00:00:00");
    return {
      offset,
      label: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""),
      labelLong: date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }),
      mes: first.slice(0, 7),
    };
  });
}

// ─── BAR CHART COMPONENT ─────────────────────────────────────────────────────
function BarGroup({ months, data, height = 120 }) {
  const max = Math.max(...data.map(d => d.index), 1);
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:8, height, padding:"0 4px" }}>
      {data.map((d, i) => {
        const h = Math.max(Math.round((d.index / 100) * height * 0.9), d.index > 0 ? 6 : 3);
        const color = statusColor(d.index);
        return (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            {d.index > 0 && (
              <span style={{ fontSize:10, fontWeight:700, color }}>{d.index}%</span>
            )}
            <div title={`${months[i].labelLong}: ${d.index}%`} style={{ width:"100%", height:h, background:d.index > 0 ? color : T.slate[100], borderRadius:"4px 4px 2px 2px", transition:"height 0.6s ease", opacity: d.index === 0 ? 0.4 : 1 }}/>
            <span style={{ fontSize:9, color:T.slate[400], fontWeight:500 }}>{months[i].label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── INDIVIDUAL CARD ─────────────────────────────────────────────────────────
function ColabHistorico({ user, months, history, onSelect, selected }) {
  const current = history[history.length - 1];
  const prev    = history[history.length - 2];
  const trend   = prev ? current.index - prev.index : 0;

  return (
    <div
      onClick={() => onSelect(user)}
      style={{ background:"#fff", border:`1.5px solid ${selected ? T.indigo[300] : T.slate[100]}`, borderRadius:14, padding:"16px 18px", cursor:"pointer", transition:"all 0.15s" }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
        <Avatar user={user} size={40}/>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, fontSize:14, color:T.slate[800] }}>{user.name}</div>
          <div style={{ fontSize:11, color:T.slate[400] }}>{user.nivel || user.cargo}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:20, fontWeight:900, color:statusColor(current.index) }}>{current.index}%</div>
          {trend !== 0 && (
            <div style={{ fontSize:10, fontWeight:600, color: trend > 0 ? T.emerald[500] : T.rose[400], display:"flex", alignItems:"center", gap:2, justifyContent:"flex-end" }}>
              <Ic n={trend > 0 ? "arrow_up" : "arrow_down"} s={10} c={trend > 0 ? T.emerald[500] : T.rose[400]}/>
              {Math.abs(trend)}% vs mês ant.
            </div>
          )}
        </div>
      </div>
      <BarGroup months={months} data={history} height={80}/>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export function HistoricoDashboard({ users, tasks, executions, pontosExtras = [], onClose }) {
  const [selected, setSelected] = useState(null);
  const months = getLast6Months();
  const colabs = users.filter(u => u.role === "colaborador" && u.ativo);

  // Calcula histórico de 6 meses para cada colaborador
  const historico = useMemo(() => {
    return colabs.map(u => ({
      user: u,
      history: months.map(m => calcPerfForMonth(u.id, executions, tasks, pontosExtras, m.offset)),
    }));
  }, [colabs, executions, tasks, pontosExtras, months]);

  // Média geral por mês
  const mediaGeral = months.map((m, mi) => ({
    index: colabs.length > 0
      ? Math.round(historico.reduce((s, h) => s + h.history[mi].index, 0) / colabs.length)
      : 0,
  }));

  const selectedData = selected ? historico.find(h => h.user.id === selected.id) : null;

  return (
    <Modal open={true} onClose={onClose} title="Dashboard de Desempenho" width={720}>
      {/* Geral */}
      <div style={{ background:`linear-gradient(135deg,${T.indigo[50]},#fff)`, border:`1px solid ${T.indigo[100]}`, borderRadius:14, padding:"18px 20px", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div>
            <h3 style={{ fontSize:15, fontWeight:800, color:T.slate[800] }}>Desempenho Geral da Equipe</h3>
            <p style={{ fontSize:12, color:T.slate[400] }}>Média dos últimos 6 meses</p>
          </div>
          <Chip color={T.indigo[600]} bg={T.indigo[50]}>
            {mediaGeral[mediaGeral.length-1].index}% este mês
          </Chip>
        </div>
        <BarGroup months={months} data={mediaGeral} height={100}/>
      </div>

      {/* Individual selecionado */}
      {selectedData && (
        <div style={{ background:T.slate[50], border:`1px solid ${T.slate[200]}`, borderRadius:14, padding:"16px 20px", marginBottom:20, animation:"fadeIn 0.2s ease both" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
            <Avatar user={selectedData.user} size={44}/>
            <div style={{ flex:1 }}>
              <h3 style={{ fontSize:15, fontWeight:800, color:T.slate[800] }}>{selectedData.user.name}</h3>
              <p style={{ fontSize:12, color:T.slate[400] }}>Evolução individual — últimos 6 meses</p>
            </div>
            <button onClick={() => setSelected(null)} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
              <Ic n="x" s={16} c={T.slate[400]}/>
            </button>
          </div>

          {/* Month-by-month details */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:8, marginBottom:14 }}>
            {months.map((m, mi) => {
              const d = selectedData.history[mi];
              return (
                <div key={mi} style={{ background:"#fff", borderRadius:10, padding:"10px 12px", border:`1px solid ${T.slate[100]}` }}>
                  <div style={{ fontSize:10, color:T.slate[400], fontWeight:600, textTransform:"uppercase", marginBottom:4 }}>{m.labelLong}</div>
                  <div style={{ fontSize:18, fontWeight:900, color:statusColor(d.index) }}>{d.index}%</div>
                  <div style={{ fontSize:10, color:T.slate[400], marginTop:2 }}>
                    {d.realizadas} feitas · {d.perdidas} perdidas
                    {d.extras > 0 && <span style={{ color:T.amber[500] }}> · +{d.extras}pts extra</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <BarGroup months={months} data={selectedData.history} height={100}/>
        </div>
      )}

      {/* Grid de colaboradores */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:12 }}>
        {historico.map(({ user, history }) => (
          <ColabHistorico
            key={user.id}
            user={user}
            months={months}
            history={history}
            onSelect={setSelected}
            selected={selected?.id === user.id}
          />
        ))}
      </div>
    </Modal>
  );
}
