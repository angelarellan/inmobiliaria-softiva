import VisitAssistant from "@/components/VisitAssistant";
import WhatsAppButton from "@/components/WhatsAppButton";

/**
 * Layout de la parte pública. El asistente de visitas vive acá para que la
 * conversación no se pierda al pasar de la home a una propiedad.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {children}
      <VisitAssistant />
      <WhatsAppButton />
    </>
  );
}
