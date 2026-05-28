import { useState, useRef } from "react";
import { T, CAT_COLORS } from "./tokens.js";
import { store, todayStr, fmtDateLong, statusColor, calcPerf, getBonus, getLast7Days, monthLabel } from "./helpers.js";
import { Ic } from "./Icon.jsx";
import { Avatar, Chip, StatusChip, ProgressRing, StatCard, Page, Modal, Field, Btn, Empty } from "./UI.jsx";

// ─── MINHAS TAREFAS ───────────────────────────────────────────────────────────
export function MinhasTarefas({ user, tasks, executions, setExecutions, toast }) {
  const [execModal, setExecModal] = useState(null);
  const [form,  setForm]  = useState({ status:"concluida", observacao:"", photo:null });
  const [preview, setPreview] = useState(null);
  const [saving, setSaving]   = useState(false);
  const fileRef = useRef();

  const myTasks   = tasks.filter(t => t.responsavelId === user.id && t.ativo);
  const todayExecs = executions.filter(e => e.userId === user.id && e.date === todayStr());
  const getExec   = id => todayExecs.find(e => e.taskId === id);

  const done    = todayExecs.filter(e => e.status === "concluida").length;
  const pct     = myTasks.length > 0 ? Math.round((done / myTasks.length) * 100) : 0;
  const pending = myTasks.filter(t => !getExec(t.id)).length;

  const openExec = task => {
    if (getExec(task.id)) return;
    setExecModal(task);
    setForm({ status:"concluida", observacao:"", photo:null });
    setPreview(null);
  };

  const handlePhoto = e => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { setForm(p => ({...p, photo:ev.target.result})); setPreview(ev.target.result); };
    reader.readAsDataURL(file);
  };

  const submit = () => {
    if (execModal?.fotoObrigatoria && !form.photo) { toast("Esta tarefa exige uma foto de evidência", "error"); return; }
    setSaving(true);
    setTimeout(() => {
      const exec = { id:"e"+Date.now(), taskId:execModal.id, userId:user.id, date:todayStr(), timestamp:new Date().toISOString(), status:form.status, observacao:form.observacao, photo:form.photo };
      const upd  = [...executions, exec];
      store.set("go_execs", upd);
      setExecutions(upd);
      setExecModal(null);
      setSaving(false);
      toast(form.status === "concluida" ? "Tarefa concluída com sucesso! 🎉" : "Tarefa registrada como não concluída");
    }, 400);
  };

  const motivational = pct >= 90 ? "🏆 Desempenho excelente!" : pct >= 70 ? "⚡ Continue assim!" : pct > 0 ? "💪 Você está indo bem!" : "👋 Comece suas tarefas!";

  return (
    <Page title="Minhas Tarefas" sub={fmtDateLong()}>
      {/* Progress header */}
      <div style={{ background:"linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius:20, padding:"24px 28px", marginBottom:24, display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
        <ProgressRing value={pct} size={80} sw={7} />
        <div style={{ flex:1 }}>
          <p style={{ fontSize:16, fontWeight:800, color:"#fff", marginBottom:6 }}>{motivational}</p>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)" }}>{done} de {myTasks.length} tarefas · {pending} pendentes hoje</p>
          <div style={{ marginTop:10, height:6, background:"rgba(255,255,255,0.15)", borderRadius:3, overflow:"hidden", maxWidth:320 }}>
            <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#818cf8,#a78bfa)", borderRadius:3, transition:"width 0.8s ease" }}/>
          </div>
        </div>
        {pending === 0 && myTasks.length > 0 && (
          <div style={{ background:"rgba(16,185,129,0.2)", border:"1px solid rgba(16,185,129,0.4)", borderRadius:14, padding:"12px 20px", textAlign:"center" }}>
            <div style={{ fontSize:24 }}>🎉</div>
            <div style={{ fontSize:12, fontWeight:700, color:"#6ee7b7", marginTop:4 }}>Todas concluídas!</div>
          </div>
        )}
      </div>

      {myTasks.length === 0 && <Empty icon="task" title="Nenhuma tarefa atribuída" sub="Aguarde o gestor atribuir tarefas para você" />}

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {myTasks.map(t => {
          const exec = getExec(t.id);
          const ok   = exec?.status === "concluida";
          const nok  = exec?.status === "nao_concluida";
          const cc   = CAT_COLORS[t.categoria] || { text:T.slate[600], bg:T.slate[100], dot:T.slate[400] };
          return (
            <div key={t.id} onClick={() => openExec(t)} className={exec ? "" : "card-hover"} style={{ background:"#fff", border:`1.5px solid ${ok?T.emerald[200]:nok?T.rose[200]:T.slate[100]}`, borderRadius:16, padding:"18px 20px", cursor:exec?"default":"pointer", position:"relative", overflow:"hidden", transition:"all 0.15s" }}>
              {ok  && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${T.emerald[400]},${T.emerald[300]})` }}/>}
              {nok && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${T.rose[400]},${T.rose[300]})` }}/>}
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:ok?T.emerald[50]:nok?T.rose[50]:cc.bg, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {ok  ? <Ic n="check" s={22} c={T.emerald[500]} sw={2.5}/> : nok ? <Ic n="x" s={22} c={T.rose[500]} sw={2.5}/> : <Ic n="clock" s={22} c={cc.text}/>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:800, fontSize:15, color:T.slate[800], marginBottom:6 }}>{t.nome}</div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                    <Chip color={cc.text} bg={cc.bg} dot>{t.categoria}</Chip>
                    <Chip color={T.slate[500]} bg={T.slate[50]}><Ic n="clock" s={10} c={T.slate[400]}/>&nbsp;{t.horario}</Chip>
                    <Chip color={T.indigo[600]} bg={T.indigo[50]}>{t.peso} pts</Chip>
                    {t.fotoObrigatoria && <Chip color={T.amber[600]} bg={T.amber[50]}><Ic n="camera" s={10} c={T.amber[500]}/>&nbsp;Foto</Chip>}
                  </div>
                  {exec?.observacao && <p style={{ fontSize:12, color:T.slate[500], marginTop:6, fontStyle:"italic" }}>{exec.observacao}</p>}
                </div>
                <div style={{ flexShrink:0 }}>
                  {!exec && (
                    <div style={{ background:T.indigo[500], color:"#fff", borderRadius:10, padding:"8px 16px", fontSize:13, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}>
                      <Ic n="chevron_right" s={14} c="#fff"/>Registrar
                    </div>
                  )}
                  {ok  && <Chip color={T.emerald[600]} bg={T.emerald[50]}><Ic n="check" s={12} c={T.emerald[500]}/>&nbsp;Concluída</Chip>}
                  {nok && <Chip color={T.rose[600]}   bg={T.rose[50]}><Ic n="x" s={12} c={T.rose[500]}/>&nbsp;Não concluída</Chip>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Exec modal */}
      <Modal open={!!execModal} onClose={() => setExecModal(null)} title="Registrar Execução">
        {execModal && (
          <>
            <div style={{ background:T.slate[50], borderRadius:12, padding:"12px 16px", marginBottom:20, display:"flex", gap:10, alignItems:"center" }}>
              <Ic n="task" s={16} c={T.indigo[500]}/>
              <div>
                <div style={{ fontWeight:700, fontSize:14, color:T.slate[800] }}>{execModal.nome}</div>
                <div style={{ fontSize:12, color:T.slate[400], marginTop:2 }}>{execModal.descricao}</div>
              </div>
            </div>

            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.slate[600], marginBottom:10, letterSpacing:0.3 }}>STATUS <span style={{ color:T.rose[500] }}>*</span></label>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                {[
                  { v:"concluida",     label:"Concluída",      icon:"check", col:T.emerald[500], bg:T.emerald[50], border:T.emerald[300] },
                  { v:"nao_concluida", label:"Não concluída",  icon:"x",     col:T.rose[500],    bg:T.rose[50],    border:T.rose[300] },
                ].map(opt => {
                  const sel = form.status === opt.v;
                  return (
                    <button key={opt.v} onClick={() => setForm(p => ({...p, status:opt.v}))} style={{ padding:"14px 10px", border:`2px solid ${sel?opt.border:T.slate[200]}`, borderRadius:12, background:sel?opt.bg:"#fff", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:8, transition:"all 0.15s", fontFamily:"inherit" }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:sel?opt.col+"20":T.slate[100], display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Ic n={opt.icon} s={18} c={sel?opt.col:T.slate[400]} sw={2.5}/>
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, color:sel?opt.col:T.slate[500] }}>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Field label="Observação (opcional)" type="textarea" value={form.observacao} onChange={v => setForm(p => ({...p, observacao:v}))} placeholder="Descreva como foi a execução, problemas encontrados..." />

            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.slate[600], marginBottom:8, letterSpacing:0.3 }}>
                FOTO DE EVIDÊNCIA{execModal.fotoObrigatoria && <span style={{ color:T.rose[500] }}>  *</span>}
                {!execModal.fotoObrigatoria && <span style={{ fontWeight:400, color:T.slate[400] }}>  (opcional)</span>}
              </label>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} style={{ display:"none" }}/>
              {preview ? (
                <div style={{ position:"relative", borderRadius:12, overflow:"hidden" }}>
                  <img src={preview} alt="" style={{ width:"100%", maxHeight:220, objectFit:"cover", display:"block" }}/>
                  <button onClick={() => { setPreview(null); setForm(p => ({...p, photo:null})); }} style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.6)", border:"none", borderRadius:"50%", width:30, height:30, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Ic n="x" s={14} c="#fff"/>
                  </button>
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, background:"linear-gradient(transparent,rgba(0,0,0,0.5))", padding:"8px 12px" }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.8)", fontWeight:600 }}>Foto capturada ✓</span>
                  </div>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()} style={{ width:"100%", padding:"32px 20px", border:`2px dashed ${T.slate[200]}`, borderRadius:12, background:T.slate[50], cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:10, fontFamily:"inherit" }} onMouseOver={e=>{e.currentTarget.style.borderColor=T.indigo[300];e.currentTarget.style.background=T.indigo[50]}} onMouseOut={e=>{e.currentTarget.style.borderColor=T.slate[200];e.currentTarget.style.background=T.slate[50]}}>
                  <div style={{ width:48, height:48, borderRadius:14, background:T.slate[100], display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Ic n="camera" s={22} c={T.slate[400]}/>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontSize:14, fontWeight:700, color:T.slate[600], margin:0 }}>Tirar foto</p>
                    <p style={{ fontSize:12, color:T.slate[400], margin:"4px 0 0" }}>Clique para abrir a câmera</p>
                  </div>
                </button>
              )}
            </div>

            <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:12, borderTop:`1px solid ${T.slate[100]}` }}>
              <Btn variant="secondary" onClick={() => setExecModal(null)}>Cancelar</Btn>
              <Btn onClick={submit} loading={saving}>Confirmar Registro</Btn>
            </div>
          </>
        )}
      </Modal>
    </Page>
  );
}

