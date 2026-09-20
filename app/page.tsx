import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import About from "@/components/About";
import WhyChooseUs from "@/components/WhyChooseUs";
import AppraisalForm from "@/components/AppraisalForm";
import Testimonials from "@/components/Testimonials";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { OperationType, PropertyType, SearchFilters } from "@/lib/types";

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;

  const initialFilters: SearchFilters = {
    operation: (params.operation as OperationType | undefined) ?? "Todas",
    type: (params.type as PropertyType | undefined) ?? "Todos",
    neighborhood: (params.neighborhood as string | undefined) ?? "",
    maxPrice: params.maxPrice ? Number(params.maxPrice) : null,
  };

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedProperties initialFilters={initialFilters} />
        <About />
        <WhyChooseUs />
        <AppraisalForm />
        <Testimonials />
        <ContactSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
