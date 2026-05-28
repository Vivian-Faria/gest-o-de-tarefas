import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";
import { T } from "./tokens.js";
import { Ic } from "./Icon.jsx";
import { Field, Btn } from "./UI.jsx";

export function ResetPassword({ onDone }) {
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);
  const [showPw,    setShowPw]    = useState(false);
  const [ready,     setReady]     = useState(false);

  // Supabase envia o token na hash da URL: #access_token=...&type=recovery
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes("type=recovery") || hash.includes("access_token")) {
      // Deixa o supabase processar a sessão a partir da URL
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setReady(true);
        else {
          // Tenta trocar o token da hash por sessão
          supabase.auth.exchangeCodeForSession(window.location.href).catch(() => {});
          setReady(true);
        }
      });
    } else {
      setReady(true);
    }
  }, []);

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("A senha deve ter pelo menos 6 caracteres."); return; }
    if (password !== confirm) { setError("As senhas não coincidem."); return; }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) { setError(err.message); setLoading(false); return; }
    setSuccess(true);
    setTimeout(() => onDone(), 2500);
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(145deg,#0f172a 0%,#1e1b4b 50%,#1a0533 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"rgba(255,255,255,0.97)", borderRadius:24, padding:"40px 36px 32px", width:"100%", maxWidth:420, boxShadow:"0 40px 100px rgba(0,0,0,0.4)", animation:"fadeIn 0.4s ease both" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:64, height:64, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", boxShadow:"0 8px 24px rgba(99,102,241,0.4)" }}>
            <Ic n="settings" s={28} c="#fff" />
          </div>
          <h1 style={{ fontSize:22, fontWeight:900, color:T.slate[800], letterSpacing:-0.5, marginBottom:6 }}>Redefinir senha</h1>
          <p style={{ fontSize:14, color:T.slate[400] }}>Digite sua nova senha abaixo</p>
        </div>

        {success ? (
          <div style={{ textAlign:"center", padding:"20px 0" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>✅</div>
            <p style={{ fontSize:16, fontWeight:700, color:T.emerald[600] }}>Senha redefinida com sucesso!</p>
            <p style={{ fontSize:13, color:T.slate[400], marginTop:8 }}>Redirecionando para o login…</p>
          </div>
        ) : (
          <form onSubmit={handle}>
            <div style={{ position:"relative" }}>
              <Field
                label="Nova senha"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={setPassword}
                required
                placeholder="Mínimo 6 caracteres"
              />
              <button type="button" onClick={() => setShowPw(p => !p)} style={{ position:"absolute", right:12, top:34, background:"none", border:"none", cursor:"pointer", padding:2 }}>
                <Ic n="eye" s={16} c={T.slate[400]} />
              </button>
            </div>
            <Field
              label="Confirmar nova senha"
              type="password"
              value={confirm}
              onChange={setConfirm}
              required
              placeholder="Repita a senha"
            />
            {error && (
              <div style={{ display:"flex", alignItems:"center", gap:8, background:T.rose[50], border:`1px solid ${T.rose[200]}`, color:T.rose[600], padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16 }}>
                <Ic n="alert_tri" s={15} c={T.rose[500]} />{error}
              </div>
            )}
            <Btn type="submit" loading={loading} full size="lg">Salvar nova senha</Btn>
          </form>
        )}
      </div>
    </div>
  );
}
