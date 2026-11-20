"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import type { AdminRole, Property, PropertyStatus } from "@/lib/types";
import { PROPERTY_STATUSES } from "@/lib/types";
import { formatPropertyPrice, STATUS_LABELS } from "@/lib/format";
import { propertyPath } from "@/lib/site";
import { canDeleteProperty, canEditProperty } from "@/lib/admin-permissions";
import {
  deletePropertyAction,
  setPropertyFeaturedAction,
  setPropertyStatusAction,
} from "@/app/admin/actions";

const STATUS_STYLES: Record<PropertyStatus, string> = {
  publicada: "bg-emerald/10 text-emerald",
  pausada: "bg-slate/10 text-slate/70",
  vendida: "bg-gold/20 text-[#8a6d12]",
  alquilada: "bg-gold/20 text-[#8a6d12]",
};

interface Props {
  properties: Property[];
  role: AdminRole;
}

export default function PropertiesPanel({ properties, role }: Props) {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate/60">
          {properties.length} propiedades · Los cambios se ven en la web al instante.
        </p>
        <Link
          href="/admin/propiedades/nueva"
          className="flex items-center justify-center gap-2 rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-warm-white shadow-sm transition-colors hover:bg-emerald-light"
        >
          <Plus size={18} />
          Nueva propiedad
        </Link>
      </div>

      {properties.length === 0 ? (
        <p className="mt-6 rounded-2xl bg-white px-6 py-12 text-center text-sm text-slate/50 ring-1 ring-slate/10">
          Todavía no hay propiedades cargadas.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3 lg:grid-cols-2">
          {properties.map((p) => (
            <PropertyRow key={p.id} property={p} role={role} />
          ))}
        </ul>
      )}
    </div>
  );
}

function PropertyRow({ property: p, role }: { property: Property; role: AdminRole }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState(p.status);
  const [featured, setFeatured] = useState(p.featured);
  const editable = canEditProperty(role, p);
  const deletable = canDeleteProperty(role, p);

  const run = (action: () => Promise<{ ok: boolean; error?: string }>, rollback?: () => void) => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "No se pudo guardar.");
        rollback?.();
      }
      router.refresh();
    });
  };

  const changeStatus = (next: PropertyStatus) => {
    const prev = status;
    setStatus(next);
    run(() => setPropertyStatusAction(p.id, next), () => setStatus(prev));
  };

  const toggleFeatured = () => {
    const prev = featured;
    setFeatured(!prev);
    run(() => setPropertyFeaturedAction(p.id, !prev), () => setFeatured(prev));
  };

  const remove = () => {
    if (!deletable) {
      setError(
        p.isSeed
          ? "En la demo las propiedades originales no se pueden borrar (sí editar)."
          : "En la demo solo podés borrar las propiedades que cargaste vos."
      );
      return;
    }
    if (!window.confirm(`¿Borrar "${p.title}"? Esta acción no se puede deshacer.`)) return;
    run(() => deletePropertyAction(p.id));
  };

  return (
    <li className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate/10 sm:p-4">
      <div className="flex gap-3">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-emerald/10 sm:h-24 sm:w-28">
          {p.images[0] && (
            <Image src={p.images[0]} alt="" fill sizes="112px" className="object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[status]}`}>
              {STATUS_LABELS[status]}
            </span>
            {p.isSeed && (
              <span className="rounded-full bg-warm-white px-2 py-0.5 text-[11px] font-medium text-slate/60 ring-1 ring-slate/10">
                Original
              </span>
            )}
            {p.createdBy === "demo" && (
              <span className="rounded-full bg-warm-white px-2 py-0.5 text-[11px] font-medium text-slate/60 ring-1 ring-slate/10">
                Cargada en la demo
              </span>
            )}
            {pending && <Loader2 size={14} className="animate-spin text-slate/40" />}
          </div>
          <p className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-slate">
            {p.title}
          </p>
          <p className="mt-0.5 text-xs text-slate/55">
            {p.operation} · {p.type} · {p.neighborhood}
          </p>
          <p className="mt-0.5 font-serif-display text-sm text-gold">
            {formatPropertyPrice(p)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate/10 pt-3">
        {editable ? (
          <Link
            href={`/admin/propiedades/${p.id}`}
            className="flex items-center gap-1.5 rounded-full bg-emerald px-3.5 py-2 text-xs font-semibold text-warm-white transition-colors hover:bg-emerald-light"
          >
            <Pencil size={14} />
            Editar
          </Link>
        ) : (
          <span className="rounded-full bg-warm-white px-3 py-2 text-xs text-slate/50 ring-1 ring-slate/10">
            Solo lectura en la demo
          </span>
        )}

        <label className="sr-only" htmlFor={`status-${p.id}`}>
          Estado
        </label>
        <select
          id={`status-${p.id}`}
          value={status}
          disabled={!editable || pending}
          onChange={(e) => changeStatus(e.target.value as PropertyStatus)}
          className="rounded-full border border-slate/15 bg-white px-3 py-2 text-xs font-medium text-slate focus:border-gold focus:outline-none disabled:opacity-60"
        >
          {PROPERTY_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={toggleFeatured}
          disabled={!editable || pending}
          aria-pressed={featured}
          title={featured ? "Quitar de destacadas" : "Marcar como destacada"}
          className={`flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold ring-1 transition-colors disabled:opacity-60 ${
            featured
              ? "bg-gold/15 text-[#8a6d12] ring-gold/40"
              : "bg-white text-slate/60 ring-slate/15 hover:text-emerald"
          }`}
        >
          <Star size={14} className={featured ? "fill-gold text-gold" : ""} />
          {featured ? "Destacada" : "Destacar"}
        </button>

        <div className="ml-auto flex items-center gap-1">
          {status !== "pausada" && (
            <Link
              href={propertyPath(p.slug)}
              target="_blank"
              aria-label="Ver en la web"
              title="Ver en la web"
              className="rounded-full p-2 text-slate/50 transition-colors hover:bg-warm-white hover:text-emerald"
            >
              <Eye size={18} />
            </Link>
          )}
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            aria-label="Borrar"
            title={deletable ? "Borrar" : "No se puede borrar en la demo"}
            className={`rounded-full p-2 transition-colors disabled:opacity-60 ${
              deletable
                ? "text-slate/50 hover:bg-red-50 hover:text-red-600"
                : "cursor-not-allowed text-slate/25"
            }`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}
