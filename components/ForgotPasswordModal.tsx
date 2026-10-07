"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import EmailInput from "@/components/EmailInput";
import ButtonChecker from "@/components/ButtonChecker";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/utils/auth";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Manejo de tecla Escape para cerrar
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // El link del correo pasa por /auth/callback, que abre la sesión y sigue a /forget-password
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/forget-password`,
    });

    setIsSubmitting(false);
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    setSubmitted(true);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0B10]/80 px-4 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-md border border-[#1C1D24] bg-[#0E0E13] p-8 shadow-2xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-[#5C5D66] transition-colors hover:text-[#F3F1EA] focus:outline-none cursor-pointer"
          aria-label="Cerrar modal"
        >
          ✕
        </button>

        {!submitted ? (
          <>
            <div className="mb-6 text-center">
              <span className="font-mono text-[10px] tracking-[0.2em] text-[#E7B33C]">
                BANDERA AMARILLA
              </span>
              <h2 className="font-display mt-2 text-2xl font-900 tracking-tight text-[#F3F1EA]">
                Recuperar acceso
              </h2>
              <p className="mt-2 text-sm text-[#93949F]">
                Ingresá tu correo y te enviaremos las coordenadas por radio para volver a pista.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <EmailInput
                email={email}
                setEmail={setEmail}
                placeholder="piloto@escuderia.com"
              />
              {error && (
                <span role="alert" className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#E10600]">
                  ✕ {error}
                </span>
              )}
              <ButtonChecker
                type="submit"
                className="w-full py-3.5"
                showArrow={!isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Enviando..." : "Enviar enlace"}
              </ButtonChecker>
            </form>
          </>
        ) : (
          /* Estado de éxito post-envío */
          <div className="py-2 text-center">
            <span className="mb-4 inline-block text-4xl">📻</span>
            <h2 className="font-display text-xl font-900 tracking-tight text-[#F3F1EA]">
              Mensaje en camino
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#93949F]">
              Revisá tu casilla de correo. Te mandamos un enlace seguro para que puedas configurar tu nueva contraseña.
            </p>
            <button
              onClick={onClose}
              className="gpt-outline-btn mt-8 w-full rounded-sm border border-[#33343D] bg-transparent py-3 text-sm font-semibold text-[#F3F1EA] transition-colors hover:border-[#E10600] hover:text-white"
            >
              Cerrar y volver al box
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}