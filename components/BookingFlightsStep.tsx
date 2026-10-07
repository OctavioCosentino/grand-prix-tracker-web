"use client";

import React from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { Vuelo } from "@/services/flights";
import { BookingAction, BookingState, countTickets, getPassengers } from "@/utils/booking";
import FlightCard from "./FlightCard";
import QuantityStepper from "./QuantityStepper";
import EmptyState from "./EmptyState";
import { QueryStatus } from "./BookingNotice";

interface BookingFlightsStepProps {
  flightsQuery: UseQueryResult<Vuelo[], Error>;
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
}

export default function BookingFlightsStep({
  flightsQuery,
  state,
  dispatch,
}: BookingFlightsStepProps) {
  if (flightsQuery.isPending || flightsQuery.isError) {
    return (
      <QueryStatus
        isPending={flightsQuery.isPending}
        error={flightsQuery.error}
        onRetry={() => flightsQuery.refetch()}
        loadingText="Consultando la torre de control..."
      />
    );
  }

  const flights = flightsQuery.data;
  const pasajeros = getPassengers(state);
  const conflictIds = state.conflict?.step === "vuelos" ? state.conflict.itemIds : [];
  const maxSeats = Math.max(1, ...flights.map((f) => f.stockAsientos));
  const tickets = countTickets(state);

  const columns = [
    { sentido: "IDA" as const, title: "Ida", selectedId: state.vueloIda },
    { sentido: "VUELTA" as const, title: "Vuelta", selectedId: state.vueloVuelta },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-md border border-[#1C1D24] bg-[#0E0E13] p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-lg font-bold text-[#F3F1EA]">Pasajeros</p>
          <p className="text-sm text-[#93949F]">
            {state.pasajeros === null && tickets > 0
              ? "Igual a la cantidad de entradas que elegiste. Podés cambiarlo."
              : "Aplica a la ida y a la vuelta."}
          </p>
        </div>
        <QuantityStepper
          value={pasajeros}
          min={1}
          max={Math.max(maxSeats, pasajeros)}
          onChange={(cantidad) => dispatch({ type: "setPassengers", cantidad })}
          label="Pasajeros"
        />
      </div>

      {flights.length === 0 ? (
        <EmptyState message="Todavía no hay vuelos para este Gran Premio" />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {columns.map(({ sentido, title, selectedId }) => {
            const options = flights.filter((f) => f.sentido === sentido);
            return (
              <section key={sentido} className="flex flex-col gap-3">
                {/* Título distintivo en Celular */}
                <div className="flex md:hidden items-center gap-3 pt-4 first:pt-0">
                  <div className="flex items-center rounded-sm bg-[#131318] border border-[#1C1D24] border-l-4 border-l-[#E10600] px-3.5 py-2 shadow-md">
                    <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#F3F1EA]">
                      VUELOS DE {sentido}
                    </span>
                  </div>
                  <div className="h-px flex-1 bg-gradient-to-r from-[#1C1D24] to-transparent" />
                </div>

                {/* Título en Desktop */}
                <h2 className="hidden md:block font-mono text-[11px] uppercase tracking-[0.2em] text-[#7C4DFF]">
                  {title}
                </h2>
                {options.length === 0 ? (
                  <EmptyState className="h-32" message={"Sin vuelos de " + title.toLowerCase() + " disponibles"} />
                ) : (
                  options.map((flight) => {
                    const selected = flight.idVuelo === selectedId;
                    return (
                      <FlightCard
                        key={flight.idVuelo}
                        flight={flight}
                        pasajeros={pasajeros}
                        selected={selected}
                        hasConflict={
                          conflictIds.includes(flight.idVuelo) ||
                          (selected && flight.stockAsientos < pasajeros)
                        }
                        onToggle={() =>
                          dispatch({
                            type: "setFlight",
                            sentido,
                            idVuelo: selected ? null : flight.idVuelo,
                          })
                        }
                      />
                    );
                  })
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
