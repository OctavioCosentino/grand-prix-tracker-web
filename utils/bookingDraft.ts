import { BookingState } from "@/utils/booking";

/**
 * Borrador del wizard de reserva en sessionStorage (vive mientras la pestaña esté
 * abierta). Sirve para no perder el paquete si la sesión vence y hay que volver a
 * loguearse en medio del checkout.
 *
 * No guarda datos sensibles: de una tarjeta nueva el estado solo tiene los últimos
 * 4 dígitos, el vencimiento y el token de la pasarela.
 */
const DRAFT_KEY = "gpt:booking-draft";

interface BookingDraft {
  userId: string;
  eventId: string;
  state: BookingState;
}

export function saveBookingDraft(userId: string, eventId: string, state: BookingState): void {
  try {
    const draft: BookingDraft = { userId, eventId, state };
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Sin storage (modo privado, cuota llena): el wizard funciona igual, sin borrador
  }
}

/** Solo devuelve el borrador si es del mismo usuario y del mismo evento. */
export function loadBookingDraft(userId: string, eventId: string): BookingState | null {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as BookingDraft;
    if (draft.userId !== userId || draft.eventId !== eventId) return null;
    // El conflicto de stock era de un intento anterior: se vuelve a validar al confirmar
    return { ...draft.state, conflict: null };
  } catch {
    return null;
  }
}

export function clearBookingDraft(): void {
  try {
    sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    // Sin storage no hay nada que borrar
  }
}
