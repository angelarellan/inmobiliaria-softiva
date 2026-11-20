import { NextRequest, NextResponse } from "next/server";
import { insertContact } from "@/lib/data/leads";
import { isSpam, parseContact } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  // Si completaron el campo trampa, respondemos OK pero no guardamos nada.
  if (isSpam(body)) return NextResponse.json({ ok: true }, { status: 201 });

  const parsed = parseContact(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    await insertContact(parsed.data);
  } catch (error) {
    console.error("No se pudo guardar la consulta:", error);
    return NextResponse.json(
      { error: "No pudimos guardar tu consulta. Probá de nuevo en un rato." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
