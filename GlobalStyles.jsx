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

      @keyframes fadeIn    { from { opacity: 0; transform: translateY(8px);      } to { opacity: 1; transform: none; } }
      @keyframes scaleIn   { from { opacity: 0; transform: scale(0.95);           } to { opacity: 1; transform: scale(1); } }
      @keyframes toastIn   { from { opacity: 0; transform: translateY(16px) scale(0.96); } to { opacity: 1; transform: none; } }
      @keyframes spin      { to { transform: rotate(360deg); } }

      .page-enter  { animation: fadeIn  0.22s ease both; }
      .card-enter  { animation: scaleIn 0.18s ease both; }

      .nav-item { transition: all 0.15s ease; cursor: pointer; }
      .nav-item:hover { background: rgba(99,102,241,0.12) !important; }

      .btn-hover { transition: all 0.15s ease; }
      .btn-hover:hover  { filter: brightness(1.06); transform: translateY(-1px); }
      .btn-hover:active { transform: translateY(0); }

      .card-hover { transition: all 0.18s ease; cursor: pointer; }
      .card-hover:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }

      .task-row { transition: all 0.15s ease; }
      .task-row:hover { background: #f8fafc !important; }

      input:focus, select:focus, textarea:focus {
        border-color: #6366f1 !important;
        box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
        outline: none;
      }

      .app-loading {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        color: #64748b;
        font-size: 14px;
        font-weight: 700;
      }

      .app-loading-spinner {
        width: 18px;
        height: 18px;
        border: 2px solid #cbd5e1;
        border-top-color: #6366f1;
        border-radius: 50%;
        animation: spin 0.75s linear infinite;
      }

      @media (max-width: 768px) {
        body { overflow-x: hidden; }

        .app-shell {
          display: block !important;
          min-height: 100dvh !important;
          padding-bottom: 76px !important;
        }

        .sidebar {
          position: fixed !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          top: auto !important;
          z-index: 900 !important;
          width: 100% !important;
          height: 68px !important;
          border-right: none !important;
          border-top: 1px solid rgba(255,255,255,0.08) !important;
          padding: 0 env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left) !important;
        }

        .sidebar > div:first-child,
        .sidebar > div:nth-child(2),
        .sidebar > div:last-child {
          display: none !important;
        }

        .sidebar-nav {
          height: 100% !important;
          padding: 8px 10px !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
        }

        .sidebar-label   { display: none !important; }
        .sidebar-logo-text { display: none !important; }

        .nav-item {
          width: 48px !important;
          height: 48px !important;
          min-width: 48px !important;
          margin: 0 !important;
          padding: 0 !important;
          justify-content: center !important;
          border-left: 0 !important;
          border-bottom: 3px solid transparent !important;
        }

        .main-content {
          min-height: auto !important;
          max-height: none !important;
          overflow: visible !important;
          padding: 16px 12px 24px !important;
        }

        .page-wrap { max-width: 100% !important; }
        .page-head {
          margin-bottom: 18px !important;
          gap: 10px !important;
        }
        .page-head > div,
        .page-head > button {
          width: 100% !important;
        }
        .page-head h2 {
          font-size: 21px !important;
          line-height: 1.15 !important;
        }

        .card-enter,
        .task-row {
          border-radius: 12px !important;
          padding: 14px !important;
        }

        .task-row,
        .ranking-row {
          align-items: flex-start !important;
        }

        .task-row {
          flex-direction: column !important;
          gap: 12px !important;
        }

        .task-row > div {
          max-width: 100% !important;
        }

        .task-row > div:last-child,
        .card-enter > div:last-child {
          flex-wrap: wrap !important;
        }

        .stat-grid,
        div[style*="grid-template-columns: repeat(auto-fit"],
        div[style*="grid-template-columns: repeat(auto-fill"],
        div[style*="grid-template-columns:\"1fr 1fr\""],
        div[style*="grid-template-columns: 1fr 1fr"] {
          grid-template-columns: 1fr !important;
        }

        .modal-backdrop {
          align-items: flex-end !important;
          padding: 10px !important;
        }

        .modal-panel {
          max-height: 94dvh !important;
          border-radius: 16px !important;
          padding: 20px 16px 16px !important;
        }

        .modal-panel [style*="grid-template-columns"] {
          grid-template-columns: 1fr !important;
        }

        .toast-container,
        div[style*="position: fixed"][style*="bottom: 24px"] {
          left: 12px !important;
          right: 12px !important;
          bottom: 84px !important;
          max-width: none !important;
        }

        table {
          min-width: 720px !important;
        }

        .page-wrap > div:has(table) {
          overflow-x: auto !important;
          -webkit-overflow-scrolling: touch;
        }

        button {
          min-height: 40px;
        }

        .ranking-row     { flex-wrap: wrap; gap: 8px !important; }
      }

      @media (max-width: 430px) {
        .main-content { padding-left: 10px !important; padding-right: 10px !important; }
        .card-enter,
        .task-row { padding: 12px !important; }
        .page-head h2 { font-size: 20px !important; }
      }
    `}</style>
  );
}
