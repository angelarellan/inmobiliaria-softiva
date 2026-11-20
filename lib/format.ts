import type { Currency, Property, PropertyStatus } from "./types";

export function formatPrice(
  price: number,
  currency: Currency,
  suffix?: string
) {
  const formatted = new Intl.NumberFormat("es-AR").format(price);
  const symbol = currency === "USD" ? "US$" : "AR$";
  return `${symbol} ${formatted}${suffix ?? ""}`;
}

export function formatPropertyPrice(
  p: Pick<Property, "price" | "currency" | "priceSuffix">
) {
  return formatPrice(p.price, p.currency, p.priceSuffix);
}

/** "Penthouse con vista al río" → "penthouse-con-vista-al-rio" */
export function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  publicada: "Publicada",
  pausada: "Pausada",
  vendida: "Vendida",
  alquilada: "Alquilada",
};

/** Sello que se muestra sobre las propiedades que ya no están disponibles. */
export function closedStampLabel(status: PropertyStatus) {
  if (status === "vendida") return "Vendida";
  if (status === "alquilada") return "Alquilada";
  return null;
}

/** "2026-11-23" → "lunes 23/11" (sin problemas de zona horaria). */
export function formatVisitDate(isoDate: string, withWeekday = true) {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(Date.UTC(y, m - 1, d, 12));
  const dayMonth = `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
  if (!withWeekday) return dayMonth;
  const weekday = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    timeZone: "UTC",
  }).format(date);
  return `${weekday} ${dayMonth}`;
}

const dateTimeFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

export function formatDateTime(iso: string) {
  return dateTimeFormatter.format(new Date(iso));
}
