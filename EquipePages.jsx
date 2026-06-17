import { useState } from "react";
import { T, CAT_COLORS } from "./tokens.js";
import { calcPerf, getBonus, statusColor, fmtDate, fmtTime, getMonthRange, monthLabel } from "./helpers.js";
import { Ic } from "./Icon.jsx";
import { Avatar, Chip, ProgressRing, StatCard, Page, Modal, Empty } from "./UI.jsx";
import { fetchExecucaoPhoto } from "./dataService.js";

const NIVEL_LABEL = { operador:"Operador", atendente:"Atendente", lider:"Líder", supervisor:"Supervisor", admin:"Admin" };

function getSubordinados(user, users) {
  const nivel = user.nivel || "operador";
  if (nivel === "admin" || nivel === "supervisor")
    return users.filter(u => u.id !== user.id && u.role !== "admin");
  if (nivel === "lider")
    return users.filter(u => (u.nivel === "operador" || u.nivel === "atendente") && u.ativo);
  return [];
}

// ─── DETALHE DO COLABORADOR ───────────────────────────────────────────────────
function ColabDetail({ colab, tasks, executions, onClose, bonusRules, pontosExtras }) {
  const [tab, setTab]             = useState("tarefas"); // tarefas | execucoes | desempenho
  const [photoModal, setPhotoModal] = useState(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const { first, last } = getMonthRange(0);
  const myTasks = tasks.filter(t => t.responsavelId === colab.id && t.ativo);
  const myExecs = executions
    .filter(e => e.userId === colab.id && e.date >= first && e.date <= last)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const p     = calcPerf(colab.id, executions, tasks, pontosExtras);
  const bonus = getBonus(p.index, bonusRules);

  const openPhoto = async (exec) => {
    setLoadingPhoto(true);
    setPhotoModal("loading");
    const photo = exec.photo || await fetchExecucaoPhoto(exec.id);
    setPhotoModal(photo || "sem-foto");
    setLoadingPhoto(false);
  };

  const TAB_BTN = ({ id, label }) => (
    <button onClick={() => setTab(id)} style={{
      flex:1, padding:"8px 4px", border:"none", borderBottom:`2px solid ${tab===id?T.indigo[500]:"transparent"}`,
      background:"transparent", fontFamily:"inherit", fontSize:13, fontWeight:tab===id?700:500,
      color:tab===id?T.indigo[600]:T.slate[400], cursor:"pointer", transition:"all 0.15s"
    }}>{label}</button>
  );

  return (
    <Modal open={true} onClose={onClose} title={colab.name} width={580}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:20, padding:"14px 16px", background:T.slate[50], borderRadius:12 }}>
        <Avatar user={colab} size={48}/>
        <div style={{ flex:1 }}>
          <div style={{ fontWeight:700, fontSize:15, color:T.slate[800] }}>{colab.name}</div>
          <div style={{ fontSize:12, color:T.slate[400] }}>{NIVEL_LABEL[colab.nivel] || colab.cargo} · {colab.setor}</div>
        </div>
        <ProgressRing value={p.index} size={52} sw={5}/>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", borderBottom:`1px solid ${T.slate[100]}`, marginBottom:16 }}>
        <TAB_BTN id="tarefas"   label={`Tarefas (${myTasks.length})`}/>
        <TAB_BTN id="execucoes" label={`Execuções (${myExecs.length})`}/>
        <TAB_BTN id="desempenho" label="Desempenho"/>
      </div>

      {/* ── TAB TAREFAS ── */}
      {tab === "tarefas" && (
        <div>
          {myTasks.length === 0 && <Empty icon="task" title="Nenhuma tarefa atribuída" sub=""/>}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {myTasks.map(t => {
              const cc = CAT_COLORS[t.categoria] || CAT_COLORS["Outro"];
              return (
                <div key={t.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10, border:`1px solid ${T.slate[100]}`, background:"#fff" }}>
                  <div style={{ width:4, height:40, borderRadius:2, background:cc.dot, flexShrink:0 }}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:T.slate[800] }}>{t.nome}</div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:4 }}>
                      <Chip color={cc.text} bg={cc.bg} dot>{t.categoria}</Chip>
                      <Chip color={T.slate[500]} bg={T.slate[50]}>{t.horario}</Chip>
                      <Chip color={T.indigo[600]} bg={T.indigo[50]}>{t.peso} pts</Chip>
                      <Chip color={T.slate[400]} bg={T.slate[50]}>{t.frequencia}</Chip>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB EXECUÇÕES ── */}
      {tab === "execucoes" && (
        <div>
          {myExecs.length === 0 && <Empty icon="task" title="Nenhuma execução este mês" sub=""/>}
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {myExecs.map(e => {
              const task = tasks.find(t => t.id === e.taskId);
              const ok   = e.status === "concluida";
              const cc   = task ? CAT_COLORS[task.categoria] : null;
              return (
                <div key={e.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10, border:`1px solid ${ok?T.emerald[100]:T.rose[100]}`, borderLeft:`3px solid ${ok?T.emerald[400]:T.rose[400]}`, background:ok?T.emerald[50]+"60":T.rose[50]+"60" }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:13, color:T.slate[800] }}>{task?.nome || "Tarefa removida"}</div>
                    <div style={{ fontSize:11, color:T.slate[400], marginTop:2 }}>
                      {fmtDate(e.date)} às {fmtTime(e.timestamp)}
                    </div>
                    {e.observacao && <p style={{ fontSize:11, color:T.slate[500], marginTop:3, fontStyle:"italic" }}>"{e.observacao}"</p>}
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
                    <Chip color={ok?T.emerald[600]:T.rose[600]} bg={ok?T.emerald[50]:T.rose[50]}>
                      {ok?"✓ Concluída":"✗ Não concluída"}
                    </Chip>
                    <button onClick={() => openPhoto(e)}
                      style={{ background:T.sky[50], border:`1px solid ${T.sky[200]}`, borderRadius:8, padding:"5px 10px", cursor:"pointer", fontSize:11, color:T.sky[600], fontWeight:700, display:"flex", alignItems:"center", gap:4, fontFamily:"inherit" }}>
                      <Ic n="photo" s={12} c={T.sky[500]}/>Foto
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB DESEMPENHO ── */}
      {tab === "desempenho" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:12 }}>
            <div style={{ background:T.slate[50], borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
              <div style={{ fontSize:10, color:T.slate[400], fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Índice</div>
              <div style={{ fontSize:28, fontWeight:900, color:statusColor(p.index) }}>{p.index}%</div>
            </div>
            <div style={{ background:T.slate[50], borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
              <div style={{ fontSize:10, color:T.slate[400], fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Bônus est.</div>
              <div style={{ fontSize:28, fontWeight:900, color:bonus>0?T.emerald[500]:T.slate[300] }}>R$ {bonus}</div>
            </div>
            <div style={{ background:T.emerald[50], borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
              <div style={{ fontSize:10, color:T.emerald[600], fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Realizadas</div>
              <div style={{ fontSize:28, fontWeight:900, color:T.emerald[500] }}>{p.realizadas}</div>
            </div>
            <div style={{ background:T.rose[50], borderRadius:12, padding:"14px 16px", textAlign:"center" }}>
              <div style={{ fontSize:10, color:T.rose[600], fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Perdidas</div>
              <div style={{ fontSize:28, fontWeight:900, color:T.rose[500] }}>{p.perdidas}</div>
            </div>
          </div>
          <div style={{ background:T.slate[50], borderRadius:12, padding:"14px 16px" }}>
            <div style={{ fontSize:12, color:T.slate[500], marginBottom:6 }}>Pontos: <b>{p.obtidos}</b> obtidos de <b>{p.possiveis}</b> possíveis no mês</div>
            <div style={{ height:8, background:T.slate[200], borderRadius:4, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${p.index}%`, background:statusColor(p.index), borderRadius:4, transition:"width 0.6s ease" }}/>
            </div>
          </div>
        </div>
      )}

      {/* Photo modal */}
      <Modal open={!!photoModal} onClose={() => setPhotoModal(null)} title="Evidência Fotográfica">
        {photoModal === "loading" && <div style={{ textAlign:"center", padding:40, color:T.slate[400] }}>Carregando foto...</div>}
        {photoModal === "sem-foto" && <div style={{ textAlign:"center", padding:40, color:T.slate[400] }}>Sem foto de evidência</div>}
        {photoModal && photoModal !== "loading" && photoModal !== "sem-foto" && (
          <img src={photoModal} alt="Evidência" style={{ width:"100%", borderRadius:12, maxHeight:420, objectFit:"contain" }}/>
        )}
      </Modal>
    </Modal>
  );
}

// ─── PAINEL DA EQUIPE ─────────────────────────────────────────────────────────
export function PainelEquipe({ user, users, tasks, executions, bonusRules, pontosExtras }) {
  const [selected, setSelected]   = useState(null);
  const subordinados               = getSubordinados(user, users);
  const { first, last }            = getMonthRange(0);

  const ranking = subordinados.map(u => {
    const p = calcPerf(u.id, executions, tasks, pontosExtras);
    return { ...u, ...p, bonus: getBonus(p.index, bonusRules) };
  }).sort((a, b) => b.index - a.index);

  const totalConcl = ranking.reduce((s, u) => s + u.realizadas, 0);
  const totalPerd  = ranking.reduce((s, u) => s + u.perdidas, 0);
  const taxaGeral  = ranking.length > 0
    ? Math.round(ranking.reduce((s, u) => s + u.index, 0) / ranking.length)
    : 0;

  const medals = ["🥇","🥈","🥉"];

  return (
    <Page title="Painel da Equipe" sub={`${subordinados.length} colaboradores · ${monthLabel()}`}>

      <div className="stat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginBottom:24 }}>
        <StatCard label="Desempenho médio" value={`${taxaGeral}%`} icon="chart"  color={T.indigo[500]} sub="Mês atual"/>
        <StatCard label="Tarefas Concluídas" value={totalConcl}    icon="check"  color={T.emerald[500]} sub="Este mês"/>
        <StatCard label="Não Concluídas"     value={totalPerd}     icon="slash"  color={T.rose[500]}   sub="Este mês"/>
        <StatCard label="Colaboradores"      value={subordinados.length} icon="users" color={T.sky[500]}/>
      </div>

      <div style={{ background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:18, overflow:"hidden" }}>
        <div style={{ padding:"18px 24px 14px", borderBottom:`1px solid ${T.slate[100]}`, display:"flex", alignItems:"center", gap:10 }}>
          <Ic n="trophy" s={18} c={T.amber[500]}/>
          <h3 style={{ fontSize:16, fontWeight:800, color:T.slate[800] }}>Ranking da Equipe</h3>
          <span style={{ fontSize:12, color:T.slate[400], marginLeft:4 }}>Clique para ver detalhes</span>
        </div>

        {ranking.length === 0 && (
          <div style={{ padding:40 }}><Empty icon="users" title="Nenhum subordinado" sub=""/></div>
        )}

        <div style={{ padding:"0 8px 8px" }}>
          {ranking.map((u, i) => (
            <div key={u.id}
              onClick={() => setSelected(u)}
              style={{ padding:"12px 14px", borderRadius:12, margin:"4px 0", background:"transparent", border:"1px solid transparent", cursor:"pointer", transition:"all 0.15s" }}
              onMouseOver={e => e.currentTarget.style.background = T.slate[50]}
              onMouseOut={e  => e.currentTarget.style.background = "transparent"}
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
                <Ic n="chevron_right" s={14} c={T.slate[300]}/>
              </div>
              <div style={{ display:"flex", gap:14, marginTop:6, paddingLeft:34 }}>
                <span style={{ fontSize:11, fontWeight:700, color:T.emerald[500] }}>✓ {u.realizadas} feitas</span>
                <span style={{ fontSize:11, fontWeight:700, color:T.rose[400] }}>✗ {u.perdidas} perdidas</span>
                <span style={{ fontSize:11, fontWeight:600, color:T.slate[400] }}>{u.index}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <ColabDetail
          colab={selected}
          tasks={tasks}
          executions={executions}
          bonusRules={bonusRules}
          pontosExtras={pontosExtras}
          onClose={() => setSelected(null)}
        />
      )}
    </Page>
  );
}
