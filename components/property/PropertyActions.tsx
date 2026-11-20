"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarCheck, Check, Link2, MessageCircle, Share2 } from "lucide-react";
import type { Property } from "@/lib/types";
import { propertyUrl } from "@/lib/site";
import { buildWhatsAppLink, buildWhatsAppShareLink } from "@/lib/whatsapp";
import { propertyInquiryMessage, propertyShareText } from "@/lib/property-messages";
import { openVisitAssistant } from "@/lib/assistant-events";

interface Props {
  property: Pick<Property, "id" | "slug" | "title" | "neighborhood" | "status">;
}

export default function PropertyActions({ property }: Props) {
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const available = property.status === "publicada";
  const url = propertyUrl(property.slug);

  useEffect(() => {
    if (!shareOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setShareOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [shareOpen]);

  const share = async () => {
    const isMobile = window.matchMedia("(pointer: coarse)").matches;
    if (isMobile && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: property.title,
          text: `Mirá esta propiedad: ${property.title}`,
          url,
        });
        return;
      } catch (error) {
        // Si la persona cerró el menú de compartir, no hacemos nada más.
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    setShareOpen((v) => !v);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      <a
        href={buildWhatsAppLink(propertyInquiryMessage(property))}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
      >
        <MessageCircle size={20} />
        Consultar por WhatsApp
      </a>

      {available && (
        <button
          type="button"
          onClick={() => openVisitAssistant(property.id)}
          className="flex items-center justify-center gap-2 rounded-full bg-emerald px-6 py-3.5 text-sm font-semibold text-warm-white transition-colors hover:bg-emerald-light"
        >
          <CalendarCheck size={20} />
          Agendar visita
        </button>
      )}

      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => void share()}
          aria-expanded={shareOpen}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-emerald/25 px-6 py-3 text-sm font-semibold text-emerald transition-colors hover:border-gold hover:text-emerald"
        >
          <Share2 size={18} />
          Compartir
        </button>

        {shareOpen && (
          <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate/10">
            <button
              type="button"
              onClick={() => void copyLink()}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate hover:bg-warm-white"
            >
              {copied ? (
                <Check size={18} className="text-emerald" />
              ) : (
                <Link2 size={18} className="text-emerald" />
              )}
              {copied ? "¡Link copiado!" : "Copiar link"}
            </button>
            <a
              href={buildWhatsAppShareLink(propertyShareText(property))}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setShareOpen(false)}
              className="flex items-center gap-3 border-t border-slate/10 px-4 py-3 text-sm text-slate hover:bg-warm-white"
            >
              <MessageCircle size={18} className="text-[#25D366]" />
              Compartir por WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
