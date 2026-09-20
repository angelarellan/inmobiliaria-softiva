"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Users, Building2 } from "lucide-react";

const stats = [
  { icon: Award, label: "Años de trayectoria", value: "+10" },
  { icon: Building2, label: "Propiedades vendidas", value: "+500" },
  { icon: Users, label: "Clientes satisfechos", value: "+800" },
];

export default function About() {
  return (
    <section id="nosotros" className="bg-white py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2 lg:px-10">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative h-96 overflow-hidden rounded-2xl"
        >
          <Image
            src="https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=1200&q=80"
            alt="Oficinas de AURA Bienes Raíces en Puerto Madero"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Nosotros
          </p>
          <h2 className="mt-3 font-serif-display text-3xl text-slate sm:text-4xl">
            Más de una década construyendo confianza
          </h2>
          <p className="mt-5 leading-relaxed text-slate/75">
            AURA Bienes Raíces nació en Puerto Madero con una convicción
            simple: cada operación inmobiliaria debe manejarse con la misma
            precisión y discreción que una decisión de inversión. Hoy
            acompañamos a familias, inversores y desarrolladores en la
            compra, venta, alquiler y tasación de propiedades de alto nivel
            en los barrios más exclusivos de Buenos Aires.
          </p>
          <p className="mt-4 leading-relaxed text-slate/75">
            Nuestro equipo combina especialistas en tasaciones, abogados,
            arquitectos y expertos en marketing digital para ofrecer un
            servicio verdaderamente integral, de principio a fin.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <stat.icon className="mx-auto mb-2 text-emerald sm:mx-0" size={22} />
                <p className="font-serif-display text-2xl text-emerald">
                  {stat.value}
                </p>
                <p className="text-xs uppercase tracking-wide text-slate/60">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
