"use client";

import { useMemo, useState } from "react";
import { properties } from "@/lib/properties";
import { Property, SearchFilters } from "@/lib/types";
import PropertySearch from "./PropertySearch";
import PropertyCard from "./PropertyCard";
import PropertyModal from "./PropertyModal";

interface Props {
  initialFilters: SearchFilters;
}

export default function FeaturedProperties({ initialFilters }: Props) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [selected, setSelected] = useState<Property | null>(null);

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      if (filters.operation !== "Todas" && p.operation !== filters.operation)
        return false;
      if (filters.type !== "Todos" && p.type !== filters.type) return false;
      if (filters.neighborhood && p.neighborhood !== filters.neighborhood)
        return false;
      if (filters.maxPrice && p.currency === "USD" && p.price > filters.maxPrice)
        return false;
      return true;
    });
  }, [filters]);

  return (
    <section id="propiedades" className="bg-warm-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Catálogo exclusivo
          </p>
          <h2 className="mt-3 font-serif-display text-3xl text-slate sm:text-4xl">
            Propiedades Destacadas
          </h2>
          <p className="mt-4 text-slate/70">
            Una selección curada de casas, departamentos y penthouses en los
            barrios más exclusivos de Buenos Aires.
          </p>
        </div>

        <div className="mt-10">
          <PropertySearch filters={filters} onChange={setFilters} />
        </div>

        {filtered.length === 0 ? (
          <p className="mt-16 text-center text-slate/60">
            No encontramos propiedades con esos filtros. Probá ajustando la
            búsqueda.
          </p>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((property, index) => (
              <PropertyCard
                key={property.id}
                property={property}
                index={index}
                onSelect={setSelected}
              />
            ))}
          </div>
        )}
      </div>

      <PropertyModal property={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
