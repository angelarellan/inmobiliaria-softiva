/**
 * Enmascarado de datos personales para el usuario demo del panel.
 * Se aplica en el servidor: el navegador del usuario demo nunca recibe los
 * datos completos.
 */

/** "Juan Pérez" → "Juan P." */
export function maskName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  const first = parts[0];
  const initial = parts.length > 1 ? ` ${parts[parts.length - 1][0].toUpperCase()}.` : "";
  return `${first}${initial}`;
}

/** "juanperez@gmail.com" → "ju***@g***.com" */
export function maskEmail(email: string) {
  const [user, domain] = email.trim().split("@");
  if (!user || !domain) return "***";
  const dot = domain.lastIndexOf(".");
  const host = dot > 0 ? domain.slice(0, dot) : domain;
  const tld = dot > 0 ? domain.slice(dot) : "";
  return `${user.slice(0, 2)}***@${host.slice(0, 1)}***${tld}`;
}

/** "+54 9 11 5555-1255" → "11 ****-**55" */
export function maskPhone(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return "—";
  if (digits.startsWith("54")) digits = digits.slice(2);
  if (digits.startsWith("9")) digits = digits.slice(1);
  digits = digits.replace(/^0/, "");
  if (digits.length < 6) return "****";
  return `${digits.slice(0, 2)} ****-**${digits.slice(-2)}`;
}

/** Oculta teléfonos, mails y números de calle dentro de un texto libre. */
export function maskFreeText(text: string) {
  return text
    .replace(/[\w.+-]+@[\w-]+(\.[\w-]+)+/g, "[mail oculto]")
    .replace(/\+?\d[\d\s().-]{5,}\d/g, "[teléfono oculto]");
}

/** "Av. Alvear 1620, Recoleta" → "Av. Alvear ••••, Recoleta" */
export function maskAddress(address: string) {
  return address.replace(/\d+/g, (m) => "•".repeat(Math.min(m.length, 4)));
}
