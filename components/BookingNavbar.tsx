"use client";

import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import WarningModal from "./WarningModal";
import Image from "next/image";
import Home from "./Home";
import { clearBookingDraft } from "@/utils/bookingDraft";

export default function BookingNavbar() {
  const router = useRouter();
  const [showWarning, setShowWarning] = useState(false);

  const handleBackClick = () => {
    setShowWarning(true);
  };

  const confirmLeave = () => {
    setShowWarning(false);
    // El aviso dice que se pierde el progreso: que no reaparezca al volver
    clearBookingDraft();
    router.back();
  };

  return (
    <>
      <WarningModal
        isOpen={showWarning}
        title="¿Salir de la reserva?"
        message="Si volvés atrás ahora, se perderá todo el progreso de la reserva de tu paquete. ¿Estás seguro que querés abandonar?"
        confirmText="Sí, salir"
        cancelText="Continuar reserva"
        severity="danger"
        onConfirm={confirmLeave}
        onCancel={() => setShowWarning(false)}
      />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#1C1D24] bg-[#0B0B10]/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            onClick={handleBackClick}
            className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-[#0B0B10]/50 text-white transition-colors hover:bg-white hover:text-[#0B0B10]"
            aria-label="Volver atrás"
          >
            <ArrowLeft strokeWidth={3} className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
          </button>

          <Home />
        </div>
      </header>
    </>
  );
}

