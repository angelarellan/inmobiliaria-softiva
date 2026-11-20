import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/** Bucket público de Storage donde se guardan las fotos de las propiedades. */
export const PHOTO_BUCKET = "propiedades";

let adminClient: SupabaseClient | null = null;

/**
 * Cliente de Supabase con la secret key. Saltea RLS, así que solo se usa en
 * código de servidor (el import de "server-only" impide que llegue al
 * navegador).
 */
export function getSupabaseAdmin() {
  if (adminClient) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error(
      "Faltan las variables NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY."
    );
  }
  adminClient = createClient(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
  return adminClient;
}
