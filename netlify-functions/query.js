// Cliente de banco via Netlify Function
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

  const res = await fetch("/.netlify/functions/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, params }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `DB error ${res.status}`);
  }

  const data = await res.json();
  return data.rows ?? [];
}
