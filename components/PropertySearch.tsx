"use client";

import { Search } from "lucide-react";
import { neighborhoods } from "@/lib/properties";
import { OperationType, PropertyType, SearchFilters } from "@/lib/types";

const operations: (OperationType | "Todas")[] = ["Todas", "Venta", "Alquiler"];
const types: (PropertyType | "Todos")[] = [
  "Todos",
  "Casa",
  "Departamento",
  "Penthouse",
  "Oficina",
  "Terreno",
];
const priceOptions = [
  { label: "Sin límite", value: null },
  { label: "Hasta US$ 300.000", value: 300000 },
  { label: "Hasta US$ 600.000", value: 600000 },
  { label: "Hasta US$ 1.000.000", value: 1000000 },
  { label: "Hasta US$ 2.000.000", value: 2000000 },
];

interface Props {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
  onSubmit?: () => void;
  variant?: "hero" | "inline";
}

export default function PropertySearch({
  filters,
  onChange,
  onSubmit,
  variant = "inline",
}: Props) {
  const containerClasses =
    variant === "hero"
      ? "bg-warm-white/95 backdrop-blur-md shadow-2xl shadow-emerald/20"
      : "bg-white shadow-md shadow-emerald/5";

  return (
    <div className={`rounded-2xl p-4 sm:p-5 ${containerClasses}`}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select
          value={filters.operation}
          onChange={(e) =>
            onChange({
              ...filters,
              operation: e.target.value as OperationType | "Todas",
            })
          }
          className="rounded-lg border border-slate/15 bg-white px-3 py-3 text-sm text-slate focus:border-gold focus:outline-none"
        >
          {operations.map((op) => (
            <option key={op} value={op}>
              {op === "Todas" ? "Operación" : op}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) =>
            onChange({ ...filters, type: e.target.value as PropertyType | "Todos" })
          }
          className="rounded-lg border border-slate/15 bg-white px-3 py-3 text-sm text-slate focus:border-gold focus:outline-none"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t === "Todos" ? "Tipo de propiedad" : t}
            </option>
          ))}
        </select>

        <select
          value={filters.neighborhood}
          onChange={(e) =>
            onChange({ ...filters, neighborhood: e.target.value })
          }
          className="rounded-lg border border-slate/15 bg-white px-3 py-3 text-sm text-slate focus:border-gold focus:outline-none"
        >
          <option value="">Ubicación</option>
          {neighborhoods.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <select
          value={filters.maxPrice ?? ""}
          onChange={(e) =>
            onChange({
              ...filters,
              maxPrice: e.target.value ? Number(e.target.value) : null,
            })
          }
          className="rounded-lg border border-slate/15 bg-white px-3 py-3 text-sm text-slate focus:border-gold focus:outline-none"
        >
          {priceOptions.map((p) => (
            <option key={p.label} value={p.value ?? ""}>
              {p.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onSubmit}
          className="flex items-center justify-center gap-2 rounded-lg bg-emerald px-4 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-emerald-light"
        >
          <Search size={18} />
          Buscar
        </button>
      </div>
    </div>
  );
}
