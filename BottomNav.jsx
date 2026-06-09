import { T } from "./tokens.js";
import { Ic } from "./Icon.jsx";

// Admin: só os 5 mais usados no mobile — resto fica na sidebar desktop
const ADMIN_NAV = [
  { id:"dashboard",    icon:"grid",      label:"Início"   },
  { id:"tarefas",      icon:"task",      label:"Tarefas"  },
  { id:"execucoes",    icon:"chart",     label:"Execuções"},
  { id:"relatorios",   icon:"download",  label:"Relatórios"},
  { id:"colaboradores",icon:"users",     label:"Equipe"   },
];

const LIDER_NAV = [
  { id:"minhas-tarefas", icon:"task",  label:"Tarefas"   },
  { id:"painel-equipe",  icon:"users", label:"Equipe"    },
  { id:"meu-desempenho", icon:"chart", label:"Desempenho"},
];

const USER_NAV = [
  { id:"minhas-tarefas", icon:"task",  label:"Tarefas"    },
  { id:"meu-desempenho", icon:"chart", label:"Desempenho" },
];

function getNav(user) {
  if (user.role === "admin") return ADMIN_NAV;
  const nivel = user.nivel || "operador";
  if (nivel === "lider" || nivel === "supervisor") return LIDER_NAV;
  return USER_NAV;
}

export function BottomNav({ user, active, setActive, onLogout, onSync }) {
  const nav = getNav(user);

  return (
    <nav className="bottom-nav" style={{
      position:"fixed", bottom:0, left:0, right:0,
      background:T.slate[900],
      borderTop:"1px solid rgba(255,255,255,0.08)",
      zIndex:999, alignItems:"center",
      padding:"6px 0 max(6px, env(safe-area-inset-bottom))",
      gap:0,
    }}>
      {nav.map(item => {
        const isActive = active === item.id;
        return (
          <button key={item.id} onClick={() => setActive(item.id)}
            style={{
              flex:1, display:"flex", flexDirection:"column", alignItems:"center",
              gap:2, padding:"5px 2px", border:"none", background:"transparent",
              color: isActive ? "#a5b4fc" : T.slate[500],
              cursor:"pointer", fontFamily:"inherit",
              borderTop: isActive ? "2px solid #818cf8" : "2px solid transparent",
              transition:"all 0.15s", minWidth:0,
            }}>
            <Ic n={item.icon} s={18} c={isActive ? "#a5b4fc" : T.slate[500]} />
            <span style={{ fontSize:8, fontWeight: isActive ? 700 : 500, letterSpacing:0.2, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", maxWidth:"100%", textAlign:"center" }}>
              {item.label}
            </span>
          </button>
        );
      })}
      {onSync && (
        <button onClick={onSync}
          style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"5px 2px", border:"none", background:"transparent", color:T.sky[400], cursor:"pointer", fontFamily:"inherit", borderTop:"2px solid transparent" }}>
          <Ic n="refresh" s={18} c={T.sky[400]} />
          <span style={{ fontSize:8, fontWeight:500 }}>Sincronizar</span>
        </button>
      )}
      <button onClick={onLogout}
        style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2, padding:"5px 2px", border:"none", background:"transparent", color:T.rose[400], cursor:"pointer", fontFamily:"inherit", borderTop:"2px solid transparent" }}>
        <Ic n="logout" s={18} c={T.rose[400]} />
        <span style={{ fontSize:8, fontWeight:500 }}>Sair</span>
      </button>
    </nav>
  );
}
