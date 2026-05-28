import { useState, useEffect } from "react";
import { GlobalStyles }    from "./GlobalStyles.jsx";
import { Sidebar }         from "./Sidebar.jsx";
import { ToastContainer }  from "./UI.jsx";
import { useToast }        from "./useToast.js";
import { store, initStorage } from "./helpers.js";
import { BONUS_RULES }     from "./tokens.js";

import { Login }           from "./Login.jsx";
import { AdminDashboard }  from "./AdminDashboard.jsx";
import { Colaboradores, Tarefas, Execucoes, Relatorios, Config } from "./AdminPages.jsx";
import { MinhasTarefas, MeuDesempenho } from "./ColaboradorPages.jsx";

export default function App() {
  const [user,       setUser]       = useState(null);
  const [active,     setActive]     = useState(null);
  const [users,      setUsers]      = useState([]);
  const [tasks,      setTasks]      = useState([]);
  const [executions, setExecutions] = useState([]);
  const [bonusRules, setBonusRules] = useState([]);
  const { toasts, toast, remove }   = useToast();

  useEffect(() => {
    initStorage();
    setUsers(store.get("go_users", []));
    setTasks(store.get("go_tasks", []));
    setExecutions(store.get("go_execs", []));
    setBonusRules(store.get("go_bonus", BONUS_RULES));
  }, []);

  const login  = (u) => { setUser(u); setActive(u.role === "admin" ? "dashboard" : "minhas-tarefas"); };
  const logout = ()  => { setUser(null); setActive(null); };

  if (!user) return <><GlobalStyles /><Login onLogin={login} /></>;

  const shared = { users, setUsers, tasks, setTasks, executions, setExecutions, bonusRules, setBonusRules, user, toast };

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
        <main
          className="main-content"
          style={{ flex:1, padding:"32px 36px", overflowY:"auto", minHeight:"100vh", maxHeight:"100vh" }}
        >
          {pages[active] || <div style={{ color:"#94a3b8", padding:40 }}>Selecione uma opção no menu</div>}
        </main>
      </div>
      <ToastContainer toasts={toasts} remove={remove} />
    </>
  );
}
