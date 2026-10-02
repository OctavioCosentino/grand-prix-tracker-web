"use client";

import React from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { Entrada } from "@/services/tickets";
import { BookingAction, BookingState } from "@/utils/booking";
import TicketCard from "./TicketCard";
import BookingNotice, { QueryStatus } from "./BookingNotice";
import CircuitViewer from "./CircuitViewer";
import { Race } from "@/utils/races";

interface BookingTicketsStepProps {
  ticketsQuery: UseQueryResult<Entrada[], Error>;
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
  race: Race;
}

export default function BookingTicketsStep({
  ticketsQuery,
  state,
  dispatch,
  race,
}: BookingTicketsStepProps) {
  if (ticketsQuery.isPending || ticketsQuery.isError) {
    return (
      <QueryStatus
        isPending={ticketsQuery.isPending}
        error={ticketsQuery.error}
        onRetry={() => ticketsQuery.refetch()}
        loadingText="Cargando tribunas..."
      />
    );
  }

  const tickets = ticketsQuery.data;
  const conflictIds = state.conflict?.step === "entradas" ? state.conflict.itemIds : [];

  if (!tickets.length) {
    return (
      <BookingNotice severity="warning" title="Sin entradas">
        Todavía no hay entradas a la venta para este Gran Premio.
      </BookingNotice>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-8">
      {/* LEFT: TICKET OPTIONS */}
      <div className="flex flex-col gap-4">
        {tickets.map((ticket) => (
          <TicketCard
            key={ticket.idEntrada}
            ticket={ticket}
            cantidad={state.entradas[ticket.idEntrada] ?? 0}
            hasConflict={conflictIds.includes(ticket.idEntrada)}
            onChange={(cantidad) =>
              dispatch({ type: "setTicket", idEntrada: ticket.idEntrada, cantidad })
            }
          />
        ))}
      </div>

      {/* RIGHT: CIRCUIT VIEWER */}
      <div className="sticky top-24 self-start w-full">
        <CircuitViewer imgUrl={race.circuit_svg_url || "/circuits/default.png"} />
      </div>
    </div>
  );
}
