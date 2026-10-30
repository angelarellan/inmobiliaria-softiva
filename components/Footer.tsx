import Link from "next/link";
import { MapPin, Clock, Phone, Mail } from "lucide-react";
import { FacebookIcon, InstagramIcon, LinkedinIcon } from "./SocialIcons";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-emerald text-warm-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div>
          <span className="font-serif-display text-2xl text-gold">AURA</span>
          <p className="mt-3 text-sm leading-relaxed text-warm-white/70">
            Gestión Inmobiliaria Integral. Compra, venta, alquiler y tasación
            de propiedades de alto nivel en Buenos Aires.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="rounded-full bg-warm-white/10 p-2.5 transition-colors hover:bg-gold hover:text-emerald"
            >
              <FacebookIcon size={18} />
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-full bg-warm-white/10 p-2.5 transition-colors hover:bg-gold hover:text-emerald"
            >
              <InstagramIcon size={18} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="rounded-full bg-warm-white/10 p-2.5 transition-colors hover:bg-gold hover:text-emerald"
            >
              <LinkedinIcon size={18} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">
            Navegación
          </h3>
          <ul className="mt-4 space-y-2.5 text-sm text-warm-white/75">
            <li><a href="#inicio" className="hover:text-gold">Inicio</a></li>
            <li><a href="#propiedades" className="hover:text-gold">Propiedades</a></li>
            <li><a href="#nosotros" className="hover:text-gold">Nosotros</a></li>
            <li><a href="#servicios" className="hover:text-gold">Servicios</a></li>
            <li><a href="#tasaciones" className="hover:text-gold">Tasaciones</a></li>
            <li><a href="#contacto" className="hover:text-gold">Contacto</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">
            Contacto
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-warm-white/75">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
              Av. Del Libertador 2450, Piso 8, Puerto Madero, Buenos Aires
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="shrink-0 text-gold" />
              +54 9 11 2233-4455
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0 text-gold" />
              contacto@aurabienesraices.com.ar
            </li>
            <li className="flex items-start gap-2">
              <Clock size={16} className="mt-0.5 shrink-0 text-gold" />
              Lun a Vie 9:00–19:00 · Sáb 10:00–13:00
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gold">
            Ubicación
          </h3>
          <div className="mt-4 h-40 overflow-hidden rounded-xl ring-1 ring-warm-white/10">
            <iframe
              title="Mapa de ubicación de AURA Bienes Raíces"
              src="https://www.openstreetmap.org/export/embed.html?bbox=-58.3708%2C-34.6132%2C-58.3608%2C-34.6082&layer=mapnik"
              className="h-full w-full grayscale invert-[0.92] contrast-[1.1]"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-warm-white/10 py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 text-xs text-warm-white/60 sm:flex-row lg:px-10">
          <div className="text-center sm:text-left">
            <p>© {year} AURA Bienes Raíces. Todos los derechos reservados.</p>
            <p className="mt-1">
              Desarrollado por{" "}
              <a
                href="https://www.softivastudio.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-gold hover:underline"
              >
                Softiva Studio
              </a>
            </p>
          </div>
          <div className="flex gap-5">
            <Link href="/legal/privacidad" className="hover:text-gold">
              Política de Privacidad
            </Link>
            <Link href="/legal/terminos" className="hover:text-gold">
              Términos y Condiciones
            </Link>
            <Link href="/admin" className="hover:text-gold">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
