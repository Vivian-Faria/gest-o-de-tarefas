import { useState } from "react";
import { T } from "./tokens.js";
import { Ic } from "./Icon.jsx";
import { Field, Btn } from "./UI.jsx";

export function Login({ onLogin }) {
  const [email,   setEmail]   = useState("");
  const [pw,      setPw]      = useState("");
  const [err,     setErr]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  const handle = async e => {
    e.preventDefault();
    setLoading(true);
    setErr("");
    try {
      await onLogin(email, pw);
    } catch (ex) {
      setErr(ex.message || "E-mail ou senha incorretos.");
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(145deg,#0f172a 0%,#1e1b4b 50%,#1a0533 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,0.15),transparent 70%)", top:-100, right:-100, pointerEvents:"none" }} />
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle,rgba(139,92,246,0.12),transparent 70%)", bottom:-100, left:-100, pointerEvents:"none" }} />

      <div style={{ display:"flex", flexDirection:"column", gap:24, width:"100%", maxWidth:420, animation:"fadeIn 0.4s ease both" }}>
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


      </div>
    </div>
  );
}
