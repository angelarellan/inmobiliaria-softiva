import { NextRequest, NextResponse } from "next/server";
import { addAppraisal } from "@/lib/store";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (
    !body ||
    typeof body.name !== "string" ||
    typeof body.email !== "string" ||
    typeof body.phone !== "string" ||
    typeof body.address !== "string" ||
    !body.name.trim() ||
    !body.email.trim() ||
    !body.phone.trim() ||
    !body.address.trim()
  ) {
    return NextResponse.json(
      { error: "Faltan datos requeridos." },
      { status: 400 }
    );
  }

  const entry = addAppraisal({
    name: body.name.trim(),
    email: body.email.trim(),
    phone: body.phone.trim(),
    propertyType:
      typeof body.propertyType === "string" ? body.propertyType : "Casa",
    address: body.address.trim(),
    area: typeof body.area === "string" ? body.area.trim() : "",
    comments: typeof body.comments === "string" ? body.comments.trim() : "",
  });

  return NextResponse.json({ ok: true, id: entry.id }, { status: 201 });
}
