const { neon } = require("@neondatabase/serverless");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { name, email, cargo, setor, nivel, role, avatar, ativo, elegivel_bonus } = body;

  if (!name || !email) {
    return { statusCode: 400, body: JSON.stringify({ error: "Nome e e-mail são obrigatórios" }) };
  }

  try {
    const sql = neon(process.env.NEON_URL);

    // Verifica se já existe
    const existing = await sql`SELECT id FROM usuarios WHERE email = ${email} LIMIT 1`;
    if (existing.length > 0) {
      return { statusCode: 400, body: JSON.stringify({ error: "E-mail já cadastrado" }) };
    }

    // Gera ID
    const id = "u-" + name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 8) + "-" + Date.now().toString().slice(-4);

    const avatarStr = avatar || name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

    const result = await sql`
      INSERT INTO usuarios (id, auth_id, name, email, cargo, setor, nivel, role, avatar, ativo, elegivel_bonus)
      VALUES (${id}, null, ${name}, ${email}, ${cargo||""}, ${setor||"Operacional"}, 
              ${nivel||"operador"}, ${role||"colaborador"}, ${avatarStr}, 
              ${ativo !== false}, ${elegivel_bonus !== false})
      RETURNING *
    `;

    return {
      statusCode: 200,
      body: JSON.stringify({ user: result[0] }),
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
