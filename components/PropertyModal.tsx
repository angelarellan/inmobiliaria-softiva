"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ChevronLeft,
  ChevronRight,
  BedDouble,
  Bath,
  Ruler,
  MapPin,
  Car,
  CalendarCheck,
  ArrowRight,
} from "lucide-react";
import { WhatsAppIcon } from "./SocialIcons";
import { Property } from "@/lib/types";
import { formatPropertyPrice } from "@/lib/format";
import { propertyPath } from "@/lib/site";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { propertyInquiryMessage } from "@/lib/property-messages";
import { openVisitAssistant } from "@/lib/assistant-events";
import StatusStamp from "./StatusStamp";

interface Props {
  property: Property | null;
  onClose: () => void;
}

/** Vista rápida de una propiedad. La ficha completa está en /propiedades/[slug]. */
export default function PropertyModal({ property, onClose }: Props) {
  useEffect(() => {
    if (!property) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [property, onClose]);

  return (
    <AnimatePresence>
      {property && (
        <motion.div
          key={property.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <ModalContent property={property} onClose={onClose} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ModalContent({
  property,
  onClose,
}: {
  property: Property;
  onClose: () => void;
}) {
  const [activeImage, setActiveImage] = useState(0);
  const total = property.images.length;
  const next = () => setActiveImage((i) => (i + 1) % total);
  const prev = () => setActiveImage((i) => (i - 1 + total) % total);
  const available = property.status === "publicada";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={property.title}
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.25 }}
      onClick={(e) => e.stopPropagation()}
      className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-4 top-4 z-10 rounded-full bg-warm-white/90 p-2 text-slate transition-colors hover:bg-gold hover:text-emerald"
      >
        <X size={20} />
      </button>

      <div className="overflow-y-auto scrollbar-thin">
        <div className="relative h-72 w-full bg-emerald sm:h-96">
          {total > 0 && (
            <Image
              key={activeImage}
              src={property.images[activeImage]}
              alt={`${property.title} — foto ${activeImage + 1}`}
              fill
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
              priority
            />
          )}
          <StatusStamp status={property.status} size="lg" />
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Foto anterior"
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-warm-white/80 p-2 text-emerald transition hover:bg-gold"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Foto siguiente"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-warm-white/80 p-2 text-emerald transition hover:bg-gold"
              >
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                {property.images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeImage ? "w-6 bg-gold" : "w-1.5 bg-warm-white/70"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                property.operation === "Venta"
                  ? "bg-emerald text-warm-white"
                  : "bg-gold text-emerald"
              }`}
            >
              {property.operation}
            </span>
            <span className="rounded-full bg-warm-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate ring-1 ring-slate/10">
              {property.type}
            </span>
          </div>

          <h2 className="mt-4 font-serif-display text-2xl text-slate sm:text-3xl">
            {property.title}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate/60">
            <MapPin size={16} className="shrink-0 text-emerald" />
            {[property.address, property.neighborhood, property.city]
              .filter(Boolean)
              .join(", ")}
          </p>

          <p className="mt-4 font-serif-display text-3xl text-gold">
            {formatPropertyPrice(property)}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-warm-white p-4 sm:grid-cols-4">
            <Spec icon={Ruler} label={`${property.area} m²`} />
            <Spec icon={BedDouble} label={`${property.bedrooms} dorm.`} />
            <Spec icon={Bath} label={`${property.bathrooms} baños`} />
            <Spec icon={Car} label={`${property.parking} coch.`} />
          </div>

          <p className="mt-6 leading-relaxed text-slate/80">
            {property.shortDescription || property.description}
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <a
              href={buildWhatsAppLink(propertyInquiryMessage(property))}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
            >
              <WhatsAppIcon size={20} />
              Consultar por WhatsApp
            </a>
            {available ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openVisitAssistant(property.id);
                }}
                className="flex items-center justify-center gap-2 rounded-full bg-emerald px-6 py-3.5 text-sm font-semibold text-warm-white transition-colors hover:bg-emerald-light"
              >
                <CalendarCheck size={20} />
                Agendar visita
              </button>
            ) : (
              <Link
                href={propertyPath(property.slug)}
                className="flex items-center justify-center gap-2 rounded-full border border-emerald px-6 py-3.5 text-sm font-semibold text-emerald transition-colors hover:bg-emerald hover:text-warm-white"
              >
                Ver ficha completa
                <ArrowRight size={18} />
              </Link>
            )}
          </div>

          {available && (
            <Link
              href={propertyPath(property.slug)}
              className="mt-4 flex items-center justify-center gap-1.5 text-sm font-semibold text-emerald hover:text-gold"
            >
              Ver ficha completa
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function Spec({ icon: Icon, label }: { icon: typeof Ruler; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <Icon size={20} className="text-emerald" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
