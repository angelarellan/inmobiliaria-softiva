"use client";

import { FormEvent, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2, Minus, Plus, Star } from "lucide-react";
import {
  CURRENCIES,
  OPERATIONS,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  type Currency,
  type OperationType,
  type Property,
  type PropertyStatus,
  type PropertyType,
} from "@/lib/types";
import { STATUS_LABELS } from "@/lib/format";
import { savePropertyAction } from "@/app/admin/actions";
import PhotoUploader, { photoItemsFrom, type PhotoItem } from "./PhotoUploader";

const AMENITY_SUGGESTIONS = [
  "Pileta",
  "Parrilla",
  "Cochera",
  "Balcón",
  "Terraza",
  "Jardín",
  "Gimnasio",
  "SUM",
  "Seguridad 24hs",
  "Laundry",
  "Baulera",
  "Amoblado",
  "Apto profesional",
  "Apto crédito",
  "Aire acondicionado",
  "Calefacción central",
];

interface FormState {
  title: string;
  operation: OperationType;
  type: PropertyType;
  currency: Currency;
  price: string;
  neighborhood: string;
  city: string;
  address: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  shortDescription: string;
  description: string;
  amenities: string[];
  featured: boolean;
  status: PropertyStatus;
}

function initialState(p: Property | null): FormState {
  return {
    title: p?.title ?? "",
    operation: p?.operation ?? "Venta",
    type: p?.type ?? "Departamento",
    currency: p?.currency ?? "USD",
    price: p ? String(p.price) : "",
    neighborhood: p?.neighborhood ?? "",
    city: p?.city ?? "Buenos Aires",
    address: p?.address ?? "",
    area: p ? String(p.area) : "",
    bedrooms: p?.bedrooms ?? 2,
    bathrooms: p?.bathrooms ?? 1,
    parking: p?.parking ?? 0,
    shortDescription: p?.shortDescription ?? "",
    description: p?.description ?? "",
    amenities: p?.amenities ?? [],
    featured: p?.featured ?? false,
    status: p?.status ?? "publicada",
  };
}

const inputClass =
  "w-full rounded-lg border border-slate/15 bg-white px-4 py-3 text-base text-slate focus:border-gold focus:outline-none sm:text-sm";

interface Props {
  property: Property | null;
  neighborhoods: string[];
}

