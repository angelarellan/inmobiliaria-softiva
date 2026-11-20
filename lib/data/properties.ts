import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { coverImage } from "@/lib/site";
import { slugify } from "@/lib/format";
import type {
  Currency,
  OperationType,
  Property,
  PropertyOrigin,
  PropertyStatus,
  PropertySummary,
  PropertyType,
} from "@/lib/types";

/**
 * Etiqueta de caché de las propiedades. Cada alta, edición o baja la invalida
 * (updateTag / revalidateTag) y la home, el buscador y las fichas se
 * actualizan sin volver a publicar.
 */
export const PROPERTIES_TAG = "properties";

interface PropertyRow {
  id: string;
  slug: string;
  title: string;
  operation: OperationType;
  type: PropertyType;
  currency: Currency;
  price: number | string;
  price_suffix: string | null;
  neighborhood: string;
  city: string;
  address: string;
  area: number | string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  images: string[] | null;
  short_description: string;
  description: string;
  amenities: string[] | null;
  featured: boolean;
  status: PropertyStatus;
  position: number;
  is_seed: boolean;
  created_by: PropertyOrigin;
  created_at: string;
  updated_at: string;
}

export interface PropertyInput {
  title: string;
  operation: OperationType;
  type: PropertyType;
  currency: Currency;
  price: number;
  priceSuffix: string | null;
  neighborhood: string;
  city: string;
  address: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  images: string[];
  shortDescription: string;
  description: string;
  amenities: string[];
  featured: boolean;
  status: PropertyStatus;
}

function rowToProperty(r: PropertyRow): Property {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    operation: r.operation,
    type: r.type,
    currency: r.currency,
    price: Number(r.price),
    priceSuffix: r.price_suffix ?? undefined,
    neighborhood: r.neighborhood,
    city: r.city,
    address: r.address,
    area: Number(r.area),
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    parking: r.parking,
    images: r.images ?? [],
    shortDescription: r.short_description,
    description: r.description,
    amenities: r.amenities ?? [],
    featured: r.featured,
    status: r.status,
    position: r.position,
    isSeed: r.is_seed,
    createdBy: r.created_by,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function inputToRow(input: PropertyInput) {
  return {
    title: input.title,
    operation: input.operation,
    type: input.type,
    currency: input.currency,
    price: input.price,
    price_suffix: input.priceSuffix,
    neighborhood: input.neighborhood,
    city: input.city,
    address: input.address,
    area: input.area,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    parking: input.parking,
    images: input.images,
    short_description: input.shortDescription,
    description: input.description,
    amenities: input.amenities,
    featured: input.featured,
    status: input.status,
  };
}

/** Orden del catálogo: disponibles primero, destacadas arriba, después el orden cargado. */
export function sortForCatalog(list: Property[]) {
  return [...list].sort((a, b) => {
    const aOpen = a.status === "publicada" ? 0 : 1;
    const bOpen = b.status === "publicada" ? 0 : 1;
    if (aOpen !== bOpen) return aOpen - bOpen;
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.position !== b.position) return a.position - b.position;
    return b.createdAt.localeCompare(a.createdAt);
  });
}

// ---------------------------------------------------------------------------
// Lecturas públicas (con caché)
// ---------------------------------------------------------------------------

async function fetchVisibleProperties() {
  const { data, error } = await getSupabaseAdmin()
    .from("properties")
    .select("*")
    .neq("status", "pausada")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  // Si falla, se lanza el error: así no queda guardado en caché un catálogo vacío.
  if (error) throw new Error(`Supabase: ${error.message}`);
  return (data as PropertyRow[]).map(rowToProperty);
}

const getVisiblePropertiesCached = unstable_cache(
  fetchVisibleProperties,
  ["visible-properties-v1"],
  { tags: [PROPERTIES_TAG], revalidate: 3600 }
);

/**
 * Propiedades que se ven en la web: publicadas, vendidas y alquiladas.
 * Las pausadas no se muestran.
 */
export const getVisibleProperties = cache(async (): Promise<Property[]> => {
  try {
    return sortForCatalog(await getVisiblePropertiesCached());
  } catch (error) {
    console.error("No se pudieron leer las propiedades:", error);
    return [];
  }
});

