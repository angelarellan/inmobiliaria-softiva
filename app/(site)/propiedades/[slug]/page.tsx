import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bath,
  BedDouble,
  Car,
  ChevronRight,
  ExternalLink,
  MapPin,
  Ruler,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PropertyCard from "@/components/PropertyCard";
import PropertyGallery from "@/components/property/PropertyGallery";
import PropertyActions from "@/components/property/PropertyActions";
import {
  getPropertyBySlug,
  getVisibleProperties,
  pickSimilar,
} from "@/lib/data/properties";
import { closedStampLabel, formatPropertyPrice } from "@/lib/format";
import { absoluteUrl, propertyPath, propertyUrl, shareImageUrl, SITE_URL } from "@/lib/site";
import type { Property } from "@/lib/types";

type Props = PageProps<"/propiedades/[slug]">;

function describe(p: Property) {
  const base = p.shortDescription || p.description;
  const text = base.length > 160 ? `${base.slice(0, 157).trimEnd()}…` : base;
  return `${p.operation} · ${formatPropertyPrice(p)} · ${p.neighborhood}. ${text}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) {
    return { title: "Propiedad no encontrada", robots: { index: false } };
  }

  const description = describe(property);
  const image = shareImageUrl(property.images[0]);
  const isUnsplash = image?.includes("images.unsplash.com");
  const images = image
    ? [
        {
          url: image,
          alt: property.title,
          ...(isUnsplash ? { width: 1200, height: 630 } : {}),
        },
      ]
    : undefined;

  return {
    title: property.title,
    description,
    alternates: { canonical: propertyPath(property.slug) },
    openGraph: {
      type: "website",
      locale: "es_AR",
      siteName: "AURA Bienes Raíces",
      url: propertyPath(property.slug),
      title: `${property.title} · ${formatPropertyPrice(property)}`,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: `${property.title} · ${formatPropertyPrice(property)}`,
      description,
      images: image ? [image] : undefined,
    },
  };
}

const SCHEMA_TYPES: Record<Property["type"], string> = {
  Casa: "SingleFamilyResidence",
  Departamento: "Apartment",
  Penthouse: "Apartment",
  Oficina: "Accommodation",
  Terreno: "Place",
};

function jsonLd(p: Property) {
  const url = propertyUrl(p.slug);
  return [
    {
      "@context": "https://schema.org",
      "@type": "RealEstateListing",
      "@id": `${url}#listing`,
      name: p.title,
      description: p.description || p.shortDescription,
      url,
      image: p.images,
      datePosted: p.createdAt,
      dateModified: p.updatedAt,
      offers: {
        "@type": "Offer",
        price: p.price,
        priceCurrency: p.currency,
        businessFunction:
          p.operation === "Venta"
            ? "http://purl.org/goodrelations/v1#Sell"
            : "http://purl.org/goodrelations/v1#LeaseOut",
        availability:
          p.status === "publicada"
            ? "https://schema.org/InStock"
            : "https://schema.org/SoldOut",
        ...(p.operation === "Alquiler"
          ? {
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: p.price,
                priceCurrency: p.currency,
                unitCode: "MON",
              },
            }
          : {}),
        seller: {
          "@type": "RealEstateAgent",
          name: "AURA Bienes Raíces",
          url: SITE_URL,
        },
      },
      about: {
        "@type": SCHEMA_TYPES[p.type],
        name: p.title,
        ...(p.type !== "Terreno"
          ? {
              floorSize: {
                "@type": "QuantitativeValue",
                value: p.area,
                unitCode: "MTK",
              },
              numberOfBedrooms: p.bedrooms,
              numberOfBathroomsTotal: p.bathrooms,
            }
          : {}),
        address: {
          "@type": "PostalAddress",
          streetAddress: p.address || undefined,
          addressLocality: p.neighborhood,
          addressRegion: p.city,
          addressCountry: "AR",
        },
        amenityFeature: p.amenities.map((a) => ({
          "@type": "LocationFeatureSpecification",
          name: a,
          value: true,
        })),
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: absoluteUrl("/") },
        {
          "@type": "ListItem",
          position: 2,
          name: "Propiedades",
          item: absoluteUrl("/#propiedades"),
        },
        { "@type": "ListItem", position: 3, name: p.title, item: url },
      ],
    },
  ];
}

