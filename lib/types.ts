export type OperationType = "Venta" | "Alquiler";

export type PropertyType =
  | "Casa"
  | "Departamento"
  | "Penthouse"
  | "Oficina"
  | "Terreno";

export type Currency = "USD" | "ARS";

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
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  propertyId?: string;
  propertyTitle?: string;
  createdAt: string;
}

export interface AppraisalSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyType: PropertyType | string;
  address: string;
  area: string;
  comments?: string;
  createdAt: string;
}

export interface SearchFilters {
  operation: OperationType | "Todas";
  type: PropertyType | "Todos";
  neighborhood: string;
  maxPrice: number | null;
}
