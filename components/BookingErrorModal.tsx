"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home, X } from "lucide-react";

interface BookingErrorModalProps {
  isOpen: boolean;
  errorMessage: string;
  isSubmitting?: boolean;
  onRetry: () => void;
  onLater: () => void;
  onClose: () => void;
}

export default function BookingErrorModal({
  isOpen,
  errorMessage,
  isSubmitting = false,
  onRetry,
  onLater,
  onClose,
}: BookingErrorModalProps) {
  // Manejo de tecla Escape para cerrar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0B10]/80 px-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-md border border-[#1C1D24] bg-[#0E0E13] p-7 sm:p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-error-title"
      >
        {/* Barra superior con acento rojo de advertencia F1 */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#E10600] via-[#FF4D4D] to-[#E10600]" />

        {/* Resplandor sutil en esquina */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#E10600]/10 blur-3xl" />

        {/* Botón de cierre superior derecho */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-sm p-1.5 text-[#5C5D66] transition-colors hover:text-[#F3F1EA] hover:bg-[#1C1D24] cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-4">
          {/* Badge de estado F1 */}
          <div className="inline-flex items-center gap-2 self-start rounded-full border border-[#E10600]/30 bg-[#E10600]/10 px-3 py-1 font-mono text-[11px] font-bold tracking-widest text-[#FF4D4D] uppercase">
            <AlertTriangle className="h-3.5 w-3.5 text-[#E10600]" />
            <span>INCIDENCIA EN BOXES · PIT LANE</span>
          </div>

          {/* Título */}
          <h2
            id="booking-error-title"
            className="font-display text-2xl sm:text-3xl font-900 tracking-tight text-[#F3F1EA]"
          >
            No pudimos procesar tu compra
          </h2>

          {/* Caja con detalle técnico o del servidor */}
          <div className="rounded-md border border-[#1C1D24] bg-[#131318] p-4 text-left">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#7C4DFF]">
              Reporte del servidor
            </span>
            <p className="mt-1 text-sm font-semibold text-[#F3F1EA] leading-relaxed">
              {errorMessage}
            </p>
          </div>

          {/* Mensaje de tranquilidad: la selección sigue en memoria */}
          <div className="rounded-md bg-[#34D399]/10 border border-[#34D399]/20 p-3.5 text-left">
            <p className="font-mono text-xs text-[#34D399] leading-relaxed">
              <strong className="font-bold">✓ Tu paquete está a salvo:</strong> Tu hotel, entradas y vuelos elegidos quedan guardados en este dispositivo. No perdiste nada de tu selección.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="mt-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
            <button
              type="button"
              onClick={onLater}
              className="booking-modal-btn-secondary inline-flex items-center justify-center gap-2 rounded-sm border border-[#33343D] bg-transparent px-5 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#D8D7CE] transition-all hover:border-[#E10600] hover:text-[#F3F1EA] hover:bg-[#1C1D24] cursor-pointer"
            >
              <Home className="h-4 w-4" />
              Intentar más tarde
            </button>

            <button
              type="button"
              onClick={onRetry}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#E10600] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-[#E10600]/25 transition-all hover:bg-[#B80400] hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`h-4 w-4 ${isSubmitting ? "animate-spin" : ""}`} />
              {isSubmitting ? "Procesando..." : "Reintentar compra"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
