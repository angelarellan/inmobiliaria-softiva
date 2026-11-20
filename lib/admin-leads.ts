import "server-only";
import type { LeadTable } from "@/lib/data/leads";
import { formatVisitDate } from "@/lib/format";
import { maskAddress, maskEmail, maskFreeText, maskName, maskPhone } from "@/lib/mask";
import { propertyPath } from "@/lib/site";
import { buildWhatsAppLinkTo } from "@/lib/whatsapp";
import type {
  AdminRole,
  AppraisalSubmission,
  ContactSubmission,
  LeadStatus,
  VisitRequest,
} from "@/lib/types";

/**
 * Lo que el panel muestra de cada consulta, tasación o visita. Se arma en el
 * servidor: para el usuario demo, los datos personales ya llegan enmascarados
 * y sin link de WhatsApp (el número completo nunca sale del servidor).
 */
export interface LeadView {
  id: string;
  table: LeadTable;
  status: LeadStatus;
  createdAt: string;
  name: string;
  email: string | null;
  phone: string | null;
  headline: string;
  highlight?: string;
  details: { label: string; value: string }[];
  message?: string;
  propertyHref?: string;
  whatsappHref: string | null;
  mailtoHref: string | null;
  masked: boolean;
}

function firstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? "";
}

export function contactViews(list: ContactSubmission[], role: AdminRole): LeadView[] {
  const demo = role === "demo";
  return list.map((c) => ({
    id: c.id,
    table: "contacts",
    status: c.status,
    createdAt: c.createdAt,
    name: demo ? maskName(c.name) : c.name,
    email: demo ? maskEmail(c.email) : c.email,
    phone: c.phone ? (demo ? maskPhone(c.phone) : c.phone) : null,
    headline: c.propertyTitle ? `Consulta por "${c.propertyTitle}"` : "Consulta general",
    details: [],
    message: demo ? maskFreeText(c.message) : c.message,
    whatsappHref:
      demo || !c.phone
        ? null
        : buildWhatsAppLinkTo(
            c.phone,
            `Hola ${firstName(c.name)}, te escribo de AURA Bienes Raíces por tu consulta${
              c.propertyTitle ? ` sobre "${c.propertyTitle}"` : ""
            }.`
          ),
    mailtoHref: demo ? null : `mailto:${c.email}`,
    masked: demo,
  }));
}

export function appraisalViews(list: AppraisalSubmission[], role: AdminRole): LeadView[] {
  const demo = role === "demo";
  return list.map((a) => ({
    id: a.id,
    table: "appraisals",
    status: a.status,
    createdAt: a.createdAt,
    name: demo ? maskName(a.name) : a.name,
    email: demo ? maskEmail(a.email) : a.email,
    phone: demo ? maskPhone(a.phone) : a.phone,
    headline: `Tasación · ${a.propertyType}`,
    details: [
      { label: "Dirección", value: demo ? maskAddress(a.address) : a.address },
      ...(a.area ? [{ label: "Superficie", value: `${a.area} m²` }] : []),
    ],
    message: a.comments ? (demo ? maskFreeText(a.comments) : a.comments) : undefined,
    whatsappHref: demo
      ? null
      : buildWhatsAppLinkTo(
          a.phone,
          `Hola ${firstName(a.name)}, te escribo de AURA Bienes Raíces por la tasación de tu ${a.propertyType.toLowerCase()} en ${a.address}.`
        ),
    mailtoHref: demo ? null : `mailto:${a.email}`,
    masked: demo,
  }));
}

export function visitViews(list: VisitRequest[], role: AdminRole): LeadView[] {
  const demo = role === "demo";
  return list.map((v) => {
    const when = `${formatVisitDate(v.visitDate)} · ${v.timeSlot}`;
    const search = [v.operation, v.zone, v.budget].filter(Boolean).join(" · ");
    return {
      id: v.id,
      table: "visits",
      status: v.status,
      createdAt: v.createdAt,
      name: demo ? maskName(v.name) : v.name,
      email: null,
      phone: demo ? maskPhone(v.phone) : v.phone,
      headline: v.propertyTitle,
      highlight: when,
      details: search ? [{ label: "Buscaba", value: search }] : [],
      propertyHref: v.propertySlug ? propertyPath(v.propertySlug) : undefined,
      whatsappHref: demo
        ? null
        : buildWhatsAppLinkTo(
            v.phone,
            `Hola ${firstName(v.name)}, te escribo de AURA Bienes Raíces para confirmar tu visita a "${v.propertyTitle}" el ${formatVisitDate(v.visitDate)} (${v.timeSlot}).`
          ),
      mailtoHref: null,
      masked: demo,
    };
  });
}
