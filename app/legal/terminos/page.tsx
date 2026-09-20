import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description:
    "Términos y condiciones de uso del sitio web de AURA Bienes Raíces.",
};

export default function TermsPage() {
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
        Términos y Condiciones
      </h1>
      <div className="prose mt-6 max-w-none text-slate/80">
        <p>
          El acceso y uso de este sitio web implica la aceptación de los
          presentes términos y condiciones. AURA Bienes Raíces se reserva el
          derecho de modificar este contenido en cualquier momento.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-slate">
          Información sobre propiedades
        </h2>
        <p>
          La información, precios, imágenes y superficies publicadas tienen
          carácter meramente informativo y están sujetos a confirmación y
          disponibilidad. AURA Bienes Raíces no se responsabiliza por
          errores tipográficos u omisiones involuntarias.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-slate">
          Propiedad intelectual
        </h2>
        <p>
          Todos los contenidos de este sitio, incluyendo textos, imágenes y
          diseño, son propiedad de AURA Bienes Raíces o de sus respectivos
          titulares y no pueden reproducirse sin autorización previa.
        </p>
        <h2 className="mt-6 text-lg font-semibold text-slate">Contacto</h2>
        <p>
          Ante cualquier consulta sobre estos términos, podés escribirnos a
          contacto@aurabienesraices.com.ar.
        </p>
      </div>
    </main>
  );
}
