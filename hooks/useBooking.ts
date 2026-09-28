"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ApiError } from "@/services/http";
import { getEventHotels, Hotel } from "@/services/hotels";
import { getEventTickets, Entrada } from "@/services/tickets";
import { getEventFlights, Vuelo } from "@/services/flights";
import { getPaymentMethods, MetodoPago } from "@/services/paymentMethods";
import { createBooking, getBookings, CheckoutRequest, Reserva } from "@/services/bookings";

/**
 * Reintenta ante cold-starts de Render (errores de red o 5xx),
 * pero no ante errores del cliente (4xx), que no se resuelven reintentando.
 */
function retryUnlessClientError(failureCount: number, error: Error): boolean {
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
    return false;
  }
  return failureCount < 4;
}

const stockQueryOptions = {
  // El stock cambia con cada compra: se refresca al volver a montar el paso.
  staleTime: 30_000,
  retry: retryUnlessClientError,
  retryDelay: (attemptIndex: number) => Math.min(2000 * (attemptIndex + 1), 10000),
};

export const bookingQueryKeys = {
  hotels: (idEvento: string) => ["event", idEvento, "hotels"] as const,
  tickets: (idEvento: string) => ["event", idEvento, "tickets"] as const,
  flights: (idEvento: string) => ["event", idEvento, "flights"] as const,
  paymentMethods: ["payment-methods"] as const,
  bookings: ["bookings"] as const,
};

export function useEventHotels(idEvento: string) {
  return useQuery<Hotel[], Error>({
    queryKey: bookingQueryKeys.hotels(idEvento),
    queryFn: () => getEventHotels(idEvento),
    ...stockQueryOptions,
  });
}

export function useEventTickets(idEvento: string) {
  return useQuery<Entrada[], Error>({
    queryKey: bookingQueryKeys.tickets(idEvento),
    queryFn: () => getEventTickets(idEvento),
    ...stockQueryOptions,
  });
}

export function useEventFlights(idEvento: string) {
  return useQuery<Vuelo[], Error>({
    queryKey: bookingQueryKeys.flights(idEvento),
    queryFn: () => getEventFlights(idEvento),
    ...stockQueryOptions,
  });
}

export function usePaymentMethods(enabled = true) {
  return useQuery<MetodoPago[], Error>({
    queryKey: bookingQueryKeys.paymentMethods,
    queryFn: getPaymentMethods,
    enabled,
    ...stockQueryOptions,
  });
}

/** Reservas ya hechas por el cliente. */
export function useMyBookings(enabled = true) {
  return useQuery<Reserva[], Error>({
    queryKey: bookingQueryKeys.bookings,
    queryFn: getBookings,
    enabled,
    ...stockQueryOptions,
  });
}

/** Compra final del paquete. Sin reintentos: no se puede cobrar dos veces. */
export function useCreateBooking() {
  return useMutation<Reserva, Error, CheckoutRequest>({
    mutationFn: createBooking,
    retry: false,
  });
}
