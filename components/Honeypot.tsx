/**
 * Campo trampa contra spam: queda fuera de la pantalla, así que las personas
 * no lo completan; los bots que llenan todos los campos, sí. El servidor
 * descarta los envíos que lo traen completo.
 */
export default function Honeypot() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-[10000px] top-0 h-px w-px overflow-hidden opacity-0"
    >
      <label>
        No completar este campo
        <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}
