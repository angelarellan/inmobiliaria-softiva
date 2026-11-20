import type { Currency, OperationType } from "./types";

/** Opciones del asistente de visitas. Las usa el chat y la validación del servidor. */

export const TIMEZONE = "America/Argentina/Buenos_Aires";

export const WEEKDAY_SLOTS = [
  "Mañana (9 a 12 h)",
  "Mediodía (12 a 15 h)",
  "Tarde (15 a 19 h)",
];
export const SATURDAY_SLOTS = ["Mañana (10 a 13 h)"];

export const VISIT_DAYS_AHEAD = 6;
export const VISIT_MAX_DAYS_AHEAD = 21;

export interface BudgetOption {
  id: string;
  label: string;
  currency?: Currency;
  min?: number;
  max?: number;
}

export const BUDGET_OPTIONS: Record<OperationType, BudgetOption[]> = {
  Venta: [
    { id: "v1", label: "Hasta US$ 500.000", currency: "USD", max: 500_000 },
    {
      id: "v2",
      label: "US$ 500.000 a 1.000.000",
      currency: "USD",
      min: 500_000,
      max: 1_000_000,
    },
    { id: "v3", label: "Más de US$ 1.000.000", currency: "USD", min: 1_000_000 },
    { id: "any", label: "No tengo un tope" },
  ],
  Alquiler: [
    {
      id: "a1",
      label: "Hasta AR$ 1.000.000 por mes",
      currency: "ARS",
      max: 1_000_000,
    },
    { id: "a2", label: "Hasta US$ 2.000 por mes", currency: "USD", max: 2_000 },
    { id: "a3", label: "Más de US$ 2.000 por mes", currency: "USD", min: 2_000 },
    { id: "any", label: "No tengo un tope" },
  ],
};

export function matchesBudget(
  option: BudgetOption,
  price: number,
  currency: Currency
) {
  if (!option.currency) return true;
  if (option.currency !== currency) return false;
  if (option.min !== undefined && price < option.min) return false;
  if (option.max !== undefined && price > option.max) return false;
  return true;
}

/** Fecha de hoy en Buenos Aires como "YYYY-MM-DD". */
export function todayInBuenosAires(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

function addDays(isoDate: string, days: number) {
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days, 12));
  return date.toISOString().slice(0, 10);
}

/** 0 = domingo … 6 = sábado */
export function weekdayOf(isoDate: string) {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
}

export function slotsFor(isoDate: string) {
  const day = weekdayOf(isoDate);
  if (day === 0) return [];
  return day === 6 ? SATURDAY_SLOTS : WEEKDAY_SLOTS;
}

/** Próximos días hábiles (lunes a sábado) desde mañana. */
export function upcomingVisitDays(count = VISIT_DAYS_AHEAD, now = new Date()) {
  const today = todayInBuenosAires(now);
  const days: string[] = [];
  let offset = 1;
  while (days.length < count && offset <= VISIT_MAX_DAYS_AHEAD) {
    const date = addDays(today, offset);
    if (weekdayOf(date) !== 0) days.push(date);
    offset += 1;
  }
  return days;
}

/** Valida en el servidor que el día y la franja elegidos sean posibles. */
export function isValidVisitSlot(isoDate: string, slot: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  const today = todayInBuenosAires(now);
  const last = addDays(today, VISIT_MAX_DAYS_AHEAD);
  if (isoDate <= today || isoDate > last) return false;
  return slotsFor(isoDate).includes(slot);
}
