import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, ADMIN_COOKIE_VALUE } from "@/lib/admin-auth";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Ingreso Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const isAuthenticated =
    cookieStore.get(ADMIN_COOKIE)?.value === ADMIN_COOKIE_VALUE;

  if (isAuthenticated) {
    redirect("/admin/dashboard");
  }

  return <LoginForm />;
}
