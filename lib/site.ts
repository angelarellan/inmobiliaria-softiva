import type { Property } from "./types";

/**
 * URL pública del sitio (NEXT_PUBLIC_SITE_URL), sin barra final.
 * Se usa en canonical, Open Graph, sitemap, robots y en los links que se
 * comparten por WhatsApp.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/+$/, "");

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function propertyPath(slug: string) {
  return `/propiedades/${slug}`;
}

export function propertyUrl(slug: string) {
  return absoluteUrl(propertyPath(slug));
}

/**
 * Imagen para la vista previa al compartir (WhatsApp, Instagram, Facebook).
 * Las fotos de Unsplash se piden en JPG 1200×630, que es lo que mejor
 * muestran esas apps. Las fotos subidas ya se comprimen a JPG al cargarlas.
 */
export function shareImageUrl(src: string | undefined) {
  if (!src) return undefined;
  try {
    const url = new URL(src);
    if (url.hostname === "images.unsplash.com") {
      url.searchParams.delete("auto");
      url.searchParams.set("fm", "jpg");
      url.searchParams.set("fit", "crop");
      url.searchParams.set("w", "1200");
      url.searchParams.set("h", "630");
      url.searchParams.set("q", "75");
      return url.toString();
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

export function coverImage(p: Pick<Property, "images">) {
  return p.images[0] ?? null;
}
