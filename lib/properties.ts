import { Property } from "./types";

function unsplash(id: string, w = 1200, q = 80) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=${q}`;
}

export const properties: Property[] = [
  {
    id: "1",
    slug: "penthouse-puerto-madero-vista-rio",
    title: "Penthouse con vista al río en Puerto Madero",
    operation: "Venta",
    type: "Penthouse",
    currency: "USD",
    price: 1250000,
    neighborhood: "Puerto Madero",
    city: "Buenos Aires",
    address: "Av. Alicia Moreau de Justo 1780",
    area: 220,
    bedrooms: 3,
    bathrooms: 3,
    parking: 2,
    images: [
      unsplash("1600607687939-ce8a6c25118c"),
      unsplash("1613977257363-707ba9348227"),
      unsplash("1560448204-e02f11c3d0e2"),
      unsplash("1600566753086-00f18fb6b3ea"),
    ],
    shortDescription:
      "Piso completo con terraza privada, vistas panorámicas al río y las torres de Catalinas.",
    description:
      "Exclusivo penthouse en uno de los edificios más codiciados de Puerto Madero. Living comedor de doble altura con ventanales de piso a techo, cocina integrada de diseño italiano, suite principal con vestidor y terraza de 80 m² con piletín climatizado. Amenities de categoría hotelera y seguridad 24 horas.",
    amenities: [
      "Pileta climatizada",
      "Gimnasio equipado",
      "Seguridad 24hs",
      "Cochera doble",
      "Terraza privada",
      "SUM con parrilla",
    ],
    featured: true,
  },
  {
    id: "2",
    slug: "departamento-recoleta-clasico-renovado",
    title: "Departamento clásico renovado en Recoleta",
    operation: "Venta",
    type: "Departamento",
    currency: "USD",
    price: 380000,
    neighborhood: "Recoleta",
    city: "Buenos Aires",
    address: "Av. Alvear 1620",
    area: 120,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    images: [
      unsplash("1600047509807-ba8f99d2cdde"),
      unsplash("1484154218962-a197022b5858"),
      unsplash("1505843513577-22bb7d21e455"),
      unsplash("1571055107559-3e67626fa8be"),
    ],
    shortDescription:
      "Pisos de roble, molduras originales y reforma integral con terminaciones premium.",
    description:
      "Departamento de categoría en edificio de la década del 30 totalmente restaurado. Combina el encanto clásico porteño —techos altos, molduras y pisos de roble— con una reforma integral que incorporó instalaciones nuevas, cocina de diseño y baños en mármol travertino. A pasos del Cementerio de la Recoleta y las principales galerías de arte.",
    amenities: [
      "Balcón francés",
      "Baulera",
      "Cochera",
      "Portero 24hs",
      "Placares a medida",
    ],
    featured: true,
  },
  {
    id: "3",
    slug: "casa-san-isidro-parque-y-pileta",
    title: "Casa de estilo en San Isidro con parque y pileta",
    operation: "Venta",
    type: "Casa",
    currency: "USD",
    price: 890000,
    neighborhood: "San Isidro",
    city: "Buenos Aires",
    address: "Ruta Panamericana km 28, Barrio Las Lomas",
    area: 350,
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    images: [
      unsplash("1600585154340-be6161a56a0c"),
      unsplash("1613490493576-7fde63acd811"),
      unsplash("1564013799919-ab600027ffc6"),
      unsplash("1600566752355-35792bedcfea"),
    ],
    shortDescription:
      "Lote de 900 m², parque parquizado, pileta y quincho con parrilla cubierta.",
    description:
      "Casa de una planta en barrio residencial de San Isidro, sobre lote de 900 m² con parque maduro. Living con hogar a leña, cocina comedor diario integrada al parque, suite principal en ala independiente y dependencia de servicio. Ideal para familias que buscan tranquilidad sin resignar cercanía a colegios bilingües y clubes de la zona norte.",
    amenities: [
      "Pileta",
      "Quincho con parrilla",
      "Parque parquizado",
      "Hogar a leña",
      "Garaje para 3 autos",
      "Sistema de riego automático",
    ],
    featured: true,
  },
  {
    id: "4",
    slug: "departamento-palermo-chico-alquiler",
    title: "Departamento de diseño en Palermo Chico",
    operation: "Alquiler",
    type: "Departamento",
    currency: "USD",
    price: 2800,
    priceSuffix: "/mes",
    neighborhood: "Palermo Chico",
    city: "Buenos Aires",
    address: "Av. Del Libertador 3200",
    area: 95,
    bedrooms: 2,
    bathrooms: 2,
    parking: 1,
    images: [
      unsplash("1600596542815-ffad4c1539a9"),
      unsplash("1600210492486-724fe5c67fb0"),
      unsplash("1522708323590-d24dbb6b0267"),
      unsplash("1600607687920-4e2a09cf159d"),
    ],
    shortDescription:
      "Torre premium frente a los bosques de Palermo, totalmente amoblado y equipado.",
    description:
      "Unidad de diseño en torre boutique frente a los Bosques de Palermo. Amenities de nivel hotelero, terminaciones de autor y vistas abiertas. Entrega inmediata, apto profesional, ideal para ejecutivos o familias que buscan alquilar en una de las zonas más buscadas de la ciudad.",
    amenities: [
      "Amoblado",
      "Pileta en rooftop",
      "Gimnasio",
      "Laundry",
      "Cochera cubierta",
    ],
    featured: true,
  },
  {
    id: "5",
    slug: "casa-nordelta-laguna-privada",
    title: "Casa sobre laguna en Nordelta",
    operation: "Venta",
    type: "Casa",
    currency: "USD",
    price: 1100000,
    neighborhood: "Nordelta",
    city: "Tigre, Buenos Aires",
    address: "Barrio Los Castores, Nordelta",
    area: 420,
    bedrooms: 5,
    bathrooms: 5,
    parking: 4,
    images: [
      unsplash("1616486338812-3dadae4b4ace"),
      unsplash("1524758631624-e2822e304c36"),
      unsplash("1613545325278-f24b0cae1224"),
      unsplash("1583608205776-bfd35f0d9f83"),
    ],
    shortDescription:
      "Frente a laguna, muelle propio, arquitectura contemporánea y doble altura.",
    description:
      "Espectacular residencia contemporánea con frente directo a laguna navegable y muelle propio. Espacios de doble altura, cerramientos de piso a techo que integran el parque con el living, cocina gourmet con isla central y suite principal con vestidor y jacuzzi. Cine en casa, cava y dependencia de servicio completa.",
    amenities: [
      "Muelle propio",
      "Pileta a borde infinito",
      "Cine en casa",
      "Cava",
      "Panel solar",
      "Seguridad perimetral del barrio",
    ],
    featured: false,
  },
  {
    id: "6",
    slug: "departamento-belgrano-alquiler",
    title: "Monoambiente premium en Belgrano",
    operation: "Alquiler",
    type: "Departamento",
    currency: "ARS",
    price: 850000,
    priceSuffix: "/mes",
    neighborhood: "Belgrano",
    city: "Buenos Aires",
    address: "Av. Cabildo 2100",
    area: 80,
    bedrooms: 1,
    bathrooms: 1,
    parking: 0,
    images: [
      unsplash("1600585152220-90363fe7e115"),
      unsplash("1571003123894-1f0594d2b5d9"),
      unsplash("1600607688066-890987f18a86"),
    ],
    shortDescription:
      "Estrenar, luminoso, a metros del subte D y del Barrio Chino.",
    description:
      "Unidad a estrenar en edificio boutique de Belgrano R, con excelente orientación y muy buena luz natural. Cocina integrada, placares empotrados y balcón. A pasos de la estación de subte y de la vida gastronómica del Barrio Chino.",
    amenities: ["Balcón", "Laundry en el edificio", "SUM", "Seguridad"],
    featured: false,
  },
  {
    id: "7",
    slug: "penthouse-puerto-madero-duplex",
    title: "Dúplex de lujo en Puerto Madero",
    operation: "Venta",
    type: "Penthouse",
    currency: "USD",
    price: 2100000,
    neighborhood: "Puerto Madero",
    city: "Buenos Aires",
    address: "Juana Manso 1550",
    area: 310,
    bedrooms: 4,
    bathrooms: 4,
    parking: 3,
    images: [
      unsplash("1615529182904-14819c35db37"),
      unsplash("1615874959474-d609969a20ed"),
      unsplash("1615873968403-89e068629265"),
      unsplash("1613977257363-707ba9348227"),
    ],
    shortDescription:
      "Dúplex con doble frente, terraza panorámica de 120 m² y acceso privado por ascensor.",
    description:
      "Residencia dúplex de autor en la torre más exclusiva del dique. Doble altura en el living principal, escalera flotante, cuatro suites con vestidor y terraza panorámica de 120 m² con vista 360° a la ciudad y el río. Acceso privado por ascensor y bodega climatizada propia.",
    amenities: [
      "Acceso privado por ascensor",
      "Terraza panorámica",
      "Bodega climatizada",
      "Home theater",
      "Spa privado",
      "Cochera para 3 autos",
    ],
    featured: true,
  },
  {
    id: "8",
    slug: "casa-barrio-parque-palermo",
    title: "Casa de autor en Barrio Parque",
    operation: "Venta",
    type: "Casa",
    currency: "USD",
    price: 1450000,
    neighborhood: "Barrio Parque, Palermo",
    city: "Buenos Aires",
    address: "Cerviño 4100",
    area: 380,
    bedrooms: 4,
    bathrooms: 3,
    parking: 2,
    images: [
      unsplash("1494526585095-c41746248156"),
      unsplash("1523217582562-09d0def993a6"),
      unsplash("1502672260266-1c1ef2d93688"),
      unsplash("1568605114967-8130f3a36994"),
    ],
    shortDescription:
      "Arquitectura de autor sobre lote propio en el barrio más verde y exclusivo de Palermo.",
    description:
      "Casa de diseño contemporáneo en Barrio Parque, una de las zonas residenciales más exclusivas de la Ciudad. Volúmenes limpios, materiales nobles y un patio interno que ilumina cada ambiente. Living principal de doble altura, estudio independiente y jardín con deck de madera.",
    amenities: [
      "Jardín con deck",
      "Estudio independiente",
      "Patio interno",
      "Cochera para 2 autos",
      "Domótica integrada",
    ],
    featured: false,
  },
];

export const neighborhoods = Array.from(
  new Set(properties.map((p) => p.neighborhood))
).sort();

export function getPropertyBySlug(slug: string) {
  return properties.find((p) => p.slug === slug);
}

export function formatPrice(
  price: number,
  currency: "USD" | "ARS",
  suffix?: string
) {
  const formatted = new Intl.NumberFormat("es-AR").format(price);
  const symbol = currency === "USD" ? "US$" : "AR$";
  return `${symbol} ${formatted}${suffix ?? ""}`;
}
