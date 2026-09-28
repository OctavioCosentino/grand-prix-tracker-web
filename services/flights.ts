import { apiFetch } from "@/services/http";

export type SentidoVuelo = "IDA" | "VUELTA";

export interface Vuelo {
  idVuelo: string;
  aerolinea: string;
  sentido: SentidoVuelo; // IDA = llega a la ciudad del evento; VUELTA = sale de ella
  origen: { idCiudad: string; nombre: string };
  destino: { idCiudad: string; nombre: string };
  fechaSalida: string; // ISO-8601
  fechaLlegada: string; // ISO-8601
  precioUsd: number; // por pasajero
  stockAsientos: number;
}

/**
 * Vuelos de ida y vuelta a la ciudad del evento que todavía no partieron,
 * ordenados por fecha de salida.
 */
export function getEventFlights(idEvento: string): Promise<Vuelo[]> {
  return apiFetch<Vuelo[]>(`/events/${encodeURIComponent(idEvento)}/flights`);
}
