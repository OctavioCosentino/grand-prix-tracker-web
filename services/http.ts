import { API_BASE_URL, ApiResponse } from "@/services/events";
import { createClient } from "@/lib/supabase/client";

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

export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

/** Headers que identifican al cliente: el back toma el cliente del claim `sub` del JWT. */
export function getClientAuthHeaders(accessToken: string): Record<string, string> {
  return { Authorization: `Bearer ${accessToken}` };
}

/**
 * Fetch a un endpoint que requiere sesión (/bookings, /payment-methods).
 * Ante un 401 refresca la sesión una sola vez y reintenta. Reintentar un POST es
 * seguro: el back rechaza el token antes de procesar nada. Si vuelve a dar 401,
 * o no hay sesión, cierra la sesión y manda al login.
 */
export async function authFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const supabase = createClient();
  const withToken = (accessToken: string): RequestInit => ({
    ...init,
    headers: { ...init.headers, ...getClientAuthHeaders(accessToken) },
  });

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return redirectToLogin();

  try {
    return await apiFetch<T>(path, withToken(session.access_token));
  } catch (error) {
    if (!isUnauthorized(error)) throw error;
  }

  const {
    data: { session: refreshed },
  } = await supabase.auth.refreshSession();
  if (!refreshed) return redirectToLogin();

  try {
    return await apiFetch<T>(path, withToken(refreshed.access_token));
  } catch (error) {
    if (isUnauthorized(error)) return redirectToLogin();
    throw error;
  }
}

let isRedirectingToLogin = false;

/**
 * Sesión vencida sin arreglo: cierra la sesión local y manda al login con la URL
 * actual en ?next=. El checkout no se pierde porque el wizard guarda su borrador.
 * Lanza igual el 401 para que la query o mutación quede en error y no reintente.
 */
async function redirectToLogin(): Promise<never> {
  // Si fallan varias queries a la vez, redirige una sola
  if (!isRedirectingToLogin) {
    isRedirectingToLogin = true;
    // scope local: no cierra las sesiones del usuario en otros dispositivos
    await createClient().auth.signOut({ scope: "local" });
    const next = `${window.location.pathname}${window.location.search}`;
    // Navegación completa a propósito: esto corre fuera de React (sin router) y así
    // arranca de cero el cache de React Query del usuario anterior.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/login?next=${encodeURIComponent(next)}`);
  }
  throw new ApiError(401, "Tu sesión expiró. Volvé a iniciar sesión para continuar.");
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
