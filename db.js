// Cliente Neon via HTTP — funciona no browser
import { neon } from "@neondatabase/serverless";

let _sql = null;

function getSQL() {
  if (!_sql) {
    const url = import.meta.env.VITE_NEON_URL;
    if (!url) throw new Error("VITE_NEON_URL não configurada");
    _sql = neon(url);
  }
  return _sql;
}

export default function sql(strings, ...values) {
  return getSQL()(strings, ...values);
}
