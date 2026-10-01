import { API_BASE_URL } from "./events";
import { createClient } from "@/lib/supabase/client";

export interface UpdateProfilePayload {
  nombre: string;
  apellido: string;
  telefono: string | null;
  dni: number | null;
}

export async function updateUserProfile(payload: UpdateProfilePayload): Promise<void> {
  const supabase = createClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;

  if (!token) {
    throw new Error("No autenticado");
  }

  // Se asume que el backend usa la ruta /users/profile para el upsert del usuario autenticado
  const res = await fetch(`${API_BASE_URL}/users/profile`, {
    method: "PUT", // o PATCH dependiendo de lo que arme el backend
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al actualizar el perfil en el backend");
  }
}
