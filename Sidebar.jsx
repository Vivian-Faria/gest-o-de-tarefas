import { T } from "../utils/tokens.js";
import { Ic } from "./Icon.jsx";
import { Avatar } from "./UI.jsx";
import { USE_SUPABASE } from "../lib/dataService.js";

const ADMIN_NAV = [
  { id:"dashboard",     label:"Dashboard",      icon:"grid"     },
  { id:"colaboradores", label:"Colaboradores",  icon:"users"    },
  { id:"tarefas",       label:"Tarefas",         icon:"task"     },
  { id:"execucoes",     label:"Execuções",        icon:"chart"    },
  { id:"relatorios",    label:"Relatórios",      icon:"download" },
  { id:"config",        label:"Configurações",   icon:"settings" },
];

const USER_NAV = [
  { id:"minhas-tarefas", label:"Minhas Tarefas", icon:"task"  },
  { id:"meu-desempenho", label:"Meu Desempenho", icon:"chart" },
];

export function Sidebar({ user, active, setActive, onLogout }) {
  const isAdmin = user.role === "admin";
  const nav = isAdmin ? ADMIN_NAV : USER_NAV;

  return (
    <aside className="sidebar" style={{ width:228, background:T.slate[900], display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, flexShrink:0, borderRight:"1px solid rgba(255,255,255,0.05)" }}>

      {/* Logo */}
      <div style={{ padding:"22px 18px 18px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:36, height:36, background:"linear-gradient(135deg,#6366f1,#8b5cf6)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 4px 12px rgba(99,102,241,0.4)" }}>
            <Ic n="task" s={18} c="#fff" />
          </div>
          <div className="sidebar-logo-text">
            <div style={{ fontSize:14, fontWeight:800, color:"#f1f5f9", letterSpacing:-0.3 }}>GestãoOp</div>
            <div style={{ fontSize:10, color:T.slate[500], fontWeight:500, letterSpacing:0.5 }}>OPERACIONAL</div>
          </div>
        </div>
      </div>

      {/* Aviso sem banco */}
      {!USE_SUPABASE && (
        <div className="sidebar-logo-text" style={{ margin:"10px 10px 0", background:"rgba(251,191,36,0.12)", border:"1px solid rgba(251,191,36,0.25)", borderRadius:10, padding:"8px 10px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
            <Ic n="alert_tri" s={12} c={T.amber[400]} />
            <span style={{ fontSize:10, fontWeight:800, color:T.amber[400], letterSpacing:0.3 }}>SEM BANCO DE DADOS</span>
          </div>
          <p style={{ fontSize:10, color:"rgba(251,191,36,0.7)", lineHeight:1.4 }}>
            Dados isolados por dispositivo. Configure o Supabase para sincronizar.
          </p>
        </div>
      )}

      {/* Section label */}
      <div style={{ padding:"14px 18px 6px" }}>
        <p className="sidebar-label" style={{ fontSize:10, fontWeight:700, color:T.slate[600], letterSpacing:1.2, textTransform:"uppercase" }}>
          {isAdmin ? "Gestão" : "Colaborador"}
        </p>
      </div>

      {/* Navigation */}
      <nav style={{ padding:"0 10px", flex:1, overflowY:"auto" }}>
        {nav.map(item => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className="nav-item"
              style={{ width:"100%", display:"flex", alignItems:"center", gap:11, padding:"10px 12px", borderRadius:10, border:"none", cursor:"pointer", background:isActive?"rgba(99,102,241,0.2)":"transparent", color:isActive?"#a5b4fc":T.slate[400], fontSize:13, fontWeight:isActive?700:500, marginBottom:2, textAlign:"left", fontFamily:"inherit", borderLeft:isActive?"3px solid #818cf8":"3px solid transparent", transition:"all 0.15s" }}
            >
              <Ic n={item.icon} s={16} c={isActive?"#a5b4fc":T.slate[500]} />
              <span className="sidebar-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:"rgba(255,255,255,0.04)", marginBottom:4 }}>
          <Avatar user={user} size={32} />
          <div className="sidebar-logo-text" style={{ overflow:"hidden", flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#e2e8f0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
            <div style={{ fontSize:10, color:T.slate[500] }}>{user.role === "admin" ? "Administrador" : user.cargo}</div>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 12px", borderRadius:10, border:"none", cursor:"pointer", background:"transparent", color:T.rose[400], fontSize:12, fontWeight:600, fontFamily:"inherit", transition:"all 0.15s" }}
          onMouseOver={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
          onMouseOut={e  => e.currentTarget.style.background = "transparent"}
        >
          <Ic n="logout" s={14} c={T.rose[400]} />
          <span className="sidebar-label">Sair da conta</span>
        </button>
      </div>
    </aside>
  );
}
