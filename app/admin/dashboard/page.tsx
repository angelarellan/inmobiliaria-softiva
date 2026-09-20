import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, ADMIN_COOKIE_VALUE } from "@/lib/admin-auth";
import { getAppraisals, getContacts } from "@/lib/store";
import { properties } from "@/lib/properties";
import DashboardTabs from "@/components/admin/DashboardTabs";

export const metadata: Metadata = {
  title: "Panel Administrativo",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const cookieStore = await cookies();
  const isAuthenticated =
    cookieStore.get(ADMIN_COOKIE)?.value === ADMIN_COOKIE_VALUE;

  if (!isAuthenticated) {
    redirect("/admin");
  }

  const contacts = getContacts();
  const appraisals = getAppraisals();

  return (
    <DashboardTabs
      contacts={contacts}
      appraisals={appraisals}
      properties={properties}
    />
  );
}
