import { authFetch } from "./http";
import { createClient } from "@/lib/supabase/client";

export interface UserProfile {
  idCliente: string;
  nombre: string;
  apellido: string;
  email?: string;
  telefono: string | null;
  dni: number | null;
  color: string | null; // e.g. "#AHSC3" o "#E10600"
}

export interface UpdateProfilePayload {
  nombre?: string;
  apellido?: string;
  telefono?: string | null;
  dni?: number | null;
  color?: string | null;
}

/**
 * Obtiene el perfil del usuario autenticado (incluyendo color de la rueda)
 * desde el backend (/users/profile). Si la API falla, arma el perfil con los
 * datos de user_metadata de la sesión, sin tirar error.
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) return null;

  try {
    const remote = await authFetch<UserProfile>("/users/profile");
    if (remote) return remote;
  } catch {
    // Si la API falla, usamos los datos de la sesión
  }

  return {
    idCliente: user.id,
    nombre: user.user_metadata?.nombre ?? "",
    apellido: user.user_metadata?.apellido ?? "",
    email: user.email ?? "",
    telefono: user.user_metadata?.telefono ?? null,
    dni: user.user_metadata?.dni ?? null,
    color: null,
  };
}

/**
 * Actualiza el perfil del usuario autenticado vía la API (PUT /users/profile),
 * que valida los datos. Si la API falla, el error se propaga para que
 * useProfile revierta el cambio optimista.
 */
export async function updateUserProfile(
  payload: UpdateProfilePayload,
): Promise<UserProfile> {
  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();

  if (!sessionData.session?.user) {
    throw new Error("No autenticado");
  }

  return authFetch<UserProfile>("/users/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
