import { useState } from "react";
import { T } from "./tokens.js";
import { todayStr, monthLabel, getMonthRange } from "./helpers.js";
import { Ic } from "./Icon.jsx";
import { Avatar, Chip, Page, Modal, Field, Btn, Empty } from "./UI.jsx";

const PONTOS_OPTS = [
  { value: 5,  label: "⭐ 5 pontos"  },
  { value: 10, label: "⭐⭐ 10 pontos" },
  { value: 15, label: "⭐⭐⭐ 15 pontos" },
];

export function PontosExtrasPage({ user, users, pontosExtras, addPontosExtras, toast }) {
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState({ userId:"", pontos:5, justificativa:"" });
  const [saving, setSaving] = useState(false);
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const { first, last } = getMonthRange(0);
  const mesAtual = todayStr().slice(0, 7); // YYYY-MM

  // Filtra colaboradores que podem receber pontos
  const colabs = users.filter(u =>
    u.role === "colaborador" && u.ativo &&
    (user.role === "admin" || user.nivel === "supervisor")
  );

  // Histórico do mês atual
  const historico = pontosExtras
    .filter(p => p.mes === mesAtual)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Total por colaborador no mês
  const totaisMes = colabs.map(u => ({
    ...u,
    totalExtra: pontosExtras
      .filter(p => p.user_id === u.id && p.mes === mesAtual)
      .reduce((s, p) => s + p.pontos, 0),
  })).sort((a, b) => b.totalExtra - a.totalExtra);

  const save = async () => {
    if (!form.userId)         { toast("Selecione o colaborador", "error"); return; }
    if (!form.justificativa)  { toast("Informe a justificativa", "error"); return; }
    setSaving(true);
    try {
      const entry = {
        id:            "pe" + Date.now(),
        user_id:       form.userId,
        given_by_id:   user.id,
        pontos:        Number(form.pontos),
        justificativa: form.justificativa,
        mes:           mesAtual,
        created_at:    new Date().toISOString(),
      };
      await addPontosExtras(entry);
      toast(`+${form.pontos} pontos atribuídos! ⭐`);
      setForm({ userId:"", pontos:5, justificativa:"" });
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
      title="Pontos Extras"
      sub={`Reconhecimento da equipe · ${monthLabel()}`}
      action={<Btn onClick={() => setModal(true)} icon="star">Atribuir Pontos</Btn>}
    >
      {/* Resumo do mês */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px,1fr))", gap:14, marginBottom:24 }}>
        {totaisMes.map(u => (
          <div key={u.id} style={{ background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:14, padding:"16px 18px", display:"flex", alignItems:"center", gap:12 }}>
            <Avatar user={u} size={40}/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:700, fontSize:13, color:T.slate[800], whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{u.name}</div>
              <div style={{ fontSize:11, color:T.slate[400] }}>{u.nivel || u.cargo}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:20, fontWeight:900, color: u.totalExtra > 0 ? T.amber[500] : T.slate[300] }}>
                +{u.totalExtra}
              </div>
              <div style={{ fontSize:10, color:T.slate[400] }}>pts extras</div>
            </div>
          </div>
        ))}
      </div>

      {/* Histórico */}
      <div style={{ background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px 12px", borderBottom:`1px solid ${T.slate[100]}`, display:"flex", alignItems:"center", gap:8 }}>
          <Ic n="star" s={16} c={T.amber[500]}/>
          <h3 style={{ fontSize:15, fontWeight:800, color:T.slate[800] }}>Histórico do mês</h3>
        </div>

        {historico.length === 0 && (
          <div style={{ padding:40 }}>
            <Empty icon="star" title="Nenhum ponto extra atribuído" sub="Clique em 'Atribuir Pontos' para reconhecer um colaborador"/>
          </div>
        )}

        <div style={{ padding:"8px 12px 12px" }}>
          {historico.map(p => {
            const recipient = getUser(p.user_id);
            const giver     = getUser(p.given_by_id);
            return (
              <div key={p.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10, border:`1px solid ${T.amber[100]}`, background:T.amber[50]+"60", marginBottom:8 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:T.amber[100], display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:18 }}>⭐</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:700, fontSize:13, color:T.slate[800] }}>
                    {recipient?.name || "—"}
                    <span style={{ fontWeight:400, color:T.slate[500] }}> recebeu </span>
                    <span style={{ color:T.amber[600], fontWeight:900 }}>+{p.pontos} pontos</span>
                  </div>
                  <div style={{ fontSize:11, color:T.slate[500], marginTop:2, fontStyle:"italic" }}>"{p.justificativa}"</div>
                  <div style={{ fontSize:10, color:T.slate[400], marginTop:3 }}>
                    por {giver?.name || "—"} · {new Date(p.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </div>
                <Chip color={T.amber[600]} bg={T.amber[50]}>+{p.pontos} pts</Chip>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal atribuir */}
      <Modal open={modal} onClose={() => setModal(false)} title="Atribuir Pontos Extras" width={440}>
        <div style={{ background:T.amber[50], border:`1px solid ${T.amber[200]}`, borderRadius:10, padding:"10px 14px", marginBottom:18, display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontSize:20 }}>⭐</span>
          <p style={{ fontSize:12, color:T.amber[700], fontWeight:600 }}>
            Pontos extras somam ao índice mensal do colaborador. Use para reconhecer desempenho acima do esperado.
          </p>
        </div>
        <Field
          label="Colaborador"
          value={form.userId}
          onChange={f("userId")}
          required
          options={[
            { value:"", label:"— Selecionar —" },
            ...colabs.map(u => ({ value:u.id, label:`${u.name} (${u.nivel||u.cargo})` }))
          ]}
        />
        <div style={{ marginBottom:16 }}>
          <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.slate[600], marginBottom:8, letterSpacing:0.3 }}>
            PONTUAÇÃO <span style={{ color:T.rose[500] }}>*</span>
          </label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {PONTOS_OPTS.map(opt => {
              const sel = Number(form.pontos) === opt.value;
              return (
                <button key={opt.value} onClick={() => f("pontos")(opt.value)}
                  style={{ padding:"12px 8px", border:`2px solid ${sel?T.amber[400]:T.slate[200]}`, borderRadius:10, background:sel?T.amber[50]:"#fff", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:13, color:sel?T.amber[600]:T.slate[500], transition:"all 0.15s", textAlign:"center" }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
        <Field
          label="Justificativa"
          type="textarea"
          value={form.justificativa}
          onChange={f("justificativa")}
          required
          placeholder="Ex: Desempenho excepcional durante o evento de quinta-feira..."
        />
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", paddingTop:8, borderTop:`1px solid ${T.slate[100]}` }}>
          <Btn variant="secondary" onClick={() => setModal(false)} disabled={saving}>Cancelar</Btn>
          <Btn onClick={save} loading={saving} icon="star">Atribuir Pontos</Btn>
        </div>
      </Modal>
    </Page>
  );
}
