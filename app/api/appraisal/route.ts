import { NextRequest, NextResponse } from "next/server";
import { insertAppraisal } from "@/lib/data/leads";
import { isSpam, parseAppraisal } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  // Si completaron el campo trampa, respondemos OK pero no guardamos nada.
  if (isSpam(body)) return NextResponse.json({ ok: true }, { status: 201 });

  const parsed = parseAppraisal(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  try {
    await insertAppraisal(parsed.data);
  } catch (error) {
    console.error("No se pudo guardar la tasación:", error);
    return NextResponse.json(
      { error: "No pudimos guardar tu solicitud. Probá de nuevo en un rato." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
