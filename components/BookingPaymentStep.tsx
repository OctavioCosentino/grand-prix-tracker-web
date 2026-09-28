"use client";

import React, { useState } from "react";
import { UseQueryResult } from "@tanstack/react-query";
import { MetodoPago } from "@/services/paymentMethods";
import { BookingAction, BookingState } from "@/utils/booking";
import NewCardForm from "./NewCardForm";
import BookingNotice, { QueryStatus } from "./BookingNotice";

interface BookingPaymentStepProps {
  paymentQuery: UseQueryResult<MetodoPago[], Error>;
  state: BookingState;
  dispatch: React.Dispatch<BookingAction>;
  clientReady: boolean;
}

export function describeCardType(tipo: MetodoPago["tipo"]): string {
  return tipo === "Credito" ? "Crédito" : "Débito";
}

export default function BookingPaymentStep({
  paymentQuery,
  state,
  dispatch,
  clientReady,
}: BookingPaymentStepProps) {
  const [showNewCard, setShowNewCard] = useState(false);
  const pago = state.pago;

  if (!clientReady) {
    return (
      <BookingNotice severity="danger" title="Sin cliente identificado">
        No hay un usuario identificado para realizar la compra.
      </BookingNotice>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7C4DFF]">
          Tarjetas guardadas
        </h2>

        {paymentQuery.isPending || paymentQuery.isError ? (
          <QueryStatus
            isPending={paymentQuery.isPending}
            error={paymentQuery.error}
            onRetry={() => paymentQuery.refetch()}
            loadingText="Cargando tus tarjetas..."
          />
        ) : paymentQuery.data.length === 0 ? (
          <p className="text-sm text-[#93949F]">No tenés tarjetas guardadas.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {paymentQuery.data.map((card) => {
              const selected =
                pago?.kind === "guardada" && pago.idMetodoPago === card.idMetodoPago;
              return (
                <button
                  key={card.idMetodoPago}
                  type="button"
                  disabled={card.vencida}
                  aria-pressed={selected}
                  onClick={() =>
                    dispatch({
                      type: "setPayment",
                      pago: { kind: "guardada", idMetodoPago: card.idMetodoPago },
                    })
                  }
                  className={`relative flex h-32 flex-col justify-between overflow-hidden rounded-md border bg-gradient-to-br from-[#1C1D24] to-[#0B0B10] p-5 text-left transition-all ${
                    selected
                      ? "border-[#E10600]"
                      : "border-[#1C1D24] enabled:hover:-translate-y-0.5 enabled:hover:border-[#33343D]"
                  } ${card.vencida ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                >
                  <div className="flex justify-between">
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-[#93949F]">
                      {describeCardType(card.tipo)}
                    </span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                        selected ? "border-[#E10600] bg-[#E10600]" : "border-[#33343D]"
                      }`}
                    >
                      {selected && <span className="h-2 w-2 rounded-full bg-white" />}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="font-display text-lg font-bold tracking-widest text-[#F3F1EA]">
                      •••• {card.ultimos4Digitos}
                    </span>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-wider ${
                        card.vencida ? "text-[#E10600]" : "text-[#5C5D66]"
                      }`}
                    >
                      {card.vencida ? "Vencida" : `Vence ${card.fechaExpiracion}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7C4DFF]">
          Tarjeta nueva
        </h2>

        {pago?.kind === "nueva" ? (
          <div className="flex items-center justify-between rounded-md border border-[#E10600] bg-[#0E0E13] p-5">
            <div>
              <p className="font-display text-lg font-bold tracking-widest text-[#F3F1EA]">
                •••• {pago.tarjeta.ultimos4Digitos}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#5C5D66]">
                {describeCardType(pago.tarjeta.tipo)} · Vence {pago.tarjeta.fechaExpiracion} ·
                Se guarda al confirmar la compra
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: "setPayment", pago: null });
                setShowNewCard(true);
              }}
              className="text-sm font-bold text-[#E10600] hover:underline cursor-pointer"
            >
              Cambiar
            </button>
          </div>
        ) : showNewCard ? (
          <div className="rounded-md border border-[#1C1D24] bg-[#0E0E13] p-6">
            <NewCardForm
              onConfirm={(tarjeta) => {
                dispatch({ type: "setPayment", pago: { kind: "nueva", tarjeta } });
                setShowNewCard(false);
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowNewCard(true)}
            className="rounded-md border border-dashed border-[#33343D] bg-[#0E0E13] p-5 text-left font-mono text-xs uppercase tracking-widest text-[#93949F] transition-colors hover:border-[#E10600] hover:text-[#F3F1EA] cursor-pointer"
          >
            + Usar una tarjeta nueva
          </button>
        )}
      </section>
    </div>
  );
}
