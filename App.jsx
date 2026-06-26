import { useState, useEffect, useCallback } from "react";
import { GlobalStyles }    from "./GlobalStyles.jsx";
import { Sidebar }         from "./Sidebar.jsx";
import { BottomNav }      from "./BottomNav.jsx";
import { ToastContainer }  from "./UI.jsx";
import { useToast }        from "./useToast.js";
import { BONUS_RULES }     from "./tokens.js";
import { initStorage, store as localStore } from "./helpers.js";
const store_logout = () => localStore.set("go_session", null);
import {
  loginUser, logoutUser, getSession,
  fetchUsers, fetchTasks, deleteUser,, fetchExecucoes, fetchBonusRules,
  upsertUser, upsertTask, insertExecucao, saveBonusRules,
  fetchPontosExtras, insertPontosExtras, deletePontosExtras,
  fetchExtraRules, saveExtraRules, DEFAULT_EXTRA_RULES,
  fetchAdvertencias, insertAdvertencia, deleteAdvertencia,
  USE_SUPABASE,
} from "./dataService.js";
import { supabase } from "./supabase.js";

import { Login }           from "./Login.jsx";
import { AdminDashboard }  from "./AdminDashboard.jsx";
import { Colaboradores, Tarefas, Execucoes, Relatorios, Config } from "./AdminPages.jsx";
import { MinhasTarefas, MeuDesempenho } from "./ColaboradorPages.jsx";
import { PainelEquipe }    from "./EquipePages.jsx";
import { PontosExtrasPage }  from "./PontosExtras.jsx";
import { AdvertenciasPage }   from "./Advertencias.jsx";
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
  const [pontosExtras, setPontosExtras] = useState([]);
  const [extraRules,   setExtraRules]   = useState([]);
  const [advertencias, setAdvertencias] = useState([]);
  const [loading,    setLoading]    = useState(true);
  // Captura o modo reset ANTES do Supabase limpar o hash
  const [isReset,    setIsReset]    = useState(() => {
    const h = typeof window !== "undefined" ? window.location.hash : "";
    return h.includes("type=recovery") || (h.includes("access_token") && h.includes("refresh_token"));
  });
  const { toasts, toast, remove }   = useToast();

  // ─── LOAD DATA ──────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    if (!USE_SUPABASE) { initStorage(); return; }
    // Usa allSettled para que uma falha isolada não zerasse todos os dados
    const [ru, rt, re, rb, rpe, rer, radv] = await Promise.allSettled([
      fetchUsers(),
      fetchTasks(),
      fetchExecucoes(),
      fetchBonusRules(),
      fetchPontosExtras(),
      fetchExtraRules(),
      fetchAdvertencias(),
    ]);

    if (ru.status  === "fulfilled" && ru.value?.length)   setUsers(ru.value);
    if (rt.status  === "fulfilled")                       setTasks(rt.value ?? []);
    if (re.status  === "fulfilled")                       setExecutions(re.value ?? []);
    if (rb.status  === "fulfilled" && rb.value?.length)   setBonusRules(rb.value);
    else                                                  setBonusRules(BONUS_RULES);
    if (rpe.status === "fulfilled")                       setPontosExtras(rpe.value ?? []);
    if (rer.status === "fulfilled" && rer.value?.length)  setExtraRules(rer.value);
    else                                                  setExtraRules(DEFAULT_EXTRA_RULES);
    if (radv.status === "fulfilled")                      setAdvertencias(radv.value ?? []);

    // Log de erros sem quebrar a aplicação
    [ru,rt,re,rb,rpe,rer,radv].forEach((r,i) => {
      if (r.status === "rejected") console.warn(`[loadAll] fetch ${i} failed:`, r.reason?.message);
    });
  }, []);

  useEffect(() => {
    if (!USE_SUPABASE) {
      initStorage();
      setUsers(localStore.get("go_users", []));
      setTasks(localStore.get("go_tasks", []));
      setExecutions(localStore.get("go_execs", []));
      setBonusRules(localStore.get("go_bonus", BONUS_RULES));
      setLoading(false);
      return;
    }

    // Timeout de segurança — garante que loading nunca trava infinitamente
    const safetyTimer = setTimeout(() => {
      console.warn("[App] loading timeout — forçando setLoading(false)");
      setLoading(false);
    }, 10000);

    const init = async () => {
      try {
        // Verifica sessão local (funciona mesmo sem Supabase Auth)
        const session = await getSession();

        if (session) {
          // Usa perfil salvo na sessão — sem precisar de fetch no Neon
          let profile = session.profile || null;

          // Se não tem perfil na sessão, tenta buscar no Neon
          if (!profile && session.email) {
            try {
              const users = await fetchUsers();
              profile = users.find(u => u.email === session.email) || null;
            } catch(e) {
              console.warn("[init] fetch profile failed, using LOCAL_USERS fallback");
            }
          }

          // Último fallback — usa dados locais hardcoded
          if (!profile && session.email) {
            const LOCAL = [
              { id:"u-vivian",  email:"vivian@orioncloudkitchens.com.br", name:"Vivian",  role:"admin",       nivel:"admin",      cargo:"Gestão",      setor:"Gestão",      avatar:"VI", ativo:true, elegivel_bonus:true },
              { id:"u-rafael",  email:"rafael@orion.com.br",              name:"Rafael",  role:"colaborador", nivel:"supervisor", cargo:"Supervisor",  setor:"Operacional", avatar:"RA", ativo:true, elegivel_bonus:true },
              { id:"u-eduardo", email:"eduardo@orion.com.br",             name:"Eduardo", role:"colaborador", nivel:"lider",      cargo:"Líder",       setor:"Operacional", avatar:"ED", ativo:true, elegivel_bonus:true },
              { id:"u-adala",   email:"adala@orion.com.br",               name:"Ádala",   role:"colaborador", nivel:"lider",      cargo:"Líder",       setor:"Operacional", avatar:"AD", ativo:true, elegivel_bonus:true },
              { id:"u-lucas",   email:"lucas@orion.com.br",               name:"Lucas",   role:"colaborador", nivel:"operador",   cargo:"Operador",    setor:"Operacional", avatar:"LU", ativo:true, elegivel_bonus:true },
            ];
            profile = LOCAL.find(u => u.email === session.email) || null;
          }

          if (profile) {
            setUser(profile);
            setActive(profile.role === "admin" ? "dashboard" : "minhas-tarefas");
            await loadAll();
            limparFotosAntigas().catch(() => {});
          }
          // Nunca chama store_logout() aqui — se falhou é problema de rede, não de sessão
        }
      } catch(e) {
        console.warn("[init] error:", e.message);
      } finally {
        clearTimeout(safetyTimer);
        setLoading(false);
      }
    };

    init();

    return () => { clearTimeout(safetyTimer); };
  }, [loadAll]);

  // ─── AUTH ───────────────────────────────────────────────────
  // Recarrega todos os dados do banco (útil para sincronizar mobile/desktop)
  const reloadAll = useCallback(async () => {
    setLoading(true);
    try { await loadAll(); } finally { setLoading(false); }
  }, [loadAll]);



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
    if (userToSave) {
      try {
        await upsertUser(userToSave);
      } catch(e) {
        console.error("upsertUser error:", e);
        toast("Erro ao salvar colaborador: " + (e?.message ?? e), "error");
        fetchUsers().then(u => setUsers(u)).catch(()=>{});
      }
    }
  }, [toast]);

  const handleSetTasks = useCallback(async (updated, taskToSave) => {
    setTasks(updated);
    if (taskToSave) {
      try {
        await upsertTask(taskToSave);
      } catch(e) {
        console.error("upsertTask error:", e);
        toast("Erro ao salvar tarefa: " + (e?.message ?? e), "error");
        // Recarrega do banco para não ficar com estado inconsistente
        fetchTasks().then(t => setTasks(t)).catch(()=>{});
      }
    }
  }, [toast]);

  const handleSetExecutions = useCallback(async (updated, execToSave) => {
    setExecutions(updated); // otimista: mostra na tela imediatamente
    if (execToSave) {
      try {
        const saved = await insertExecucao(execToSave);
        console.log("[App] execucao salva:", saved?.id);
        // Recarrega do banco para confirmar
        const fresh = await fetchExecucoes();
        setExecutions(fresh);
      } catch(e) {
        console.error("[App] insertExecucao error:", e);
        toast("Erro ao salvar execução: " + (e?.message ?? e), "error");
        // Reverte ao estado do banco
        fetchExecucoes().then(f => setExecutions(f)).catch(()=>{});
      }
    }
  }, [toast]);

  const handleAddPontosExtras = useCallback(async (entry) => {
    try {
      const saved = await insertPontosExtras(entry);
      setPontosExtras(p => [saved, ...p]);
      return saved;
    } catch(e) {
      toast("Erro ao salvar pontos: " + e.message, "error");
      throw e;
    }
  }, [toast]);

  const handleSetBonusRules = useCallback(async (rules) => {
    setBonusRules(rules);
    try {
      await saveBonusRules(rules);
    } catch(e) {
      toast("Erro ao salvar configurações: " + (e?.message ?? e), "error");
    }
  }, [toast]);

  if (isReset) return <><GlobalStyles /><ResetPassword onDone={() => { setIsReset(false); window.location.hash = ""; }} /></>;
  if (window.location.hash === "#migrar") return <><GlobalStyles /><MigracaoPage /></>;
  if (loading) return <><GlobalStyles /><Loading /></>;
  if (!user)   return <><GlobalStyles /><Login onLogin={login} /></>;

  const shared = {
    users,
    tasks,
    executions,
    bonusRules,
    user,
    toast,
    reloadAll,
    setUsers:      (upd, toSave) => handleSetUsers(upd, toSave),
    setTasks:      (upd, toSave) => handleSetTasks(upd, toSave),
    setExecutions: (upd, toSave) => handleSetExecutions(upd, toSave),
    setBonusRules: handleSetBonusRules,
    removeUser: async (id) => {
      try {
        await deleteUser(id);
        setUsers(prev => prev.filter(u => u.id !== id));
        toast("Colaborador removido");
      } catch(e) {
        toast("Erro ao remover: " + e.message, "error");
      }
    },
    pontosExtras,
    addPontosExtras: handleAddPontosExtras,
    removePontosExtras: async (id) => {
      try {
        await deletePontosExtras(id);
        setPontosExtras(p => p.filter(e => e.id !== id));
        toast("Registro removido");
      } catch(e) {
        toast("Erro ao remover: " + e.message, "error");
      }
    },
    extraRules,
    setExtraRules: async (rules) => { setExtraRules(rules); await saveExtraRules(rules).catch(console.error); },
    advertencias,
    addAdvertencia: async (entry) => {
      try {
        const saved = await insertAdvertencia(entry);
        setAdvertencias(p => [saved, ...p]);
        return saved;
      } catch(e) { toast("Erro ao salvar advertência: " + e.message, "error"); throw e; }
    },
    removeAdvertencia: async (id) => {
      try {
        await deleteAdvertencia(id);
        setAdvertencias(p => p.filter(a => a.id !== id));
        toast("Advertência removida");
      } catch(e) { toast("Erro: " + e.message, "error"); }
    },
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
    "painel-equipe":   <PainelEquipe   {...shared} />,
    "pontos-extras":   <PontosExtrasPage {...shared} />,
    "advertencias":    <AdvertenciasPage  {...shared} />,
  };

  return (
    <>
      <GlobalStyles />
      <div style={{ display:"flex", minHeight:"100vh", background:"#f1f5f9" }}>
        <Sidebar user={user} active={active} setActive={setActive} onLogout={logout} />
        <BottomNav user={user} active={active} setActive={setActive} onLogout={logout} onSync={reloadAll} />
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
