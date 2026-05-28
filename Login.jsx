import { useState } from "react";
import { T } from "../utils/tokens.js";
import { store } from "../utils/helpers.js";
import { Ic } from "../components/Icon.jsx";
import { Field, Btn } from "../components/UI.jsx";

export function Login({ onLogin }) {
  const [email,   setEmail]   = useState("");
  const [pw,      setPw]      = useState("");
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const handle = e => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    setTimeout(() => {
      const users = store.get("go_users", []);
      const u = users.find(u => u.email === email && u.password === pw && u.ativo);
      if (u) onLogin(u);
      else { setErr("E-mail ou senha incorretos."); setLoading(false); }
    }, 500);
  };

  const demos = [
    { label:"Admin",   email:"admin@empresa.com",   pw:"admin123" },
    { label:"Carlos",  email:"carlos@empresa.com",  pw:"123456" },
    { label:"Ana",     email:"ana@empresa.com",      pw:"123456" },
    { label:"Roberto", email:"roberto@empresa.com",  pw:"123456" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(145deg,#0f172a 0%,#1e1b4b 50%,#1a0533 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative", overflow:"hidden" }}>
      {/* Background orbs */}
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.15),transparent 70%)", top:-100, right:-100, pointerEvents:"none" }} />
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.12),transparent 70%)", bottom:-100, left:-100, pointerEvents:"none" }} />

      <div style={{ display:"flex", flexDirection:"column", gap:24, width:"100%", maxWidth:420, animation:"fadeIn 0.4s ease both" }}>
        {/* Card */}
        <div style={{ background:"rgba(255,255,255,0.97)", borderRadius:24, padding:"40px 36px 32px", boxShadow:"0 40px 100px rgba(0,0,0,0.4)" }}>
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ width:64, height:64, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", boxShadow:"0 8px 24px rgba(99,102,241,0.4)" }}>
              <Ic n="task" s={28} c="#fff" />
            </div>
            <h1 style={{ fontSize:24, fontWeight:900, color:T.slate[800], letterSpacing:-0.5, marginBottom:6 }}>Gestão Operacional</h1>
            <p style={{ fontSize:14, color:T.slate[400] }}>Acesse com suas credenciais</p>
          </div>

          <form onSubmit={handle}>
            <Field label="E-mail" type="email" value={email} onChange={setEmail} required placeholder="seu@email.com" />
            <div style={{ position:"relative" }}>
              <Field label="Senha" type={showPw ? "text" : "password"} value={pw} onChange={setPw} required placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw(p => !p)} style={{ position:"absolute", right:12, top:34, background:"none", border:"none", cursor:"pointer", padding:2 }}>
                <Ic n="eye" s={16} c={T.slate[400]} />
              </button>
            </div>
            {err && (
              <div style={{ display:"flex", alignItems:"center", gap:8, background:T.rose[50], border:`1px solid ${T.rose[200]}`, color:T.rose[600], padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16 }}>
                <Ic n="alert_tri" s={15} c={T.rose[500]} />{err}
              </div>
            )}
            <Btn type="submit" loading={loading} full size="lg">Entrar</Btn>
          </form>
        </div>

        {/* Quick access demo */}
        <div style={{ background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:16, padding:"18px 20px", backdropFilter:"blur(10px)" }}>
          <p style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>
            Acesso rápido — demonstração
          </p>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {demos.map(d => (
              <button
                key={d.label}
                onClick={() => { setEmail(d.email); setPw(d.pw); }}
                style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:8, padding:"6px 14px", fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.8)", cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit" }}
                onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
                onMouseOut={e  => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
