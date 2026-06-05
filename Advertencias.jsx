import { useState } from "react";
import { T } from "./tokens.js";
import { todayStr, monthLabel } from "./helpers.js";
import { Ic } from "./Icon.jsx";
import { Avatar, Chip, Page, Modal, Field, Btn, Empty } from "./UI.jsx";

const MOTIVOS = [
  "Atraso",
  "Insubordinação",
  "Abandono do posto de trabalho sem autorização",
  "Recusa injustificada em executar atividades compatíveis com a função",
  "Não realizar checklist ou conferências exigidas",
  "Uso indevido do celular durante o expediente",
  "Comportamento inadequado com colegas ou clientes",
  "Descumprimento das normas de higiene e segurança",
  "Ausência sem justificativa",
  "Outro",
];

export function AdvertenciasPage({ user, users, advertencias, addAdvertencia, removeAdvertencia, toast }) {
  const [modal,   setModal]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [form,    setForm]    = useState({ userId:"", nomeManual:"", motivo:"", descricao:"", penalidade:10 });
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const mesAtual  = todayStr().slice(0, 7);
  const colabs    = users.filter(u => u.role === "colaborador" && u.ativo);
  const historico = advertencias
    .filter(a => a.mes === mesAtual)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Contagem por colaborador
  const porColab = colabs.map(u => ({
    ...u,
    total: advertencias.filter(a => a.user_id === u.id && a.mes === mesAtual).length,
    pontosPerdidos: advertencias.filter(a => a.user_id === u.id && a.mes === mesAtual)
      .reduce((s, a) => s + (a.penalidade || 10), 0),
  })).filter(u => u.total > 0).sort((a, b) => b.total - a.total);

  const canDelete = user.role === "admin" || user.nivel === "supervisor";

  const save = async () => {
    if (!form.motivo) { toast("Selecione o motivo", "error"); return; }
    const nomeDisplay = form.userId
      ? users.find(u => u.id === form.userId)?.name || form.nomeManual
      : form.nomeManual;
    if (!nomeDisplay) { toast("Informe o nome do colaborador", "error"); return; }

    setSaving(true);
    try {
      const entry = {
        id:               "adv" + Date.now(),
        user_id:          form.userId || null,
        colaborador_nome: nomeDisplay,
        dado_por_id:      user.id,
        motivo:           form.motivo,
        descricao:        form.descricao || null,
        penalidade:       form.userId ? Number(form.penalidade) : 0,
        mes:              mesAtual,
        created_at:       new Date().toISOString(),
      };
      await addAdvertencia(entry);
      toast("Advertência registrada");
      setForm({ userId:"", nomeManual:"", motivo:"", descricao:"", penalidade:10 });
      setModal(false);
    } catch(e) {
      toast("Erro: " + e.message, "error");
    } finally {
      setSaving(false);
    }
  };

  const getUser = id => users.find(u => u.id === id);

  return (
    <Page
      title="Advertências"
      sub={`Registro disciplinar · ${monthLabel()}`}
      action={<Btn onClick={() => setModal(true)} icon="alert_tri">Registrar Advertência</Btn>}
    >
      {/* Resumo colaboradores com advertências */}
      {porColab.length > 0 && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px,1fr))", gap:12, marginBottom:24 }}>
          {porColab.map(u => (
            <div key={u.id} style={{ background:"#fff", border:`1.5px solid ${T.rose[200]}`, borderRadius:14, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 }}>
              <Avatar user={u} size={38}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:13, color:T.slate[800] }}>{u.name}</div>
                <div style={{ fontSize:11, color:T.slate[400] }}>{u.nivel || u.cargo}</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:16, fontWeight:900, color:T.rose[500] }}>{u.total}x</div>
                <div style={{ fontSize:10, color:T.rose[400], fontWeight:600 }}>-{u.pontosPerdidos} pts</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Histórico */}
      <div style={{ background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px 12px", borderBottom:`1px solid ${T.slate[100]}`, display:"flex", alignItems:"center", gap:8 }}>
          <Ic n="alert_tri" s={16} c={T.rose[500]}/>
          <h3 style={{ fontSize:15, fontWeight:800, color:T.slate[800] }}>Histórico do mês</h3>
        </div>

        {historico.length === 0 && (
          <div style={{ padding:40 }}>
            <Empty icon="check" title="Nenhuma advertência este mês" sub="Registre uma advertência clicando no botão acima"/>
          </div>
        )}

        <div style={{ padding:"8px 12px 12px" }}>
          {historico.map(a => {
            const recipient = a.user_id ? getUser(a.user_id) : null;
            const giver     = getUser(a.dado_por_id);
            return (
              <div key={a.id} style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"14px", borderRadius:12, border:`1px solid ${T.rose[100]}`, background:T.rose[50]+"60", marginBottom:8 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:T.rose[100], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Ic n="alert_tri" s={18} c={T.rose[500]}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:T.slate[800], marginBottom:2 }}>
                    {recipient ? (
                      <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <Avatar user={recipient} size={18}/>
                        {recipient.name}
                      </span>
                    ) : (
                      <span>{a.colaborador_nome}</span>
                    )}
                  </div>
                  <div style={{ fontSize:12, fontWeight:600, color:T.rose[600], marginBottom:4 }}>{a.motivo}</div>
                  {a.descricao && <div style={{ fontSize:11, color:T.slate[500], fontStyle:"italic", marginBottom:4 }}>"{a.descricao}"</div>}
                  <div style={{ fontSize:10, color:T.slate[400] }}>
                    por {giver?.name || "—"} · {new Date(a.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6, flexShrink:0 }}>
                  {a.penalidade > 0 && (
                    <Chip color={T.rose[600]} bg={T.rose[50]}>-{a.penalidade} pts</Chip>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => window.confirm("Remover esta advertência?") && removeAdvertencia(a.id)}
                      style={{ background:T.rose[50], border:`1px solid ${T.rose[200]}`, borderRadius:8, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}
                    >
                      <Ic n="x" s={12} c={T.rose[500]}/>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Registrar Advertência" width={480}>
        <div style={{ background:T.rose[50], border:`1px solid ${T.rose[200]}`, borderRadius:10, padding:"10px 14px", marginBottom:18, display:"flex", gap:8, alignItems:"center" }}>
          <Ic n="alert_tri" s={16} c={T.rose[500]}/>
          <p style={{ fontSize:12, color:T.rose[700], fontWeight:600 }}>
            Advertências para colaboradores cadastrados deduzem pontos do índice mensal.
          </p>
        </div>

        {/* Colaborador cadastrado ou avulso */}
        <Field
          label="Colaborador cadastrado (opcional)"
          value={form.userId}
          onChange={v => { f("userId")(v); if(v) f("nomeManual")(""); }}
          options={[
            { value:"", label:"— Selecionar ou digitar nome abaixo —" },
            ...colabs.map(u => ({ value:u.id, label:`${u.name} (${u.nivel||u.cargo})` }))
          ]}
        />

        {!form.userId && (
          <Field
            label="Nome do colaborador"
            value={form.nomeManual}
            onChange={f("nomeManual")}
            placeholder="Digite o nome caso não esteja cadastrado"
            required
          />
        )}

        <div style={{ marginBottom:16 }}>
          <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.slate[600], marginBottom:8, letterSpacing:0.3 }}>
            MOTIVO <span style={{ color:T.rose[500] }}>*</span>
          </label>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {MOTIVOS.map(m => (
              <button key={m} onClick={() => f("motivo")(m)}
                style={{ padding:"10px 14px", border:`1.5px solid ${form.motivo===m?T.rose[400]:T.slate[200]}`, borderRadius:10, background:form.motivo===m?T.rose[50]:"#fff", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:form.motivo===m?700:400, color:form.motivo===m?T.rose[600]:T.slate[600], textAlign:"left", transition:"all 0.12s" }}>
                {form.motivo===m && <span style={{ marginRight:6 }}>●</span>}{m}
              </button>
            ))}
          </div>
        </div>

        <Field label="Descrição adicional (opcional)" type="textarea" value={form.descricao} onChange={f("descricao")} placeholder="Descreva detalhes do ocorrido..."/>

        {form.userId && (
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.slate[600], marginBottom:8, letterSpacing:0.3 }}>PENALIDADE</label>
            <div style={{ display:"flex", gap:10 }}>
              {[0, 5, 10, 15].map(v => (
                <button key={v} onClick={() => f("penalidade")(v)}
                  style={{ flex:1, padding:"10px 0", border:`2px solid ${form.penalidade===v?T.rose[400]:T.slate[200]}`, borderRadius:10, background:form.penalidade===v?T.rose[50]:"#fff", cursor:"pointer", fontFamily:"inherit", fontSize:13, fontWeight:700, color:form.penalidade===v?T.rose[600]:T.slate[500] }}>
                  {v === 0 ? "Sem penalidade" : `-${v} pts`}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:8, borderTop:`1px solid ${T.slate[100]}` }}>
          <Btn variant="secondary" onClick={() => setModal(false)} disabled={saving}>Cancelar</Btn>
          <Btn onClick={save} loading={saving} icon="alert_tri" variant="danger">Registrar</Btn>
        </div>
      </Modal>
    </Page>
  );
}
