"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import { WhatsAppIcon } from "./SocialIcons";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import Honeypot from "./Honeypot";

type Status = "idle" | "loading" | "success" | "error";

function followUpMessage(name: string, message: string) {
  const short = message.length > 500 ? `${message.slice(0, 497)}…` : message;
  return `Hola AURA Bienes Raíces, soy ${name}. Les acabo de dejar una consulta en la web:\n"${short}"`;
}

export default function ContactSection() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [whatsappText, setWhatsappText] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<
      string,
      string
    >;

    setStatus("loading");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Ocurrió un error al enviar el mensaje. Probá nuevamente.");
        setStatus("error");
        return;
      }
      setWhatsappText(followUpMessage(data.name ?? "", data.message ?? ""));
      setStatus("success");
      form.reset();
    } catch {
      setError("Ocurrió un error de conexión. Probá nuevamente.");
      setStatus("error");
    }
  };

  return (
    <section id="contacto" className="bg-white py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 lg:grid-cols-2 lg:px-10">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Contacto
          </p>
          <h2 className="mt-3 font-serif-display text-3xl text-slate sm:text-4xl">
            Conversemos sobre tu próxima operación
          </h2>
          <p className="mt-4 leading-relaxed text-slate/70">
            Ya sea que busques comprar, vender o alquilar, nuestro equipo está
            listo para asesorarte con la discreción y la precisión que tu
            patrimonio merece.
          </p>

          <div className="mt-10 space-y-5">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 text-emerald" size={20} />
              <p className="text-sm text-slate/80">
                Av. Del Libertador 2450, Piso 8, Puerto Madero, Buenos Aires
              </p>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 text-emerald" size={20} />
              <p className="text-sm text-slate/80">+54 9 11 2233-4455</p>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 text-emerald" size={20} />
              <p className="text-sm text-slate/80">contacto@aurabienesraices.com.ar</p>
            </div>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 24 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="relative flex flex-col gap-4 rounded-2xl bg-warm-white p-6 shadow-lg shadow-emerald/5 ring-1 ring-slate/5 sm:p-8"
        >
          <Honeypot />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="c-name" className="text-sm font-medium text-slate">
              Nombre
            </label>
            <input
              required
              id="c-name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength={120}
              className="rounded-lg border border-slate/15 bg-white px-4 py-3 text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="c-email" className="text-sm font-medium text-slate">
              Email
            </label>
            <input
              required
              id="c-email"
              name="email"
              type="email"
              autoComplete="email"
              maxLength={200}
              className="rounded-lg border border-slate/15 bg-white px-4 py-3 text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="c-phone" className="text-sm font-medium text-slate">
              Teléfono
            </label>
            <input
              id="c-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              maxLength={40}
              className="rounded-lg border border-slate/15 bg-white px-4 py-3 text-sm focus:border-gold focus:outline-none"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="c-message" className="text-sm font-medium text-slate">
              Mensaje
            </label>
            <textarea
              required
              id="c-message"
              name="message"
              rows={4}
              maxLength={3000}
              className="resize-none rounded-lg border border-slate/15 bg-white px-4 py-3 text-sm focus:border-gold focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-emerald transition-colors hover:bg-gold-soft disabled:opacity-70"
          >
            {status === "loading" && <Loader2 className="animate-spin" size={18} />}
            {status === "loading" ? "Enviando..." : "Enviar Mensaje"}
          </button>

          {status === "success" && (
            <div className="rounded-xl bg-emerald/5 p-4 text-center" role="status">
              <p className="flex items-center justify-center gap-2 text-sm font-medium text-emerald">
                <CheckCircle2 size={18} />
                ¡Mensaje enviado! Te responderemos a la brevedad.
              </p>
              {whatsappText && (
                <a
                  href={buildWhatsAppLink(whatsappText)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                >
                  <WhatsAppIcon size={18} />
                  Seguir por WhatsApp
                </a>
              )}
            </div>
          )}
          {status === "error" && (
            <p className="text-center text-sm font-medium text-red-600" role="alert">
              {error}
            </p>
          )}
        </motion.form>
      </div>
    </section>
  );
}
