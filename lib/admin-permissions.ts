import type { AdminRole, Property } from "./types";

/**
 * Qué puede hacer cada usuario del panel con una propiedad.
 * · Dueño: todo.
 * · Demo: edita las originales (se restauran cada noche) y las que cargó él;
 *   borra solo las que cargó él. Las que cargó el dueño son de solo lectura.
 */
export function canEditProperty(role: AdminRole, p: Pick<Property, "isSeed" | "createdBy">) {
  if (role === "owner") return true;
  return p.isSeed || p.createdBy === "demo";
}

export function canDeleteProperty(role: AdminRole, p: Pick<Property, "isSeed" | "createdBy">) {
  if (role === "owner") return true;
  return !p.isSeed && p.createdBy === "demo";
}
