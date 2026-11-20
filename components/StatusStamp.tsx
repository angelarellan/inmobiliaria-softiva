import type { PropertyStatus } from "@/lib/types";
import { closedStampLabel } from "@/lib/format";

interface Props {
  status: PropertyStatus;
  size?: "sm" | "lg";
}

/** Sello "Vendida" / "Alquilada" sobre la foto de la propiedad. */
export default function StatusStamp({ status, size = "sm" }: Props) {
  const label = closedStampLabel(status);
  if (!label) return null;
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-emerald/35">
      <span
        className={`-rotate-6 rounded-md border-2 border-gold bg-emerald/85 font-serif-display uppercase tracking-[0.25em] text-gold shadow-xl ${
          size === "lg" ? "px-8 py-3 text-3xl sm:text-4xl" : "px-5 py-2 text-xl"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
