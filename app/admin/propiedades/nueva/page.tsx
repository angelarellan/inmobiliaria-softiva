import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/session";
import { listNeighborhoods } from "@/lib/data/properties";
import AdminHeader from "@/components/admin/AdminHeader";
import PropertyForm from "@/components/admin/PropertyForm";

export const metadata: Metadata = {
  title: "Nueva propiedad",
  robots: { index: false, follow: false },
};

export default async function NewPropertyPage() {
  const session = await requireSession();
  const neighborhoods = await listNeighborhoods();

  return (
    <div className="min-h-screen bg-warm-white">
      <AdminHeader role={session.role} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <PropertyForm property={null} neighborhoods={neighborhoods} />
      </main>
    </div>
  );
}
