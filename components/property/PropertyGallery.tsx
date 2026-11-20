"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";
import type { PropertyStatus } from "@/lib/types";
import StatusStamp from "../StatusStamp";

interface Props {
  images: string[];
  title: string;
  status: PropertyStatus;
}

/** Galería de fotos: se desliza con el dedo en el celular y tiene flechas en escritorio. */
export default function PropertyGallery({ images, title, status }: Props) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = images.length;

  const goTo = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const i = (index + total) % total;
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
    setActive(i);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    const i = Math.round(track.scrollLeft / track.clientWidth);
    if (i !== active) setActive(i);
  };

  if (total === 0) {
    return <div className="aspect-[4/3] w-full rounded-2xl bg-emerald/10 sm:aspect-[16/9]" />;
  }

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl bg-emerald">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto sm:aspect-[16/9] lg:aspect-[21/9] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map((src, i) => (
            <div key={src} className="relative h-full w-full shrink-0 snap-center">
              <Image
                src={src}
                alt={`${title} — foto ${i + 1} de ${total}`}
                fill
                priority={i === 0}
                sizes="(max-width: 1280px) 100vw, 1216px"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <StatusStamp status={status} size="lg" />

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(active - 1)}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-warm-white/85 p-2.5 text-emerald shadow transition hover:bg-gold sm:block"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => goTo(active + 1)}
              aria-label="Foto siguiente"
              className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-warm-white/85 p-2.5 text-emerald shadow transition hover:bg-gold sm:block"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}

        <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-emerald/80 px-3 py-1 text-xs font-medium text-warm-white backdrop-blur">
          <Images size={14} />
          {active + 1} / {total}
        </span>
      </div>

      {total > 1 && (
        <div className="mt-3 hidden gap-3 overflow-x-auto pb-1 scrollbar-thin sm:flex">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === active}
              className={`relative h-20 w-28 shrink-0 overflow-hidden rounded-lg ring-2 transition ${
                i === active ? "ring-gold" : "ring-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image src={src} alt="" fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
