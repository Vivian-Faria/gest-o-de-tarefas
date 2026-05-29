import { useState } from "react";
import { T, CAT_COLORS } from "./tokens.js";
import { calcPerf, getBonus, statusColor, fmtDate, fmtTime, getMonthRange, monthLabel, todayStr } from "./helpers.js";
import { Ic } from "./Icon.jsx";
import { Avatar, Chip, ProgressRing, StatCard, Page, Modal, Empty } from "./UI.jsx";

// ─── NÍVEIS ──────────────────────────────────────────────────────────────────
const NIVEL_LABEL = { operador:"Operador", atendente:"Atendente", lider:"Líder", supervisor:"Supervisor", admin:"Admin" };
const NIVEL_ORDER = { operador:1, atendente:1, lider:2, supervisor:3, admin:4 };

// Retorna quais usuários o usuário logado pode ver
function getSubordinados(user, users) {
  const nivel = user.nivel || "operador";
  if (nivel === "admin" || nivel === "supervisor") {
    return users.filter(u => u.id !== user.id && u.role !== "admin");
  }
  if (nivel === "lider") {
    return users.filter(u => (u.nivel === "operador" || u.nivel === "atendente") && u.ativo);
  }
  return [];
}

// ─── PAINEL DA EQUIPE ────────────────────────────────────────────────────────
export function PainelEquipe({ user, users, tasks, executions, bonusRules }) {
  const [selected, setSelected] = useState(null);
  const [photoModal, setPhotoModal] = useState(null);
  const subordinados = getSubordinados(user, users);
  const { first, last } = getMonthRange(0);

  const ranking = subordinados.map(u => {
    const p = calcPerf(u.id, executions, tasks);
    return { ...u, ...p, bonus: getBonus(p.index, bonusRules) };
  }).sort((a, b) => b.index - a.index);

  const totalConcl = ranking.reduce((s, u) => s + u.realizadas, 0);
  const totalPerd  = ranking.reduce((s, u) => s + u.perdidas, 0);
  const taxaGeral  = ranking.length > 0
    ? Math.round(ranking.reduce((s, u) => s + u.index, 0) / ranking.length)
    : 0;

  // Execuções do colaborador selecionado
  const selectedExecs = selected
    ? executions
        .filter(e => e.userId === selected.id && e.date >= first && e.date <= last)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    : [];

  const medals = ["🥇","🥈","🥉"];

  return (
    <Page title="Painel da Equipe" sub={`${subordinados.length} colaboradores · ${monthLabel()}`}>

      {/* Stats gerais */}
      <div className="stat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginBottom:24 }}>
        <StatCard label="Desempenho médio" value={`${taxaGeral}%`} icon="chart"  color={T.indigo[500]} sub="Mês atual"/>
        <StatCard label="Tarefas Concluídas" value={totalConcl}    icon="check"  color={T.emerald[500]} sub="Este mês"/>
        <StatCard label="Não Concluídas"     value={totalPerd}     icon="slash"  color={T.rose[500]}   sub="Este mês"/>
        <StatCard label="Colaboradores"      value={subordinados.length} icon="users" color={T.sky[500]}/>
      </div>

      {/* Ranking da equipe */}
      <div style={{ background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:18, overflow:"hidden", marginBottom:24 }}>
        <div style={{ padding:"18px 24px 14px", borderBottom:`1px solid ${T.slate[100]}`, display:"flex", alignItems:"center", gap:10 }}>
          <Ic n="trophy" s={18} c={T.amber[500]}/>
          <h3 style={{ fontSize:16, fontWeight:800, color:T.slate[800] }}>Ranking da Equipe</h3>
        </div>
        {ranking.length === 0 && (
          <div style={{ padding:40 }}>
            <Empty icon="users" title="Nenhum subordinado" sub="Não há colaboradores atribuídos a você"/>
          </div>
        )}
        <div style={{ padding:"0 8px 8px" }}>
          {ranking.map((u, i) => (
            <div key={u.id}
              onClick={() => setSelected(selected?.id === u.id ? null : u)}
              style={{ padding:"12px 14px", borderRadius:12, margin:"4px 0", background: selected?.id === u.id ? T.indigo[50] : "transparent", border: selected?.id === u.id ? `1px solid ${T.indigo[200]}` : "1px solid transparent", cursor:"pointer", transition:"all 0.15s" }}
            >
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:i<3?16:12, fontWeight:800, color:i===0?T.amber[500]:i===1?T.slate[400]:i===2?"#b45309":T.slate[300], flexShrink:0, width:24, textAlign:"center" }}>
                  {i<3?medals[i]:i+1}
                </span>
                <Avatar user={u} size={36}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, color:T.slate[800], fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{u.name}</div>
                  <div style={{ fontSize:11, color:T.slate[400] }}>{NIVEL_LABEL[u.nivel] || u.cargo}</div>
                </div>
                <ProgressRing value={u.index} size={44} sw={4}/>
              </div>
              <div style={{ display:"flex", gap:14, marginTop:8, paddingLeft:34 }}>
                <span style={{ fontSize:11, fontWeight:700, color:T.emerald[500] }}>✓ {u.realizadas} feitas</span>
                <span style={{ fontSize:11, fontWeight:700, color:T.rose[400] }}>✗ {u.perdidas} perdidas</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detalhe do colaborador selecionado */}
      {selected && (
        <div style={{ background:"#fff", border:`1px solid ${T.indigo[100]}`, borderRadius:18, overflow:"hidden", animation:"fadeIn 0.2s ease both" }}>
          <div style={{ padding:"18px 24px 14px", borderBottom:`1px solid ${T.slate[100]}`, display:"flex", alignItems:"center", gap:12 }}>
            <Avatar user={selected} size={36}/>
            <div>
              <h3 style={{ fontSize:15, fontWeight:800, color:T.slate[800] }}>{selected.name}</h3>
              <p style={{ fontSize:12, color:T.slate[400] }}>Execuções de {monthLabel()}</p>
            </div>
          </div>

          {selectedExecs.length === 0 && (
            <div style={{ padding:32 }}>
              <Empty icon="task" title="Nenhuma execução registrada" sub="Este colaborador ainda não registrou tarefas este mês"/>
            </div>
          )}

          <div style={{ padding:"8px 12px 12px" }}>
            {selectedExecs.map(e => {
              const task = tasks.find(t => t.id === e.taskId);
              const ok   = e.status === "concluida";
              const cc   = task ? CAT_COLORS[task.categoria] : null;
              return (
                <div key={e.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10, border:`1px solid ${ok?T.emerald[100]:T.rose[100]}`, borderLeft:`3px solid ${ok?T.emerald[400]:T.rose[400]}`, marginBottom:8, background:ok?T.emerald[50]+"80":T.rose[50]+"80" }}>
                  <div style={{ width:32, height:32, borderRadius:8, background:ok?T.emerald[50]:T.rose[50], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <Ic n={ok?"check":"x"} s={15} c={ok?T.emerald[500]:T.rose[500]} sw={2.5}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:T.slate[800] }}>{task?.nome || "Tarefa removida"}</div>
                    <div style={{ fontSize:11, color:T.slate[400], marginTop:2, display:"flex", gap:6, flexWrap:"wrap" }}>
                      {cc && <Chip color={cc.text} bg={cc.bg}>{task.categoria}</Chip>}
                      <span>{fmtDate(e.date)} às {fmtTime(e.timestamp)}</span>
                    </div>
                    {e.observacao && <p style={{ fontSize:11, color:T.slate[500], marginTop:4, fontStyle:"italic" }}>"{e.observacao}"</p>}
                  </div>
                  {e.photo && (
                    <button onClick={() => setPhotoModal(e.photo)} style={{ background:T.sky[50], border:`1px solid ${T.sky[200]}`, borderRadius:8, padding:"6px 10px", cursor:"pointer", fontSize:11, color:T.sky[600], fontWeight:700, display:"flex", alignItems:"center", gap:5, fontFamily:"inherit", flexShrink:0 }}>
                      <Ic n="photo" s={12} c={T.sky[500]}/>Foto
                    </button>
                  )}
                  <Chip color={ok?T.emerald[600]:T.rose[600]} bg={ok?T.emerald[50]:T.rose[50]}>{ok?"✓ Concluída":"✗ Não concluída"}</Chip>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <Modal open={!!photoModal} onClose={() => setPhotoModal(null)} title="Evidência Fotográfica">
        {photoModal && <img src={photoModal} alt="Evidência" style={{ width:"100%", borderRadius:12, maxHeight:420, objectFit:"contain" }}/>}
      </Modal>
    </Page>
  );
}
