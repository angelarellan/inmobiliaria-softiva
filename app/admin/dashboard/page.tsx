import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Info } from "lucide-react";
import { requireSession } from "@/lib/auth/session";
import { listAllProperties } from "@/lib/data/properties";
import { listAppraisals, listContacts, listVisits } from "@/lib/data/leads";
import { appraisalViews, contactViews, visitViews } from "@/lib/admin-leads";
import { propertyPath } from "@/lib/site";
import AdminHeader from "@/components/admin/AdminHeader";
import DashboardTabs, {
  DASHBOARD_TABS,
  type DashboardTab,
} from "@/components/admin/DashboardTabs";
import PropertiesPanel from "@/components/admin/PropertiesPanel";
import LeadsPanel from "@/components/admin/LeadsPanel";

export const metadata: Metadata = {
  title: "Panel Administrativo",
  robots: { index: false, follow: false },
};

function settled<T>(result: PromiseSettledResult<T>, fallback: T) {
  if (result.status === "fulfilled") return result.value;
  console.error("Panel: no se pudieron leer datos:", result.reason);
  return fallback;
}

export default async function AdminDashboardPage({
  searchParams,
}: PageProps<"/admin/dashboard">) {
  const session = await requireSession();
  const params = await searchParams;
  const tabParam = typeof params.tab === "string" ? params.tab : "";
  const tab: DashboardTab = DASHBOARD_TABS.includes(tabParam as DashboardTab)
    ? (tabParam as DashboardTab)
    : "propiedades";
  const savedSlug = typeof params.guardada === "string" ? params.guardada : null;

  const results = await Promise.allSettled([
    listAllProperties(),
    listContacts(),
    listAppraisals(),
    listVisits(),
  ]);
  const loadFailed = results.some((r) => r.status === "rejected");
  const properties = settled(results[0], []);
  const contacts = contactViews(settled(results[1], []), session.role);
  const appraisals = appraisalViews(settled(results[2], []), session.role);
  const visits = visitViews(settled(results[3], []), session.role);

  const fresh = (list: { status: string }[]) =>
    list.filter((l) => l.status === "nuevo").length;

  return (
    <div className="min-h-screen bg-warm-white">
      <AdminHeader role={session.role} />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {session.role === "demo" && (
          <div className="mb-5 flex gap-3 rounded-2xl bg-gold/10 p-4 text-sm text-slate/80 ring-1 ring-gold/30">
            <Info size={18} className="mt-0.5 shrink-0 text-gold" />
            <p>
              <strong className="font-semibold text-slate">Estás en el modo demo.</strong>{" "}
              Cargá, editá y pausá propiedades: los cambios se ven en la web al
              instante. Los datos de contacto se muestran ocultos y todo vuelve
              a como estaba cada noche.
            </p>
          </div>
        )}

        {savedSlug && (
          <div
            role="status"
            className="mb-5 flex flex-col gap-2 rounded-2xl bg-emerald/10 p-4 text-sm text-emerald ring-1 ring-emerald/20 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="flex items-center gap-2 font-medium">
              <CheckCircle2 size={18} />
              ¡Listo! Los cambios ya están en la web.
            </p>
            <Link
              href={propertyPath(savedSlug)}
              target="_blank"
              className="font-semibold underline underline-offset-2 hover:text-gold"
            >
              Ver la publicación →
            </Link>
          </div>
        )}

        {loadFailed && (
          <p
            role="alert"
            className="mb-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200"
          >
            No pudimos leer todos los datos de la base. Probá recargar la página
            en un rato.
          </p>
        )}

        <DashboardTabs
          active={tab}
          counts={{
            propiedades: { total: properties.length },
            consultas: { total: contacts.length, fresh: fresh(contacts) },
            tasaciones: { total: appraisals.length, fresh: fresh(appraisals) },
            visitas: { total: visits.length, fresh: fresh(visits) },
          }}
        />

        <div className="mt-6">
          {tab === "propiedades" && (
            <PropertiesPanel properties={properties} role={session.role} />
          )}
          {tab === "consultas" && (
            <LeadsPanel leads={contacts} emptyLabel="Todavía no recibiste consultas." />
          )}
          {tab === "tasaciones" && (
            <LeadsPanel
              leads={appraisals}
              emptyLabel="Todavía no recibiste solicitudes de tasación."
            />
          )}
          {tab === "visitas" && (
            <LeadsPanel
              leads={visits}
              emptyLabel="Todavía no hay visitas agendadas desde el asistente."
            />
          )}
        </div>
      </main>
    </div>
  );
}
