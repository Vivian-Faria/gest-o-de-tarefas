import { useState, useEffect, useCallback } from "react";
import { GlobalStyles }    from "./GlobalStyles.jsx";
import { Sidebar }         from "./Sidebar.jsx";
import { ToastContainer }  from "./UI.jsx";
import { useToast }        from "./useToast.js";
import { BONUS_RULES }     from "./tokens.js";
import { initStorage }     from "./helpers.js";
import {
  loginUser, logoutUser,
  fetchUsers, fetchTasks, fetchExecucoes, fetchBonusRules,
  upsertUser, upsertTask, insertExecucao, saveBonusRules,
  USE_SUPABASE,
} from "./dataService.js";

import { Login }           from "./Login.jsx";
import { AdminDashboard }  from "./AdminDashboard.jsx";
import { Colaboradores, Tarefas, Execucoes, Relatorios, Config } from "./AdminPages.jsx";
import { MinhasTarefas, MeuDesempenho } from "./ColaboradorPages.jsx";
import { ResetPassword } from "./ResetPassword.jsx";

// ─── LOADING SCREEN ───────────────────────────────────────────
function Loading() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#0f172a", gap:16 }}>
      <div style={{ width:48, height:48, border:"3px solid rgba(99,102,241,0.3)", borderTopColor:"#6366f1", borderRadius:"50%", animation:"spin 0.7s linear infinite" }}/>
      <p style={{ color:"#94a3b8", fontSize:14, fontWeight:600 }}>Carregando dados…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function App() {
  const [user,       setUser]       = useState(null);
  const [active,     setActive]     = useState(null);
  const [users,      setUsers]      = useState([]);
  const [tasks,      setTasks]      = useState([]);
  const [executions, setExecutions] = useState([]);
  const [bonusRules, setBonusRules] = useState([]);
  const [loading,    setLoading]    = useState(true);
  // Captura o modo reset ANTES do Supabase limpar o hash
  const [isReset,    setIsReset]    = useState(() => {
    const h = typeof window !== "undefined" ? window.location.hash : "";
    return h.includes("type=recovery") || (h.includes("access_token") && h.includes("refresh_token"));
  });
  const { toasts, toast, remove }   = useToast();

  // ─── LOAD DATA ──────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    if (!USE_SUPABASE) initStorage();
    const [u, t, e, b] = await Promise.all([
      fetchUsers(),
      fetchTasks(),
      fetchExecucoes(),
      fetchBonusRules(),
    ]);
    setUsers(u);
    setTasks(t);
    setExecutions(e);
    setBonusRules(b.length ? b : BONUS_RULES);
  }, []);

  useEffect(() => {
    loadAll().finally(() => setLoading(false));
  }, [loadAll]);

  // ─── AUTH ───────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const u = await loginUser(email, password);
    setUser(u);
    setActive(u.role === "admin" ? "dashboard" : "minhas-tarefas");
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setActive(null);
  }, []);

  // ─── PERSISTÊNCIA: wrappers que atualizam estado + DB ────────
  const handleSetUsers = useCallback(async (updated, userToSave) => {
    setUsers(updated);
    if (userToSave) await upsertUser(userToSave).catch(console.error);
  }, []);

  const handleSetTasks = useCallback(async (updated, taskToSave) => {
    setTasks(updated);
    if (taskToSave) await upsertTask(taskToSave).catch(console.error);
  }, []);

  const handleSetExecutions = useCallback(async (updated, execToSave) => {
    setExecutions(updated);
    if (execToSave) await insertExecucao(execToSave).catch(console.error);
  }, []);

  const handleSetBonusRules = useCallback(async (rules) => {
    setBonusRules(rules);
    await saveBonusRules(rules).catch(console.error);
  }, []);

  if (isReset) return <><GlobalStyles /><ResetPassword onDone={() => { setIsReset(false); window.location.hash = ""; }} /></>;
  if (loading) return <><GlobalStyles /><Loading /></>;
  if (!user)   return <><GlobalStyles /><Login onLogin={login} /></>;

  const shared = {
    users,
    tasks,
    executions,
    bonusRules,
    user,
    toast,
    setUsers:      (upd, toSave) => handleSetUsers(upd, toSave),
    setTasks:      (upd, toSave) => handleSetTasks(upd, toSave),
    setExecutions: (upd, toSave) => handleSetExecutions(upd, toSave),
    setBonusRules: handleSetBonusRules,
  };

  const pages = {
    "dashboard":       <AdminDashboard {...shared} />,
    "colaboradores":   <Colaboradores  {...shared} />,
    "tarefas":         <Tarefas        {...shared} />,
    "execucoes":       <Execucoes      {...shared} />,
    "relatorios":      <Relatorios     {...shared} />,
    "config":          <Config         {...shared} />,
    "minhas-tarefas":  <MinhasTarefas  {...shared} />,
    "meu-desempenho":  <MeuDesempenho  {...shared} />,
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ display:"flex", minHeight:"100vh", background:"#f1f5f9" }}>
        <Sidebar user={user} active={active} setActive={setActive} onLogout={logout} />
        <main className="main-content" style={{ flex:1, padding:"32px 36px", overflowY:"auto", minHeight:"100vh", maxHeight:"100vh" }}>
          {/* Banner de aviso sem banco — visível especialmente no mobile */}
          {!USE_SUPABASE && (
            <div style={{ display:"flex", alignItems:"center", gap:10, background:"#fffbeb", border:"1px solid #fde68a", borderRadius:12, padding:"10px 14px", marginBottom:20, fontSize:12 }}>
              <span style={{ fontSize:16 }}>⚠️</span>
              <div>
                <strong style={{ color:"#92400e" }}>Dados locais — sem sincronização</strong>
                <span style={{ color:"#b45309", marginLeft:6 }}>Mobile e desktop têm bases separadas até o Supabase ser configurado.</span>
              </div>
            </div>
          )}
          {pages[active] || <div style={{ color:"#94a3b8", padding:40 }}>Selecione uma opção no menu</div>}
        </main>
      </div>
      <ToastContainer toasts={toasts} remove={remove} />
    </>
  );
}
