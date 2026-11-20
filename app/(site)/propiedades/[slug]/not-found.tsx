import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PropertyNotFound() {
  return (
    <>
      <Navbar variant="solid" />
      <main className="flex min-h-[70vh] items-center justify-center bg-warm-white px-6 pb-24 pt-32">
        <div className="max-w-md text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
            Propiedad no disponible
          </p>
          <h1 className="mt-3 font-serif-display text-3xl text-slate">
            Esta propiedad ya no está publicada
          </h1>
          <p className="mt-4 text-slate/70">
            Puede que se haya vendido, alquilado o pausado. Mirá el resto del
            catálogo: seguro hay algo para vos.
          </p>
          <Link
            href="/#propiedades"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-emerald px-6 py-3 text-sm font-semibold text-warm-white transition-colors hover:bg-emerald-light"
          >
            <ArrowLeft size={18} />
            Ver propiedades
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
