"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2, AlertCircle } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center bg-emerald px-6">
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
                placeholder="admin"
                className="w-full text-sm focus:outline-none"
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
                className="w-full text-sm focus:outline-none"
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

          <p className="text-center text-xs text-slate/40">
            Usuario: admin · Contraseña: admin
          </p>
        </form>
      </div>
    </div>
  );
}
