"use client";

import React, { useState } from "react";
import ButtonChecker from "./ButtonChecker";
import { PagoConTarjetaNueva } from "@/services/bookings";
import { TipoTarjeta } from "@/services/paymentMethods";
import { isValidCardNumber, isValidExpiry, simulateCardToken } from "@/utils/booking";

interface NewCardFormProps {
  onConfirm: (tarjeta: PagoConTarjetaNueva) => void;
}

const inputClasses =
  "w-full rounded-sm border bg-[#131318] px-4 py-3 text-sm text-[#F3F1EA] placeholder-[#5C5D66] outline-none transition-colors focus:border-[#E10600]";
const labelClasses = "font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]";

/** "4242424242424242" → "4242 4242 4242 4242" */
function formatCardNumber(value: string): string {
  return value.replace(/\D/g, "").slice(0, 19).replace(/(\d{4})(?=\d)/g, "$1 ");
}

/** "1228" → "12/28" */
function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

/**
 * Carga de una tarjeta nueva. El número completo y el CVC solo viven en el estado
 * de este formulario: al backend viajan tipo, últimos 4 dígitos, vencimiento y
 * el token de la pasarela (hoy simulado).
 */
export default function NewCardForm({ onConfirm }: NewCardFormProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [tipo, setTipo] = useState<TipoTarjeta>("Credito");
  const [submitted, setSubmitted] = useState(false);

  const digits = cardNumber.replace(/\D/g, "");
  const errors = {
    number: isValidCardNumber(digits) ? null : "Número de tarjeta inválido.",
    expiry: isValidExpiry(expiry) ? null : "Vencimiento inválido o tarjeta vencida (MM/AA).",
    cvc: /^\d{3,4}$/.test(cvc) ? null : "CVC inválido.",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (hasErrors) return;

    onConfirm({
      tipo,
      ultimos4Digitos: digits.slice(-4),
      fechaExpiracion: expiry,
      proveedorToken: simulateCardToken(),
    });
    setCardNumber("");
    setCvc("");
  };

  const fieldError = (error: string | null) =>
    submitted && error ? (
      <span className="font-mono text-[10px] text-[#E10600]">{error}</span>
    ) : null;
  const borderFor = (error: string | null) =>
    submitted && error ? "border-[#E10600]" : "border-[#33343D]";

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex gap-2">
        {(["Credito", "Debito"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={`flex h-10 flex-1 items-center justify-center rounded-sm border font-mono text-xs uppercase tracking-widest cursor-pointer transition-colors ${
              tipo === t
                ? "border-[#E10600] bg-[#E10600]/10 text-[#E10600]"
                : "border-[#33343D] bg-[#131318] text-[#93949F] hover:border-[#5C5D66]"
            }`}
          >
            {t === "Credito" ? "Crédito" : "Débito"}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="card-number" className={labelClasses}>
          Número de Tarjeta
        </label>
        <input
          id="card-number"
          type="text"
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="0000 0000 0000 0000"
          value={cardNumber}
          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
          className={`${inputClasses} ${borderFor(errors.number)}`}
        />
        {fieldError(errors.number)}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="card-expiry" className={labelClasses}>
            Vencimiento
          </label>
          <input
            id="card-expiry"
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/AA"
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            className={`${inputClasses} ${borderFor(errors.expiry)}`}
          />
          {fieldError(errors.expiry)}
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="card-cvc" className={labelClasses}>
            CVC
          </label>
          <input
            id="card-cvc"
            type="password"
            inputMode="numeric"
            autoComplete="cc-csc"
            maxLength={4}
            placeholder="123"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
            className={`${inputClasses} ${borderFor(errors.cvc)}`}
          />
          {fieldError(errors.cvc)}
        </div>
      </div>

      <ButtonChecker type="submit" className="mt-2 w-full py-3.5" showArrow>
        Usar esta tarjeta
      </ButtonChecker>
    </form>
  );
}
