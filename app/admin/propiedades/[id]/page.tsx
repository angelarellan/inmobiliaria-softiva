import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { getPropertyById, listNeighborhoods } from "@/lib/data/properties";
import { canEditProperty } from "@/lib/admin-permissions";
import AdminHeader from "@/components/admin/AdminHeader";
import PropertyForm from "@/components/admin/PropertyForm";

export const metadata: Metadata = {
  title: "Editar propiedad",
  robots: { index: false, follow: false },
};

export default async function EditPropertyPage({
  params,
}: PageProps<"/admin/propiedades/[id]">) {
  const session = await requireSession();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [property, neighborhoods] = await Promise.all([
    getPropertyById(id),
    listNeighborhoods(),
  ]);
  if (!property) notFound();

  return (
    <div className="min-h-screen bg-warm-white">
      <AdminHeader role={session.role} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        {canEditProperty(session.role, property) ? (
          <PropertyForm property={property} neighborhoods={neighborhoods} />
        ) : (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate/10">
            <Lock size={28} className="mx-auto text-gold" />
            <h1 className="mt-3 font-serif-display text-2xl text-slate">
              Solo lectura en la demo
            </h1>
            <p className="mt-2 text-sm text-slate/70">
              Esta propiedad la cargó la inmobiliaria. En el modo demo podés
              editar las originales y las que cargues vos.
            </p>
            <Link
              href="/admin/dashboard?tab=propiedades"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald px-5 py-3 text-sm font-semibold text-warm-white hover:bg-emerald-light"
            >
              <ArrowLeft size={16} />
              Volver al panel
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
