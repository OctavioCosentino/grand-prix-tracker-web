import React from "react";
import { Reserva } from "@/services/bookings";
import { formatDateTimeES } from "@/utils/booking";
import Eyebrow from "./EyeBrow";
import ButtonChecker from "./ButtonChecker";
import ButtonOutline from "./ButtonOutline";
import ReservationItinerary from "./ReservationItinerary";

interface BookingConfirmationProps {
  reserva: Reserva;
  eventName: string;
}

/** Pantalla de éxito: muestra solo lo que devolvió POST /bookings. */
export default function BookingConfirmation({ reserva, eventName }: BookingConfirmationProps) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="relative overflow-hidden rounded-md border border-[#1C1D24] bg-[#0E0E13] p-8 shadow-2xl sm:p-10">
        <div className="absolute bottom-0 left-0 top-0 w-1.5 bg-[#34D399]" />
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#34D399] opacity-10 blur-3xl" />

        <Eyebrow>Bandera a cuadros</Eyebrow>
        <h1 className="font-display mt-3 text-4xl font-900 tracking-tight text-[#F3F1EA]">
          ¡Reserva confirmada!
        </h1>
        <p className="mt-2 text-[#93949F]">Tu paquete para {eventName} ya está pago.</p>

        <div className="mt-8 rounded-sm border border-[#33343D] bg-[#131318] p-6 text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#5C5D66]">
            Código de confirmación
          </span>
          <p className="font-display mt-2 text-4xl font-900 tracking-widest text-[#F3F1EA]">
            {reserva.codigoConfirmacion}
          </p>
          <p className="mt-2 font-mono text-[10px] text-[#5C5D66]">
            Comprado el {formatDateTimeES(reserva.fechaCompra)}
          </p>
        </div>

        <div className="mt-8">
          <ReservationItinerary reserva={reserva} />
        </div>

        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <ButtonOutline href="/calendar">
            Volver al calendario
          </ButtonOutline>
          <ButtonChecker href="/profile?tab=reservas" className="px-6 py-3 text-xs" showArrow>
            Ver mis reservas
          </ButtonChecker>
        </div>
      </div>
    </div>
  );
}
