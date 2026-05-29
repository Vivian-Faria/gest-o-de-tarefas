import { useState } from "react";
import { T, CAT_COLORS } from "./tokens.js";
import { store, initials, fmtDate, fmtTime, calcPerf, getBonus, statusColor, getMonthRange, monthLabel, todayStr } from "./helpers.js";
import { Ic } from "./Icon.jsx";
import { Avatar, Chip, ProgressRing, Page, Modal, Field, Btn, Empty } from "./UI.jsx";

// ─── COLABORADORES ────────────────────────────────────────────────────────────
export function Colaboradores({ users, setUsers, toast }) {
  const blank = { name:"", email:"", password:"", cargo:"", setor:"", nivel:"operador", role:"colaborador", ativo:true };
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState(blank);
  const f = k => v => setForm(p => ({ ...p, [k]:v }));
  const colabs = users.filter(u => u.role === "colaborador");

  const openNew  = () => { setEditing(null); setForm(blank); setModal(true); };
  const openEdit = u  => { setEditing(u);    setForm({...u}); setModal(true); };

  const save = () => {
    if (!form.name || !form.email) { toast("Preencha nome e e-mail", "error"); return; }
    let upd;
    if (editing) {
      upd = users.map(u => u.id === editing.id ? { ...form, id:editing.id, avatar:initials(form.name) } : u);
      toast("Colaborador atualizado");
    } else {
      if (users.find(u => u.email === form.email)) { toast("E-mail já cadastrado", "error"); return; }
      upd = [...users, { ...form, id:"u"+Date.now(), avatar:initials(form.name) }];
      toast("Colaborador cadastrado");
    }
    const userToSave = editing ? { ...form, id:editing.id, avatar:initials(form.name) } : upd[upd.length-1];
    setUsers(upd, userToSave); setModal(false);
  };

  const toggle = id => {
    const upd = users.map(u => u.id === id ? { ...u, ativo:!u.ativo } : u);
    const changed = upd.find(u => u.id === id);
    setUsers(upd, changed);
    const u = upd.find(u => u.id === id);
    toast(`${u.name} ${u.ativo ? "ativado" : "desativado"}`);
  };

  return (
    <Page title="Colaboradores" sub={`${colabs.length} cadastrados`} action={<Btn onClick={openNew} icon="plus">Novo Colaborador</Btn>}>
      {colabs.length === 0 && <Empty icon="users" title="Nenhum colaborador" sub="Clique em 'Novo Colaborador' para começar" />}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:16 }}>
        {colabs.map(u => (
          <div key={u.id} className="card-enter" style={{ background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:16, padding:22, opacity:u.ativo?1:0.6, transition:"opacity 0.3s" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:16 }}>
              <Avatar user={u} size={48} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:800, color:T.slate[800], fontSize:15, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{u.name}</div>
                <div style={{ fontSize:12, color:T.slate[400], marginTop:2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{u.email}</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
              <Chip color={T.indigo[600]}  bg={T.indigo[50]}>{u.cargo}</Chip>
              <Chip color={T.emerald[600]} bg={T.emerald[50]}>{u.setor}</Chip>
              <Chip color={u.ativo?T.emerald[600]:T.rose[500]} bg={u.ativo?T.emerald[50]:T.rose[50]}>{u.ativo?"Ativo":"Inativo"}</Chip>
            </div>
            <div style={{ display:"flex", gap:8, borderTop:`1px solid ${T.slate[100]}`, paddingTop:14 }}>
              <Btn size="sm" variant="secondary" onClick={() => openEdit(u)} icon="edit">Editar</Btn>
              <Btn size="sm" variant={u.ativo?"danger":"success"} onClick={() => toggle(u.id)}>{u.ativo?"Desativar":"Ativar"}</Btn>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? "Editar Colaborador" : "Novo Colaborador"}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:"0 16px" }}>
          <div style={{ gridColumn:"1/-1" }}><Field label="Nome completo" value={form.name} onChange={f("name")} required /></div>
          <div style={{ gridColumn:"1/-1" }}><Field label="E-mail" type="email" value={form.email} onChange={f("email")} required /></div>
          {!editing && <div style={{ gridColumn:"1/-1" }}><Field label="Senha" type="password" value={form.password} onChange={f("password")} required /></div>}
          <Field label="Cargo" value={form.cargo} onChange={f("cargo")} placeholder="Ex: Operador" />
          <Field label="Setor" value={form.setor} onChange={f("setor")} placeholder="Ex: Produção" />
          <Field label="Nível hierárquico" value={form.nivel || "operador"} onChange={f("nivel")}
            options={[
              { value:"operador",   label:"Operador"   },
              { value:"atendente",  label:"Atendente"  },
              { value:"lider",      label:"Líder"      },
              { value:"supervisor", label:"Supervisor" },
            ]} />
          <div style={{ gridColumn:"1/-1" }}>
            <Field label="Perfil de acesso" value={form.role} onChange={f("role")} options={[{ value:"colaborador", label:"Colaborador Operacional" },{ value:"admin", label:"Administrador" }]} />
          </div>
          <div style={{ gridColumn:"1/-1" }}><Field type="checkbox" value={form.ativo} onChange={f("ativo")} placeholder="Usuário ativo no sistema" /></div>
        </div>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:8, borderTop:`1px solid ${T.slate[100]}` }}>
          <Btn variant="secondary" onClick={() => setModal(false)}>Cancelar</Btn>
          <Btn onClick={save}>{editing ? "Salvar Alterações" : "Cadastrar"}</Btn>
        </div>
      </Modal>
    </Page>
  );
}

