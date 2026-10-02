import { authFetch } from "@/services/http";
import { TipoEntrada } from "@/services/tickets";
import { TipoHabitacion } from "@/services/hotels";
import { TipoTarjeta } from "@/services/paymentMethods";

export interface PagoConTarjetaGuardada {
  idMetodoPago: string;
}

/** El número completo de la tarjeta nunca viaja al backend. */
export interface PagoConTarjetaNueva {
  tipo: TipoTarjeta;
  ultimos4Digitos: string;
  fechaExpiracion: string; // "MM/AA"
  proveedorToken: string;
}

export interface CheckoutRequest {
  idEvento: string;
  entradas?: { idEntrada: string; cantidad: number }[];
  habitaciones?: {
    idHabitacion: string;
    fechaCheckIn: string; // "YYYY-MM-DD"
    fechaCheckOut: string; // "YYYY-MM-DD"
  }[];
  vuelos?: { idVuelo: string; cantidadPasajeros: number }[];
  pago: PagoConTarjetaGuardada | PagoConTarjetaNueva;
  incluyeTransporte?: boolean;
}

export type EstadoReserva = "Pendiente" | "Pagada" | "Cancelada";

export interface ReservaEvento {
  idEvento: string;
  temporada: number;
  fechaInicio: string; // "YYYY-MM-DD"
  fechaFin: string; // "YYYY-MM-DD"
  circuito: {
    nombre: string;
    ciudad: {
      nombre: string;
      pais: { nombre: string; codigoIso: string };
    };
  };
}

/** Misma forma en POST /bookings, GET /bookings y GET /bookings/{idReserva}. */
export interface Reserva {
  idReserva: string;
  codigoConfirmacion: string;
  estado: EstadoReserva; // el POST siempre devuelve "Pagada"
  fechaCompra: string;
  totalUsd: number;
  incluyeEntrada: boolean;
  incluyeHotel: boolean;
  incluyeVuelo: boolean;
  incluyeTransporte: boolean;
  idMetodoPago: string | null;
  /** Nunca incluye el token de la pasarela */
  metodoPago: {
    idMetodoPago: string;
    tipo: TipoTarjeta;
    ultimos4Digitos: string;
  } | null;
  /** null si es una reserva vieja a la que no se le pudo deducir el evento */
  evento: ReservaEvento | null;
  entradas: {
    idEntrada: string;
    nombreTribuna: string;
    tipo: TipoEntrada;
    cantidad: number;
    precioUnitarioUsd: number;
    subtotalUsd: number;
  }[];
  habitaciones: {
    idHabitacion: string;
    idHotel: string;
    hotel: string;
    tipo: TipoHabitacion;
    fechaCheckIn: string;
    fechaCheckOut: string;
    cantidadNoches: number;
    precioPorNocheUsd: number;
    subtotalUsd: number;
  }[];
  vuelos: {
    idVuelo: string;
    aerolinea: string;
    origen: string;
    destino: string;
    fechaSalida: string;
    fechaLlegada: string;
    cantidadPasajeros: number;
    precioUnitarioUsd: number;
    subtotalUsd: number;
  }[];
}

/** Reservas del cliente, de la más nueva a la más vieja (fechaCompra descendente). */
export function getBookings(): Promise<Reserva[]> {
  return authFetch<Reserva[]>("/bookings");
}

/**
 * Compra el paquete completo en una sola llamada. Todo o nada:
 * si falla, el backend no descuenta stock ni crea la reserva.
 */
export function createBooking(body: CheckoutRequest): Promise<Reserva> {
  return authFetch<Reserva>("/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
