import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { AdminRole } from "@/lib/types";

export const SESSION_COOKIE = "aura_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 horas

export interface Session {
  role: AdminRole;
  username: string;
}

interface SessionPayload {
  r: AdminRole;
  u: string;
  exp: number;
}

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET falta o es demasiado corto (mínimo 32 caracteres).");
  }
  return secret;
}

function sign(data: string) {
  return createHmac("sha256", sessionSecret()).update(data).digest("base64url");
}

/** Compara en tiempo constante (sin filtrar el largo de los textos). */
function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

/**
 * Usuario y contraseña de cada rol, desde las variables de entorno.
 * Si alguna está vacía, ese ingreso queda deshabilitado.
 */
function credentialsFor(role: AdminRole) {
  const user =
    role === "owner" ? process.env.OWNER_ADMIN_USER : process.env.DEMO_ADMIN_USER;
  const password =
    role === "owner"
      ? process.env.OWNER_ADMIN_PASSWORD
      : process.env.DEMO_ADMIN_PASSWORD;
  if (!user?.trim() || !password) return null;
  return { user: user.trim(), password };
}

export function checkCredentials(username: string, password: string): Session | null {
  let match: Session | null = null;
  // Se comparan los dos roles siempre, para no dar pistas por el tiempo de respuesta.
  for (const role of ["owner", "demo"] as const) {
    const creds = credentialsFor(role);
    const userOk = safeEqual(username.trim(), creds?.user ?? "\u0000");
    const passOk = safeEqual(password, creds?.password ?? "\u0000");
    if (creds && userOk && passOk && !match) {
      match = { role, username: creds.user };
    }
  }
  return match;
}

export function createSessionToken(session: Session) {
  const payload: SessionPayload = {
    r: session.role,
    u: session.username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function verifySessionToken(token: string): Session | null {
  const [data, signature] = token.split(".");
  if (!data || !signature) return null;
  let expected: string;
  try {
    expected = sign(data);
  } catch {
    return null;
  }
  if (!safeEqual(signature, expected)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (payload.r !== "demo" && payload.r !== "owner") return null;
  if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
    return null;
  }
  // Si cambian o se borran las credenciales de ese rol, la sesión deja de valer.
  const creds = credentialsFor(payload.r);
  if (!creds || creds.user !== payload.u) return null;
  return { role: payload.r, username: payload.u };
}

export async function getSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return token ? verifySessionToken(token) : null;
}

/** Para páginas del panel: si no hay sesión, vuelve al login. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/admin");
  return session;
}

export async function startSession(session: Session) {
  (await cookies()).set(SESSION_COOKIE, createSessionToken(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export function isOwnerLoginEnabled() {
  return credentialsFor("owner") !== null;
}
