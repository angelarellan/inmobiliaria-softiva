import { buildWhatsAppLink, SOFTIVA_DEMO_MESSAGE } from "@/lib/whatsapp";

/**
 * Aviso fino arriba de todo: la web es un modelo de Softiva Studio.
 * Se oculta con ?captura=1 (lo decide la página que lo renderiza).
 */
export default function DemoBar() {
  return (
    <div className="border-b border-gold/25 bg-[#0a2a20] px-4 py-1.5 text-center text-[11px] leading-snug text-warm-white/85 sm:text-xs">
      <span>Web modelo creada por </span>
      <a
        href="https://www.softivastudio.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-gold hover:underline"
      >
        Softiva Studio
      </a>
      <span aria-hidden="true" className="px-1.5 text-gold/60">
        ·
      </span>
      <span>Las propiedades y los datos son de ejemplo</span>
      <span aria-hidden="true" className="px-1.5 text-gold/60">
        ·
      </span>
      <a
        href={buildWhatsAppLink(SOFTIVA_DEMO_MESSAGE)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-gold underline decoration-gold/40 underline-offset-2 hover:decoration-gold"
      >
        ¿Querés una así para tu inmobiliaria?
      </a>
    </div>
  );
}
