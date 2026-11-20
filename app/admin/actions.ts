"use server";

import { updateTag } from "next/cache";
import { getSession } from "@/lib/auth/session";
import {
  deletePropertyRow,
  getPropertyById,
  insertProperty,
  patchProperty,
  PROPERTIES_TAG,
  updatePropertyRow,
} from "@/lib/data/properties";
import { updateLeadStatus, type LeadTable } from "@/lib/data/leads";
import {
  createUploadTickets,
  folderFor,
  removePhotosByUrl,
  type UploadTicket,
} from "@/lib/data/photos";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { parsePropertyInput } from "@/lib/validation";
import { canDeleteProperty, canEditProperty } from "@/lib/admin-permissions";
import {
  ALLOWED_PHOTO_TYPES,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS,
  storagePathFromUrl,
} from "@/lib/photos";
import {
  LEAD_STATUSES,
  PROPERTY_STATUSES,
  type LeadStatus,
  type PropertyStatus,
} from "@/lib/types";

type ActionResult<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const UUID_RE = /^[0-9a-f-]{36}$/i;
const SESSION_EXPIRED = "Tu sesión venció. Volvé a ingresar.";
const GENERIC_ERROR = "No pudimos guardar los cambios. Probá de nuevo en un rato.";

/** La web pública se actualiza en la próxima visita, sin volver a publicar. */
function refreshPublicSite() {
  updateTag(PROPERTIES_TAG);
}

// ---------------------------------------------------------------------------
// Propiedades
// ---------------------------------------------------------------------------

