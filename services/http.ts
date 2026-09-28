import { API_BASE_URL, ApiResponse } from "@/services/events";

/**
 * Error de la API con el código HTTP y el `message` del envoltorio ApiResponse.
 * Los mensajes de reglas de negocio (409 de stock, evento finalizado, etc.) están
 * en español y se pueden mostrar; los de validación (400 "Datos inválidos: ...") no.
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }

  /** 400 de validación de campos: mensaje técnico, no apto para el usuario. */
  get isValidationError(): boolean {
    return this.status === 400 && this.message.startsWith("Datos inválidos");
  }
}

/**
 * Headers que identifican al cliente.
 * TEMPORAL: hasta integrar Supabase Auth se manda `X-Cliente-Id` desde una variable
 * de entorno. Al integrar auth, reemplazar por `Authorization: Bearer <jwt>` acá.
 */
export function getClientAuthHeaders(): Record<string, string> {
  const clienteId = process.env.NEXT_PUBLIC_CLIENTE_ID_DEV;
  if (!clienteId) {
    throw new ApiError(
      0,
      "No hay un cliente identificado para operar. Configurá NEXT_PUBLIC_CLIENTE_ID_DEV.",
    );
  }
  return { "X-Cliente-Id": clienteId };
}

export function hasClientIdentity(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_CLIENTE_ID_DEV);
}

/**
 * Fetch contra la API que desarma el envoltorio ApiResponse<T>.
 * Si la respuesta no es exitosa, lanza ApiError con el status y el message del back.
 */
export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init.headers,
    },
  });

  let json: ApiResponse<T | null> | null = null;
  try {
    json = await res.json();
  } catch {
    // Respuesta sin JSON (por ejemplo, un 502 de Render mientras despierta)
  }

  if (!res.ok || !json?.success || json.data === null) {
    throw new ApiError(
      res.status,
      json?.message || `Error al conectar con la API (${res.status})`,
    );
  }

  return json.data;
}
