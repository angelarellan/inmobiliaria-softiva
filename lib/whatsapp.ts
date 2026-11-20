/**
 * Número de WhatsApp de la web (NEXT_PUBLIC_WHATSAPP_NUMBER).
 * En la web modelo es el número de Softiva: quien prueba el botón le escribe
 * a Softiva.
 */
export const WHATSAPP_NUMBER = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ""
).replace(/\D/g, "");

/** Link para escribirle a la inmobiliaria con un mensaje precargado. */
export function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/**
 * Link para compartir un texto con cualquier contacto (abre el selector de
 * chats de WhatsApp). No va a ningún número en particular.
 */
export function buildWhatsAppShareLink(text: string) {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

/**
 * Convierte un teléfono cargado a mano ("11 5555-1234", "+54 9 11 ...",
 * "011 15 5555 1234") al formato internacional que usa wa.me.
 * Devuelve null si no parece un teléfono válido.
 */
export function toWhatsAppNumber(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("54")) {
    let rest = digits.slice(2);
    if (rest.startsWith("9")) rest = rest.slice(1);
    rest = rest.replace(/^0/, "");
    return rest.length >= 8 ? `549${rest}` : null;
  }
  digits = digits.replace(/^0/, "");
  // Formato local con "15": 11 15 5555 1234 → 11 5555 1234
  if (digits.length === 12 && digits.slice(2, 4) === "15") {
    digits = digits.slice(0, 2) + digits.slice(4);
  }
  if (digits.length === 10) return `549${digits}`;
  return digits.length >= 8 ? digits : null;
}

/** Link para escribirle a un cliente (lo usa el panel). */
export function buildWhatsAppLinkTo(phone: string, message: string) {
  const number = toWhatsAppNumber(phone);
  if (!number) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
