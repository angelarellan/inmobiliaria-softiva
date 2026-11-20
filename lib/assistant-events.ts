/** Evento para abrir el asistente de visitas desde cualquier botón de la web. */
export const OPEN_ASSISTANT_EVENT = "aura:open-visit-assistant";

export interface OpenAssistantDetail {
  propertyId?: string;
}

export function openVisitAssistant(propertyId?: string) {
  window.dispatchEvent(
    new CustomEvent<OpenAssistantDetail>(OPEN_ASSISTANT_EVENT, {
      detail: { propertyId },
    })
  );
}
