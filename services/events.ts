export interface EventCircuitCountry {
  idPais: string;
  nombre: string;
  codigoIso: string;
  continente: string;
}

export interface EventCircuitCity {
  idCiudad: string;
  nombre: string;
  pais: EventCircuitCountry;
}

export interface EventCircuit {
  idCircuito: string;
  nombre: string;
  longitudKm: number;
  curvas: number;
  vueltas: number;
  mapaSvgUrl: string;
  ciudad: EventCircuitCity;
}

export interface BackendEvent {
  idEvento: string;
  temporada: number;
  fechaInicio: string; // "YYYY-MM-DD"
  fechaFin: string; // "YYYY-MM-DD"
  estado: string; // "Proximo", "Finalizado", etc.
  circuito: EventCircuit;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://grand-prix-tracker-api.onrender.com";

/**
 * Obtiene la lista completa de eventos directamente desde la API en Render.
 * Soporta reintentos ante cold-starts de instancias de Render.
 */
export async function getEvents(): Promise<BackendEvent[]> {
  const res = await fetch(`${API_BASE_URL}/events`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(
      `Error al conectar con la API de eventos (${res.status}): ${res.statusText}`,
    );
  }

  const json: ApiResponse<BackendEvent[]> = await res.json();

  if (!json.success || !Array.isArray(json.data)) {
    throw new Error(
      json.message || "Estructura de respuesta inválida desde el servidor",
    );
  }

  return json.data;
}

/**
 * Obtiene un evento específico por su ID directamente desde la API en Render.
 * Devuelve null si el evento no existe (404) o el id no es un UUID (400).
 * Ante otros errores lanza, para que TanStack Query reintente (cold-start de Render).
 */
export async function getEventById(id: string): Promise<BackendEvent | null> {
  const res = await fetch(`${API_BASE_URL}/events/${encodeURIComponent(id)}`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) {
    throw new Error(`Error ${res.status}: ${res.statusText}`);
  }

  const json: ApiResponse<BackendEvent> = await res.json();
  if (!json.success || !json.data) return null;

  return json.data;
}
