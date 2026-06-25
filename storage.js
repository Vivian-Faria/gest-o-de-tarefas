// Supabase Storage — apenas para fotos de evidência
// Banco de dados principal: Neon
import { createClient } from "@supabase/supabase-js";

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL;
const STORAGE_KEY = import.meta.env.VITE_STORAGE_KEY;
const BUCKET = "fotos-execucoes";

const storageClient = createClient(STORAGE_URL, STORAGE_KEY);

// Upload de foto — retorna URL pública
export async function uploadFoto(base64, execId) {
  try {
    // Converte base64 para blob
    const base64Data = base64.split(",")[1] || base64;
    const mimeType   = base64.startsWith("data:image/png") ? "image/png" : "image/jpeg";
    const byteString = atob(base64Data);
    const bytes      = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      bytes[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    const ext  = mimeType === "image/png" ? "png" : "jpg";
    const path = `${execId}.${ext}`;

    const { error } = await storageClient.storage
      .from(BUCKET)
      .upload(path, blob, { upsert: true, contentType: mimeType });

    if (error) throw error;

    const { data } = storageClient.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch(e) {
    console.error("[storage] uploadFoto error:", e.message);
    return null;
  }
}

// Busca URL pública da foto
export async function getFotoUrl(execId) {
  try {
    // Tenta jpg primeiro, depois png
    const { data } = storageClient.storage.from(BUCKET).getPublicUrl(`${execId}.jpg`);
    return data.publicUrl;
  } catch(e) {
    return null;
  }
}

// Apaga fotos com mais de 15 dias
export async function limparFotosAntigas() {
  try {
    const { data: files } = await storageClient.storage.from(BUCKET).list();
    if (!files) return;
    const cutoff = Date.now() - 15 * 24 * 60 * 60 * 1000;
    const antigas = files.filter(f => new Date(f.created_at).getTime() < cutoff);
    if (antigas.length > 0) {
      await storageClient.storage.from(BUCKET).remove(antigas.map(f => f.name));
      console.log(`[storage] ${antigas.length} fotos antigas removidas`);
    }
  } catch(e) {
    console.error("[storage] limparFotosAntigas error:", e.message);
  }
}
