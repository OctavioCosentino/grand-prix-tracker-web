import { apiFetch } from "@/services/http";

export type TipoHabitacion = "Single" | "Doble" | "Suite";

export interface Habitacion {
  idHabitacion: string;
  tipo: TipoHabitacion;
  precioPorNocheUsd: number;
  stockDisponible: number; // sin distinguir fechas
}

export interface Hotel {
  idHotel: string;
  nombre: string;
  estrellas: number | null;
  distanciaCircuitoKm: number | null;
  ofreceTraslado: boolean | null;
  imagenPrincipalUrl: string | null;
  habitaciones: Habitacion[];
}

/**
 * Hoteles en la ciudad del evento, ordenados por distancia al circuito.
 * Incluye habitaciones agotadas con stockDisponible = 0.
 */
export function getEventHotels(idEvento: string): Promise<Hotel[]> {
  return apiFetch<Hotel[]>(`/events/${encodeURIComponent(idEvento)}/hotels`);
}
