"use client";

import React from "react";
import ReservationCard from "@/components/ReservationCard";
import BookingNotice, { QueryStatus } from "@/components/BookingNotice";
import ButtonChecker from "@/components/ButtonChecker";
import { useMyBookings } from "@/hooks/useBooking";
import { hasClientIdentity } from "@/services/http";
import { Reserva } from "@/services/bookings";
import { getReservationEndDate, isReservationPast } from "@/utils/booking";

function Group({ title, reservas }: { title: string; reservas: Reserva[] }) {
  if (!reservas.length) return null;
  return (
    <section className="mb-10">
      <h3 className="font-display mb-6 text-2xl font-900 tracking-tight">{title}</h3>
      {reservas.map((reserva) => (
        <ReservationCard key={reserva.idReserva} reserva={reserva} />
      ))}
    </section>
  );
}

export default function ReservasView() {
  const clientReady = hasClientIdentity();
  const bookingsQuery = useMyBookings(clientReady);

  if (!clientReady) {
    return (
      <BookingNotice severity="warning" title="Sin usuario">
        No hay un usuario identificado para mostrar sus reservas.
      </BookingNotice>
    );
  }

  if (bookingsQuery.isPending || bookingsQuery.isError) {
    return (
      <QueryStatus
        isPending={bookingsQuery.isPending}
        error={bookingsQuery.error}
        onRetry={() => bookingsQuery.refetch()}
        loadingText="Cargando tu historial de pista..."
      />
    );
  }

  const reservas = bookingsQuery.data;

  if (!reservas.length) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <p className="font-mono text-sm uppercase tracking-widest text-[#93949F]">
          Todavía no tenés reservas
        </p>
        <ButtonChecker href="/calendar" className="px-6 py-3 text-xs" showArrow>
          Ver el calendario
        </ButtonChecker>
      </div>
    );
  }

  const byEndDate = (a: Reserva, b: Reserva) =>
    getReservationEndDate(a).localeCompare(getReservationEndDate(b));
  // Próximas: la carrera más cercana primero. Pasadas: la más reciente primero.
  const upcoming = reservas.filter((r) => !isReservationPast(r)).sort(byEndDate);
  const past = reservas.filter((r) => isReservationPast(r)).sort((a, b) => byEndDate(b, a));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <Group title="Próximos Grandes Premios" reservas={upcoming} />
      <Group title="Grandes Premios pasados" reservas={past} />
    </div>
  );
}
