import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FeaturedProperties from "@/components/FeaturedProperties";
import About from "@/components/About";
import WhyChooseUs from "@/components/WhyChooseUs";
import AppraisalForm from "@/components/AppraisalForm";
import Testimonials from "@/components/Testimonials";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { getVisibleProperties } from "@/lib/data/properties";
import {
  OPERATIONS,
  PROPERTY_TYPES,
  OperationType,
  PropertyType,
  SearchFilters,
} from "@/lib/types";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const properties = await getVisibleProperties();
  const neighborhoods = Array.from(new Set(properties.map((p) => p.neighborhood))).sort(
    (a, b) => a.localeCompare(b, "es")
  );

  const operation = param(params.operation);
  const type = param(params.type);
  const neighborhood = param(params.neighborhood);
  const maxPrice = Number(param(params.maxPrice));

  const initialFilters: SearchFilters = {
    operation: OPERATIONS.includes(operation as OperationType)
      ? (operation as OperationType)
      : "Todas",
    type: PROPERTY_TYPES.includes(type as PropertyType) ? (type as PropertyType) : "Todos",
    neighborhood: neighborhood ?? "",
    maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : null,
  };

  return (
    <>
      <Navbar />
      <main>
        <Hero neighborhoods={neighborhoods} />
        <FeaturedProperties
          key={JSON.stringify(initialFilters)}
          properties={properties}
          neighborhoods={neighborhoods}
          initialFilters={initialFilters}
        />
        <About />
        <WhyChooseUs />
        <AppraisalForm />
        <Testimonials />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
