import { neon } from "@neondatabase/serverless";

export default async (req, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.NEON_URL || process.env.VITE_NEON_URL;
  if (!DATABASE_URL) {
    return new Response(JSON.stringify({ error: "NEON_URL nao configurada." }), { status: 500, headers });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Body invalido" }), { status: 400, headers });
  }

  const { query, params = [] } = body || {};
  if (!query) {
    return new Response(JSON.stringify({ error: "query ausente" }), { status: 400, headers });
  }

  try {
    const sql = neon(DATABASE_URL);
    const rows = await sql(query, params);
    return new Response(JSON.stringify({ rows: Array.isArray(rows) ? rows : [] }), { status: 200, headers });
  } catch (err) {
    console.error("[query] erro:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
};

export const config = { path: "/.netlify/functions/query" };
