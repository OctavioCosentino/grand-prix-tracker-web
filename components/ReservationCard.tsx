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
      icon: "/plane.png",
      label: "Vuelo",
      active: reserva.incluyeVuelo,
      detail: describeFlights(reserva),
    },
    {
      icon: "/hotel.png",
      label: "Hotel",
      active: reserva.incluyeHotel,
      detail: firstRoom ? `${firstRoom.cantidadNoches} noches` : undefined,
    },
    {
      icon: "/tickets.png",
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
          <span className="font-mono text-[10px] tracking-[0.2em]" style={{ color: estado.color }}>
            {estado.label}
          </span>
          <h4 className="font-display mt-2 text-xl font-900 uppercase tracking-tight text-[#F3F1EA]">
            {name}
          </h4>
          {place && <span className="mt-1 text-sm text-[#93949F]">{place}</span>}
          {dates && <span className="text-sm text-[#93949F]">{dates}</span>}
          <span className="mt-3 font-mono text-[11px] tracking-widest text-[#5C5D66]">
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
        <span className="font-mono text-xs text-[#D8D7CE]">{formatUsd(reserva.totalUsd)}</span>
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
