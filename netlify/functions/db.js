const { neon } = require("@neondatabase/serverless");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  let body;
  try { body = JSON.parse(event.body); }
  catch { return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid JSON" }) }; }

  const { query, params = [] } = body;
  if (!query) return { statusCode: 400, headers, body: JSON.stringify({ error: "query required" }) };

  try {
    const sql = neon(process.env.NEON_URL);
    const rows = await sql(query, params);
    return { statusCode: 200, headers, body: JSON.stringify({ rows }) };
  } catch (e) {
    console.error("[db]", e.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
