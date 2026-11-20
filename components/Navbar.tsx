"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  { id: "inicio", label: "Inicio" },
  { id: "propiedades", label: "Propiedades" },
  { id: "nosotros", label: "Nosotros" },
  { id: "servicios", label: "Servicios" },
  { id: "tasaciones", label: "Tasaciones" },
  { id: "contacto", label: "Contacto" },
];

interface Props {
  /** "overlay": transparente sobre el hero hasta que se scrollea (home). */
  variant?: "overlay" | "solid";
}

export default function Navbar({ variant = "overlay" }: Props) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isHome = variant === "overlay";
  const href = (id: string) => (isHome ? `#${id}` : `/#${id}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = !isHome || scrolled;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={`transition-all duration-500 ${
          solid
            ? "bg-emerald/95 shadow-lg shadow-emerald/10 backdrop-blur-md"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href={isHome ? "#inicio" : "/"} className="flex items-center gap-2">
            <span className="font-serif-display text-2xl tracking-wide text-gold">
              AURA
            </span>
            <span className="hidden text-xs uppercase tracking-[0.25em] text-warm-white/80 sm:inline">
              Bienes Raíces
            </span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {sections.map((link) => (
              <Link
                key={link.id}
                href={href(link.id)}
                className="text-sm font-medium tracking-wide text-warm-white/90 transition-colors hover:text-gold"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden lg:block">
            <Link
              href={href("tasaciones")}
              className="rounded-full border border-gold bg-gold px-5 py-2.5 text-sm font-semibold text-emerald transition-all hover:bg-transparent hover:text-gold"
            >
              Publicá tu Propiedad
            </Link>
          </div>

          <button
            type="button"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            className="text-warm-white lg:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-emerald lg:hidden"
            >
              <div className="flex flex-col gap-1 px-6 pb-6">
                {sections.map((link) => (
                  <Link
                    key={link.id}
                    href={href(link.id)}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-warm-white/90 transition-colors hover:bg-emerald-light hover:text-gold"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href={href("tasaciones")}
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-full bg-gold px-5 py-3 text-center text-sm font-semibold text-emerald"
                >
                  Publicá tu Propiedad
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
