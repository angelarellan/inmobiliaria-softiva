"use client";

import { useState } from "react";
import Image from "next/image";
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
  MessageCircle,
} from "lucide-react";
import { Property } from "@/lib/types";
import { formatPrice } from "@/lib/properties";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface Props {
  property: Property | null;
  onClose: () => void;
}

export default function PropertyModal({ property, onClose }: Props) {
  const [activeImage, setActiveImage] = useState(0);

  if (!property) return null;

  const total = property.images.length;
  const next = () => setActiveImage((i) => (i + 1) % total);
  const prev = () => setActiveImage((i) => (i - 1 + total) % total);

  const whatsappMessage = `Hola AURA Bienes Raíces, quisiera más información sobre "${property.title}" (${property.neighborhood}). ¿Podrían asesorarme?`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate/70 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
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
              <Image
                key={activeImage}
                src={property.images[activeImage]}
                alt={property.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
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
                          i === activeImage
                            ? "w-6 bg-gold"
                            : "w-1.5 bg-warm-white/70"
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
                <MapPin size={16} className="text-emerald" />
                {property.address}, {property.neighborhood}, {property.city}
              </p>

              <p className="mt-4 font-serif-display text-3xl text-gold">
                {formatPrice(property.price, property.currency, property.priceSuffix)}
              </p>

              <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl bg-warm-white p-4 sm:grid-cols-4">
                <div className="flex flex-col items-center gap-1 text-center">
                  <Ruler size={20} className="text-emerald" />
                  <span className="text-sm font-medium">{property.area} m²</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <BedDouble size={20} className="text-emerald" />
                  <span className="text-sm font-medium">
                    {property.bedrooms} dorm.
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <Bath size={20} className="text-emerald" />
                  <span className="text-sm font-medium">
                    {property.bathrooms} baños
                  </span>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <Car size={20} className="text-emerald" />
                  <span className="text-sm font-medium">
                    {property.parking} coch.
                  </span>
                </div>
              </div>

              <p className="mt-6 leading-relaxed text-slate/80">
                {property.description}
              </p>

              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate/60">
                  Comodidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-emerald/5 px-3 py-1.5 text-sm text-emerald"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>

              <a
                href={buildWhatsAppLink(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
              >
                <MessageCircle size={20} />
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
