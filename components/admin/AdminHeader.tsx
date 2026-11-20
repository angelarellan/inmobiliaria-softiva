"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import type { AdminRole } from "@/lib/types";

export default function AdminHeader({ role }: { role: AdminRole }) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-3">
          <span className="font-serif-display text-2xl text-emerald">AURA</span>
          <span className="hidden text-xs uppercase tracking-[0.25em] text-slate/50 sm:inline">
            Panel
          </span>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
              role === "demo" ? "bg-gold/15 text-[#8a6d12]" : "bg-emerald/10 text-emerald"
            }`}
          >
            {role === "demo" ? "Modo demo" : "Dueño"}
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-slate/70 transition-colors hover:text-emerald"
          >
            <ExternalLink size={16} />
            <span className="hidden sm:inline">Ver web</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Cerrar sesión"
            className="flex items-center gap-2 rounded-full border border-slate/15 px-3 py-2 text-sm font-medium text-slate transition-colors hover:border-gold hover:text-emerald disabled:opacity-60 sm:px-4"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">
              {loggingOut ? "Saliendo..." : "Cerrar sesión"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
