// Cliente de banco via Netlify Function (evita CORS do Neon no browser)
export default async function sql(strings, ...values) {
  // Monta a query com placeholders $1, $2...
  let query = "";
  const params = [];
  strings.forEach((str, i) => {
    query += str;
    if (i < values.length) {
      params.push(values[i]);
      query += `$${params.length}`;
    }
  });

  const res = await fetch("/.netlify/functions/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, params }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `DB error ${res.status}`);
  }

  const data = await res.json();
  return data.rows ?? [];
}
