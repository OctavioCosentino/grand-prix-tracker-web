"use client";

import React from "react";
import { MetodoPago } from "@/services/paymentMethods";
import {
  BOOKING_STEPS,
  BookingStep,
  PaymentSelection,
  SummaryLine,
  ValidationIssue,
  formatDateES,
  formatUsd,
} from "@/utils/booking";
import ButtonChecker from "./ButtonChecker";
import ButtonProgress from "./ButtonProgress";
import { describeCardType } from "./BookingPaymentStep";

interface BookingReviewStepProps {
  lines: SummaryLine[];
  stay: { checkIn: string; checkOut: string; nights: number };
  pago: PaymentSelection | null;
  paymentMethods: MetodoPago[];
  issues: ValidationIssue[];
  submitError: string | null;
  isSubmitting: boolean;
  onEdit: (step: BookingStep) => void;
  onConfirm: () => void;
}

function describePayment(pago: PaymentSelection | null, methods: MetodoPago[]): string {
  if (!pago) return "Sin medio de pago";
  if (pago.kind === "nueva") {
    return `${describeCardType(pago.tarjeta.tipo)} •••• ${pago.tarjeta.ultimos4Digitos} (tarjeta nueva)`;
  }
  const card = methods.find((m) => m.idMetodoPago === pago.idMetodoPago);
  return card
    ? `${describeCardType(card.tipo)} •••• ${card.ultimos4Digitos}`
    : "Tarjeta guardada";
}

export default function BookingReviewStep({
  lines,
  stay,
  pago,
  paymentMethods,
  issues,
  submitError,
  isSubmitting,
  onEdit,
  onConfirm,
}: BookingReviewStepProps) {
  const total = lines.reduce((acc, l) => acc + l.subtotal, 0);
  const productSteps = BOOKING_STEPS.filter((s) =>
    ["hotel", "entradas", "vuelos"].includes(s.id),
  );

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div className="rounded-md border border-[#1C1D24] bg-[#0E0E13] p-6 sm:p-8">
        {productSteps.map(({ id, label }) => {
          const stepLines = lines.filter((l) => l.step === id);
          return (
            <section key={id} className="border-b border-[#1C1D24] py-5 first:pt-0">
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#7C4DFF]">
                  {label}
                </h3>
                <button
                  type="button"
                  onClick={() => onEdit(id)}
                  className="font-mono text-[11px] uppercase tracking-widest text-[#93949F] hover:text-[#F3F1EA] cursor-pointer"
                >
                  Editar
                </button>
              </div>
              {id === "hotel" && stepLines.length > 0 && (
                <p className="mt-1 font-mono text-xs text-[#5C5D66]">
                  {formatDateES(stay.checkIn)} → {formatDateES(stay.checkOut)} · {stay.nights} noches
                </p>
              )}
              {stepLines.length === 0 ? (
                <p className="mt-3 text-base text-[#5C5D66]">No incluido</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-3.5">
                  {stepLines.map((line) => (
                    <li key={line.id} className="flex justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-[#F3F1EA]">{line.label}</p>
                        <p className="font-mono text-xs text-[#93949F]">{line.detail}</p>
                      </div>
                      <span className="shrink-0 font-mono text-base text-[#D8D7CE]">
                        {formatUsd(line.subtotal)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}

        <section className="border-b border-[#1C1D24] py-5">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-[#7C4DFF]">
              Pago
            </h3>
            <button
              type="button"
              onClick={() => onEdit("pago")}
              className="font-mono text-[11px] uppercase tracking-widest text-[#93949F] hover:text-[#F3F1EA] cursor-pointer"
            >
              Editar
            </button>
          </div>
          <p className="mt-3 text-base font-semibold text-[#F3F1EA]">
            {describePayment(pago, paymentMethods)}
          </p>
        </section>

        <div className="flex items-center justify-between pt-6">
          <span className="font-mono text-sm uppercase tracking-widest text-[#93949F]">
            Total estimado
          </span>
          <span className="font-display text-4xl font-900 text-[#E10600]">
            {formatUsd(total)}
          </span>
        </div>

        {isSubmitting ? (
          <ButtonProgress className="mt-8 w-full py-4" />
        ) : (
          <ButtonChecker
            className="mt-8 w-full py-4 font-mono text-xs uppercase tracking-widest"
            showArrow
            disabled={issues.length > 0}
            onClick={onConfirm}
          >
            Confirmar y pagar
          </ButtonChecker>
        )}
      </div>
    </div>
  );
}
