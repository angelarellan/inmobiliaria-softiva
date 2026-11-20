import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/** Bloquea el ingreso tras 5 intentos fallidos desde la misma IP en 15 minutos. */
export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_WINDOW_MINUTES = 15;

export function clientIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim().slice(0, 100);
  return (headers.get("x-real-ip") ?? "desconocida").slice(0, 100);
}

function windowStart() {
  return new Date(Date.now() - LOCK_WINDOW_MINUTES * 60 * 1000).toISOString();
}

export async function isLoginLocked(ip: string) {
  try {
    const { count, error } = await getSupabaseAdmin()
      .from("login_attempts")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .eq("success", false)
      .gte("created_at", windowStart());
    if (error) throw error;
    return (count ?? 0) >= MAX_FAILED_ATTEMPTS;
  } catch (error) {
    console.error("No se pudo consultar los intentos de ingreso:", error);
    return false;
  }
}

export async function recordLoginAttempt(
  ip: string,
  username: string,
  success: boolean
) {
  try {
    const supabase = getSupabaseAdmin();
    await supabase
      .from("login_attempts")
      .insert({ ip, username: username.slice(0, 120), success });
    if (success) {
      // Ingreso correcto: se perdonan los fallos anteriores de esa IP.
      await supabase
        .from("login_attempts")
        .delete()
        .eq("ip", ip)
        .eq("success", false);
    }
  } catch (error) {
    console.error("No se pudo registrar el intento de ingreso:", error);
  }
}
