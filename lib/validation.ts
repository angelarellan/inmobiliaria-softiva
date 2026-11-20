import "server-only";
import {
  CURRENCIES,
  OPERATIONS,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  type Currency,
  type OperationType,
  type PropertyStatus,
  type PropertyType,
} from "@/lib/types";
import type { PropertyInput } from "@/lib/data/properties";
import { isAllowedImageUrl, MAX_PHOTOS } from "@/lib/photos";
import { isValidVisitSlot } from "@/lib/visit-options";

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };

type Raw = Record<string, unknown>;

function str(raw: Raw, key: string, max: number) {
  const v = raw[key];
  if (typeof v !== "string") return "";
  return v.replace(/\s+/g, " ").trim().slice(0, max);
}

function text(raw: Raw, key: string, max: number) {
  const v = raw[key];
  if (typeof v !== "string") return "";
  return v.replace(/\r\n/g, "\n").trim().slice(0, max);
}

function int(raw: Raw, key: string, min: number, max: number) {
  const v = raw[key];
  const n = typeof v === "number" ? v : Number(String(v ?? "").replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(n)) return null;
  const r = Math.round(n);
  return r < min || r > max ? null : r;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function phoneDigits(phone: string) {
  return phone.replace(/\D/g, "").length;
}

/** Campo trampa: los humanos no lo ven, los bots lo completan. */
export function isSpam(raw: Raw) {
  const trap = raw["website"];
  return typeof trap === "string" && trap.trim().length > 0;
}

// ---------------------------------------------------------------------------
// Formularios públicos
// ---------------------------------------------------------------------------

export function parseContact(raw: Raw) {
  const name = str(raw, "name", 120);
  const email = str(raw, "email", 200);
  const phone = str(raw, "phone", 40);
  const message = text(raw, "message", 3000);
  const propertyId = str(raw, "propertyId", 60);
  const propertyTitle = str(raw, "propertyTitle", 160);

  if (name.length < 2) return fail("Contanos tu nombre.");
  if (!EMAIL_RE.test(email)) return fail("Revisá el email.");
  if (phone && phoneDigits(phone) < 6) return fail("Revisá el teléfono.");
  if (message.length < 2) return fail("Escribinos tu mensaje.");

  return ok({
    name,
    email,
    phone,
    message,
    propertyId: /^[0-9a-f-]{36}$/i.test(propertyId) ? propertyId : undefined,
    propertyTitle: propertyTitle || undefined,
  });
}

export function parseAppraisal(raw: Raw) {
  const name = str(raw, "name", 120);
  const email = str(raw, "email", 200);
  const phone = str(raw, "phone", 40);
  const propertyType = str(raw, "propertyType", 40);
  const address = str(raw, "address", 200);
  const area = str(raw, "area", 40);
  const comments = text(raw, "comments", 3000);

  if (name.length < 2) return fail("Contanos tu nombre.");
  if (phoneDigits(phone) < 6) return fail("Revisá el teléfono.");
  if (!EMAIL_RE.test(email)) return fail("Revisá el email.");
  if (address.length < 3) return fail("Indicá la dirección de la propiedad.");

  return ok({
    name,
    email,
    phone,
    propertyType: (PROPERTY_TYPES as string[]).includes(propertyType)
      ? propertyType
      : "Otro",
    address,
    area,
    comments,
  });
}

export function parseVisit(raw: Raw) {
  const propertyId = str(raw, "propertyId", 60);
  const visitDate = str(raw, "visitDate", 10);
  const timeSlot = str(raw, "timeSlot", 60);
  const name = str(raw, "name", 120);
  const phone = str(raw, "phone", 40);
  const operation = str(raw, "operation", 20);
  const zone = str(raw, "zone", 80);
  const budget = str(raw, "budget", 80);

  if (!/^[0-9a-f-]{36}$/i.test(propertyId)) return fail("Elegí una propiedad.");
  if (!isValidVisitSlot(visitDate, timeSlot))
    return fail("Elegí un día y un horario disponibles.");
  if (name.length < 2) return fail("Contanos tu nombre.");
  if (phoneDigits(phone) < 8) return fail("Revisá el teléfono.");

  return ok({
    propertyId,
    visitDate,
    timeSlot,
    name,
    phone,
    operation: operation || undefined,
    zone: zone || undefined,
    budget: budget || undefined,
  });
}

// ---------------------------------------------------------------------------
// Propiedades (panel)
// ---------------------------------------------------------------------------

function oneOf<T extends string>(value: unknown, options: readonly T[]) {
  return typeof value === "string" && (options as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

function autoShortDescription(description: string) {
  const firstSentence = description.split(/(?<=[.!?])\s/)[0] ?? "";
  const base = firstSentence.length >= 40 ? firstSentence : description;
  return base.length > 160 ? `${base.slice(0, 157).trimEnd()}…` : base;
}

export function parsePropertyInput(raw: Raw): Result<PropertyInput> {
  const title = str(raw, "title", 160);
  const operation = oneOf<OperationType>(raw.operation, OPERATIONS);
  const type = oneOf<PropertyType>(raw.type, PROPERTY_TYPES);
  const currency = oneOf<Currency>(raw.currency, CURRENCIES);
  const status = oneOf<PropertyStatus>(raw.status, PROPERTY_STATUSES);
  const price = int(raw, "price", 0, 100_000_000_000);
  const neighborhood = str(raw, "neighborhood", 80);
  const city = str(raw, "city", 80) || "Buenos Aires";
  const address = str(raw, "address", 160);
  const areaRaw = Number(String(raw.area ?? "0").replace(",", "."));
  const area = Number.isFinite(areaRaw) && areaRaw >= 0 && areaRaw <= 1_000_000 ? Math.round(areaRaw * 100) / 100 : null;
  const bedrooms = int(raw, "bedrooms", 0, 50);
  const bathrooms = int(raw, "bathrooms", 0, 50);
  const parking = int(raw, "parking", 0, 50);
  const description = text(raw, "description", 5000);
  let shortDescription = str(raw, "shortDescription", 300);

  if (title.length < 3) return fail("Poné un título (mínimo 3 letras).");
  if (!operation) return fail("Elegí si es venta o alquiler.");
  if (!type) return fail("Elegí el tipo de propiedad.");
  if (!currency) return fail("Elegí la moneda.");
  if (price === null || price <= 0) return fail("Poné un precio válido.");
  if (neighborhood.length < 2) return fail("Indicá el barrio.");
  if (area === null) return fail("Revisá los m².");
  if (bedrooms === null || bathrooms === null || parking === null)
    return fail("Revisá dormitorios, baños y cocheras.");
  if (!status) return fail("Elegí el estado.");

  const images = Array.isArray(raw.images)
    ? raw.images.filter((u): u is string => typeof u === "string")
    : [];
  if (images.length === 0) return fail("Subí al menos una foto.");
  if (images.length > MAX_PHOTOS) return fail(`Máximo ${MAX_PHOTOS} fotos por propiedad.`);
  if (new Set(images).size !== images.length) return fail("Hay fotos repetidas.");
  if (!images.every(isAllowedImageUrl)) return fail("Hay una foto que no es válida.");

  const amenities = Array.isArray(raw.amenities)
    ? Array.from(
        new Set(
          raw.amenities
            .filter((a): a is string => typeof a === "string")
            .map((a) => a.replace(/\s+/g, " ").trim().slice(0, 60))
            .filter(Boolean)
        )
      ).slice(0, 30)
    : [];

  if (!shortDescription && description) {
    shortDescription = autoShortDescription(description.replace(/\s+/g, " "));
  }

  return ok({
    title,
    operation,
    type,
    currency,
    price,
    priceSuffix: operation === "Alquiler" ? "/mes" : null,
    neighborhood,
    city,
    address,
    area,
    bedrooms,
    bathrooms,
    parking,
    images,
    shortDescription,
    description,
    amenities,
    featured: raw.featured === true,
    status,
  });
}

function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

function fail(error: string): { ok: false; error: string } {
  return { ok: false, error };
}
