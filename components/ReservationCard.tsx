"use client";

import { useState } from "react";
import Badge from "./Badge";
import ReservationItinerary from "./ReservationItinerary";
import { Reserva } from "@/services/bookings";
import { formatRaceDates } from "@/utils/dateTranslate";
import { getRaceName } from "@/utils/events";
import { formatUsd } from "@/utils/booking";

export interface ReservationCardProps {
  reserva: Reserva;
}

const ESTADOS: Record<Reserva["estado"], { label: string; color: string }> = {
  Pagada: { label: "CONFIRMADO", color: "#E7B33C" },
  Pendiente: { label: "PENDIENTE", color: "#93949F" },
  Cancelada: { label: "CANCELADO", color: "#E10600" },
};

/** "2026-11-06" → "06/11/2026", el formato que espera formatRaceDates */
function toDMY(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function describeFlights(reserva: Reserva): string | undefined {
  const city = reserva.evento?.circuito.ciudad.nombre;
  if (!reserva.vuelos.length) return undefined;
  if (reserva.vuelos.length > 1) return "Ida y vuelta";
  if (!city) return "1 vuelo";
  return reserva.vuelos[0].destino === city ? "Solo ida" : "Solo vuelta";
}

export default function ReservationCard({ reserva }: ReservationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { evento } = reserva;
  const estado = ESTADOS[reserva.estado];

  const name = evento
    ? getRaceName(evento.circuito.nombre, evento.circuito.ciudad.nombre, evento.circuito.ciudad.pais.nombre)
    : `Reserva ${reserva.codigoConfirmacion}`;
  const place = evento
    ? `${evento.circuito.ciudad.nombre}, ${evento.circuito.ciudad.pais.nombre}`
    : null;
  const dates = evento
    ? formatRaceDates([toDMY(evento.fechaInicio), toDMY(evento.fechaFin)])
    : null;

  const tickets = reserva.entradas.reduce((acc, e) => acc + e.cantidad, 0);
  const firstRoom = reserva.habitaciones[0];

  const items = [
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2C10.67 2 10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" />
        </svg>
      ),
      label: "Vuelo",
      active: reserva.incluyeVuelo,
      detail: describeFlights(reserva),
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 2H5C3.9 2 3 2.9 3 4V22H21V4C21 2.9 20.1 2 19 2ZM11 18H7V14H11V18ZM11 10H7V6H11V10ZM17 18H13V14H17V18ZM17 10H13V6H17V10Z" />
        </svg>
      ),
      label: "Hotel",
      active: reserva.incluyeHotel,
      detail: firstRoom ? `${firstRoom.cantidadNoches} noches` : undefined,
    },
    {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 10V6C22 4.9 21.1 4 20 4H4C2.9 4 2.01 4.9 2.01 6V10C3.11 10 4 10.9 4 12C4 13.1 3.11 14 2 14V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V14C20.9 14 20 13.1 20 12C20 10.9 22 10 22 10ZM11 15H5V13H11V15ZM11 11H5V9H11V11ZM19 15H13V13H19V15ZM19 11H13V9H19V11Z" />
        </svg>
      ),
      label: "Entrada",
      active: reserva.incluyeEntrada,
      detail: reserva.entradas.length
        ? `${reserva.entradas[0].nombreTribuna}${tickets > 1 ? ` ×${tickets}` : ""}`
        : undefined,
    },
  ];

  return (
    <div className="group mb-4 rounded-md border border-[#1C1D24] bg-[#131318] p-1 shadow-md transition-colors hover:border-[#33343D]">
      <div className="flex flex-col md:flex-row">
        <div className="flex w-full flex-col justify-center border-b border-[#1C1D24] bg-[#0B0B10] p-6 md:w-1/3 md:border-b-0 md:border-r">
          <span 
            className="inline-block self-start font-mono text-[10px] uppercase tracking-[0.2em] px-2 py-0.5 rounded-sm border"
            style={{ color: estado.color, backgroundColor: estado.color + '1A', borderColor: estado.color + '33' }}
          >
            {estado.label}
          </span>
          <h4 className="font-display mt-3 text-2xl font-900 uppercase tracking-tight text-[#F3F1EA]">
            {name}
          </h4>
          {place && <span className="mt-1 text-sm text-[#93949F]">{place}</span>}
          {dates && <span className="text-sm text-[#93949F]">{dates}</span>}
          <span className="mt-3 font-mono tabular-nums text-[11px] tracking-widest text-[#5C5D66]">
            {reserva.codigoConfirmacion}
          </span>
        </div>

        <div className="grid grow grid-cols-3 gap-4 p-6">
          {items.map((item) => (
            <Badge
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={item.active}
              detail={item.detail}
            />
          ))}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#1C1D24] bg-[#0E0E13] px-6 pb-6">
          <ReservationItinerary reserva={reserva} />
        </div>
      )}

      <div className="flex items-center justify-between bg-[#0E0E13] px-6 py-3">
        <span className="font-mono tabular-nums text-lg font-bold text-[#F3F1EA]">{formatUsd(reserva.totalUsd)}</span>
        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((v) => !v)}
          className="font-mono text-[10px] font-semibold tracking-widest text-[#93949F] transition-colors hover:text-[#F3F1EA] cursor-pointer"
        >
          {expanded ? "OCULTAR ITINERARIO ↑" : "VER ITINERARIO COMPLETO →"}
        </button>
      </div>
    </div>
  );
}
