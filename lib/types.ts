export type OperationType = "Venta" | "Alquiler";

export type PropertyType =
  | "Casa"
  | "Departamento"
  | "Penthouse"
  | "Oficina"
  | "Terreno";

export type Currency = "USD" | "ARS";

export type PropertyStatus = "publicada" | "pausada" | "vendida" | "alquilada";

export type PropertyOrigin = "seed" | "demo" | "owner";

export const OPERATIONS: OperationType[] = ["Venta", "Alquiler"];
export const PROPERTY_TYPES: PropertyType[] = [
  "Casa",
  "Departamento",
  "Penthouse",
  "Oficina",
  "Terreno",
];
export const CURRENCIES: Currency[] = ["USD", "ARS"];
export const PROPERTY_STATUSES: PropertyStatus[] = [
  "publicada",
  "pausada",
  "vendida",
  "alquilada",
];

export interface Property {
  id: string;
  slug: string;
  title: string;
  operation: OperationType;
  type: PropertyType;
  currency: Currency;
  price: number;
  priceSuffix?: string;
  neighborhood: string;
  city: string;
  address: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  images: string[];
  shortDescription: string;
  description: string;
  amenities: string[];
  featured: boolean;
  status: PropertyStatus;
  position: number;
  isSeed: boolean;
  createdBy: PropertyOrigin;
  createdAt: string;
  updatedAt: string;
}

/** Lo mínimo que necesita el asistente de visitas para mostrar una propiedad. */
export interface PropertySummary {
  id: string;
  slug: string;
  title: string;
  operation: OperationType;
  type: PropertyType;
  currency: Currency;
  price: number;
  priceSuffix?: string;
  neighborhood: string;
  image: string | null;
}

export type LeadStatus = "nuevo" | "contactado" | "cerrado";
export const LEAD_STATUSES: LeadStatus[] = ["nuevo", "contactado", "cerrado"];

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId?: string;
  propertyTitle?: string;
  status: LeadStatus;
  createdAt: string;
}

export interface AppraisalSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyType: string;
  address: string;
  area: string;
  comments: string;
  status: LeadStatus;
  createdAt: string;
}

export interface VisitRequest {
  id: string;
  propertyId?: string;
  propertyTitle: string;
  propertySlug?: string;
  visitDate: string;
  timeSlot: string;
  name: string;
  phone: string;
  operation?: string;
  zone?: string;
  budget?: string;
  status: LeadStatus;
  createdAt: string;
}

export interface SearchFilters {
  operation: OperationType | "Todas";
  type: PropertyType | "Todos";
  neighborhood: string;
  maxPrice: number | null;
}

export type AdminRole = "demo" | "owner";