export async function savePropertyAction(
  id: string | null,
  raw: Record<string, unknown>
): Promise<ActionResult<{ id: string; slug: string }>> {
  const session = await getSession();
  if (!session) return { ok: false, error: SESSION_EXPIRED };
  if (!raw || typeof raw !== "object") return { ok: false, error: "Datos inválidos." };

  const parsed = parsePropertyInput(raw);
  if (!parsed.ok) return parsed;
  const input = parsed.data;

  try {
    const existing = id && UUID_RE.test(id) ? await getPropertyById(id) : null;
    if (id && !existing) return { ok: false, error: "Esa propiedad ya no existe." };
    if (existing && !canEditProperty(session.role, existing)) {
      return {
        ok: false,
        error: "En la demo no se pueden editar las propiedades que cargó la inmobiliaria.",
      };
    }

    // Las fotos nuevas tienen que ser de la carpeta del usuario (el demo no
    // puede reutilizar fotos del dueño).
    const folder = folderFor(session.role);
    const previous = new Set(existing?.images ?? []);
    const foreign = input.images.some((url) => {
      if (previous.has(url)) return false;
      const path = storagePathFromUrl(url);
      return path !== null && !path.startsWith(`${folder}/`);
    });
    if (foreign) return { ok: false, error: "Hay una foto que no es válida." };

    const saved = existing
      ? await updatePropertyRow(existing.id, input)
      : await insertProperty(input, session.role === "demo" ? "demo" : "owner");

    // Fotos que se sacaron de la propiedad: se borran del bucket.
    if (existing) {
      const removed = existing.images.filter((url) => !input.images.includes(url));
      await removePhotosByUrl(removed, session.role === "demo" ? "demo" : undefined);
    }

    refreshPublicSite();
    return { ok: true, id: saved.id, slug: saved.slug };
  } catch (error) {
    console.error("savePropertyAction:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

export async function deletePropertyAction(id: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: SESSION_EXPIRED };
  if (!UUID_RE.test(id)) return { ok: false, error: "Propiedad inválida." };

  try {
    const existing = await getPropertyById(id);
    if (!existing) return { ok: true };
    if (!canDeleteProperty(session.role, existing)) {
      return {
        ok: false,
        error: existing.isSeed
          ? "En la demo las propiedades originales no se pueden borrar (sí editar)."
          : "En la demo solo podés borrar las propiedades que cargaste vos.",
      };
    }
    await deletePropertyRow(id);
    await removePhotosByUrl(existing.images, session.role === "demo" ? "demo" : undefined);
    refreshPublicSite();
    return { ok: true };
  } catch (error) {
    console.error("deletePropertyAction:", error);
    return { ok: false, error: "No pudimos borrar la propiedad." };
  }
}

export async function setPropertyStatusAction(
  id: string,
  status: PropertyStatus
): Promise<ActionResult> {
  return quickPatch(id, () =>
    PROPERTY_STATUSES.includes(status) ? { status } : null
  );
}

export async function setPropertyFeaturedAction(
  id: string,
  featured: boolean
): Promise<ActionResult> {
  return quickPatch(id, () => ({ featured: featured === true }));
}

async function quickPatch(
  id: string,
  build: () => { status?: PropertyStatus; featured?: boolean } | null
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: SESSION_EXPIRED };
  const patch = build();
  if (!UUID_RE.test(id) || !patch) return { ok: false, error: "Datos inválidos." };
  try {
    const existing = await getPropertyById(id);
    if (!existing) return { ok: false, error: "Esa propiedad ya no existe." };
    if (!canEditProperty(session.role, existing)) {
      return {
        ok: false,
        error: "En la demo no se pueden editar las propiedades que cargó la inmobiliaria.",
      };
    }
    await patchProperty(id, patch);
    refreshPublicSite();
    return { ok: true };
  } catch (error) {
    console.error("quickPatch:", error);
    return { ok: false, error: GENERIC_ERROR };
  }
}

// ---------------------------------------------------------------------------
// Fotos
// ---------------------------------------------------------------------------

/**
 * Pide URLs firmadas para subir fotos directo a Supabase Storage.
 * `currentCount` es cuántas fotos ya tiene la propiedad en el formulario.
 */
export async function requestPhotoUploadsAction(
  currentCount: number,
  files: { type: string; size: number }[]
): Promise<ActionResult<{ tickets: UploadTicket[] }>> {
  const session = await getSession();
  if (!session) return { ok: false, error: SESSION_EXPIRED };

  if (!Array.isArray(files) || files.length === 0) {
    return { ok: false, error: "No hay fotos para subir." };
  }
  const count = Number.isInteger(currentCount) && currentCount >= 0 ? currentCount : 0;
  if (count + files.length > MAX_PHOTOS) {
    return { ok: false, error: `Máximo ${MAX_PHOTOS} fotos por propiedad.` };
  }
  for (const f of files) {
    if (!ALLOWED_PHOTO_TYPES.includes(f?.type)) {
      return { ok: false, error: "Solo se pueden subir imágenes JPG, PNG o WebP." };
    }
    if (typeof f.size !== "number" || f.size <= 0 || f.size > MAX_PHOTO_BYTES) {
      return { ok: false, error: "Cada foto puede pesar hasta 5 MB." };
    }
  }

  try {
    const tickets = await createUploadTickets(
      session.role,
      files.map((f) => f.type)
    );
    return { ok: true, tickets };
  } catch (error) {
    console.error("requestPhotoUploadsAction:", error);
    return { ok: false, error: "No pudimos preparar la subida de fotos." };
  }
}

/**
 * Borra una foto que se subió en el formulario y se sacó antes de guardar.
 * Solo borra fotos de la carpeta del usuario que no use ninguna propiedad.
 */
export async function discardUploadedPhotoAction(url: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: SESSION_EXPIRED };
  const path = typeof url === "string" ? storagePathFromUrl(url) : null;
  if (!path || !path.startsWith(`${folderFor(session.role)}/`)) return { ok: true };

  try {
    const { count } = await getSupabaseAdmin()
      .from("properties")
      .select("id", { count: "exact", head: true })
      .contains("images", [url]);
    if ((count ?? 0) === 0) await removePhotosByUrl([url]);
    return { ok: true };
  } catch (error) {
    console.error("discardUploadedPhotoAction:", error);
    return { ok: true };
  }
}

// ---------------------------------------------------------------------------
// Consultas, tasaciones y visitas
// ---------------------------------------------------------------------------

const LEAD_TABLES: LeadTable[] = ["contacts", "appraisals", "visits"];

export async function setLeadStatusAction(
  table: LeadTable,
  id: string,
  status: LeadStatus
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: SESSION_EXPIRED };
  if (!LEAD_TABLES.includes(table) || !UUID_RE.test(id) || !LEAD_STATUSES.includes(status)) {
    return { ok: false, error: "Datos inválidos." };
  }
  try {
    await updateLeadStatus(table, id, status);
    return { ok: true };
  } catch (error) {
    console.error("setLeadStatusAction:", error);
    return { ok: false, error: "No pudimos cambiar el estado." };
  }
}
