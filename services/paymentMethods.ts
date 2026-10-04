import { authFetch } from "@/services/http";

export type TipoTarjeta = "Credito" | "Debito";

export interface MetodoPago {
  idMetodoPago: string;
  tipo: TipoTarjeta;
  ultimos4Digitos: string;
  fechaExpiracion: string; // "MM/AA"
  vencida: boolean; // el checkout rechaza las vencidas
  marca?: string; // e.g. Visa, Mastercard
  nombre_titular?: string;
}

/** Tarjetas guardadas del cliente, de la más nueva a la más vieja. */
export function getPaymentMethods(): Promise<MetodoPago[]> {
  return authFetch<MetodoPago[]>("/payment-methods");
}


export interface NuevaTarjetaRequest {
  tipo: TipoTarjeta;
  ultimos4Digitos: string;
  fechaExpiracion: string;
  proveedorToken: string;
  nombre_titular?: string;
}

export function addPaymentMethod(data: NuevaTarjetaRequest): Promise<MetodoPago> {
  return authFetch<MetodoPago>("/users/me/payment-methods", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });
}

export function updatePaymentMethod(idMetodoPago: string, data: Partial<NuevaTarjetaRequest>): Promise<MetodoPago> {
  return authFetch<MetodoPago>(`/users/me/payment-methods/${idMetodoPago}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" }
  });
}
