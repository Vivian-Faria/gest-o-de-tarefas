// Cliente Neon via HTTP API nativa — funciona direto no browser
const NEON_HOST = "ep-spring-mode-ac67uqmi.sa-east-1.aws.neon.tech";
const NEON_USER = "neondb_owner";
const NEON_PASS = "npg_Ifg68kZSKYdQ";
const NEON_DB   = "neondb";
const NEON_URL  = `https://${NEON_HOST}/sql/v1`;
const NEON_AUTH = btoa(`${NEON_USER}:${NEON_PASS}`);

export default async function sql(strings, ...values) {
  let query = "";
  const params = [];
  strings.forEach((str, i) => {
    query += str;
    if (i < values.length) {
      params.push(values[i] === undefined ? null : values[i]);
      query += `$${params.length}`;
    }
  });

  const res = await fetch(NEON_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Basic ${NEON_AUTH}`,
      "Neon-Database": NEON_DB,
    },
    body: JSON.stringify({ query, params }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `Neon error ${res.status}`);
  }

  const data = await res.json();
  return data.rows ?? [];
}
