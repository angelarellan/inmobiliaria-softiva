"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Martina Iglesias",
    role: "Compradora, Puerto Madero",
    quote:
      "El equipo de AURA nos acompañó en cada paso de la compra de nuestro penthouse. Profesionalismo y transparencia absoluta.",
  },
  {
    name: "Federico Bianchi",
    role: "Inversor inmobiliario",
    quote:
      "Vendí dos propiedades con ellos en menos de 60 días cada una, a un precio superior al esperado. Recomendables al 100%.",
  },
  {
    name: "Sofía Larrañaga",
    role: "Propietaria, San Isidro",
    quote:
      "La tasación fue precisa y el asesoramiento legal nos dio total tranquilidad durante toda la operación.",
  },
];

const metrics = [
  { value: "+10", label: "Años de experiencia" },
  { value: "+500", label: "Propiedades vendidas" },
  { value: "+120", label: "Propiedades en alquiler" },
  { value: "98%", label: "Clientes que nos recomiendan" },
];

export default function Testimonials() {
  return (
    <section className="bg-warm-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="grid grid-cols-2 gap-8 border-b border-slate/10 pb-16 sm:grid-cols-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="text-center"
            >
              <p className="font-serif-display text-3xl text-emerald sm:text-4xl">
                {metric.value}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate/60">
                {metric.label}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Testimonios
          </p>
          <h2 className="mt-3 font-serif-display text-3xl text-slate sm:text-4xl">
            La confianza de quienes ya trabajaron con nosotros
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-2xl bg-white p-6 shadow-sm shadow-emerald/5 ring-1 ring-slate/5"
            >
              <div className="flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-slate/80">
                &ldquo;{t.quote}&rdquo;
              </p>
              <p className="mt-5 text-sm font-semibold text-slate">{t.name}</p>
              <p className="text-xs text-slate/60">{t.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
