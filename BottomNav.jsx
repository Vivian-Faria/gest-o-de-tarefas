import { T } from "./tokens.js";
import { Ic } from "./Icon.jsx";

const ADMIN_NAV = [
  { id:"dashboard",     icon:"grid",     label:"Início"    },
  { id:"tarefas",       icon:"task",     label:"Tarefas"   },
  { id:"colaboradores", icon:"users",    label:"Equipe"    },
  { id:"execucoes",     icon:"chart",    label:"Execuções" },
  { id:"relatorios",    icon:"download", label:"Relatórios"},
  { id:"pontos-extras",  icon:"star",      label:"Pontos"    },
  { id:"advertencias",  icon:"alert_tri", label:"Advertências" },
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
              gap:3, padding:"6px 4px", border:"none", background:"transparent",
              color: isActive ? "#a5b4fc" : T.slate[500],
              cursor:"pointer", fontFamily:"inherit",
              borderTop: isActive ? "2px solid #818cf8" : "2px solid transparent",
              transition:"all 0.15s",
            }}>
            <Ic n={item.icon} s={20} c={isActive ? "#a5b4fc" : T.slate[500]} />
            <span style={{ fontSize:9, fontWeight: isActive ? 700 : 500, letterSpacing:0.3 }}>
              {item.label}
            </span>
          </button>
        );
      })}
      {onSync && (
        <button onClick={onSync}
          style={{
            flex:1, display:"flex", flexDirection:"column", alignItems:"center",
            gap:3, padding:"6px 4px", border:"none",
            background:"transparent", color:T.sky[400],
            cursor:"pointer", fontFamily:"inherit",
            borderTop:"2px solid transparent",
          }}>
          <Ic n="refresh" s={20} c={T.sky[400]} />
          <span style={{ fontSize:9, fontWeight:500, letterSpacing:0.3 }}>Sincronizar</span>
        </button>
      )}
      <button onClick={onLogout}
        style={{
          flex:1, display:"flex", flexDirection:"column", alignItems:"center",
          gap:3, padding:"6px 4px", border:"none",
          background:"transparent", color:T.rose[400],
          cursor:"pointer", fontFamily:"inherit",
          borderTop:"2px solid transparent",
        }}>
        <Ic n="logout" s={20} c={T.rose[400]} />
        <span style={{ fontSize:9, fontWeight:500, letterSpacing:0.3 }}>Sair</span>
      </button>
    </nav>
  );
}
