import { NextRequest, NextResponse } from "next/server";
import { insertVisit } from "@/lib/data/leads";
import { getPropertyById } from "@/lib/data/properties";
import { isSpam, parseVisit } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  // Si completaron el campo trampa, respondemos OK pero no guardamos nada.
  if (isSpam(body)) return NextResponse.json({ ok: true }, { status: 201 });

  const parsed = parseVisit(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    const property = await getPropertyById(parsed.data.propertyId);
    if (!property || property.status !== "publicada") {
      return NextResponse.json(
        { error: "Esa propiedad ya no está disponible para visitas." },
        { status: 409 }
      );
    }

    await insertVisit({
      ...parsed.data,
      propertyTitle: property.title,
      propertySlug: property.slug,
    });
  } catch (error) {
    console.error("No se pudo guardar la visita:", error);
    return NextResponse.json(
      { error: "No pudimos agendar la visita. Probá de nuevo en un rato." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
