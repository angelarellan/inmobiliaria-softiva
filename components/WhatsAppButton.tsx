import { buildWhatsAppLink } from "@/lib/whatsapp";
import { WhatsAppIcon } from "./SocialIcons";

export default function WhatsAppButton() {
  return (
    <a
      href={buildWhatsAppLink(
        "Hola AURA Bienes Raíces, me gustaría recibir más información."
      )}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="wa-wiggle fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-emerald/30 transition-[scale] hover:scale-110"
    >
      {/* Halo que late alrededor del botón */}
      <span
        aria-hidden="true"
        className="wa-halo pointer-events-none absolute inset-0 rounded-full bg-[#25D366]"
      />
      <WhatsAppIcon size={30} className="relative" />
    </a>
  );
}
