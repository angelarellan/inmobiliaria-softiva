"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PropertySearch from "./PropertySearch";
import { SearchFilters } from "@/lib/types";

const defaultFilters: SearchFilters = {
  operation: "Todas",
  type: "Todos",
  neighborhood: "",
  maxPrice: null,
};

export default function Hero() {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (filters.operation !== "Todas") params.set("operation", filters.operation);
    if (filters.type !== "Todos") params.set("type", filters.type);
    if (filters.neighborhood) params.set("neighborhood", filters.neighborhood);
    if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
    const query = params.toString();
    router.push(`${query ? `/?${query}` : "/"}#propiedades`, { scroll: false });
    document
      .getElementById("propiedades")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="inicio"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-emerald pt-24"
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-emerald/80 via-emerald/70 to-emerald" />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold"
        >
          Gestión Inmobiliaria Integral
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-serif-display text-4xl leading-tight text-warm-white sm:text-5xl lg:text-6xl"
        >
          Propiedades que definen
          <span className="block text-gold">un nuevo estándar</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-6 max-w-2xl text-base text-warm-white/85 sm:text-lg"
        >
          Compra, venta, alquiler y tasación de propiedades de alto nivel en
          los barrios más exclusivos de Buenos Aires. Asesoramiento integral,
          discreción y resultados medibles.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
          className="mt-10 w-full max-w-4xl"
        >
          <PropertySearch
            filters={filters}
            onChange={setFilters}
            onSubmit={handleSearch}
            variant="hero"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-14 grid grid-cols-3 gap-8 text-warm-white/90"
        >
          <div>
            <p className="font-serif-display text-3xl text-gold">+10</p>
            <p className="text-xs uppercase tracking-wide">Años de experiencia</p>
          </div>
          <div>
            <p className="font-serif-display text-3xl text-gold">+500</p>
            <p className="text-xs uppercase tracking-wide">Propiedades vendidas</p>
          </div>
          <div>
            <p className="font-serif-display text-3xl text-gold">98%</p>
            <p className="text-xs uppercase tracking-wide">Clientes satisfechos</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
