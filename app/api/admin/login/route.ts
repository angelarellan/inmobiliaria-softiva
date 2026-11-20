import { NextRequest, NextResponse } from "next/server";
import { checkCredentials, startSession } from "@/lib/auth/session";
import {
  clientIp,
  isLoginLocked,
  LOCK_WINDOW_MINUTES,
  recordLoginAttempt,
} from "@/lib/auth/login-limit";

export async function POST(request: NextRequest) {
  const ip = clientIp(request.headers);

  if (await isLoginLocked(ip)) {
    return NextResponse.json(
      {
        error: `Demasiados intentos fallidos. Probá de nuevo en ${LOCK_WINDOW_MINUTES} minutos.`,
      },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.slice(0, 120) : "";
  const password = typeof body?.password === "string" ? body.password.slice(0, 200) : "";

  const session = username && password ? checkCredentials(username, password) : null;

  if (!session) {
    await recordLoginAttempt(ip, username, false);
    // Pequeña demora para frenar ataques de fuerza bruta.
    await new Promise((resolve) => setTimeout(resolve, 600));
    return NextResponse.json(
      { error: "Usuario o contraseña incorrectos." },
      { status: 401 }
    );
  }

  await recordLoginAttempt(ip, session.username, true);
  await startSession(session);
  return NextResponse.json({ ok: true, role: session.role });
}
