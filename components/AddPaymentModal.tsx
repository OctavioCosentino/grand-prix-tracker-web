"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import ButtonChecker from "@/components/ButtonChecker";
import { MetodoPago } from "@/services/paymentMethods";

interface AddPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "add" | "edit";
  initialData?: MetodoPago | null;
  onConfirm?: (cardData: any) => void;
}

export default function AddPaymentModal({
  isOpen,
  onClose,
  mode = "add",
  initialData,
  onConfirm,
}: AddPaymentModalProps) {
  const [mounted, setMounted] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [tipo, setTipo] = useState<"Credito" | "Debito">("Credito");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [expiryError, setExpiryError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 16) val = val.slice(0, 16);
    let formatted = "";
    for (let i = 0; i < val.length; i += 4) {
      if (i > 0) formatted += " ";
      formatted += val.slice(i, i + 4);
    }
    setCardNumber(formatted);
  };

  const handleCardNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\d/g, "");
    setCardName(val.toUpperCase());
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    
    if (val.length >= 3) {
      val = val.slice(0, 2) + "/" + val.slice(2);
    }
    setExpiry(val);

    if (val.length === 5) {
      const parts = val.split("/");
      const yy = Number(parts[1]);
      const currentYear = Number(new Date().getFullYear().toString().slice(-2));
      if (yy < currentYear) {
        setExpiryError(true);
      } else {
        setExpiryError(false);
      }
    } else {
      setExpiryError(false);
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 3) val = val.slice(0, 3);
    setCvc(val);
  };

  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && initialData) {
        setCardNumber(`**** **** **** ${initialData.ultimos4Digitos}`);
        setCardName(initialData.nombre_titular || "");
        setExpiry(initialData.fechaExpiracion || "");
        setCvc("***");
        setTipo(initialData.tipo || "Credito");
      } else {
        setCardNumber("");
        setCardName("");
        setExpiry("");
        setCvc("");
        setTipo("Credito");
      }
    }
  }, [isOpen, mode, initialData]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = cardNumber.replace(/\D/g, "");
    const cardData = {
      tipo,
      ultimos4Digitos: digits.slice(-4),
      fechaExpiracion: expiry,
      proveedorToken: "tok_simulado_123", // simulate token
      nombre_titular: cardName,
    };
    
    console.log(mode === "add" ? "Guardando tarjeta:" : "Editando tarjeta:", cardData);
    
    if (expiryError) return;

    if (onConfirm) {
      onConfirm(cardData);
    }
    onClose();
  };

  const isEdit = mode === "edit";

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0B10]/80 p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative my-auto w-full max-w-md max-h-[calc(100dvh-2.5rem)] overflow-y-auto custom-scrollbar rounded-md border border-[#1C1D24] bg-[#0E0E13] p-5 sm:p-7 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#5C5D66] transition-colors hover:text-[#F3F1EA] focus:outline-none cursor-pointer sm:right-5 sm:top-5"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        <div className="mb-4 text-center sm:mb-5">
          <span
            className={`font-mono text-[10px] tracking-[0.2em] ${isEdit ? "text-[#E10600]" : "text-[#34D399]"}`}
          >
            {isEdit ? "EDITAR COMPUESTO" : "NUEVO COMPUESTO"}
          </span>
          <h2 className="font-display mt-1 text-xl font-900 tracking-tight text-[#F3F1EA] sm:mt-1.5 sm:text-2xl">
            {isEdit ? "Editar método de pago" : "Agregar método de pago"}
          </h2>
          <p className="mt-1 text-xs text-[#93949F] sm:text-sm">
            {isEdit
              ? "Actualizá los datos de tu tarjeta."
              : "Ingresá los datos de tu tarjeta para habilitar compras rápidas."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5C5D66] sm:text-[10px]">
              Número de Tarjeta
            </label>
            <input
              type="text"
              required
              maxLength={19}
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={handleCardNumberChange}
              className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-3.5 py-2.5 text-sm text-[#F3F1EA] placeholder-[#5C5D66] outline-none transition-colors focus:border-[#E10600] sm:py-3"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5C5D66] sm:text-[10px]">
              Nombre en la Tarjeta
            </label>
            <input
              type="text"
              required
              placeholder="AYRTON SENNA"
              value={cardName}
              onChange={handleCardNameChange}
              className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-3.5 py-2.5 text-sm text-[#F3F1EA] placeholder-[#5C5D66] outline-none transition-colors focus:border-[#E10600] sm:py-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5C5D66] sm:text-[10px]">
                Vencimiento
              </label>
              <input
                type="text"
                required
                maxLength={5}
                placeholder="MM/AA"
                value={expiry}
                onChange={handleExpiryChange}
                className={`w-full rounded-sm border ${expiryError ? 'border-[#E10600]' : 'border-[#33343D]'} bg-[#131318] px-3.5 py-2.5 text-sm text-[#F3F1EA] placeholder-[#5C5D66] outline-none transition-colors focus:border-[#E10600] sm:py-3`}
              />
              {expiryError && <span className="text-[#E10600] text-[10px] mt-0.5">Ingrese un año válido</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5C5D66] sm:text-[10px]">
                CVC
              </label>
              <input
                type="text"
                required
                maxLength={3}
                placeholder="123"
                value={cvc}
                onChange={handleCvcChange}
                className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-3.5 py-2.5 text-sm text-[#F3F1EA] placeholder-[#5C5D66] outline-none transition-colors focus:border-[#E10600] sm:py-3"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 relative">
            <label className="font-mono text-[9px] uppercase tracking-[0.15em] text-[#5C5D66] sm:text-[10px]">
              Tipo de Tarjeta
            </label>
            <div
              className={`w-full rounded-sm border flex justify-between items-center bg-[#131318] px-3.5 py-2.5 sm:py-3 text-sm text-[#F3F1EA] outline-none transition-colors cursor-pointer ${isDropdownOpen ? "border-[#E10600]" : "border-[#33343D]"}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span>{tipo === "Credito" ? "Crédito" : "Débito"}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180 text-[#E10600]" : "text-[#5C5D66]"}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-1 w-full rounded-sm border border-[#33343D] bg-[#131318] shadow-2xl z-20 overflow-hidden">
                  <div
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-[#1C1D24] hover:text-[#E10600] sm:py-3 ${tipo === "Credito" ? "text-[#F3F1EA] bg-[#1C1D24]" : "text-[#93949F]"}`}
                    onClick={() => {
                      setTipo("Credito");
                      setIsDropdownOpen(false);
                    }}
                  >
                    Crédito
                  </div>
                  <div
                    className={`px-4 py-2.5 text-sm cursor-pointer transition-colors hover:bg-[#1C1D24] hover:text-[#E10600] sm:py-3 ${tipo === "Debito" ? "text-[#F3F1EA] bg-[#1C1D24]" : "text-[#93949F]"}`}
                    onClick={() => {
                      setTipo("Debito");
                      setIsDropdownOpen(false);
                    }}
                  >
                    Débito
                  </div>
                </div>
              </>
            )}
          </div>

          <ButtonChecker
            type="submit"
            className="mt-2 w-full py-3 sm:mt-3 sm:py-3.5"
            showArrow={true}
          >
            {isEdit ? "Actualizar Tarjeta" : "Guardar en Billetera"}
          </ButtonChecker>
        </form>
      </div>
    </div>,
    document.body
  );
}
