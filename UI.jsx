import { useEffect } from "react";
import { T } from "./tokens.js";
import { statusColor, statusLabel } from "./helpers.js";
import { Ic } from "./Icon.jsx";

// ─── AVATAR ───────────────────────────────────────────────────────────────────
export function Avatar({ user, size = 36, ring = false }) {
  const palette = ["#6366f1","#8b5cf6","#ec4899","#14b8a6","#f59e0b","#3b82f6","#10b981","#f97316"];
  const bg = palette[(user?.name?.charCodeAt(0) || 0) % palette.length];
  return (
    <div style={{ width:size, height:size, borderRadius:"50%", background:bg, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:size*0.36, flexShrink:0, border:ring?`2.5px solid #fff`:"none", boxShadow:ring?`0 0 0 2px ${bg}`:"none" }}>
      {user?.avatar || "?"}
    </div>
  );
}

// ─── CHIP ─────────────────────────────────────────────────────────────────────
export function Chip({ children, color = T.indigo[600], bg = T.indigo[50], dot = false }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600, color, background:bg, letterSpacing:0.2, whiteSpace:"nowrap" }}>
      {dot && <span style={{ width:6, height:6, borderRadius:"50%", background:color, flexShrink:0 }} />}
      {children}
    </span>
  );
}

export function StatusChip({ index }) {
  const color = statusColor(index);
  return <Chip color={color} bg={color + "18"} dot>{statusLabel(index)}</Chip>;
}

// ─── PROGRESS RING ────────────────────────────────────────────────────────────
export function ProgressRing({ value, size = 64, sw = 6, animate = true }) {
  const r = (size - sw) / 2, circ = 2 * Math.PI * r, offset = circ - (value / 100) * circ;
  const color = statusColor(value);
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: animate ? "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" : "none" }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <span style={{ fontSize:size*0.2, fontWeight:800, color, lineHeight:1 }}>{value}</span>
        <span style={{ fontSize:size*0.13, color:T.slate[400], fontWeight:600 }}>%</span>
      </div>
    </div>
  );
}

