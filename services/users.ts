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
 * Obtiene el perfil del usuario autenticado (incluyendo color de la rueda).
 * Consulta primero el backend (/users/profile). Si el backend aún no lo tiene
 * implementado, recurre a la tabla 'clientes' de Supabase como fallback.
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
    // Si el backend aún no expone /users/profile, leemos de Supabase
  }

  try {
    const { data, error } = await supabase
      .from("clientes")
      .select("id_cliente, nombre, apellido, email, telefono, dni, color")
      .eq("id_cliente", user.id)
      .single();

    if (!error && data) {
      return {
        idCliente: data.id_cliente,
        nombre: data.nombre ?? user.user_metadata?.nombre ?? "",
        apellido: data.apellido ?? user.user_metadata?.apellido ?? "",
        email: data.email ?? user.email ?? "",
        telefono: data.telefono ?? null,
        dni: data.dni ?? null,
        color: data.color ?? null,
      };
    }
  } catch (err) {
    console.debug("Fallback Supabase profile error:", err);
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
 * Actualiza el perfil del usuario autenticado.
 * Envía el payload con el atributo 'color' al backend (/users/profile).
 * Además, sincroniza la tabla 'clientes' en Supabase para persistencia inmediata.
 */
export async function updateUserProfile(
  payload: UpdateProfilePayload
): Promise<UserProfile> {
  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) {
    throw new Error("No autenticado");
  }

  let backendSuccess = false;
  let result: UserProfile | null = null;

  try {
    result = await authFetch<UserProfile>("/users/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    backendSuccess = true;
  } catch {
    // El backend aún está en desarrollo
  }

  // Sincronizar en la tabla 'clientes' de Supabase (donde ya existe la columna 'color')
  try {
    const updateObj: Record<string, unknown> = {};
    if (payload.nombre !== undefined) updateObj.nombre = payload.nombre;
    if (payload.apellido !== undefined) updateObj.apellido = payload.apellido;
    if (payload.telefono !== undefined) updateObj.telefono = payload.telefono;
    if (payload.dni !== undefined) updateObj.dni = payload.dni;
    if (payload.color !== undefined) updateObj.color = payload.color;

    await supabase
      .from("clientes")
      .update(updateObj)
      .eq("id_cliente", user.id);
  } catch (err) {
    console.debug("Error sincronizando en Supabase:", err);
    if (!backendSuccess) {
      throw err;
    }
  }

  return (
    result || {
      idCliente: user.id,
      nombre: payload.nombre ?? user.user_metadata?.nombre ?? "",
      apellido: payload.apellido ?? user.user_metadata?.apellido ?? "",
      email: user.email ?? "",
      telefono: payload.telefono ?? null,
      dni: payload.dni ?? null,
      color: payload.color ?? null,
    }
  );
}
