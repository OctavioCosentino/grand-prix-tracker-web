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
