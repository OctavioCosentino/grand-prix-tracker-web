import { BackendEvent } from "@/services/events";
import { Hotel } from "@/services/hotels";
import { Entrada } from "@/services/tickets";
import { Vuelo } from "@/services/flights";
import { MetodoPago } from "@/services/paymentMethods";
import { CheckoutRequest, PagoConTarjetaNueva, Reserva } from "@/services/bookings";

/* ======= FECHAS ===========
 * Las fechas del evento son "YYYY-MM-DD" sin hora. Se opera con Date.UTC para
 * que sumar/restar días no se corra por la zona horaria.
 * "Hoy" se toma en UTC porque es el reloj que usa el backend para validar.
 */

function parseISODate(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

export function addDaysISO(iso: string, days: number): string {
  const date = new Date(parseISODate(iso));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((parseISODate(checkOut) - parseISODate(checkIn)) / 86_400_000);
}

export function todayUtcISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Usar fechaFin, no `estado`: hay eventos "Proximo" cuyas fechas ya pasaron. */
export function hasEventEnded(fechaFin: string, today = todayUtcISO()): boolean {
  return fechaFin < today;
}

/** Regla de negocio: check-in 1 día antes del inicio, check-out 1 día después del fin. */
export function getHotelStay(event: Pick<BackendEvent, "fechaInicio" | "fechaFin">) {
  const checkIn = addDaysISO(event.fechaInicio, -1);
  const checkOut = addDaysISO(event.fechaFin, 1);
  return { checkIn, checkOut, nights: nightsBetween(checkIn, checkOut) };
}

/** "2026-11-05" → "05 nov 2026" */
export function formatDateES(iso: string): string {
  return new Date(parseISODate(iso)).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** ISO-8601 con hora → "05 nov, 12:00" en la hora local del usuario */
export function formatDateTimeES(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

/* ======= TARJETAS =========== */

/** "MM/AA" válido y no vencido. Igual que el back: vence al terminar el mes. */
export function isValidExpiry(expiry: string, now = new Date()): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(expiry);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth() + 1;
  return year > currentYear || (year === currentYear && month >= currentMonth);
}

/** Algoritmo de Luhn sobre el número sin espacios. */
export function isValidCardNumber(digits: string): boolean {
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let n = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
}

/**
 * Simula la tokenización de la pasarela de pago. Cuando haya pasarela real,
 * este es el único lugar donde el número completo sale del formulario.
 */
export function simulateCardToken(): string {
  return `tok_sim_${crypto.randomUUID()}`;
}

/* ======= ESTADO DEL WIZARD =========== */

export const BOOKING_STEPS = [
  { id: "hotel", label: "Hotel" },
  { id: "entradas", label: "Entradas" },
  { id: "vuelos", label: "Vuelos" },
  { id: "pago", label: "Pago" },
  { id: "resumen", label: "Resumen" },
] as const;

export type BookingStep = (typeof BOOKING_STEPS)[number]["id"];

export type PaymentSelection =
  | { kind: "guardada"; idMetodoPago: string }
  | { kind: "nueva"; tarjeta: PagoConTarjetaNueva };

export interface StockConflict {
  message: string;
  step: BookingStep;
  /** Ids de los ítems elegidos que ya no tienen stock suficiente */
  itemIds: string[];
}

export interface BookingState {
  step: BookingStep;
  /** Cantidad por idHabitacion. Cada unidad es un ítem del POST. */
  habitaciones: Record<string, number>;
  /** Cantidad por idEntrada */
  entradas: Record<string, number>;
  vueloIda: string | null;
  vueloVuelta: string | null;
  /** null = sigue la cantidad de entradas elegidas */
  pasajeros: number | null;
  pago: PaymentSelection | null;
  conflict: StockConflict | null;
}

export const initialBookingState: BookingState = {
  step: "hotel",
  habitaciones: {},
  entradas: {},
  vueloIda: null,
  vueloVuelta: null,
  pasajeros: null,
  pago: null,
  conflict: null,
};

export type BookingAction =
  | { type: "goTo"; step: BookingStep }
  | { type: "setRoom"; idHabitacion: string; cantidad: number }
  | { type: "setTicket"; idEntrada: string; cantidad: number }
  | { type: "setFlight"; sentido: "IDA" | "VUELTA"; idVuelo: string | null }
  | { type: "setPassengers"; cantidad: number }
  | { type: "setPayment"; pago: PaymentSelection | null }
  | { type: "stockConflict"; conflict: StockConflict }
  | { type: "clearConflict" };

function setQuantity(
  map: Record<string, number>,
  id: string,
  cantidad: number,
): Record<string, number> {
  const next = { ...map };
  if (cantidad > 0) next[id] = cantidad;
  else delete next[id];
  return next;
}

export function bookingReducer(
  state: BookingState,
  action: BookingAction,
): BookingState {
  switch (action.type) {
    case "goTo":
      return { ...state, step: action.step };
    case "setRoom":
      return {
        ...state,
        habitaciones: setQuantity(state.habitaciones, action.idHabitacion, action.cantidad),
      };
    case "setTicket":
      return {
        ...state,
        entradas: setQuantity(state.entradas, action.idEntrada, action.cantidad),
      };
    case "setFlight":
      return action.sentido === "IDA"
        ? { ...state, vueloIda: action.idVuelo }
        : { ...state, vueloVuelta: action.idVuelo };
    case "setPassengers":
      return { ...state, pasajeros: action.cantidad };
    case "setPayment":
      return { ...state, pago: action.pago };
    case "stockConflict":
      return { ...state, step: action.conflict.step, conflict: action.conflict };
    case "clearConflict":
      return { ...state, conflict: null };
  }
}

/* ======= DERIVADOS =========== */

export interface BookingCatalog {
  hotels: Hotel[];
  tickets: Entrada[];
  flights: Vuelo[];
}

export function countTickets(state: BookingState): number {
  return Object.values(state.entradas).reduce((acc, n) => acc + n, 0);
}

export function getPassengers(state: BookingState): number {
  return state.pasajeros ?? Math.max(1, countTickets(state));
}

export function hasAnyItem(state: BookingState): boolean {
  return (
    Object.keys(state.habitaciones).length > 0 ||
    Object.keys(state.entradas).length > 0 ||
    state.vueloIda !== null ||
    state.vueloVuelta !== null
  );
}

export interface SummaryLine {
  id: string;
  step: BookingStep;
  label: string;
  detail: string;
  subtotal: number;
}

/** Líneas del resumen con precios orientativos. El total real lo devuelve el POST. */
export function buildSummaryLines(
  state: BookingState,
  catalog: BookingCatalog,
  nights: number,
): SummaryLine[] {
  const lines: SummaryLine[] = [];

  for (const hotel of catalog.hotels) {
    for (const room of hotel.habitaciones) {
      const cantidad = state.habitaciones[room.idHabitacion];
      if (!cantidad) continue;
      lines.push({
        id: room.idHabitacion,
        step: "hotel",
        label: `${hotel.nombre} · ${room.tipo}`,
        detail: `${cantidad} hab. × ${nights} noches × ${formatUsd(room.precioPorNocheUsd)}`,
        subtotal: room.precioPorNocheUsd * nights * cantidad,
      });
    }
  }

  for (const ticket of catalog.tickets) {
    const cantidad = state.entradas[ticket.idEntrada];
    if (!cantidad) continue;
    lines.push({
      id: ticket.idEntrada,
      step: "entradas",
      label: `${ticket.nombreTribuna} · ${ticket.tipo}`,
      detail: `${cantidad} × ${formatUsd(ticket.precioUsd)}`,
      subtotal: ticket.precioUsd * cantidad,
    });
  }

  const pasajeros = getPassengers(state);
  for (const id of [state.vueloIda, state.vueloVuelta]) {
    const flight = catalog.flights.find((f) => f.idVuelo === id);
    if (!flight) continue;
    lines.push({
      id: flight.idVuelo,
      step: "vuelos",
      label: `${flight.sentido === "IDA" ? "Ida" : "Vuelta"} · ${flight.aerolinea}`,
      detail: `${pasajeros} pasajero${pasajeros > 1 ? "s" : ""} × ${formatUsd(flight.precioUsd)}`,
      subtotal: flight.precioUsd * pasajeros,
    });
  }

  return lines;
}

/* ======= VALIDACIÓN =========== */

export interface ValidationIssue {
  step: BookingStep;
  message: string;
}

/**
 * Valida el paquete antes de enviarlo. Los errores de validación del back
 * son técnicos, así que todo lo que se pueda chequear se chequea acá.
 */
export function validateBooking(
  state: BookingState,
  catalog: BookingCatalog,
  paymentMethods: MetodoPago[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!hasAnyItem(state)) {
    issues.push({ step: "hotel", message: "Elegí al menos un producto para armar el paquete." });
  }

  for (const hotel of catalog.hotels) {
    for (const room of hotel.habitaciones) {
      const cantidad = state.habitaciones[room.idHabitacion];
      if (cantidad && cantidad > room.stockDisponible) {
        issues.push({
          step: "hotel",
          message: `Solo quedan ${room.stockDisponible} habitaciones ${room.tipo} en ${hotel.nombre}.`,
        });
      }
    }
  }

  for (const ticket of catalog.tickets) {
    const cantidad = state.entradas[ticket.idEntrada];
    if (cantidad && cantidad > ticket.stockDisponible) {
      issues.push({
        step: "entradas",
        message: `Solo quedan ${ticket.stockDisponible} entradas para ${ticket.nombreTribuna}.`,
      });
    }
  }

  const pasajeros = getPassengers(state);
  if (!Number.isInteger(pasajeros) || pasajeros < 1) {
    issues.push({ step: "vuelos", message: "La cantidad de pasajeros tiene que ser al menos 1." });
  }
  for (const id of [state.vueloIda, state.vueloVuelta]) {
    if (!id) continue;
    const flight = catalog.flights.find((f) => f.idVuelo === id);
    if (!flight) {
      issues.push({ step: "vuelos", message: "Uno de los vuelos elegidos ya no está disponible." });
    } else if (pasajeros > flight.stockAsientos) {
      issues.push({
        step: "vuelos",
        message: `El vuelo de ${flight.aerolinea} tiene ${flight.stockAsientos} asientos disponibles.`,
      });
    }
  }

  if (!state.pago) {
    issues.push({ step: "pago", message: "Elegí un medio de pago." });
  } else if (state.pago.kind === "guardada") {
    const idMetodoPago = state.pago.idMetodoPago;
    const card = paymentMethods.find((m) => m.idMetodoPago === idMetodoPago);
    if (!card || card.vencida) {
      issues.push({ step: "pago", message: "La tarjeta elegida no está disponible o está vencida." });
    }
  } else {
    const { ultimos4Digitos, fechaExpiracion, proveedorToken } = state.pago.tarjeta;
    if (!/^\d{4}$/.test(ultimos4Digitos) || !isValidExpiry(fechaExpiracion) || !proveedorToken) {
      issues.push({ step: "pago", message: "Revisá los datos de la tarjeta nueva." });
    }
  }

  return issues;
}

/* ======= REQUEST =========== */

export function buildCheckoutRequest(
  idEvento: string,
  state: BookingState,
  stay: { checkIn: string; checkOut: string },
): CheckoutRequest {
  if (!state.pago) throw new Error("Falta el medio de pago");

  const habitaciones = Object.entries(state.habitaciones).flatMap(
    ([idHabitacion, cantidad]) =>
      Array.from({ length: cantidad }, () => ({
        idHabitacion,
        fechaCheckIn: stay.checkIn,
        fechaCheckOut: stay.checkOut,
      })),
  );
  const entradas = Object.entries(state.entradas).map(([idEntrada, cantidad]) => ({
    idEntrada,
    cantidad,
  }));
  const pasajeros = getPassengers(state);
  const vuelos = [state.vueloIda, state.vueloVuelta]
    .filter((id): id is string => id !== null)
    .map((idVuelo) => ({ idVuelo, cantidadPasajeros: pasajeros }));

  return {
    idEvento,
    ...(entradas.length ? { entradas } : {}),
    ...(habitaciones.length ? { habitaciones } : {}),
    ...(vuelos.length ? { vuelos } : {}),
    pago:
      state.pago.kind === "guardada"
        ? { idMetodoPago: state.pago.idMetodoPago }
        : state.pago.tarjeta,
  };
}

/* ======= CONFLICTO DE STOCK (409) =========== */

/**
 * Con el catálogo recién refrescado, busca qué ítems elegidos ya no alcanzan.
 * Devuelve el primer paso afectado y los ids, o null si no se detecta ninguno.
 */
export function findStockConflict(
  state: BookingState,
  catalog: BookingCatalog,
): { step: BookingStep; itemIds: string[] } | null {
  const byStep: Record<"hotel" | "entradas" | "vuelos", string[]> = {
    hotel: [],
    entradas: [],
    vuelos: [],
  };

  for (const hotel of catalog.hotels) {
    for (const room of hotel.habitaciones) {
      const cantidad = state.habitaciones[room.idHabitacion];
      if (cantidad && cantidad > room.stockDisponible) byStep.hotel.push(room.idHabitacion);
    }
  }
  for (const ticket of catalog.tickets) {
    const cantidad = state.entradas[ticket.idEntrada];
    if (cantidad && cantidad > ticket.stockDisponible) byStep.entradas.push(ticket.idEntrada);
  }
  const pasajeros = getPassengers(state);
  for (const id of [state.vueloIda, state.vueloVuelta]) {
    if (!id) continue;
    const flight = catalog.flights.find((f) => f.idVuelo === id);
    if (!flight || pasajeros > flight.stockAsientos) byStep.vuelos.push(id);
  }

  for (const step of ["hotel", "entradas", "vuelos"] as const) {
    if (byStep[step].length) return { step, itemIds: byStep[step] };
  }
  return null;
}

/* ======= RESERVAS HECHAS =========== */

/**
 * Último día de la reserva ("YYYY-MM-DD"): fechaFin del evento o, en reservas viejas
 * sin evento, la fecha más tardía del itinerario. Se compara como texto, sin Date.
 */
export function getReservationEndDate(reserva: Reserva): string {
  if (reserva.evento) return reserva.evento.fechaFin;
  const dates = [
    ...reserva.habitaciones.map((h) => h.fechaCheckOut),
    ...reserva.vuelos.map((v) => v.fechaLlegada.slice(0, 10)),
    reserva.fechaCompra.slice(0, 10),
  ];
  return dates.sort().at(-1)!;
}

export function isReservationPast(reserva: Reserva, today = todayUtcISO()): boolean {
  return getReservationEndDate(reserva) < today;
}
