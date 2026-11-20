import Link from "next/link";
import { Building2, CalendarDays, ClipboardList, Mail } from "lucide-react";

export type DashboardTab = "propiedades" | "consultas" | "tasaciones" | "visitas";

export const DASHBOARD_TABS: DashboardTab[] = [
  "propiedades",
  "consultas",
  "tasaciones",
  "visitas",
];

const TAB_META: Record<DashboardTab, { label: string; icon: typeof Mail }> = {
  propiedades: { label: "Propiedades", icon: Building2 },
  consultas: { label: "Consultas", icon: Mail },
  tasaciones: { label: "Tasaciones", icon: ClipboardList },
  visitas: { label: "Visitas", icon: CalendarDays },
};

interface Props {
  active: DashboardTab;
  /** Total por pestaña y, para consultas/tasaciones/visitas, cuántas están "nuevas". */
  counts: Record<DashboardTab, { total: number; fresh?: number }>;
}

export default function DashboardTabs({ active, counts }: Props) {
  return (
    <nav
      aria-label="Secciones del panel"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-thin sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {DASHBOARD_TABS.map((key) => {
        const { label, icon: Icon } = TAB_META[key];
        const isActive = key === active;
        const { total, fresh } = counts[key];
        return (
          <Link
            key={key}
            href={`/admin/dashboard?tab=${key}`}
            replace
            scroll={false}
            aria-current={isActive ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-emerald text-warm-white"
                : "bg-white text-slate/70 ring-1 ring-slate/10 hover:text-emerald"
            }`}
          >
            <Icon size={16} />
            {label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                isActive ? "bg-warm-white/20" : "bg-slate/10"
              }`}
            >
              {total}
            </span>
            {!!fresh && (
              <span className="rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-bold text-emerald">
                {fresh} {fresh === 1 ? "nueva" : "nuevas"}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
