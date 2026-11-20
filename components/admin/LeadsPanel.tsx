"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Loader2,
  Lock,
  Mail,
  Phone,
} from "lucide-react";
import { WhatsAppIcon } from "../SocialIcons";
import type { LeadStatus } from "@/lib/types";
import { LEAD_STATUSES } from "@/lib/types";
import { formatDateTime } from "@/lib/format";
import type { LeadView } from "@/lib/admin-leads";
import { setLeadStatusAction } from "@/app/admin/actions";

const STATUS_LABELS: Record<LeadStatus, string> = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  cerrado: "Cerrado",
};

const STATUS_STYLES: Record<LeadStatus, string> = {
  nuevo: "bg-gold/15 text-[#8a6d12] ring-gold/40",
  contactado: "bg-emerald/10 text-emerald ring-emerald/20",
  cerrado: "bg-slate/10 text-slate/60 ring-slate/15",
};

interface Props {
  leads: LeadView[];
  emptyLabel: string;
}

export default function LeadsPanel({ leads, emptyLabel }: Props) {
  if (leads.length === 0) {
    return (
      <p className="rounded-2xl bg-white px-6 py-12 text-center text-sm text-slate/50 ring-1 ring-slate/10">
        {emptyLabel}
      </p>
    );
  }
  return (
    <ul className="grid gap-3 lg:grid-cols-2">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </ul>
  );
}

function LeadCard({ lead }: { lead: LeadView }) {
  const [status, setStatus] = useState(lead.status);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [demoNotice, setDemoNotice] = useState(false);

  const changeStatus = (next: LeadStatus) => {
    const prev = status;
    setStatus(next);
    setError(null);
    startTransition(async () => {
      const result = await setLeadStatusAction(lead.table, lead.id, next);
      if (!result.ok) {
        setStatus(prev);
        setError(result.error);
      }
    });
  };

  return (
    <li className="flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-slate">{lead.name}</p>
          <p className="text-xs text-slate/50">{formatDateTime(lead.createdAt)}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {pending && <Loader2 size={14} className="animate-spin text-slate/40" />}
          <label className="sr-only" htmlFor={`lead-${lead.id}`}>
            Estado
          </label>
          <select
            id={`lead-${lead.id}`}
            value={status}
            onChange={(e) => changeStatus(e.target.value as LeadStatus)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 focus:outline-none ${STATUS_STYLES[status]}`}
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3">
        {lead.propertyHref ? (
          <Link
            href={lead.propertyHref}
            target="_blank"
            className="text-sm font-semibold text-emerald hover:text-gold"
          >
            {lead.headline}
          </Link>
        ) : (
          <p className="text-sm font-semibold text-emerald">{lead.headline}</p>
        )}
        {lead.highlight && (
          <p className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-gold/10 px-2.5 py-1 text-sm font-medium text-slate">
            <CalendarDays size={15} className="text-gold" />
            {lead.highlight}
          </p>
        )}
      </div>

      <dl className="mt-3 space-y-1 text-sm text-slate/70">
        {lead.phone && (
          <div className="flex items-center gap-2">
            <dt className="sr-only">Teléfono</dt>
            <Phone size={14} className="shrink-0 text-slate/40" />
            <dd>{lead.phone}</dd>
          </div>
        )}
        {lead.email && (
          <div className="flex items-center gap-2">
            <dt className="sr-only">Email</dt>
            <Mail size={14} className="shrink-0 text-slate/40" />
            <dd className="break-all">{lead.email}</dd>
          </div>
        )}
        {lead.details.map((d) => (
          <div key={d.label} className="flex gap-2">
            <dt className="shrink-0 text-slate/45">{d.label}:</dt>
            <dd>{d.value}</dd>
          </div>
        ))}
      </dl>

      {lead.message && (
        <p className="mt-3 whitespace-pre-line rounded-xl bg-warm-white p-3 text-sm text-slate/80">
          {lead.message}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {lead.whatsappHref ? (
          <a
            href={lead.whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full bg-[#25D366] px-4 py-2 text-xs font-semibold text-white transition-transform hover:scale-[1.02]"
          >
            <WhatsAppIcon size={15} />
            WhatsApp
          </a>
        ) : lead.masked ? (
          <button
            type="button"
            onClick={() => setDemoNotice((v) => !v)}
            className="flex items-center gap-1.5 rounded-full bg-[#25D366]/15 px-4 py-2 text-xs font-semibold text-[#128C4B]"
          >
            <WhatsAppIcon size={15} />
            WhatsApp
          </button>
        ) : null}
        {lead.mailtoHref && (
          <a
            href={lead.mailtoHref}
            className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-emerald ring-1 ring-emerald/25 hover:bg-emerald/5"
          >
            <Mail size={15} />
            Email
          </a>
        )}
      </div>

      {demoNotice && (
        <p className="mt-2 flex items-start gap-2 rounded-xl bg-gold/10 p-3 text-xs text-slate/80">
          <Lock size={14} className="mt-0.5 shrink-0 text-gold" />
          En la demo los datos de contacto están ocultos para cuidar a quien los
          dejó. En el panel de tu inmobiliaria, este botón abre el chat de
          WhatsApp con el cliente y un mensaje listo para enviar.
        </p>
      )}

      {error && (
        <p className="mt-2 text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      )}
    </li>
  );
}
