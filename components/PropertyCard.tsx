"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BedDouble, Bath, Ruler, MapPin, Eye, Star } from "lucide-react";
import { Property } from "@/lib/types";
import { formatPropertyPrice } from "@/lib/format";
import { propertyPath } from "@/lib/site";
import StatusStamp from "./StatusStamp";

interface Props {
  property: Property;
  /** Abre la vista rápida (modal). Si no se pasa, no se muestra el botón. */
  onQuickView?: (property: Property) => void;
  index?: number;
}

export default function PropertyCard({ property, onQuickView, index = 0 }: Props) {
  const href = propertyPath(property.slug);
  const cover = property.images[0];

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3) }}
      className="group relative flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm shadow-emerald/5 ring-1 ring-slate/5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald/15"
    >
      <div className="relative h-64 w-full overflow-hidden bg-emerald/10">
        {cover && (
          <Image
            src={cover}
            alt={property.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        )}
        <div className="absolute left-4 right-4 top-4 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
              property.operation === "Venta"
                ? "bg-emerald text-warm-white"
                : "bg-gold text-emerald"
            }`}
          >
            {property.operation}
          </span>
          <span className="rounded-full bg-warm-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate">
            {property.type}
          </span>
          {property.featured && property.status === "publicada" && (
            <span className="flex items-center gap-1 rounded-full bg-emerald/85 px-2.5 py-1 text-xs font-semibold text-gold">
              <Star size={12} className="fill-gold" />
              Destacada
            </span>
          )}
        </div>
        <StatusStamp status={property.status} />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="font-serif-display text-xl text-gold">
          {formatPropertyPrice(property)}
        </p>
        <h3 className="text-lg font-semibold text-slate">
          {/* El link cubre toda la tarjeta */}
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {property.title}
          </Link>
        </h3>
        <p className="flex items-center gap-1.5 text-sm text-slate/60">
          <MapPin size={15} className="text-emerald" />
          {property.neighborhood}, {property.city}
        </p>

        <div className="mt-auto flex items-center gap-4 border-t border-slate/10 pt-4 text-sm text-slate/70">
          <span className="flex items-center gap-1.5">
            <Ruler size={16} className="text-emerald" />
            {property.area} m²
          </span>
          <span className="flex items-center gap-1.5" title="Dormitorios">
            <BedDouble size={16} className="text-emerald" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1.5" title="Baños">
            <Bath size={16} className="text-emerald" />
            {property.bathrooms}
          </span>
        </div>
      </div>

      {onQuickView && (
        <button
          type="button"
          onClick={() => onQuickView(property)}
          aria-label={`Vista rápida de ${property.title}`}
          className="absolute right-3 top-[13.5rem] z-10 flex items-center gap-1.5 rounded-full bg-warm-white/90 px-3 py-1.5 text-xs font-semibold text-emerald shadow-sm transition-colors hover:bg-gold"
        >
          <Eye size={14} />
          Vista rápida
        </button>
      )}
    </motion.article>
  );
}
