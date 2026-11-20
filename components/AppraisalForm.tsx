"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import Honeypot from "./Honeypot";

type Status = "idle" | "loading" | "success" | "error";

function followUpMessage(data: Record<string, string>) {
  const lines = [
    `Hola AURA Bienes Raíces, soy ${data.name}. Les pedí una tasación desde la web:`,
    `• Propiedad: ${data.propertyType}`,
    `• Dirección: ${data.address}`,
  ];
  if (data.area) lines.push(`• Superficie: ${data.area} m²`);
  return lines.join("\n");
}

export default function AppraisalForm() {
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
      const res = await fetch("/api/appraisal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Ocurrió un error al enviar el formulario. Probá nuevamente.");
        setStatus("error");
        return;
      }
      setWhatsappText(followUpMessage(data));
      setStatus("success");
      form.reset();
    } catch {
      setError("Ocurrió un error de conexión. Probá nuevamente.");
      setStatus("error");
    }
  };

  return (
    <section id="tasaciones" className="bg-warm-white py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Tasaciones
          </p>
          <h2 className="mt-3 font-serif-display text-3xl text-slate sm:text-4xl">
            Solicitá la tasación de tu propiedad
          </h2>
          <p className="mt-4 text-slate/70">
            Completá el formulario y uno de nuestros especialistas se
            contactará en menos de 24 horas hábiles.
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
          className="relative mt-12 grid grid-cols-1 gap-5 rounded-2xl bg-white p-6 shadow-lg shadow-emerald/5 ring-1 ring-slate/5 sm:grid-cols-2 sm:p-10"
        >
          <Honeypot />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-slate">
              Nombre completo
            </label>
            <input
              required
              id="name"
              name="name"
              autoComplete="name"
              maxLength={120}
              type="text"
              placeholder="Tu nombre"
              className="rounded-lg border border-slate/15 px-4 py-3 text-sm focus:border-gold focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-slate">
              Teléfono
            </label>
            <input
              required
              id="phone"
              name="phone"
              autoComplete="tel"
              maxLength={40}
              type="tel"
              placeholder="+54 9 11 0000-0000"
              className="rounded-lg border border-slate/15 px-4 py-3 text-sm focus:border-gold focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate">
              Email
            </label>
            <input
              required
              id="email"
              name="email"
              autoComplete="email"
              maxLength={200}
              type="email"
              placeholder="tu@email.com"
              className="rounded-lg border border-slate/15 px-4 py-3 text-sm focus:border-gold focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="propertyType"
              className="text-sm font-medium text-slate"
            >
              Tipo de propiedad
            </label>
            <select
              id="propertyType"
              name="propertyType"
              className="rounded-lg border border-slate/15 px-4 py-3 text-sm focus:border-gold focus:outline-none"
              defaultValue="Casa"
            >
              <option>Casa</option>
              <option>Departamento</option>
              <option>Penthouse</option>
              <option>Oficina</option>
              <option>Terreno</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="address" className="text-sm font-medium text-slate">
              Dirección de la propiedad
            </label>
            <input
              required
              id="address"
              name="address"
              maxLength={200}
              type="text"
              placeholder="Calle, número, barrio"
              className="rounded-lg border border-slate/15 px-4 py-3 text-sm focus:border-gold focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="area" className="text-sm font-medium text-slate">
              Superficie aproximada (m²)
            </label>
            <input
              required
              id="area"
              name="area"
              inputMode="numeric"
              maxLength={40}
              type="text"
              placeholder="Ej: 150"
              className="rounded-lg border border-slate/15 px-4 py-3 text-sm focus:border-gold focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label htmlFor="comments" className="text-sm font-medium text-slate">
              Comentarios adicionales
            </label>
            <textarea
              id="comments"
              name="comments"
              rows={4}
              maxLength={3000}
              placeholder="Contanos más sobre tu propiedad..."
              className="resize-none rounded-lg border border-slate/15 px-4 py-3 text-sm focus:border-gold focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={status === "loading"}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald px-6 py-3.5 text-sm font-semibold text-warm-white transition-colors hover:bg-emerald-light disabled:opacity-70"
            >
              {status === "loading" && <Loader2 className="animate-spin" size={18} />}
              {status === "loading" ? "Enviando..." : "Solicitar Tasación"}
            </button>

            {status === "success" && (
              <div className="mt-4 rounded-xl bg-emerald/5 p-4 text-center" role="status">
                <p className="flex items-center justify-center gap-2 text-sm font-medium text-emerald">
                  <CheckCircle2 size={18} />
                  ¡Gracias! Recibimos tu solicitud, te contactaremos a la brevedad.
                </p>
                {whatsappText && (
                  <a
                    href={buildWhatsAppLink(whatsappText)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
                  >
                    <MessageCircle size={18} />
                    Seguir por WhatsApp
                  </a>
                )}
              </div>
            )}
            {status === "error" && (
              <p className="mt-4 text-center text-sm font-medium text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>
        </motion.form>
      </div>
    </section>
  );
}
