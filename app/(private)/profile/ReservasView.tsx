"use client";

import React from "react";
import ReservationCard from "@/components/ReservationCard";
import BookingNotice, { QueryStatus } from "@/components/BookingNotice";
import ButtonChecker from "@/components/ButtonChecker";
import EmptyState from "@/components/EmptyState";
import { useMyBookings } from "@/hooks/useBooking";
import { useAuth } from "@/components/providers/AuthProvider";
import { Reserva } from "@/services/bookings";
import { getReservationEndDate, isReservationPast } from "@/utils/booking";

function Group({ title, reservas }: { title: string; reservas: Reserva[] }) {
  if (!reservas.length) return null;
  return (
    <section className="mb-10">
      <h3 className="font-display mb-6 text-2xl font-900 tracking-tight">
        {title}
      </h3>
      {reservas.map((reserva) => (
        <ReservationCard key={reserva.idReserva} reserva={reserva} />
      ))}
    </section>
  );
}

export default function ReservasView() {
  const { user, isLoading } = useAuth();
  // Sin token el back responde 401: se pide recién cuando la sesión terminó de cargar
  const bookingsQuery = useMyBookings(!isLoading && Boolean(user));

  if (!isLoading && !user) {
    return (
      <BookingNotice severity="warning" title="Sin usuario">
        No hay un usuario identificado para mostrar sus reservas.
      </BookingNotice>
    );
  }

  if (isLoading || bookingsQuery.isPending || bookingsQuery.isError) {
    return (
      <QueryStatus
        isPending={isLoading || bookingsQuery.isPending}
        error={bookingsQuery.error}
        onRetry={() => bookingsQuery.refetch()}
        loadingText="Cargando tu historial de pista..."
        className="flex-1 w-full h-full min-h-[350px]"
      />
    );
  }

  const reservas = bookingsQuery.data;

  if (!reservas.length) {
    return (
      <EmptyState
        message="Todavía no tenés reservas"
        className="flex-1 w-full min-h-[350px]"
      >
        <ButtonChecker href="/calendar" className="px-6 py-3 text-xs" showArrow>
          Ver el calendario
        </ButtonChecker>
      </EmptyState>
    );
  }

  const byEndDate = (a: Reserva, b: Reserva) =>
    getReservationEndDate(a).localeCompare(getReservationEndDate(b));
  // Próximas: la carrera más cercana primero. Pasadas: la más reciente primero.
  const upcoming = reservas
    .filter((r) => !isReservationPast(r))
    .sort(byEndDate);
  const past = reservas
    .filter((r) => isReservationPast(r))
    .sort((a, b) => byEndDate(b, a));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Group title="Tus Próximos Grandes Premios" reservas={upcoming} />
      <Group title="Grandes Premios pasados" reservas={past} />
    </div>
  );
}
