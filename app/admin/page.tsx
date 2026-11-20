import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Ingreso Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await getSession()) {
    redirect("/admin/dashboard");
  }

  return <LoginForm />;
}
