import type { Property } from "./types";
import { propertyUrl } from "./site";

/** Mensaje precargado para consultar por una propiedad (incluye título y link). */
export function propertyInquiryMessage(
  p: Pick<Property, "title" | "neighborhood" | "slug">
) {
  return `Hola AURA Bienes Raíces, quisiera más información sobre "${p.title}" (${p.neighborhood}). ¿Podrían asesorarme?\n${propertyUrl(p.slug)}`;
}

/** Texto para compartir una propiedad con otra persona. */
export function propertyShareText(p: Pick<Property, "title" | "slug">) {
  return `Mirá esta propiedad: ${p.title}\n${propertyUrl(p.slug)}`;
}
