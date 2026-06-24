// Cliente Neon — banco de dados principal
// Supabase continua sendo usado APENAS para autenticação
import { neon } from "@neondatabase/serverless";

const sql = neon(import.meta.env.VITE_NEON_URL);
export default sql;
