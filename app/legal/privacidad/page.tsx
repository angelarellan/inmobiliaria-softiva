import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description:
    "Política de privacidad de AURA Bienes Raíces sobre el tratamiento de datos personales.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-emerald hover:text-gold"
      >
        <ArrowLeft size={16} />
        Volver al inicio
      </Link>
      <h1 className="font-serif-display text-3xl text-slate">
        Política de Privacidad
      </h1>
      <div className="prose mt-6 max-w-none text-slate/80">
        <p>
          En AURA Bienes Raíces valoramos la confianza que depositás en
          nosotros. Esta política describe cómo recolectamos, usamos y
          protegemos tu información personal cuando utilizás nuestro sitio
          web o solicitás alguno de nuestros servicios.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-slate">
          Información que recolectamos
        </h2>
        <p>
          Recolectamos los datos que nos proporcionás voluntariamente a
          través de nuestros formularios de contacto y tasación: nombre,
          email, teléfono y detalles sobre la propiedad de interés.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-slate">
          Uso de la información
        </h2>
        <p>
          Utilizamos tus datos exclusivamente para responder a tus consultas,
          coordinar tasaciones y ofrecerte información sobre propiedades
          relevantes. No compartimos tu información con terceros sin tu
          consentimiento.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-slate">Tus derechos</h2>
        <p>
          Podés solicitar en cualquier momento el acceso, la rectificación o
          la eliminación de tus datos personales escribiéndonos a
          contacto@aurabienesraices.com.ar.
        </p>
      </div>
    </main>
  );
}
