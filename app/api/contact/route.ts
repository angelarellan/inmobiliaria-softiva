import { NextRequest, NextResponse } from "next/server";
import { addContact } from "@/lib/store";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.name !== "string" ||
    typeof body.email !== "string" ||
    typeof body.message !== "string" ||
    !body.name.trim() ||
    !body.email.trim() ||
    !body.message.trim()
  ) {
    return NextResponse.json(
      { error: "Faltan datos requeridos." },
      { status: 400 }
    );
  }

  const entry = addContact({
    name: body.name.trim(),
    email: body.email.trim(),
    phone: typeof body.phone === "string" ? body.phone.trim() : "",
    message: body.message.trim(),
    propertyId: typeof body.propertyId === "string" ? body.propertyId : undefined,
    propertyTitle:
      typeof body.propertyTitle === "string" ? body.propertyTitle : undefined,
  });

  return NextResponse.json({ ok: true, id: entry.id }, { status: 201 });
}
