import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aurabienesraices.com.ar"),
  title: {
    default: "AURA Bienes Raíces — Gestión Inmobiliaria Integral",
    template: "%s | AURA Bienes Raíces",
  },
  description:
    "Inmobiliaria de alto nivel en Buenos Aires. Compra, venta, alquiler y tasación de propiedades premium en Puerto Madero, Recoleta, Palermo, San Isidro y Nordelta.",
  keywords: [
    "inmobiliaria de lujo",
    "propiedades premium Buenos Aires",
    "Puerto Madero",
    "tasaciones inmobiliarias",
    "AURA Bienes Raíces",
  ],
  openGraph: {
    title: "AURA Bienes Raíces — Gestión Inmobiliaria Integral",
    description:
      "Compra, venta, alquiler y tasación de propiedades premium en Buenos Aires.",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-warm-white text-slate antialiased">
        {children}
      </body>
    </html>
  );
}