// ─── MEU DESEMPENHO ───────────────────────────────────────────────────────────
export function MeuDesempenho({ user, tasks, executions, bonusRules }) {
  const p      = calcPerf(user.id, executions, tasks);
  const bonus  = getBonus(p.index, bonusRules);
  const sColor = statusColor(p.index);

  const allUsers = store.get("go_users", []).filter(u => u.role === "colaborador" && u.ativo);
  const allTasks = store.get("go_tasks", []);
  const ranking  = allUsers.map(u => {
    const up = calcPerf(u.id, executions, allTasks);
    return { id:u.id, name:u.name, avatar:u.avatar, index:up.index };
  }).sort((a, b) => b.index - a.index);
  const myRank = ranking.findIndex(u => u.id === user.id) + 1;

  const days7    = getLast7Days();
  const chartData = days7.map(d => ({ d, v: executions.filter(e => e.userId === user.id && e.date === d && e.status === "concluida").length }));
  const maxDay   = Math.max(...chartData.map(d => d.v), 1);

  const nextBonus = bonusRules.find(r => r.valor > bonus && r.min > p.index);

  return (
    <Page title="Meu Desempenho" sub={`${monthLabel()} · ${user.name}`}>
      {/* Hero card */}
      <div style={{ background:`linear-gradient(135deg,${sColor}18,${sColor}08)`, border:`1.5px solid ${sColor}25`, borderRadius:20, padding:"28px 32px", marginBottom:24, display:"flex", alignItems:"center", gap:28, flexWrap:"wrap" }}>
        <ProgressRing value={p.index} size={96} sw={9}/>
        <div style={{ flex:1, minWidth:180 }}>
          <StatusChip index={p.index}/>
          <div style={{ fontSize:36, fontWeight:900, color:sColor, letterSpacing:-1.5, marginTop:8, lineHeight:1 }}>{p.index}%</div>
          <div style={{ fontSize:14, color:T.slate[500], marginTop:6 }}>{p.obtidos} de {p.possiveis} pontos · #{myRank} no ranking</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ background:"#fff", borderRadius:14, padding:"16px 22px", textAlign:"center", border:`1px solid ${T.slate[100]}` }}>
            <div style={{ fontSize:11, color:T.slate[400], fontWeight:700, letterSpacing:0.5, textTransform:"uppercase" }}>Bônus Estimado</div>
            <div style={{ fontSize:28, fontWeight:900, color:bonus>0?T.emerald[500]:T.slate[300], letterSpacing:-0.5, marginTop:4 }}>R$ {bonus}</div>
          </div>
          {nextBonus && (
            <div style={{ background:T.amber[50], border:`1px solid ${T.amber[200]}`, borderRadius:12, padding:"10px 16px", textAlign:"center" }}>
              <div style={{ fontSize:11, color:T.amber[600], fontWeight:700 }}>Próxima faixa em {nextBonus.min - p.index}%</div>
              <div style={{ fontSize:14, fontWeight:800, color:T.amber[500] }}>R$ {nextBonus.valor}</div>
            </div>
          )}
        </div>
      </div>

      {/* Stat grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:24 }}>
        <StatCard label="Realizadas"    value={p.realizadas} icon="check" color={T.emerald[500]}/>
        <StatCard label="Perdidas"      value={p.perdidas}   icon="x"     color={T.rose[500]}/>
        <StatCard label="Pts obtidos"   value={p.obtidos}    icon="star"  color={T.amber[500]}/>
        <StatCard label="Pts possíveis" value={p.possiveis}  icon="task"  color={T.indigo[500]}/>
      </div>

      {/* Weekly chart */}
      <div style={{ background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:16, padding:24, marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
          <h3 style={{ fontSize:15, fontWeight:800, color:T.slate[800] }}>Evolução dos últimos 7 dias</h3>
          <Chip color={T.indigo[600]} bg={T.indigo[50]}>Tarefas concluídas/dia</Chip>
        </div>
        <div style={{ display:"flex", alignItems:"flex-end", gap:8, height:100 }}>
          {chartData.map((d, i) => {
            const dayNames = ["D","S","T","Q","Q","S","S"];
            const dt       = new Date(d.d + "T12:00:00");
            const isToday  = d.d === todayStr();
            const h        = d.v > 0 ? Math.round((d.v / maxDay) * 80) + 8 : 4;
            return (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:6 }}>
                {d.v > 0 && <span style={{ fontSize:11, fontWeight:700, color:T.indigo[500] }}>{d.v}</span>}
                <div style={{ width:"100%", height:h, background:isToday?T.indigo[500]:d.v>0?T.indigo[200]:T.slate[100], borderRadius:"4px 4px 2px 2px", transition:"height 0.6s ease", minHeight:4 }}/>
                <span style={{ fontSize:10, fontWeight:isToday?800:500, color:isToday?T.indigo[500]:T.slate[400] }}>
                  {dayNames[dt.getDay()]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ranking */}
      <div style={{ background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ padding:"18px 20px 14px", borderBottom:`1px solid ${T.slate[100]}`, display:"flex", alignItems:"center", gap:8 }}>
          <Ic n="trophy" s={16} c={T.amber[500]}/>
          <h3 style={{ fontSize:15, fontWeight:800, color:T.slate[800] }}>Ranking da equipe</h3>
        </div>
        <div style={{ padding:"8px 12px 12px" }}>
          {ranking.map((u, i) => {
            const isMe = u.id === user.id;
            return (
              <div key={u.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:10, background:isMe?T.indigo[50]:"transparent", border:isMe?`1px solid ${T.indigo[100]}`:"1px solid transparent", marginBottom:4 }}>
                <span style={{ width:22, textAlign:"center", fontSize:i<3?16:13, fontWeight:800, color:i===0?T.amber[500]:i===1?T.slate[400]:i===2?"#b45309":T.slate[300] }}>
                  {i===0?"🥇":i===1?"🥈":i===2?"🥉":i+1}
                </span>
                <Avatar user={u} size={34}/>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:14, fontWeight:isMe?800:600, color:isMe?T.indigo[700]:T.slate[700] }}>
                    {u.name}{isMe && " (você)"}
                  </span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:60, height:4, background:T.slate[100], borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${u.index}%`, background:statusColor(u.index), borderRadius:2 }}/>
                  </div>
                  <span style={{ fontSize:13, fontWeight:800, color:statusColor(u.index), minWidth:36, textAlign:"right" }}>{u.index}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Page>
  );
}
