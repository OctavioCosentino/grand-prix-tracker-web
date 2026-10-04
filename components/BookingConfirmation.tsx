import React, { useEffect, useRef } from "react";
import { Reserva } from "@/services/bookings";
import { formatDateTimeES } from "@/utils/booking";
import { playPaymentSuccessSound } from "@/utils/audio";
import Eyebrow from "./EyeBrow";
import ButtonChecker from "./ButtonChecker";
import ButtonOutline from "./ButtonOutline";
import ReservationItinerary from "./ReservationItinerary";
import { F1CarSilhouette } from "./F1CarSilhouette";

interface BookingConfirmationProps {
  reserva: Reserva;
  eventName: string;
}

/** Pantalla de éxito: muestra solo lo que devolvió POST /bookings. */
export default function BookingConfirmation({ reserva, eventName }: BookingConfirmationProps) {
  const soundPlayedRef = useRef(false);

  useEffect(() => {
    if (!soundPlayedRef.current) {
      soundPlayedRef.current = true;
      playPaymentSuccessSound();
    }
  }, []);
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

        <div className="relative overflow-hidden mt-8 rounded-sm border border-[#33343D] bg-[#131318] p-6 text-center">
          <style>{`
            @keyframes race-cars-confirmation {
              0% { transform: translateX(-160px); }
              100% { transform: translateX(100%); }
            }
            .animate-race-confirmation {
              animation: race-cars-confirmation 5s linear infinite;
            }
          `}</style>

          <span className="relative z-10 font-mono text-[10px] uppercase tracking-[0.3em] text-[#5C5D66]">
            Código de confirmación
          </span>
          <p className="relative z-10 font-display mt-2 text-4xl font-900 tracking-widest text-[#F3F1EA]">
            {reserva.codigoConfirmacion}
          </p>
          <p className="relative z-10 mt-2 font-mono text-[10px] text-[#5C5D66]">
            Comprado el {formatDateTimeES(reserva.fechaCompra)}
          </p>

          {/* Animación de autos en el borde inferior */}
          <div className="absolute bottom-[-6px] left-0 w-full h-8 pointer-events-none opacity-40">
            <div className="flex items-end animate-race-confirmation w-full absolute bottom-0 gap-8">
              <F1CarSilhouette className="w-14 text-[#5C5D66]" />
              <F1CarSilhouette className="w-14 text-[#5C5D66]" />
            </div>
          </div>
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
