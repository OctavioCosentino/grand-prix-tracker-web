import { apiFetch } from "@/services/http";

export type TipoEntrada = "VIP" | "Asiento Numerado" | "General";

export interface Entrada {
  idEntrada: string;
  nombreTribuna: string;
  tipo: TipoEntrada;
  precioUsd: number; // por entrada
  stockDisponible: number;
}

/**
 * Entradas del evento, ordenadas por precio ascendente.
 * Incluye las agotadas con stockDisponible = 0.
 */
export function getEventTickets(idEvento: string): Promise<Entrada[]> {
  return apiFetch<Entrada[]>(`/events/${encodeURIComponent(idEvento)}/tickets`);
}
