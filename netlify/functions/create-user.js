const { createClient } = require("@supabase/supabase-js");

exports.handler = async (event) => {
  // Só aceita POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // Usa a service_role key — segura pois roda no servidor, nunca no browser
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { name, email, password, cargo, setor, nivel, role, avatar, ativo } = body;

  if (!name || !email || !password) {
    return { statusCode: 400, body: JSON.stringify({ error: "name, email e password são obrigatórios" }) };
  }

  try {
    // 1. Cria o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // confirma automaticamente, sem precisar de e-mail
    });

    if (authError) {
      return { statusCode: 400, body: JSON.stringify({ error: authError.message }) };
    }

    const authId = authData.user.id;

    // 2. Gera ID do perfil
    const profileId = "u-" + name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove acentos
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 8) + "-" + Date.now().toString().slice(-4);

    // 3. Insere perfil na tabela usuarios
    const { data: profileData, error: profileError } = await supabase
      .from("usuarios")
      .insert({
        id:      profileId,
        auth_id: authId,
        name,
        email,
        cargo:   cargo   || "",
        setor:   setor   || "Operacional",
        nivel:   nivel   || "operador",
        role:    role    || "colaborador",
        avatar:  avatar  || name.split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase(),
        ativo:   ativo !== false,
      })
      .select()
      .single();

    if (profileError) {
      // Se falhou ao criar o perfil, deleta o auth user para não ficar órfão
      await supabase.auth.admin.deleteUser(authId);
      return { statusCode: 500, body: JSON.stringify({ error: profileError.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ user: profileData }),
    };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
