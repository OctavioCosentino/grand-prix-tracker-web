import React from "react";
import Image from "next/image";
import { Hotel } from "@/services/hotels";
import { formatUsd } from "@/utils/booking";
import QuantityStepper from "./QuantityStepper";
import StockLabel from "./StockLabel";

interface HotelCardProps {
  hotel: Hotel;
  nights: number;
  /** Cantidad elegida por idHabitacion */
  selected: Record<string, number>;
  onRoomChange: (idHabitacion: string, cantidad: number) => void;
  conflictIds?: string[];
}

export default function HotelCard({
  hotel,
  nights,
  selected,
  onRoomChange,
  conflictIds = [],
}: HotelCardProps) {
  const { nombre, estrellas, distanciaCircuitoKm, ofreceTraslado, imagenPrincipalUrl } = hotel;
  const stars = estrellas ?? 0;
  const available = hotel.habitaciones.filter((h) => h.stockDisponible > 0);
  const fromPrice = Math.min(
    ...(available.length ? available : hotel.habitaciones).map((h) => h.precioPorNocheUsd),
  );
  const hasSelection = hotel.habitaciones.some((h) => selected[h.idHabitacion]);

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-md border bg-[#0E0E13] transition-all hover:shadow-lg md:flex-row ${
        hasSelection ? "border-[#33343D]" : "border-[#1C1D24] hover:border-[#33343D]"
      }`}
    >
      <div className="relative h-48 w-full shrink-0 md:h-auto md:w-56">
        {imagenPrincipalUrl ? (
          <Image
            src={imagenPrincipalUrl}
            alt={nombre}
            fill
            sizes="(min-width: 768px) 224px, 100vw"
            className="object-cover grayscale transition-all duration-500 hover:grayscale-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#131318]">
            <span className="font-mono text-xs text-[#5C5D66]">Sin imagen</span>
          </div>
        )}

        {ofreceTraslado && (
          <div className="absolute left-3 top-3 rounded-sm bg-[#E10600] px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-white">
            Traslado Incluido
          </div>
        )}
      </div>

      {/* Hotel Info */}
      <div className="flex flex-grow flex-col justify-between p-6">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-xl font-bold text-[#F3F1EA]">
                {nombre}
              </h3>
              {estrellas !== null && (
                <div className="mt-1 flex text-[#E7B33C]">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill={i < stars ? "currentColor" : "none"}
                      stroke="currentColor"
                      className={`h-4 w-4 ${i >= stars ? "text-[#33343D]" : ""}`}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385c.148.621-.531 1.115-1.07.822L12 18.064a.562.562 0 00-.533 0l-4.78 2.688c-.539.303-1.218-.191-1.07-.822l1.285-5.385a.563.563 0 00-.182-.557l-4.204-3.602c-.38-.325-.178-.948.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                      />
                    </svg>
                  ))}
                </div>
              )}
            </div>
            <div className="text-right">
              <span className="font-mono text-[10px] uppercase text-[#93949F]">
                Desde
              </span>
              <div className="font-display text-2xl font-900 text-[#E10600]">
                {formatUsd(fromPrice)}
              </div>
              <span className="font-mono text-[10px] text-[#5C5D66]">
                / noche
              </span>
            </div>
          </div>

          {distanciaCircuitoKm !== null && (
            <div className="mt-4 flex flex-wrap gap-4 font-mono text-xs text-[#93949F]">
              <div className="flex items-center gap-1.5">
                <svg
                  className="h-4 w-4 text-[#7C4DFF]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>A {distanciaCircuitoKm} km del circuito</span>
              </div>
            </div>
          )}
        </div>

        {/* Habitaciones */}
        <ul className="mt-6 divide-y divide-[#1C1D24] border-t border-[#1C1D24]">
          {hotel.habitaciones.map((room) => {
            const cantidad = selected[room.idHabitacion] ?? 0;
            const soldOut = room.stockDisponible === 0;
            const hasConflict = conflictIds.includes(room.idHabitacion);

            return (
              <li
                key={room.idHabitacion}
                className={`flex items-center justify-between gap-4 py-3 ${
                  hasConflict ? "-mx-2 rounded-sm border border-[#E10600] px-2" : ""
                } ${soldOut && cantidad === 0 ? "opacity-50" : ""}`}
              >
                <div>
                  <p className="font-display text-sm font-bold text-[#F3F1EA]">
                    {room.tipo}
                  </p>
                  <StockLabel stock={room.stockDisponible} unit="disponibles" lowThreshold={2} />
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-[#F3F1EA]">
                      {formatUsd(room.precioPorNocheUsd)}
                    </span>
                    <span className="block font-mono text-[10px] text-[#5C5D66]">
                      {formatUsd(room.precioPorNocheUsd * nights)} por {nights} noches
                    </span>
                  </div>
                  <QuantityStepper
                    value={cantidad}
                    max={room.stockDisponible}
                    disabled={soldOut && cantidad === 0}
                    onChange={(n) => onRoomChange(room.idHabitacion, n)}
                    label="Habitaciones"
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