// ─── TAREFAS ──────────────────────────────────────────────────────────────────
const CAT_OPTS  = ["Limpeza","Inspeção","Controle","Manutenção","Relatório","Outro"].map(c => ({ value:c, label:c }));
const FREQ_OPTS = [{ value:"diaria", label:"Diária" },{ value:"semanal", label:"Semanal" },{ value:"mensal", label:"Mensal" },{ value:"personalizada", label:"Personalizada" }];
const FREQ_LABEL = { diaria:"Diária", semanal:"Semanal", mensal:"Mensal", personalizada:"Personalizada" };

export function Tarefas({ tasks, setTasks, users, toast }) {
  const blank = { nome:"", descricao:"", categoria:"Limpeza", horario:"08:00", frequencia:"diaria", tempoEstimado:15, peso:5, fotoObrigatoria:true, responsavelId:"", ativo:true };
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]       = useState(blank);
  const [filterCat, setFilterCat] = useState("");
  const f = k => v => setForm(p => ({ ...p, [k]:v }));
  const colabs = users.filter(u => u.role === "colaborador" && u.ativo);
  const filtered = tasks.filter(t => !filterCat || t.categoria === filterCat);

  const openNew  = () => { setEditing(null); setForm(blank); setModal(true); };
  const openEdit = t  => { setEditing(t); setForm({...t}); setModal(true); };

  const save = () => {
    if (!form.nome) { toast("Informe o nome da tarefa", "error"); return; }
    let upd;
    if (editing) {
      upd = tasks.map(t => t.id === editing.id ? { ...form, id:editing.id } : t);
      toast("Tarefa atualizada");
    } else {
      upd = [...tasks, { ...form, id:"t"+Date.now() }];
      toast("Tarefa criada");
    }
    const taskToSave = editing ? { ...form, id:editing.id } : upd[upd.length-1];
    setTasks(upd, taskToSave); setModal(false);
  };

  const toggle = id => {
    const upd = tasks.map(t => t.id === id ? { ...t, ativo:!t.ativo } : t);
    const changed = upd.find(t => t.id === id);
    setTasks(upd, changed);
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita.")) return;
    const upd = tasks.filter(t => t.id !== id);
    setTasks(upd);
    if (typeof window !== "undefined" && import.meta.env.VITE_SUPABASE_URL) {
      const { supabase } = await import("./supabase.js");
      await supabase.from("tarefas").delete().eq("id", id);
    }
    toast("Tarefa excluída");
  };

  return (
    <Page title="Tarefas Operacionais" sub={`${tasks.filter(t=>t.ativo).length} ativas`} action={<Btn onClick={openNew} icon="plus">Nova Tarefa</Btn>}>
      {/* Category filters */}
      <div style={{ background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:14, padding:"14px 18px", marginBottom:20, display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
        <Ic n="filter" s={15} c={T.slate[400]} />
        <span style={{ fontSize:12, fontWeight:700, color:T.slate[500] }}>Filtrar:</span>
        {Object.keys(CAT_COLORS).map(c => {
          const cc = CAT_COLORS[c];
          const active = filterCat === c;
          return (
            <button key={c} onClick={() => setFilterCat(p => p === c ? "" : c)} style={{ padding:"5px 14px", borderRadius:20, border:`1.5px solid ${active?cc.text:T.slate[200]}`, background:active?cc.bg:"transparent", color:active?cc.text:T.slate[500], fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
              {c}
            </button>
          );
        })}
        {filterCat && <button onClick={() => setFilterCat("")} style={{ padding:"5px 12px", borderRadius:20, border:"none", background:T.rose[50], color:T.rose[500], fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:5 }}><Ic n="x" s={12} c={T.rose[500]}/>Limpar</button>}
      </div>

      {filtered.length === 0 && <Empty icon="task" title="Nenhuma tarefa" sub="Clique em 'Nova Tarefa' para começar" />}

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(t => {
          const cc   = CAT_COLORS[t.categoria] || { text:T.slate[600], bg:T.slate[100], dot:T.slate[400] };
          const resp = users.find(u => u.id === t.responsavelId);
          return (
            <div key={t.id} className="task-row" style={{ background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:14, padding:"16px 20px", display:"flex", alignItems:"center", gap:16, opacity:t.ativo?1:0.5 }}>
              <div style={{ width:4, height:48, borderRadius:2, background:cc.dot, flexShrink:0 }} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, color:T.slate[800], fontSize:15, marginBottom:6, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{t.nome}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <Chip color={cc.text} bg={cc.bg} dot>{t.categoria}</Chip>
                  <Chip color={T.slate[600]} bg={T.slate[100]}>{FREQ_LABEL[t.frequencia]}</Chip>
                  <Chip color={T.indigo[600]} bg={T.indigo[50]}>{t.peso} pts</Chip>
                  <Chip color={T.slate[500]} bg={T.slate[50]}><Ic n="clock" s={10} c={T.slate[400]}/>&nbsp;{t.horario}</Chip>
                  {t.fotoObrigatoria && <Chip color={T.amber[600]} bg={T.amber[50]}><Ic n="camera" s={10} c={T.amber[500]}/>&nbsp;Foto</Chip>}
                </div>
              </div>
              {resp && (
                <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                  <Avatar user={resp} size={30} />
                  <div style={{ display:"flex", flexDirection:"column" }}>
                    <span style={{ fontSize:12, fontWeight:600, color:T.slate[700] }}>{resp.name.split(" ")[0]}</span>
                    <span style={{ fontSize:11, color:T.slate[400] }}>{resp.setor}</span>
                  </div>
                </div>
              )}
              <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                <Btn size="sm" variant="secondary" onClick={() => openEdit(t)} icon="edit">Editar</Btn>
                <Btn size="sm" variant={t.ativo?"danger":"success"} onClick={() => toggle(t.id)}>{t.ativo?"Pausar":"Ativar"}</Btn>
                <Btn size="sm" variant="danger" onClick={() => deleteTask(t.id)} icon="x">Excluir</Btn>
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing?"Editar Tarefa":"Nova Tarefa"} width={540}>
        <Field label="Nome da tarefa" value={form.nome} onChange={f("nome")} required />
        <Field label="Descrição" type="textarea" value={form.descricao} onChange={f("descricao")} placeholder="Descreva o procedimento..." />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:"0 16px" }}>
          <Field label="Categoria"            value={form.categoria}     onChange={f("categoria")}      options={CAT_OPTS} />
          <Field label="Horário sugerido"     type="time"                value={form.horario}           onChange={f("horario")} />
          <Field label="Frequência"           value={form.frequencia}    onChange={f("frequencia")}     options={FREQ_OPTS} />
          <Field label="Tempo estimado (min)" type="number"              value={form.tempoEstimado}     onChange={v => f("tempoEstimado")(Number(v))} />
          <Field label="Peso / Pontuação"     type="number"              value={form.peso}              onChange={v => f("peso")(Number(v))} hint="Valor em pontos"/>
          <Field label="Responsável"          value={form.responsavelId} onChange={f("responsavelId")}
            options={[{ value:"", label:"— Selecionar —" }, ...colabs.map(u => ({ value:u.id, label:`${u.name} (${u.nivel||u.cargo})` }))]} />
        </div>
        <Field type="checkbox" value={form.fotoObrigatoria} onChange={f("fotoObrigatoria")} placeholder="Foto obrigatória como evidência de execução" />
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:8, borderTop:`1px solid ${T.slate[100]}` }}>
          <Btn variant="secondary" onClick={() => setModal(false)}>Cancelar</Btn>
          <Btn onClick={save}>{editing?"Salvar Alterações":"Criar Tarefa"}</Btn>
        </div>
      </Modal>
    </Page>
  );
}

// ─── EXECUÇÕES ────────────────────────────────────────────────────────────────
export function Execucoes({ executions, tasks, users }) {
  const [filter, setFilter] = useState({ user:"", date:todayStr(), status:"" });
  const [photoModal, setPhotoModal] = useState(null);
  const colabs = users.filter(u => u.role === "colaborador");

  const filtered = executions.filter(e => {
    if (filter.user   && e.userId !== filter.user)   return false;
    if (filter.date   && e.date   !== filter.date)   return false;
    if (filter.status && e.status !== filter.status) return false;
    return true;
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const concl = filtered.filter(e => e.status === "concluida").length;
  const nao   = filtered.filter(e => e.status === "nao_concluida").length;

  return (
    <Page title="Registro de Execuções" sub={`${filtered.length} registros`}>
      {filtered.length > 0 && (
        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          <Chip color={T.emerald[600]} bg={T.emerald[50]}><Ic n="check" s={12} c={T.emerald[500]}/>&nbsp;{concl} concluídas</Chip>
          <Chip color={T.rose[600]}   bg={T.rose[50]}><Ic n="x" s={12} c={T.rose[500]}/>&nbsp;{nao} não concluídas</Chip>
          {filtered.length > 0 && <Chip color={T.sky[600]} bg={T.sky[50]}>{Math.round((concl/filtered.length)*100)}% taxa</Chip>}
        </div>
      )}

      {/* Filter bar */}
      <div style={{ background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:14, padding:"16px 20px", marginBottom:20, display:"flex", gap:14, flexWrap:"wrap", alignItems:"flex-end" }}>
        {[
          { key:"user",   label:"COLABORADOR", type:"select",  opts:[{value:"",label:"Todos"},...colabs.map(u=>({value:u.id,label:u.name}))] },
          { key:"date",   label:"DATA",        type:"date"  },
          { key:"status", label:"STATUS",      type:"select",  opts:[{value:"",label:"Todos"},{value:"concluida",label:"Concluída"},{value:"nao_concluida",label:"Não concluída"}] },
        ].map(({ key, label, type, opts }) => (
          <div key={key} style={{ flex:"1 1 160px" }}>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.slate[500], marginBottom:6, letterSpacing:0.3 }}>{label}</label>
            {type === "select"
              ? <select value={filter[key]} onChange={e => setFilter(p => ({...p,[key]:e.target.value}))} style={{ width:"100%", padding:"9px 12px", border:`1.5px solid ${T.slate[200]}`, borderRadius:10, fontSize:13, fontFamily:"inherit" }}>
                  {opts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              : <input type="date" value={filter[key]} onChange={e => setFilter(p => ({...p,[key]:e.target.value}))} style={{ width:"100%", padding:"9px 12px", border:`1.5px solid ${T.slate[200]}`, borderRadius:10, fontSize:13, fontFamily:"inherit" }} />
            }
          </div>
        ))}
        <Btn variant="secondary" size="sm" icon="refresh" onClick={() => setFilter({ user:"", date:"", status:"" })}>Limpar</Btn>
      </div>

      {filtered.length === 0 && <Empty icon="filter" title="Nenhuma execução encontrada" sub="Ajuste os filtros ou aguarde registros" />}

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {filtered.map(e => {
          const task = tasks.find(t => t.id === e.taskId);
          const u    = users.find(u => u.id === e.userId);
          const ok   = e.status === "concluida";
          const cc   = task ? CAT_COLORS[task.categoria] : null;
          return (
            <div key={e.id} className="card-enter" style={{ background:"#fff", border:`1px solid ${ok?T.emerald[100]:T.rose[100]}`, borderLeft:`4px solid ${ok?T.emerald[400]:T.rose[400]}`, borderRadius:12, padding:"14px 18px", display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:ok?T.emerald[50]:T.rose[50], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Ic n={ok?"check":"x"} s={16} c={ok?T.emerald[500]:T.rose[500]} sw={2.5} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:14, color:T.slate[800], marginBottom:4 }}>{task?.nome||"Tarefa removida"}</div>
                <div style={{ fontSize:12, color:T.slate[400], display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
                  {u && <span style={{ display:"flex", alignItems:"center", gap:4 }}><Avatar user={u} size={16}/>{u.name}</span>}
                  <span>·</span><span>{fmtDate(e.date)}</span><span>·</span><span>{fmtTime(e.timestamp)}</span>
                  {cc && <Chip color={cc.text} bg={cc.bg}>{task.categoria}</Chip>}
                </div>
                {e.observacao && <div style={{ fontSize:12, color:T.slate[500], marginTop:5, fontStyle:"italic", background:T.slate[50], padding:"4px 10px", borderRadius:6, display:"inline-block" }}>"{e.observacao}"</div>}
              </div>
              {e.photo && (
                <button onClick={() => setPhotoModal(e.photo)} style={{ background:T.sky[50], border:`1px solid ${T.sky[200]}`, borderRadius:8, padding:"7px 13px", cursor:"pointer", fontSize:12, color:T.sky[600], fontWeight:700, display:"flex", alignItems:"center", gap:6, fontFamily:"inherit", flexShrink:0 }}>
                  <Ic n="photo" s={14} c={T.sky[500]}/>Evidência
                </button>
              )}
              <Chip color={ok?T.emerald[600]:T.rose[600]} bg={ok?T.emerald[50]:T.rose[50]}>{ok?"Concluída":"Não concluída"}</Chip>
            </div>
          );
        })}
      </div>

      <Modal open={!!photoModal} onClose={() => setPhotoModal(null)} title="Evidência Fotográfica">
        {photoModal && <img src={photoModal} alt="Evidência" style={{ width:"100%", borderRadius:12, maxHeight:420, objectFit:"contain", background:T.slate[50] }}/>}
      </Modal>
    </Page>
  );
}

// ─── RELATÓRIOS ───────────────────────────────────────────────────────────────
export function Relatorios({ users, tasks, executions, bonusRules }) {
  const colabs = users.filter(u => u.role === "colaborador" && u.ativo);
  const ranking = colabs.map(u => {
    const p = calcPerf(u.id, executions, tasks);
    return { ...u, ...p, bonus:getBonus(p.index, bonusRules) };
  }).sort((a, b) => b.index - a.index);

  const exportCSV = () => {
    const rows = [["Nome","Cargo","Setor","Índice (%)","Realizadas","Perdidas","Pts Obtidos","Pts Possíveis","Bônus (R$)"]];
    ranking.forEach(u => rows.push([u.name, u.cargo, u.setor, u.index, u.realizadas, u.perdidas, u.obtidos, u.possiveis, u.bonus]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const a   = document.createElement("a");
    a.href    = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csv);
    a.download = `relatorio_${todayStr()}.csv`;
    a.click();
  };

  return (
    <Page title="Relatórios" sub={`Mês atual · ${monthLabel()}`} action={<Btn onClick={exportCSV} icon="download">Exportar CSV</Btn>}>
      <div style={{ background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:16, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:T.slate[50] }}>
              {["#","Colaborador","Cargo","Setor","Realizadas","Perdidas","Índice","Bônus"].map(h => (
                <th key={h} style={{ padding:"12px 16px", fontSize:11, fontWeight:700, color:T.slate[500], textAlign:"left", borderBottom:`1px solid ${T.slate[100]}`, letterSpacing:0.5, textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranking.map((u, i) => (
              <tr key={u.id} style={{ borderBottom:`1px solid ${T.slate[50]}` }} onMouseOver={e=>e.currentTarget.style.background=T.slate[50]} onMouseOut={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"14px 16px", fontSize:13, color:T.slate[400], fontWeight:800, textAlign:"center" }}>{i+1}</td>
                <td style={{ padding:"14px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <Avatar user={u} size={34}/>
                    <span style={{ fontSize:14, fontWeight:700, color:T.slate[800] }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding:"14px 16px", fontSize:13, color:T.slate[600] }}>{u.cargo}</td>
                <td style={{ padding:"14px 16px", fontSize:13, color:T.slate[600] }}>{u.setor}</td>
                <td style={{ padding:"14px 16px", fontSize:14, fontWeight:800, color:T.emerald[500] }}>{u.realizadas}</td>
                <td style={{ padding:"14px 16px", fontSize:14, fontWeight:800, color:T.rose[400] }}>{u.perdidas}</td>
                <td style={{ padding:"14px 16px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ flex:1, height:6, background:T.slate[100], borderRadius:3, overflow:"hidden", minWidth:60 }}>
                      <div style={{ height:"100%", width:`${u.index}%`, background:statusColor(u.index), borderRadius:3, transition:"width 0.8s ease" }}/>
                    </div>
                    <span style={{ fontSize:13, fontWeight:800, color:statusColor(u.index), minWidth:38 }}>{u.index}%</span>
                  </div>
                </td>
                <td style={{ padding:"14px 16px" }}>
                  <span style={{ fontSize:15, fontWeight:900, color:u.bonus>0?T.emerald[500]:T.slate[300] }}>R$ {u.bonus}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bonus legend */}
      <div style={{ marginTop:24, background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:16, padding:22 }}>
        <h3 style={{ fontSize:14, fontWeight:800, color:T.slate[700], marginBottom:16 }}>Tabela de Bonificação</h3>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {bonusRules.filter(r => r.valor > 0).map((r, i) => (
            <div key={i} style={{ background:T.slate[50], border:`1px solid ${T.slate[200]}`, borderRadius:12, padding:"12px 18px", textAlign:"center" }}>
              <div style={{ fontSize:12, color:T.slate[500], fontWeight:600, marginBottom:4 }}>{r.min}% – {r.max}%</div>
              <div style={{ fontSize:20, fontWeight:900, color:T.emerald[500] }}>R$ {r.valor}</div>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}

// ─── CONFIGURAÇÕES ────────────────────────────────────────────────────────────
export function Config({ bonusRules, setBonusRules, toast }) {
  const [rules, setRules] = useState([...bonusRules]);
  const upd = (i, k, v) => setRules(r => r.map((x, idx) => idx === i ? { ...x, [k]:Number(v) } : x));
  const save = () => { store.set("go_bonus", rules); setBonusRules(rules); toast("Configurações salvas"); };

  return (
    <Page title="Configurações" sub="Regras de bonificação e parâmetros do sistema">
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(360px,1fr))", gap:20 }}>
        {/* Bonus rules */}
        <div style={{ background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:16, padding:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:T.emerald[50], display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ic n="star" s={16} c={T.emerald[500]}/>
            </div>
            <div>
              <h3 style={{ fontSize:15, fontWeight:800, color:T.slate[800] }}>Faixas de Bônus</h3>
              <p style={{ fontSize:12, color:T.slate[400] }}>Configure os valores por faixa de desempenho</p>
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:20 }}>
            {rules.map((r, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 16px", background:T.slate[50], borderRadius:10, border:`1px solid ${T.slate[100]}` }}>
                <div style={{ width:24, height:24, borderRadius:6, background:r.valor>0?T.emerald[50]:T.rose[50], display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <span style={{ fontSize:11, fontWeight:800, color:r.valor>0?T.emerald[500]:T.rose[400] }}>{i+1}</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6, flex:1, flexWrap:"wrap" }}>
                  <input type="number" value={r.min} onChange={e=>upd(i,"min",e.target.value)} style={{ width:58, padding:"5px 8px", border:`1.5px solid ${T.slate[200]}`, borderRadius:8, fontSize:13, fontFamily:"inherit", textAlign:"center" }}/>
                  <span style={{ fontSize:12, color:T.slate[400], fontWeight:600 }}>% a</span>
                  <input type="number" value={r.max} onChange={e=>upd(i,"max",e.target.value)} style={{ width:58, padding:"5px 8px", border:`1.5px solid ${T.slate[200]}`, borderRadius:8, fontSize:13, fontFamily:"inherit", textAlign:"center" }}/>
                  <span style={{ fontSize:12, color:T.slate[400], fontWeight:600 }}>% → R$</span>
                  <input type="number" value={r.valor} onChange={e=>upd(i,"valor",e.target.value)} style={{ width:72, padding:"5px 8px", border:`1.5px solid ${T.slate[200]}`, borderRadius:8, fontSize:13, fontFamily:"inherit", textAlign:"center", fontWeight:700, color:r.valor>0?T.emerald[600]:T.slate[400] }}/>
                </div>
              </div>
            ))}
          </div>
          <Btn onClick={save} full icon="check">Salvar Configurações</Btn>
        </div>

        {/* Status legend */}
        <div style={{ background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:16, padding:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:T.indigo[50], display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Ic n="info" s={16} c={T.indigo[500]}/>
            </div>
            <div>
              <h3 style={{ fontSize:15, fontWeight:800, color:T.slate[800] }}>Legenda de Desempenho</h3>
              <p style={{ fontSize:12, color:T.slate[400] }}>Indicadores visuais por faixa</p>
            </div>
          </div>
          {[{ v:95, l:"Meta atingida", range:"90% a 100%" },{ v:80, l:"Atenção necessária", range:"70% a 89%" },{ v:60, l:"Abaixo da meta", range:"Abaixo de 70%" }].map((item, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:i<2?`1px solid ${T.slate[100]}`:"none" }}>
              <div style={{ width:40, height:40, borderRadius:"50%", background:statusColor(item.v)+"18", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <div style={{ width:12, height:12, borderRadius:"50%", background:statusColor(item.v) }}/>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:700, color:T.slate[700] }}>{item.l}</div>
                <div style={{ fontSize:12, color:T.slate[400] }}>{item.range}</div>
              </div>
              <span style={{ fontSize:20, fontWeight:900, color:statusColor(item.v) }}>{item.v}%</span>
            </div>
          ))}
        </div>
      </div>
    </Page>
  );
}
