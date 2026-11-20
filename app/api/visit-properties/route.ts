import { NextResponse } from "next/server";
import { getVisitableSummaries } from "@/lib/data/properties";

export const dynamic = "force-dynamic";

/** Propiedades que se pueden visitar (las usa el asistente de la web). */
export async function GET() {
  const properties = await getVisitableSummaries();
  return NextResponse.json(
    { properties },
    { headers: { "Cache-Control": "no-store" } }
  );
}