export default function PropertyForm({ property, neighborhoods }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => initialState(property));
  const [photos, setPhotos] = useState<PhotoItem[]>(() =>
    photoItemsFrom(property?.images ?? [])
  );
  const [customAmenity, setCustomAmenity] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const uploading = photos.some((p) => p.status === "uploading");
  const readyPhotos = photos.filter((p) => p.status === "done" && p.url);

  const toggleAmenity = (a: string) =>
    set(
      "amenities",
      form.amenities.includes(a)
        ? form.amenities.filter((x) => x !== a)
        : [...form.amenities, a]
    );

  const addCustomAmenity = () => {
    const value = customAmenity.replace(/\s+/g, " ").trim();
    if (!value) return;
    if (!form.amenities.some((a) => a.toLowerCase() === value.toLowerCase())) {
      set("amenities", [...form.amenities, value]);
    }
    setCustomAmenity("");
  };

  const showError = (message: string) => {
    setError(message);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (uploading) return showError("Esperá a que terminen de subirse las fotos.");
    if (readyPhotos.length === 0) return showError("Subí al menos una foto.");
    if (photos.some((p) => p.status === "error"))
      return showError("Sacá las fotos que no se pudieron subir (marcadas en rojo).");
    if (form.title.trim().length < 3) return showError("Poné un título.");
    if (!Number(form.price)) return showError("Poné el precio.");
    if (form.neighborhood.trim().length < 2) return showError("Indicá el barrio.");

    startSaving(async () => {
      const result = await savePropertyAction(property?.id ?? null, {
        ...form,
        price: Number(form.price),
        area: Number(form.area.replace(",", ".") || 0),
        images: readyPhotos.map((p) => p.url),
      });
      if (!result.ok) {
        showError(result.error);
        return;
      }
      router.push(`/admin/dashboard?tab=propiedades&guardada=${result.slug}`);
    });
  };

  const priceDisplay = form.price
    ? new Intl.NumberFormat("es-AR").format(Number(form.price))
    : "";

  return (
    <form onSubmit={handleSubmit} className="pb-28">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/admin/dashboard?tab=propiedades"
          aria-label="Volver"
          className="rounded-full p-2 text-slate/60 ring-1 ring-slate/10 transition-colors hover:text-emerald"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-serif-display text-2xl text-slate sm:text-3xl">
          {property ? "Editar propiedad" : "Nueva propiedad"}
        </h1>
      </div>

      {error && (
        <p
          role="alert"
          className="mb-5 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-200"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="space-y-5">
        <Section title="Fotos">
          <PhotoUploader items={photos} setItems={setPhotos} />
        </Section>

        <Section title="Datos principales">
          <div className="space-y-4">
            <Field label="Operación">
              <Segmented
                options={OPERATIONS.map((o) => ({ value: o, label: o }))}
                value={form.operation}
                onChange={(v) => set("operation", v)}
              />
            </Field>

            <Field label="Tipo">
              <div className="flex flex-wrap gap-2">
                {PROPERTY_TYPES.map((t) => (
                  <Chip key={t} active={form.type === t} onClick={() => set("type", t)}>
                    {t}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field label="Título" htmlFor="title">
              <input
                id="title"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                maxLength={160}
                placeholder="Ej: Departamento de 3 ambientes con balcón en Palermo"
                className={inputClass}
              />
            </Field>

            <Field
              label={form.operation === "Alquiler" ? "Precio por mes" : "Precio"}
              htmlFor="price"
            >
              <div className="flex gap-2">
                <Segmented
                  options={CURRENCIES.map((c) => ({
                    value: c,
                    label: c === "USD" ? "US$" : "AR$",
                  }))}
                  value={form.currency}
                  onChange={(v) => set("currency", v)}
                  compact
                />
                <input
                  id="price"
                  inputMode="numeric"
                  value={priceDisplay}
                  onChange={(e) => set("price", e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Barrio" htmlFor="neighborhood">
                <input
                  id="neighborhood"
                  list="neighborhood-options"
                  value={form.neighborhood}
                  onChange={(e) => set("neighborhood", e.target.value)}
                  maxLength={80}
                  placeholder="Ej: Palermo"
                  className={inputClass}
                />
                <datalist id="neighborhood-options">
                  {neighborhoods.map((n) => (
                    <option key={n} value={n} />
                  ))}
                </datalist>
              </Field>
              <Field label="Ciudad" htmlFor="city">
                <input
                  id="city"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  maxLength={80}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Dirección (opcional)" htmlFor="address">
              <input
                id="address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                maxLength={160}
                placeholder="Calle y altura"
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        <Section title="Características">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Superficie (m²)" htmlFor="area">
              <input
                id="area"
                inputMode="decimal"
                value={form.area}
                onChange={(e) => set("area", e.target.value.replace(/[^\d.,]/g, "").slice(0, 9))}
                placeholder="Ej: 85"
                className={inputClass}
              />
            </Field>
            <Stepper label="Dormitorios" value={form.bedrooms} onChange={(v) => set("bedrooms", v)} />
            <Stepper label="Baños" value={form.bathrooms} onChange={(v) => set("bathrooms", v)} />
            <Stepper label="Cocheras" value={form.parking} onChange={(v) => set("parking", v)} />
          </div>
        </Section>

        <Section title="Descripción">
          <div className="space-y-4">
            <Field label="Descripción" htmlFor="description">
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={5}
                maxLength={5000}
                placeholder="Contá cómo es la propiedad, qué la hace especial y qué hay cerca."
                className={`${inputClass} resize-y`}
              />
            </Field>
            <Field
              label="Resumen para las tarjetas (opcional)"
              htmlFor="shortDescription"
              hint="Si lo dejás vacío, lo armamos con el comienzo de la descripción."
            >
              <input
                id="shortDescription"
                value={form.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
                maxLength={300}
                className={inputClass}
              />
            </Field>
          </div>
        </Section>

        <Section title="Comodidades">
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set([...AMENITY_SUGGESTIONS, ...form.amenities])).map((a) => (
              <Chip key={a} active={form.amenities.includes(a)} onClick={() => toggleAmenity(a)}>
                {a}
              </Chip>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <label htmlFor="custom-amenity" className="sr-only">
              Otra comodidad
            </label>
            <input
              id="custom-amenity"
              value={customAmenity}
              onChange={(e) => setCustomAmenity(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addCustomAmenity();
                }
              }}
              maxLength={60}
              placeholder="Agregar otra…"
              className={inputClass}
            />
            <button
              type="button"
              onClick={addCustomAmenity}
              className="shrink-0 rounded-lg px-4 text-sm font-semibold text-emerald ring-1 ring-emerald/25 hover:bg-emerald/5"
            >
              Agregar
            </button>
          </div>
        </Section>

        <Section title="Publicación">
          <div className="space-y-4">
            <Field label="Estado">
              <Segmented
                options={PROPERTY_STATUSES.map((s) => ({ value: s, label: STATUS_LABELS[s] }))}
                value={form.status}
                onChange={(v) => set("status", v)}
                wrap
              />
            </Field>
            <button
              type="button"
              onClick={() => set("featured", !form.featured)}
              aria-pressed={form.featured}
              className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm ring-1 transition-colors ${
                form.featured ? "bg-gold/10 ring-gold/40" : "bg-white ring-slate/15"
              }`}
            >
              <span className="flex items-center gap-2 font-medium text-slate">
                <Star size={18} className={form.featured ? "fill-gold text-gold" : "text-slate/40"} />
                Propiedad destacada
              </span>
              <span
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  form.featured ? "bg-emerald" : "bg-slate/20"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    form.featured ? "left-[1.375rem]" : "left-0.5"
                  }`}
                />
              </span>
            </button>
          </div>
        </Section>
      </div>

      {/* Barra de guardado: queda fija abajo, cómoda para el pulgar en el celular */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate/10 bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          <Link
            href="/admin/dashboard?tab=propiedades"
            className="rounded-full px-4 py-3 text-sm font-medium text-slate/60 hover:text-emerald"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald px-6 py-3.5 text-sm font-semibold text-warm-white transition-colors hover:bg-emerald-light disabled:opacity-60"
          >
            {(saving || uploading) && <Loader2 size={18} className="animate-spin" />}
            {uploading
              ? "Subiendo fotos…"
              : saving
                ? "Guardando…"
                : property
                  ? "Guardar cambios"
                  : "Publicar propiedad"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate/10 sm:p-6">
      <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate/50">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="text-sm font-medium text-slate">
          {label}
        </label>
      ) : (
        <span className="text-sm font-medium text-slate">{label}</span>
      )}
      {children}
      {hint && <span className="text-xs text-slate/50">{hint}</span>}
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  compact,
  wrap,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  compact?: boolean;
  /** En celular se acomoda en dos columnas. */
  wrap?: boolean;
}) {
  return (
    <div
      className={`shrink-0 rounded-lg bg-warm-white p-1 ring-1 ring-slate/10 ${
        wrap ? "grid grid-cols-2 gap-1 sm:flex" : "flex"
      } ${compact ? "" : "w-full"}`}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            value === o.value ? "bg-emerald text-warm-white shadow-sm" : "text-slate/70 hover:text-emerald"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full px-3.5 py-2 text-sm transition-colors ${
        active
          ? "bg-emerald text-warm-white"
          : "bg-warm-white text-slate/70 ring-1 ring-slate/15 hover:text-emerald"
      }`}
    >
      {children}
    </button>
  );
}

function Stepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-slate">{label}</span>
      <div className="flex items-center justify-between rounded-lg border border-slate/15 bg-white p-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label={`Menos ${label.toLowerCase()}`}
          className="rounded-md p-2.5 text-emerald hover:bg-warm-white"
        >
          <Minus size={16} />
        </button>
        <span className="min-w-8 text-center text-base font-semibold text-slate" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(50, value + 1))}
          aria-label={`Más ${label.toLowerCase()}`}
          className="rounded-md p-2.5 text-emerald hover:bg-warm-white"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
