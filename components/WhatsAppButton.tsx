"use client";

import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function WhatsAppButton() {
  return (
    <a
      href={buildWhatsAppLink(
        "Hola AURA Bienes Raíces, me gustaría recibir más información."
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald/30 transition-transform hover:scale-110"
    >
      <MessageCircle size={28} />
    </a>
  );
}
