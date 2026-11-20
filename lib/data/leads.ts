import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type {
  AppraisalSubmission,
  ContactSubmission,
  LeadStatus,
  VisitRequest,
} from "@/lib/types";

export type LeadTable = "contacts" | "appraisals" | "visits";

function check(error: { message: string } | null) {
  if (error) throw new Error(`Supabase: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Altas (formularios públicos)
// ---------------------------------------------------------------------------

export async function insertContact(
  data: Omit<ContactSubmission, "id" | "createdAt" | "status">
) {
  const { error } = await getSupabaseAdmin().from("contacts").insert({
    name: data.name,
    email: data.email,
    phone: data.phone,
    message: data.message,
    property_id: data.propertyId ?? null,
    property_title: data.propertyTitle ?? null,
  });
  check(error);
}

export async function insertAppraisal(
  data: Omit<AppraisalSubmission, "id" | "createdAt" | "status">
) {
  const { error } = await getSupabaseAdmin().from("appraisals").insert({
    name: data.name,
    email: data.email,
    phone: data.phone,
    property_type: data.propertyType,
    address: data.address,
    area: data.area,
    comments: data.comments,
  });
  check(error);
}

export async function insertVisit(
  data: Omit<VisitRequest, "id" | "createdAt" | "status">
) {
  const { error } = await getSupabaseAdmin().from("visits").insert({
    property_id: data.propertyId ?? null,
    property_title: data.propertyTitle,
    property_slug: data.propertySlug ?? null,
    visit_date: data.visitDate,
    time_slot: data.timeSlot,
    name: data.name,
    phone: data.phone,
    operation: data.operation ?? null,
    zone: data.zone ?? null,
    budget: data.budget ?? null,
  });
  check(error);
}

// ---------------------------------------------------------------------------
// Lecturas (panel)
// ---------------------------------------------------------------------------

const LIST_LIMIT = 300;

export async function listContacts(): Promise<ContactSubmission[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("contacts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(LIST_LIMIT);
  check(error);
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone ?? "",
    message: r.message,
    propertyId: r.property_id ?? undefined,
    propertyTitle: r.property_title ?? undefined,
    status: r.status,
    createdAt: r.created_at,
  }));
}

export async function listAppraisals(): Promise<AppraisalSubmission[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("appraisals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(LIST_LIMIT);
  check(error);
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    propertyType: r.property_type,
    address: r.address,
    area: r.area ?? "",
    comments: r.comments ?? "",
    status: r.status,
    createdAt: r.created_at,
  }));
}

export async function listVisits(): Promise<VisitRequest[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("visits")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(LIST_LIMIT);
  check(error);
  return (data ?? []).map((r) => ({
    id: r.id,
    propertyId: r.property_id ?? undefined,
    propertyTitle: r.property_title,
    propertySlug: r.property_slug ?? undefined,
    visitDate: r.visit_date,
    timeSlot: r.time_slot,
    name: r.name,
    phone: r.phone,
    operation: r.operation ?? undefined,
    zone: r.zone ?? undefined,
    budget: r.budget ?? undefined,
    status: r.status,
    createdAt: r.created_at,
  }));
}

export async function updateLeadStatus(
  table: LeadTable,
  id: string,
  status: LeadStatus
) {
  const { error } = await getSupabaseAdmin()
    .from(table)
    .update({ status })
    .eq("id", id);
  check(error);
}
