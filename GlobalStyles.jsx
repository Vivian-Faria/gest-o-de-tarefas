export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; background: #f1f5f9; color: #1e293b; }
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      input, select, textarea, button { font-family: inherit; }
      @keyframes fadeIn  { from { opacity:0; transform:translateY(8px) }  to { opacity:1; transform:none } }
      @keyframes scaleIn { from { opacity:0; transform:scale(0.95) }       to { opacity:1; transform:scale(1) } }
      @keyframes toastIn { from { opacity:0; transform:translateY(16px) scale(0.96) } to { opacity:1; transform:none } }
      @keyframes spin    { to { transform:rotate(360deg) } }
      .page-enter  { animation: fadeIn  0.22s ease both; }
      .card-enter  { animation: scaleIn 0.18s ease both; }
      .nav-item    { transition: all 0.15s ease; cursor: pointer; }
      .nav-item:hover { background: rgba(99,102,241,0.12) !important; }
      .btn-hover   { transition: all 0.15s ease; }
      .btn-hover:hover  { filter: brightness(1.06); transform: translateY(-1px); }
      .btn-hover:active { transform: translateY(0); }
      .card-hover  { transition: all 0.18s ease; cursor: pointer; }
      .card-hover:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
      .task-row { transition: all 0.15s ease; }
      .task-row:hover { background: #f8fafc !important; }
      input:focus, select:focus, textarea:focus {
        border-color: #6366f1 !important;
        box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
        outline: none;
      }
      /* DESKTOP */
      .sidebar-desktop { display: flex !important; }
      .bottom-nav      { display: none !important; }
      .main-content    { padding: 32px 36px; }
      /* MODAL GRID RESPONSIVO */
    .modal-form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 0 16px; }
    @media (max-width: 540px) {
      .modal-form-grid { grid-template-columns: 1fr !important; }
      .modal-form-grid > * { grid-column: 1 / -1 !important; }
    }
      /* MOBILE */
      @media (max-width: 768px) {
        .sidebar-desktop  { display: none !important; }
        .bottom-nav       { display: flex !important; }
        .main-content     { padding: 16px 14px 88px 14px !important; width: 100% !important; }
        .stat-grid        { grid-template-columns: 1fr 1fr !important; }
        .ranking-row      { flex-wrap: wrap; gap: 8px !important; }
        .modal-grid-2col  { grid-template-columns: 1fr !important; }
        .task-card-inner  { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
        .task-card-chips  { flex-wrap: wrap !important; }
        .task-card-btn    { width: 100% !important; justify-content: center !important; }
        .table-wrap       { overflow-x: auto !important; }
      }
    `}</style>
  );
}
