import "server-only";
import { randomUUID } from "node:crypto";
import { getSupabaseAdmin, PHOTO_BUCKET } from "@/lib/supabase/server";
import { storagePathFromUrl } from "@/lib/photos";
import type { AdminRole } from "@/lib/types";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Carpeta de cada usuario dentro del bucket. El reseteo nocturno borra todo
 * lo que hay en "demo/".
 */
export function folderFor(role: AdminRole) {
  return role === "demo" ? "demo" : "owner";
}

export interface UploadTicket {
  path: string;
  token: string;
  publicUrl: string;
}

/**
 * Genera URLs firmadas para que el navegador suba las fotos directo a
 * Supabase Storage (sin pasar por el servidor de Vercel, que limita el tamaño
 * de los pedidos).
 */
export async function createUploadTickets(role: AdminRole, contentTypes: string[]) {
  const storage = getSupabaseAdmin().storage.from(PHOTO_BUCKET);
  const tickets: UploadTicket[] = [];
  for (const type of contentTypes) {
    const ext = EXTENSIONS[type] ?? "jpg";
    const path = `${folderFor(role)}/${randomUUID()}.${ext}`;
    const { data, error } = await storage.createSignedUploadUrl(path);
    if (error || !data) {
      throw new Error(`Storage: ${error?.message ?? "sin datos"}`);
    }
    const { data: pub } = storage.getPublicUrl(path);
    tickets.push({ path, token: data.token, publicUrl: pub.publicUrl });
  }
  return tickets;
}

/**
 * Borra del bucket las fotos (por URL pública) que ya no se usan. Si
 * `onlyFolder` está definido, solo borra las de esa carpeta.
 */
export async function removePhotosByUrl(urls: string[], onlyFolder?: string) {
  const paths = urls
    .map(storagePathFromUrl)
    .filter((p): p is string => !!p)
    .filter((p) => !onlyFolder || p.startsWith(`${onlyFolder}/`));
  if (paths.length === 0) return 0;
  const { error } = await getSupabaseAdmin().storage.from(PHOTO_BUCKET).remove(paths);
  if (error) {
    console.error("No se pudieron borrar fotos:", error.message);
    return 0;
  }
  return paths.length;
}

/** Borra todas las fotos que subió el usuario demo. */
export async function removeAllDemoPhotos() {
  const storage = getSupabaseAdmin().storage.from(PHOTO_BUCKET);
  let removed = 0;
  // Se listan de a 1000 hasta vaciar la carpeta (máximo 20 vueltas por seguridad).
  for (let round = 0; round < 20; round++) {
    const { data, error } = await storage.list("demo", { limit: 1000 });
    if (error) throw new Error(`Storage: ${error.message}`);
    const paths = (data ?? []).filter((f) => f.name).map((f) => `demo/${f.name}`);
    if (paths.length === 0) break;
    for (let i = 0; i < paths.length; i += 100) {
      const batch = paths.slice(i, i + 100);
      const { error: removeError } = await storage.remove(batch);
      if (removeError) throw new Error(`Storage: ${removeError.message}`);
      removed += batch.length;
    }
    if (paths.length < 1000) break;
  }
  return removed;
}