export async function getPropertyBySlug(slug: string) {
  const list = await getVisibleProperties();
  return list.find((p) => p.slug === slug) ?? null;
}

export function toSummary(p: Property): PropertySummary {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    operation: p.operation,
    type: p.type,
    currency: p.currency,
    price: p.price,
    priceSuffix: p.priceSuffix,
    neighborhood: p.neighborhood,
    image: coverImage(p),
  };
}

/** Propiedades que se pueden visitar (las ofrece el asistente). */
export async function getVisitableSummaries() {
  const list = await getVisibleProperties();
  return list.filter((p) => p.status === "publicada").map(toSummary);
}

export function pickSimilar(all: Property[], current: Property, count = 3) {
  const candidates = all.filter(
    (p) => p.id !== current.id && p.status === "publicada"
  );
  const score = (p: Property) => {
    let s = 0;
    if (p.operation === current.operation) s += 4;
    if (p.type === current.type) s += 2;
    if (p.neighborhood === current.neighborhood) s += 2;
    if (p.currency === current.currency && current.price > 0) {
      const ratio = Math.abs(p.price - current.price) / current.price;
      s += ratio < 0.3 ? 2 : ratio < 0.6 ? 1 : 0;
    }
    return s;
  };
  return candidates
    .map((p) => ({ p, s: score(p) }))
    .sort((a, b) => b.s - a.s || a.p.position - b.p.position)
    .slice(0, count)
    .map(({ p }) => p);
}

// ---------------------------------------------------------------------------
// Panel (sin caché: siempre datos frescos)
// ---------------------------------------------------------------------------

export async function listAllProperties() {
  const { data, error } = await getSupabaseAdmin()
    .from("properties")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Supabase: ${error.message}`);
  return (data as PropertyRow[]).map(rowToProperty);
}

export async function getPropertyById(id: string) {
  const { data, error } = await getSupabaseAdmin()
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Supabase: ${error.message}`);
  return data ? rowToProperty(data as PropertyRow) : null;
}

export async function listNeighborhoods() {
  const { data, error } = await getSupabaseAdmin()
    .from("properties")
    .select("neighborhood");
  if (error) return [];
  return Array.from(
    new Set((data as { neighborhood: string }[]).map((r) => r.neighborhood))
  ).sort((a, b) => a.localeCompare(b, "es"));
}

async function uniqueSlug(title: string) {
  const base = slugify(title) || "propiedad";
  const { data } = await getSupabaseAdmin()
    .from("properties")
    .select("slug")
    .like("slug", `${base}%`);
  const taken = new Set((data as { slug: string }[] | null)?.map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 500; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function insertProperty(
  input: PropertyInput,
  createdBy: PropertyOrigin
) {
  const supabase = getSupabaseAdmin();
  // Las nuevas van primero en el orden del catálogo.
  const { data: first } = await supabase
    .from("properties")
    .select("position")
    .order("position", { ascending: true })
    .limit(1)
    .maybeSingle();
  const position = ((first as { position: number } | null)?.position ?? 1) - 1;

  const slug = await uniqueSlug(input.title);
  const { data, error } = await supabase
    .from("properties")
    .insert({
      ...inputToRow(input),
      slug,
      position,
      is_seed: false,
      created_by: createdBy,
    })
    .select("*")
    .single();
  if (error) throw new Error(`Supabase: ${error.message}`);
  return rowToProperty(data as PropertyRow);
}

export async function updatePropertyRow(id: string, input: PropertyInput) {
  const { data, error } = await getSupabaseAdmin()
    .from("properties")
    .update(inputToRow(input))
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw new Error(`Supabase: ${error.message}`);
  return rowToProperty(data as PropertyRow);
}

export async function patchProperty(
  id: string,
  patch: Partial<Pick<PropertyRow, "status" | "featured">>
) {
  const { error } = await getSupabaseAdmin()
    .from("properties")
    .update(patch)
    .eq("id", id);
  if (error) throw new Error(`Supabase: ${error.message}`);
}

export async function deletePropertyRow(id: string) {
  const { error } = await getSupabaseAdmin()
    .from("properties")
    .delete()
    .eq("id", id);
  if (error) throw new Error(`Supabase: ${error.message}`);
}
