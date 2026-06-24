import { useState } from "react";
import sql from "./db.js";
import { T } from "./tokens.js";
import { Btn } from "./UI.jsx";

const SUPA_URL  = "https://khdecbfsmdctsnvxofjq.supabase.co/rest/v1";
const SUPA_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function fetchFromSupabase(table, select = "*") {
  const res = await fetch(`${SUPA_URL}/${table}?select=${select}&limit=1000`, {
    headers: {
      "apikey": SUPA_KEY,
      "Authorization": `Bearer ${SUPA_KEY}`,
    }
  });
  if (!res.ok) throw new Error(`Supabase ${table}: ${res.status}`);
  return res.json();
}

export function MigracaoPage() {
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const addLog = (msg, type = "info") => {
    setLog(prev => [...prev, { msg, type, ts: new Date().toLocaleTimeString() }]);
  };

  const migrate = async () => {
    setRunning(true);
    setLog([]);

    try {
      // 1. Migrar tarefas
      addLog("Buscando tarefas do Supabase...");
      const tarefas = await fetchFromSupabase("tarefas");
      addLog(`✓ ${tarefas.length} tarefas encontradas`, "success");

      let tOk = 0;
      for (const t of tarefas) {
        try {
          await sql`
            INSERT INTO tarefas (id, nome, descricao, categoria, horario, frequencia, tempo_estimado, peso, foto_obrigatoria, responsavel_id, ativo)
            VALUES (${t.id}, ${t.nome}, ${t.descricao||null}, ${t.categoria}, ${t.horario},
                    ${t.frequencia}, ${t.tempo_estimado}, ${t.peso}, ${t.foto_obrigatoria},
                    ${t.responsavel_id||null}, ${t.ativo})
            ON CONFLICT (id) DO UPDATE SET
              nome = EXCLUDED.nome, categoria = EXCLUDED.categoria,
              horario = EXCLUDED.horario, peso = EXCLUDED.peso,
              foto_obrigatoria = EXCLUDED.foto_obrigatoria,
              responsavel_id = EXCLUDED.responsavel_id, ativo = EXCLUDED.ativo
          `;
          tOk++;
        } catch(e) {}
      }
      addLog(`✓ ${tOk}/${tarefas.length} tarefas migradas`, "success");

      // 2. Migrar execuções (SEM fotos)
      addLog("Buscando execuções do Supabase (sem fotos)...");
      const execs = await fetchFromSupabase("execucoes", "id,task_id,user_id,date,timestamp,status,observacao");
      addLog(`✓ ${execs.length} execuções encontradas`, "success");

      let eOk = 0, eErr = 0;
      for (const e of execs) {
        try {
          const dateStr = e.date ? String(e.date).split("T")[0] : null;
          await sql`
            INSERT INTO execucoes (id, task_id, user_id, date, timestamp, status, observacao)
            VALUES (${e.id}, ${e.task_id}, ${e.user_id}, ${dateStr},
                    ${e.timestamp}, ${e.status}, ${e.observacao||null})
            ON CONFLICT (id) DO NOTHING
          `;
          eOk++;
        } catch(e2) { eErr++; }
      }
      addLog(`✓ ${eOk} execuções migradas${eErr>0?` (${eErr} ignoradas)`:""}`, "success");

      // 3. Migrar usuários com auth_id
      addLog("Buscando usuários do Supabase...");
      const users = await fetchFromSupabase("usuarios");
      addLog(`✓ ${users.length} usuários encontrados`, "success");

      for (const u of users) {
        try {
          await sql`
            INSERT INTO usuarios (id, auth_id, name, email, role, cargo, setor, nivel, avatar, ativo, elegivel_bonus)
            VALUES (${u.id}, ${u.auth_id||null}, ${u.name}, ${u.email}, ${u.role},
                    ${u.cargo}, ${u.setor}, ${u.nivel||'operador'}, ${u.avatar}, ${u.ativo}, ${u.elegivel_bonus!==false})
            ON CONFLICT (id) DO UPDATE SET
              auth_id = EXCLUDED.auth_id, name = EXCLUDED.name,
              nivel = EXCLUDED.nivel, cargo = EXCLUDED.cargo,
              ativo = EXCLUDED.ativo, elegivel_bonus = EXCLUDED.elegivel_bonus
          `;
        } catch(e) {}
      }
      addLog(`✓ Usuários atualizados com auth_ids`, "success");

      addLog("🎉 Migração concluída! Recarregue a página.", "success");
      setDone(true);

    } catch(e) {
      addLog(`✗ Erro: ${e.message}`, "error");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0f172a", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#fff", borderRadius:20, padding:32, width:"100%", maxWidth:600 }}>
        <h2 style={{ fontSize:20, fontWeight:800, color:"#1e293b", marginBottom:8 }}>
          🔄 Migração de Dados
        </h2>
        <p style={{ fontSize:13, color:"#64748b", marginBottom:24 }}>
          Transfere tarefas e execuções do Supabase para o Neon. Fotos não serão migradas.
        </p>

        {!done && (
          <Btn onClick={migrate} loading={running} full size="lg">
            {running ? "Migrando..." : "Iniciar Migração"}
          </Btn>
        )}

        {done && (
          <Btn onClick={() => window.location.href = "/"} full size="lg" variant="success">
            ✓ Ir para o sistema
          </Btn>
        )}

        {log.length > 0 && (
          <div style={{ marginTop:20, background:"#0f172a", borderRadius:12, padding:16, fontFamily:"monospace", fontSize:12, maxHeight:300, overflowY:"auto" }}>
            {log.map((l, i) => (
              <div key={i} style={{ color: l.type==="error"?T.rose[400]:l.type==="success"?T.emerald[400]:T.slate[300], marginBottom:4 }}>
                <span style={{ color:T.slate[500] }}>[{l.ts}]</span> {l.msg}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
