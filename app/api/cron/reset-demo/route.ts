import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { PROPERTIES_TAG } from "@/lib/data/properties";
import { removeAllDemoPhotos } from "@/lib/data/photos";

/**
 * Reseteo diario de la web modelo. Lo llama Vercel Cron todas las noches
 * (ver vercel.json) con el header "Authorization: Bearer <CRON_SECRET>".
 *
 * · Borra las propiedades que cargó el usuario demo y sus fotos.
 * · Deja las propiedades originales como en el seed.
 * · No toca consultas, tasaciones ni visitas.
 */
export const maxDuration = 60;

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const header = request.headers.get("authorization") ?? "";
  if (!secret) return false;
  const a = createHash("sha256").update(header).digest();
  const b = createHash("sha256").update(`Bearer ${secret}`).digest();
  return timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  // 1. Propiedades: borra las del demo y restaura las originales.
  const { data, error } = await getSupabaseAdmin().rpc("reset_demo_properties");
  if (error) {
    console.error("Reseteo demo: falló la base de datos:", error.message);
    return NextResponse.json(
      { error: "No se pudo resetear la base de datos." },
      { status: 500 }
    );
  }

  // 2. Fotos que subió el usuario demo.
  let photosRemoved = 0;
  let photosError: string | undefined;
  try {
    photosRemoved = await removeAllDemoPhotos();
  } catch (e) {
    photosError = e instanceof Error ? e.message : String(e);
    console.error("Reseteo demo: no se pudieron borrar las fotos:", photosError);
  }

  // 3. La web muestra los cambios en la próxima visita.
  revalidateTag(PROPERTIES_TAG, { expire: 0 });

  return NextResponse.json({
    ok: true,
    properties: data,
    photosRemoved,
    ...(photosError ? { photosError } : {}),
    at: new Date().toISOString(),
  });
}
