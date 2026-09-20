"use client";

import { motion } from "framer-motion";
import { Scale, LineChart, KeyRound, ShieldCheck } from "lucide-react";

const services = [
  {
    icon: LineChart,
    title: "Tasaciones precisas",
    description:
      "Valuamos tu propiedad con estudios de mercado comparativo y análisis de tendencias en tiempo real.",
  },
  {
    icon: Scale,
    title: "Asesoramiento legal",
    description:
      "Equipo de abogados especializados que acompaña cada operación con total seguridad jurídica.",
  },
  {
    icon: KeyRound,
    title: "Marketing inmobiliario",
    description:
      "Fotografía profesional, tours virtuales y campañas digitales para maximizar la visibilidad de tu propiedad.",
  },
  {
    icon: ShieldCheck,
    title: "Administración de alquileres",
    description:
      "Gestión integral de contratos, cobros y mantenimiento para propietarios que buscan tranquilidad.",
  },
];

export default function WhyChooseUs() {
  return (
    <section id="servicios" className="bg-emerald py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Por qué elegirnos
          </p>
          <h2 className="mt-3 font-serif-display text-3xl text-warm-white sm:text-4xl">
            Servicios de excelencia, de principio a fin
          </h2>
          <p className="mt-4 text-warm-white/75">
            Más de una década acompañando a familias e inversores en las
            decisiones inmobiliarias más importantes de su vida.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-2xl border border-warm-white/10 bg-warm-white/5 p-6 transition-colors hover:border-gold/40 hover:bg-warm-white/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/15 text-gold">
                <service.icon size={24} />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-warm-white">
                {service.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-warm-white/70">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
