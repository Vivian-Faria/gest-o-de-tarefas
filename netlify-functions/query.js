import { neon } from "@neondatabase/serverless";

export const config = { type: "esm" };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.NEON_URL || process.env.VITE_NEON_URL;
  if (!DATABASE_URL) {
    return res.status(500).json({ error: "Variavel de banco nao configurada. Adicione NEON_URL nas variaveis de ambiente da Netlify." });
  }

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "Body invalido" }); }
  }
  const { query, params = [] } = body || {};
  if (!query) return res.status(400).json({ error: "query ausente" });

  try {
    const sql = neon(DATABASE_URL);
    const rows = await sql(query, params);
    return res.status(200).json({ rows: Array.isArray(rows) ? rows : [] });
  } catch (err) {
    console.error("[query] erro:", err.message);
    return res.status(500).json({ error: err.message });
  }
}
