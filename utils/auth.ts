import type { AuthError, User } from "@supabase/supabase-js";

/**
 * Valida el `?next=` al que se vuelve después de loguearse. Solo acepta paths
 * internos, para que un link armado no pueda mandar al usuario a otro sitio.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return "/";
  }
  return next;
}

/** Mensaje apto para el usuario a partir de un error de Supabase Auth. */
export function authErrorMessage(error: AuthError): string {
  switch (error.code) {
    case "invalid_credentials":
      return "El correo o la contraseña no son correctos.";
    case "user_already_exists":
    case "email_exists":
      return "Ya existe una cuenta con ese correo.";
    case "email_not_confirmed":
      return "Todavía no confirmaste tu correo. Revisá tu casilla.";
    case "weak_password":
      return "La contraseña es demasiado débil.";
    case "same_password":
      return "La nueva contraseña tiene que ser distinta a la anterior.";
    case "email_address_invalid":
      return "El correo no es válido.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Demasiados intentos. Esperá unos minutos y probá de nuevo.";
    default:
      return "No pudimos completar la operación. Probá de nuevo.";
  }
}

/** Nombre para mostrar, a partir de lo que se guardó en el registro. */
export function getDisplayName(user: User): string {
  const { nombre, apellido } = user.user_metadata ?? {};
  const fullName = [nombre, apellido].filter(Boolean).join(" ").trim();
  return fullName || user.email?.split("@")[0] || "Piloto";
}
