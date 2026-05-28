import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.warn(
    "[GestãoOp] Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configuradas.\n" +
    "Copie .env.example para .env e preencha com as chaves do seu projeto Supabase."
  );
}

export const supabase = createClient(url ?? "", key ?? "");
