import React from "react";
import { Vuelo } from "@/services/flights";
import { formatDateTimeES, formatUsd } from "@/utils/booking";
import StockLabel from "./StockLabel";

interface FlightCardProps {
  flight: Vuelo;
  selected: boolean;
  pasajeros: number;
  onToggle: () => void;
  hasConflict?: boolean;
}

export default function FlightCard({
  flight,
  selected,
  pasajeros,
  onToggle,
  hasConflict = false,
}: FlightCardProps) {
  const notEnoughSeats = flight.stockAsientos < pasajeros;
  // Un vuelo ya elegido se puede deseleccionar aunque no alcancen los asientos
  const disabled = notEnoughSeats && !selected;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      className={`w-full rounded-md border bg-[#0E0E13] p-5 text-left transition-all ${
        hasConflict
          ? "border-[#E10600]"
          : selected
            ? "border-[#E10600] bg-[#E10600]/5"
            : "border-[#1C1D24] hover:border-[#33343D]"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#7C4DFF]">
            {flight.aerolinea}
          </span>
          <p className="font-display mt-1 text-lg font-bold text-[#F3F1EA]">
            {flight.origen.nombre} → {flight.destino.nombre}
          </p>
        </div>
        <span
          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-[#E10600] bg-[#E10600]" : "border-[#33343D]"
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-white" />}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs text-[#93949F]">
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-[#5C5D66]">Sale</span>
          {formatDateTimeES(flight.fechaSalida)}
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-wider text-[#5C5D66]">Llega</span>
          {formatDateTimeES(flight.fechaLlegada)}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        {notEnoughSeats && flight.stockAsientos > 0 ? (
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#E7B33C]">
            Solo {flight.stockAsientos} asiento{flight.stockAsientos > 1 ? "s" : ""}
          </span>
        ) : (
          <StockLabel stock={flight.stockAsientos} unit="asientos" />
        )}
        <div className="text-right">
          <span className="font-display text-xl font-900 text-[#E10600]">
            {formatUsd(flight.precioUsd)}
          </span>
          <span className="ml-1 font-mono text-[10px] text-[#5C5D66]">/ pasajero</span>
        </div>
      </div>
    </button>
  );
}
