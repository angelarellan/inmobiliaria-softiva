/**
 * Reglas para las fotos de las propiedades (las usan el panel y el servidor).
 */

export const PHOTO_BUCKET_NAME = "propiedades";
export const MAX_PHOTOS = 8;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

const STORAGE_PUBLIC_PREFIX = `/storage/v1/object/public/${PHOTO_BUCKET_NAME}/`;

function supabaseHost() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").host;
  } catch {
    return null;
  }
}

/**
 * Solo se aceptan fotos de nuestro bucket de Supabase o de Unsplash (las de
 * las propiedades originales). Evita que se guarden links a cualquier sitio.
 */
export function isAllowedImageUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    if (url.hostname === "images.unsplash.com") return true;
    const host = supabaseHost();
    return (
      !!host &&
      url.host === host &&
      url.pathname.startsWith(STORAGE_PUBLIC_PREFIX) &&
      !url.pathname.includes("..")
    );
  } catch {
    return false;
  }
}

/** Ruta dentro del bucket ("demo/abc.jpg") a partir de la URL pública. */
export function storagePathFromUrl(value: string) {
  try {
    const url = new URL(value);
    const host = supabaseHost();
    if (!host || url.host !== host) return null;
    if (!url.pathname.startsWith(STORAGE_PUBLIC_PREFIX)) return null;
    const path = decodeURIComponent(
      url.pathname.slice(STORAGE_PUBLIC_PREFIX.length)
    );
    return path && !path.includes("..") ? path : null;
  } catch {
    return null;
  }
}
