"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Mail, ClipboardList, Building2 } from "lucide-react";
import { AppraisalSubmission, ContactSubmission, Property } from "@/lib/types";
import { formatPrice } from "@/lib/properties";

interface Props {
  contacts: ContactSubmission[];
  appraisals: AppraisalSubmission[];
  properties: Property[];
}

type Tab = "contacts" | "appraisals" | "properties";

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

export default function DashboardTabs({ contacts, appraisals, properties }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("contacts");
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  };

  const tabs: { key: Tab; label: string; icon: typeof Mail; count: number }[] = [
    { key: "contacts", label: "Consultas", icon: Mail, count: contacts.length },
    {
      key: "appraisals",
      label: "Tasaciones",
      icon: ClipboardList,
      count: appraisals.length,
    },
    {
      key: "properties",
      label: "Propiedades",
      icon: Building2,
      count: properties.length,
    },
  ];

  return (
    <div className="min-h-screen bg-warm-white">
      <header className="border-b border-slate/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <span className="font-serif-display text-2xl text-emerald">AURA</span>
            <p className="text-xs uppercase tracking-[0.25em] text-slate/50">
              Panel Administrativo
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 rounded-full border border-slate/15 px-4 py-2 text-sm font-medium text-slate transition-colors hover:border-gold hover:text-emerald disabled:opacity-60"
          >
            <LogOut size={16} />
            {loggingOut ? "Saliendo..." : "Cerrar sesión"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-emerald text-warm-white"
                  : "bg-white text-slate/70 ring-1 ring-slate/10 hover:text-emerald"
              }`}
            >
              <t.icon size={16} />
              {t.label}
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  tab === t.key ? "bg-warm-white/20" : "bg-slate/10"
                }`}
              >
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-8">
          {tab === "contacts" && (
            <TableCard
              isEmpty={contacts.length === 0}
              emptyLabel="Todavía no recibiste consultas."
              headers={["Nombre", "Email", "Teléfono", "Mensaje", "Fecha"]}
            >
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-slate/10 last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-slate">
                    {c.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate/70">{c.email}</td>
                  <td className="px-4 py-3 text-sm text-slate/70">{c.phone || "—"}</td>
                  <td className="max-w-xs px-4 py-3 text-sm text-slate/70">
                    {c.message}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate/50">
                    {dateFormatter.format(new Date(c.createdAt))}
                  </td>
                </tr>
              ))}
            </TableCard>
          )}

          {tab === "appraisals" && (
            <TableCard
              isEmpty={appraisals.length === 0}
              emptyLabel="Todavía no recibiste solicitudes de tasación."
              headers={["Nombre", "Teléfono", "Tipo", "Dirección", "m²", "Fecha"]}
            >
              {appraisals.map((a) => (
                <tr key={a.id} className="border-b border-slate/10 last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-slate">
                    {a.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate/70">{a.phone}</td>
                  <td className="px-4 py-3 text-sm text-slate/70">
                    {a.propertyType}
                  </td>
                  <td className="max-w-xs px-4 py-3 text-sm text-slate/70">
                    {a.address}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate/70">{a.area || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate/50">
                    {dateFormatter.format(new Date(a.createdAt))}
                  </td>
                </tr>
              ))}
            </TableCard>
          )}

          {tab === "properties" && (
            <TableCard
              isEmpty={properties.length === 0}
              emptyLabel="No hay propiedades cargadas."
              headers={["Título", "Operación", "Tipo", "Ubicación", "Precio"]}
            >
              {properties.map((p) => (
                <tr key={p.id} className="border-b border-slate/10 last:border-0">
                  <td className="px-4 py-3 text-sm font-medium text-slate">
                    {p.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate/70">{p.operation}</td>
                  <td className="px-4 py-3 text-sm text-slate/70">{p.type}</td>
                  <td className="px-4 py-3 text-sm text-slate/70">
                    {p.neighborhood}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-emerald">
                    {formatPrice(p.price, p.currency, p.priceSuffix)}
                  </td>
                </tr>
              ))}
            </TableCard>
          )}
        </div>
      </main>
    </div>
  );
}

function TableCard({
  children,
  headers,
  isEmpty,
  emptyLabel,
}: {
  children: React.ReactNode;
  headers: string[];
  isEmpty: boolean;
  emptyLabel: string;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate/10">
      {isEmpty ? (
        <p className="px-6 py-12 text-center text-sm text-slate/50">
          {emptyLabel}
        </p>
      ) : (
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr className="border-b border-slate/10 bg-warm-white/60">
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate/50"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      )}
    </div>
  );
}
