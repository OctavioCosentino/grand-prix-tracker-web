"use client";

import React from "react";
import ReservationCard from "@/components/ReservationCard";
import BookingNotice, { QueryStatus } from "@/components/BookingNotice";
import ButtonChecker from "@/components/ButtonChecker";
import { useMyBookings } from "@/hooks/useBooking";
import { useAuth } from "@/components/providers/AuthProvider";
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
        className="min-h-[60vh]"
      />
    );
  }

  const reservas = bookingsQuery.data;

  if (!reservas.length) {
    return (
      <div className="relative flex min-h-[40vh] flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-[#33343D] bg-[#0E0E13]">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30 grayscale"
          style={{ backgroundImage: "url('/empty.png')" }}
        />
        <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
          <p className="font-mono text-sm uppercase tracking-widest text-[#ffffff] drop-shadow-md">
            Todavía no tenés reservas
          </p>
          <ButtonChecker href="/calendar" className="px-6 py-3 text-xs" showArrow>
            Ver el calendario
          </ButtonChecker>
        </div>
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