// ─── BAR CHART ────────────────────────────────────────────────────────────────
export function BarChart({ data, height = 80 }) {
  const max = Math.max(...data.map(d => d.v), 1);
  const labels = ["D-6","D-5","D-4","D-3","D-2","D-1","Hoje"];
  return (
    <div style={{ display:"flex", alignItems:"flex-end", gap:6, height, padding:"0 4px" }}>
      {data.map((d, i) => {
        const h = Math.round((d.v / max) * height * 0.85) || 2;
        const color = d.v > 0 ? T.indigo[400] : T.slate[200];
        return (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            <div style={{ width:"100%", height:h, background:color, borderRadius:"4px 4px 2px 2px", transition:"height 0.6s ease", minHeight:2 }} />
            <span style={{ fontSize:9, color:T.slate[400], fontWeight:500 }}>{labels[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon, color = T.indigo[500], sub, trend, chart }) {
  return (
    <div className="card-enter" style={{ background:"#fff", border:`1px solid ${T.slate[100]}`, borderRadius:16, padding:"20px 22px", display:"flex", flexDirection:"column", gap:8, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, right:0, width:80, height:80, background:color+"08", borderRadius:"0 16px 0 80px" }} />
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:12, color:T.slate[500], fontWeight:600, textTransform:"uppercase", letterSpacing:0.8 }}>{label}</span>
        <div style={{ width:36, height:36, borderRadius:10, background:color+"18", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Ic n={icon} s={16} c={color} />
        </div>
      </div>
      <span style={{ fontSize:28, fontWeight:900, color:T.slate[800], letterSpacing:-1 }}>{value}</span>
      {sub && <span style={{ fontSize:12, color:T.slate[400] }}>{sub}</span>}
      {trend !== undefined && (
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <Ic n={trend >= 0 ? "arrow_up" : "arrow_down"} s={12} c={trend >= 0 ? T.emerald[500] : T.rose[500]} />
          <span style={{ fontSize:11, fontWeight:600, color:trend >= 0 ? T.emerald[500] : T.rose[500] }}>{Math.abs(trend)}% vs mês anterior</span>
        </div>
      )}
      {chart && <div style={{ marginTop:4 }}><BarChart data={chart} /></div>}
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 500 }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);
  if (!open) return null;
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(15,23,42,0.6)", zIndex:2000, display:"flex", alignItems:"center", justifyContent:"center", padding:16, backdropFilter:"blur(4px)" }} onClick={onClose}>
      <div className="card-enter" style={{ background:"#fff", borderRadius:20, padding:"28px 28px 24px", width:"100%", maxWidth:width, maxHeight:"92vh", overflowY:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.22)" }} onClick={e => e.stopPropagation()}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24 }}>
          <h3 style={{ fontSize:17, fontWeight:800, color:T.slate[800] }}>{title}</h3>
          <button onClick={onClose} style={{ background:T.slate[100], border:"none", borderRadius:8, width:32, height:32, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"background 0.15s" }} onMouseOver={e => e.currentTarget.style.background=T.slate[200]} onMouseOut={e => e.currentTarget.style.background=T.slate[100]}>
            <Ic n="x" s={15} c={T.slate[500]} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── FIELD ────────────────────────────────────────────────────────────────────
export function Field({ label, value, onChange, type = "text", required, options, placeholder, disabled, hint }) {
  const base = { width:"100%", padding:"10px 13px", border:`1.5px solid ${T.slate[200]}`, borderRadius:10, fontSize:14, color:T.slate[800], background:disabled?T.slate[50]:"#fff", transition:"border 0.15s, box-shadow 0.15s", fontFamily:"inherit" };
  return (
    <div style={{ marginBottom:16 }}>
      {label && (
        <label style={{ display:"block", fontSize:12, fontWeight:700, color:T.slate[600], marginBottom:6, letterSpacing:0.3 }}>
          {label}{required && <span style={{ color:T.rose[500] }}>  *</span>}
        </label>
      )}
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={base} disabled={disabled}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : type === "checkbox" ? (
        <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }}>
          <div style={{ width:20, height:20, borderRadius:6, border:`2px solid ${value?T.indigo[500]:T.slate[300]}`, background:value?T.indigo[500]:"#fff", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s", flexShrink:0 }} onClick={() => onChange(!value)}>
            {value && <Ic n="check" s={12} c="#fff" sw={2.5} />}
          </div>
          <span style={{ fontSize:14, color:T.slate[700] }}>{placeholder}</span>
        </label>
      ) : type === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ ...base, minHeight:84, resize:"vertical" }} />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} disabled={disabled} required={required} />
      )}
      {hint && <p style={{ fontSize:11, color:T.slate[400], marginTop:5 }}>{hint}</p>}
    </div>
  );
}

// ─── BTN ──────────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = "primary", size = "md", disabled, icon, full = false, type = "button", loading = false }) {
  const variants = {
    primary:   { bg:T.indigo[500],  text:"#fff",           border:"none",                              shadow:"0 4px 14px rgba(99,102,241,0.35)" },
    secondary: { bg:T.slate[100],   text:T.slate[700],      border:"none",                              shadow:"none" },
    danger:    { bg:T.rose[50],     text:T.rose[600],       border:`1px solid ${T.rose[200]}`,          shadow:"none" },
    success:   { bg:T.emerald[50],  text:T.emerald[600],    border:`1px solid ${T.emerald[200]}`,       shadow:"none" },
    ghost:     { bg:"transparent",  text:T.indigo[500],     border:`1.5px solid ${T.indigo[200]}`,      shadow:"none" },
    dark:      { bg:T.slate[800],   text:"#fff",            border:"none",                              shadow:"0 4px 14px rgba(15,23,42,0.25)" },
  };
  const sizes = {
    sm: { p:"6px 14px",  fs:12, r:8,  ic:13 },
    md: { p:"9px 18px",  fs:14, r:10, ic:15 },
    lg: { p:"13px 26px", fs:15, r:12, ic:16 },
  };
  const v = variants[variant] || variants.primary;
  const sz = sizes[size] || sizes.md;
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className="btn-hover" style={{ background:v.bg, color:v.text, border:v.border||"none", borderRadius:sz.r, padding:sz.p, fontSize:sz.fs, fontWeight:700, cursor:(disabled||loading)?"not-allowed":"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7, opacity:(disabled||loading)?0.55:1, width:full?"100%":"auto", boxShadow:v.shadow, letterSpacing:0.1, fontFamily:"inherit", whiteSpace:"nowrap" }}>
      {loading
        ? <div style={{ width:sz.ic, height:sz.ic, border:`2px solid ${v.text}40`, borderTopColor:v.text, borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
        : icon && <Ic n={icon} s={sz.ic} c={v.text} />
      }
      {children}
    </button>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
export function ToastContainer({ toasts, remove }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", flexDirection:"column", gap:10, maxWidth:340 }}>
      {toasts.map(t => (
        <div key={t.id} style={{ background:"#fff", border:`1px solid ${t.type==="success"?T.emerald[200]:t.type==="error"?T.rose[200]:T.slate[200]}`, borderLeft:`4px solid ${t.type==="success"?T.emerald[500]:t.type==="error"?T.rose[500]:T.indigo[500]}`, borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:12, boxShadow:"0 8px 24px rgba(0,0,0,0.12)", animation:"toastIn 0.25s ease both" }}>
          <Ic n={t.type==="success"?"check":t.type==="error"?"alert_tri":"info"} s={18} c={t.type==="success"?T.emerald[500]:t.type==="error"?T.rose[500]:T.indigo[500]} />
          <span style={{ flex:1, fontSize:13, fontWeight:600, color:T.slate[700] }}>{t.msg}</span>
          <button onClick={() => remove(t.id)} style={{ background:"none", border:"none", cursor:"pointer", padding:2 }}>
            <Ic n="x" s={14} c={T.slate[400]} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export function Empty({ icon = "filter", title = "Nenhum resultado", sub = "Tente ajustar os filtros" }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"64px 24px", color:T.slate[400], background:T.slate[50], borderRadius:16, border:`1px dashed ${T.slate[200]}` }}>
      <div style={{ width:56, height:56, borderRadius:16, background:T.slate[100], display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
        <Ic n={icon} s={26} c={T.slate[300]} />
      </div>
      <p style={{ fontSize:15, fontWeight:700, color:T.slate[600], marginBottom:6 }}>{title}</p>
      <p style={{ fontSize:13, textAlign:"center", maxWidth:240 }}>{sub}</p>
    </div>
  );
}

// ─── PAGE WRAPPER ─────────────────────────────────────────────────────────────
export function Page({ title, sub, action, children }) {
  return (
    <div className="page-enter" style={{ maxWidth:1100, margin:"0 auto" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontSize:24, fontWeight:900, color:T.slate[800], letterSpacing:-0.5, marginBottom:4 }}>{title}</h2>
          {sub && <p style={{ fontSize:14, color:T.slate[400] }}>{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
