"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BedDouble, Bath, Ruler, MapPin } from "lucide-react";
import { Property } from "@/lib/types";
import { formatPrice } from "@/lib/properties";

interface Props {
  property: Property;
  onSelect: (property: Property) => void;
  index?: number;
}

export default function PropertyCard({ property, onSelect, index = 0 }: Props) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(property)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3) }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-sm shadow-emerald/5 ring-1 ring-slate/5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald/15"
    >
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={property.images[0]}
          alt={property.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute left-4 top-4 flex gap-2">
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
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="font-serif-display text-xl text-gold">
          {formatPrice(property.price, property.currency, property.priceSuffix)}
        </p>
        <h3 className="text-lg font-semibold text-slate">{property.title}</h3>
        <p className="flex items-center gap-1.5 text-sm text-slate/60">
          <MapPin size={15} className="text-emerald" />
          {property.neighborhood}, {property.city}
        </p>

        <div className="mt-auto flex items-center gap-4 border-t border-slate/10 pt-4 text-sm text-slate/70">
          <span className="flex items-center gap-1.5">
            <Ruler size={16} className="text-emerald" />
            {property.area} m²
          </span>
          <span className="flex items-center gap-1.5">
            <BedDouble size={16} className="text-emerald" />
            {property.bedrooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Bath size={16} className="text-emerald" />
            {property.bathrooms}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