export default async function PropertyPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const similar = pickSimilar(await getVisibleProperties(), property);
  const showDemoBar = query.captura !== "1";
  const stamp = closedStampLabel(property.status);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [property.address, property.neighborhood, property.city].filter(Boolean).join(", ")
  )}`;

  const specs = [
    { icon: Ruler, label: "Superficie", value: `${property.area} m²` },
    { icon: BedDouble, label: "Dormitorios", value: property.bedrooms },
    { icon: Bath, label: "Baños", value: property.bathrooms },
    { icon: Car, label: "Cocheras", value: property.parking },
  ];

  const priceCard = (
    <div className="rounded-2xl bg-white p-6 shadow-lg shadow-emerald/5 ring-1 ring-slate/5">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate/50">
        {property.operation === "Venta" ? "Precio de venta" : "Alquiler mensual"}
      </p>
      <p className="mt-1 font-serif-display text-3xl text-gold">
        {formatPropertyPrice(property)}
      </p>
      {stamp && (
        <p className="mt-3 rounded-lg bg-emerald/5 px-3 py-2 text-sm text-emerald">
          Esta propiedad ya fue {stamp.toLowerCase()}. Escribinos y te mostramos
          opciones parecidas.
        </p>
      )}
      <div className="mt-5">
        <PropertyActions property={property} />
      </div>
    </div>
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd(property)).replace(/</g, "\\u003c"),
        }}
      />
      <Navbar variant="solid" showDemoBar={showDemoBar} />

      <main
        className={`bg-warm-white pb-24 ${showDemoBar ? "pt-36 sm:pt-32" : "pt-24"}`}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <nav aria-label="Ruta" className="mb-5 flex flex-wrap items-center gap-1 text-sm text-slate/60">
            <Link href="/" className="hover:text-emerald">
              Inicio
            </Link>
            <ChevronRight size={14} />
            <Link href="/#propiedades" className="hover:text-emerald">
              Propiedades
            </Link>
            <ChevronRight size={14} />
            <span className="line-clamp-1 text-slate/80">{property.title}</span>
          </nav>

          <PropertyGallery
            images={property.images}
            title={property.title}
            status={property.status}
          />

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    property.operation === "Venta"
                      ? "bg-emerald text-warm-white"
                      : "bg-gold text-emerald"
                  }`}
                >
                  {property.operation}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate ring-1 ring-slate/10">
                  {property.type}
                </span>
                {stamp && (
                  <span className="rounded-full border border-gold bg-emerald px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold">
                    {stamp}
                  </span>
                )}
              </div>

              <h1 className="mt-4 font-serif-display text-3xl leading-tight text-slate sm:text-4xl">
                {property.title}
              </h1>
              <p className="mt-2 flex items-start gap-1.5 text-slate/65">
                <MapPin size={18} className="mt-0.5 shrink-0 text-emerald" />
                {[property.address, property.neighborhood, property.city]
                  .filter(Boolean)
                  .join(", ")}
              </p>

              {/* En celular, el precio y los botones van arriba */}
              <div className="mt-6 lg:hidden">{priceCard}</div>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1 rounded-xl bg-white p-4 text-center ring-1 ring-slate/5"
                  >
                    <Icon size={22} className="text-emerald" />
                    <p className="text-lg font-semibold text-slate">{value}</p>
                    <p className="text-xs uppercase tracking-wide text-slate/50">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              <section className="mt-10">
                <h2 className="font-serif-display text-2xl text-slate">Descripción</h2>
                {property.shortDescription && (
                  <p className="mt-3 text-lg leading-relaxed text-slate/85">
                    {property.shortDescription}
                  </p>
                )}
                {property.description && (
                  <p className="mt-4 whitespace-pre-line leading-relaxed text-slate/75">
                    {property.description}
                  </p>
                )}
              </section>

              {property.amenities.length > 0 && (
                <section className="mt-10">
                  <h2 className="font-serif-display text-2xl text-slate">Comodidades</h2>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {property.amenities.map((a) => (
                      <li
                        key={a}
                        className="rounded-full bg-emerald/5 px-3.5 py-1.5 text-sm text-emerald"
                      >
                        {a}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="mt-10">
                <h2 className="font-serif-display text-2xl text-slate">Ubicación</h2>
                <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-white p-5 ring-1 ring-slate/5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-slate">{property.neighborhood}</p>
                    <p className="text-sm text-slate/65">
                      {[property.address, property.city].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald hover:text-gold"
                  >
                    Ver en Google Maps
                    <ExternalLink size={15} />
                  </a>
                </div>
              </section>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-32">{priceCard}</div>
            </aside>
          </div>

          {similar.length > 0 && (
            <section className="mt-20">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                Seguí mirando
              </p>
              <h2 className="mt-2 font-serif-display text-3xl text-slate">
                Propiedades similares
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {similar.map((p, i) => (
                  <PropertyCard key={p.id} property={p} index={i} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
