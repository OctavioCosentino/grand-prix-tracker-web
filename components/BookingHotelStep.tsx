"use client";

import React, { useState } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { Hotel } from "@/services/hotels";
import { BookingAction, BookingState, formatDateES } from "@/utils/booking";
import HotelCard from "./HotelCard";
import HotelFilters from "./HotelFilters";
import BookingNotice, { QueryStatus } from "./BookingNotice";

interface BookingHotelStepProps {
  hotelsQuery: UseQueryResult<Hotel[], Error>;
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
  stay: { checkIn: string; checkOut: string; nights: number };
  /** El check-in cae antes de hoy (el evento ya empezó): el back rechaza la reserva */
  checkInPassed: boolean;
}

const MAX_PRICE = 2000;

export default function BookingHotelStep({
  hotelsQuery,
  state,
  dispatch,
  stay,
  checkInPassed,
}: BookingHotelStepProps) {
  const [priceRange, setPriceRange] = useState(MAX_PRICE);
  const [minStars, setMinStars] = useState(3);

  if (checkInPassed) {
    return (
      <BookingNotice severity="warning" title="Hotel no disponible">
        El check-in del paquete era el {formatDateES(stay.checkIn)} y ya pasó, así que
        no se puede reservar hotel para este Gran Premio. Podés seguir con entradas y vuelos.
      </BookingNotice>
    );
  }

  if (hotelsQuery.isPending || hotelsQuery.isError) {
    return (
      <QueryStatus
        isPending={hotelsQuery.isPending}
        error={hotelsQuery.error}
        onRetry={() => hotelsQuery.refetch()}
        loadingText="Buscando hoteles cerca del circuito..."
      />
    );
  }

  const hotels = hotelsQuery.data;
  const conflictIds = state.conflict?.step === "hotel" ? state.conflict.itemIds : [];

  const filteredHotels = hotels.filter((h) => {
    // Un hotel con habitaciones elegidas no se oculta aunque no pase los filtros
    if (h.habitaciones.some((r) => state.habitaciones[r.idHabitacion])) return true;
    const cheapest = Math.min(...h.habitaciones.map((r) => r.precioPorNocheUsd));
    return (
      cheapest <= priceRange &&
      // Sin clasificación cargada no se filtra por estrellas
      (h.estrellas === null || h.estrellas >= minStars) &&
      (state.traslado ? h.ofreceTraslado === true : true)
    );
  });

  return (
    <div className="flex flex-col gap-6">
      <BookingNotice title="Fechas del paquete">
        Check-in {formatDateES(stay.checkIn)} · Check-out {formatDateES(stay.checkOut)} ·{" "}
        {stay.nights} noches. Las fechas cubren todo el fin de semana de carrera.
      </BookingNotice>

      <div className="flex flex-col gap-6">
        <HotelFilters
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          minStars={minStars}
          setMinStars={setMinStars}
          transferOnly={state.traslado}
          setTransferOnly={(val) => dispatch({ type: "setTraslado", incluye: val })}
        />

        <div className="flex flex-col gap-4">
          {filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel.idHotel}
                hotel={hotel}
                nights={stay.nights}
                selected={state.habitaciones}
                conflictIds={conflictIds}
                onRoomChange={(idHabitacion, cantidad) =>
                  dispatch({ type: "setRoom", idHabitacion, cantidad })
                }
              />
            ))
          ) : (
            <div className="relative flex h-64 flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-[#33343D] bg-[#0E0E13]">
              <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-30 grayscale"
                style={{ backgroundImage: "url('/mclaren_roto.png')" }}
              />
              <div className="relative z-10 flex flex-col items-center text-center px-4">
                <p className="mt-4 font-mono text-sm tracking-widest text-[#ffffff] uppercase">
                  {hotels.length ? "No hay hoteles que coincidan" : "No hay hoteles para este evento"}
                </p>
                {hotels.length > 0 && (
                  <button
                    onClick={() => {
                      setPriceRange(MAX_PRICE);
                      setMinStars(3);
                      dispatch({ type: "setTraslado", incluye: false });
                    }}
                    className="mt-4 text-base font-bold text-[#f10b03] hover:underline cursor-pointer"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
