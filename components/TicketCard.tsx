import React from "react";
import { Entrada } from "@/services/tickets";
import { formatUsd } from "@/utils/booking";
import QuantityStepper from "./QuantityStepper";
import StockLabel from "./StockLabel";
import { tireColors } from "@/utils/tireColors";

interface TicketCardProps {
  ticket: Entrada;
  cantidad: number;
  onChange: (cantidad: number) => void;
  hasConflict?: boolean;
}

const TIPO_COLORS: Record<Entrada["tipo"], string> = {
  General: tireColors.hard,
  "Asiento Numerado": tireColors.medium,
  VIP: tireColors.soft,
};

export default function TicketCard({
  ticket,
  cantidad,
  onChange,
  hasConflict = false,
}: TicketCardProps) {
  const soldOut = ticket.stockDisponible === 0;
  const color = TIPO_COLORS[ticket.tipo];

  return (
    <div
      className={`relative flex flex-col gap-4 overflow-hidden rounded-md border bg-[#0E0E13] p-6 transition-all sm:flex-row sm:items-center sm:justify-between ${
        hasConflict
          ? "border-[#E10600]"
          : cantidad > 0
            ? "border-[#33343D]"
            : "border-[#1C1D24] hover:border-[#33343D]"
      } ${soldOut && cantidad === 0 ? "opacity-50" : ""}`}
    >
      <div className="absolute bottom-0 left-0 top-0 w-1" style={{ backgroundColor: color }} />

      <div className="pl-2">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color }}
        >
          {ticket.tipo}
        </span>
        <h3 className="font-display mt-1 text-xl font-bold" style={{ color }}>
          {ticket.nombreTribuna}
        </h3>
        <div className="mt-1">
          <StockLabel stock={ticket.stockDisponible} unit="disponibles" />
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 pl-2 sm:justify-end">
        <div className="text-right">
          <div className="font-display text-2xl font-900 text-[#E10600]">
            {formatUsd(ticket.precioUsd)}
          </div>
          <span className="font-mono text-xs text-[#5C5D66]">/ entrada</span>
        </div>
        <QuantityStepper
          value={cantidad}
          max={ticket.stockDisponible}
          // Si se agotó con la entrada ya elegida, se permite bajar la cantidad
          disabled={soldOut && cantidad === 0}
          onChange={onChange}
          label="Entradas"
        />
      </div>
    </div>
  );
}
