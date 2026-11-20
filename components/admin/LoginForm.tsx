"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2, AlertCircle, ArrowLeft, MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "No pudimos iniciar sesión.");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Ocurrió un error de conexión.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-emerald px-5 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="text-center">
          <span className="font-serif-display text-3xl text-emerald">AURA</span>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate/50">
            Panel Administrativo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="username" className="text-sm font-medium text-slate">
              Usuario
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-slate/15 px-4 py-3 focus-within:border-gold">
              <User size={18} className="text-slate/40" />
              <input
                required
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Tu usuario"
                className="w-full text-base focus:outline-none sm:text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate">
              Contraseña
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-slate/15 px-4 py-3 focus-within:border-gold">
              <Lock size={18} className="text-slate/40" />
              <input
                required
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••"
                className="w-full text-base focus:outline-none sm:text-sm"
              />
            </div>
          </div>

          {error && (
            <p className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={16} />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-emerald px-6 py-3.5 text-sm font-semibold text-warm-white transition-colors hover:bg-emerald-light disabled:opacity-70"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

        </form>

        <a
          href={buildWhatsAppLink(
            "Hola Softiva, quiero probar el panel de la web modelo de inmobiliaria. ¿Me pasan el acceso demo?"
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-warm-white px-4 py-3 text-center text-xs text-slate/70 ring-1 ring-slate/10 transition-colors hover:text-emerald"
        >
          <MessageCircle size={16} className="shrink-0 text-[#25D366]" />
          ¿Querés probar el panel? Pedinos el acceso demo por WhatsApp
        </a>
      </div>

      <Link
        href="/"
        className="mt-6 flex items-center gap-1.5 text-sm text-warm-white/70 hover:text-gold"
      >
        <ArrowLeft size={16} />
        Volver a la web
      </Link>
    </div>
  );
}
