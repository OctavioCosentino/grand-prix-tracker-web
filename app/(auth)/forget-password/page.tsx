"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Home from "@/components/Home";
import PasswordInput from "@/components/PasswordInput";
import ButtonChecker from "@/components/ButtonChecker";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import PasswordRequirements from "@/utils/passwordRequirements";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/utils/auth";

/**
 * Se llega desde el link del correo de recuperación: /auth/callback ya abrió
 * una sesión temporal, así que alcanza con updateUser.
 */
export default function RecoverPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { requirements, score, getLightColor } = PasswordRequirements({ password });
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const canSubmit = score === 4 && passwordsMatch && !isSubmitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setIsSubmitting(true);
    setError(null);

    const { error } = await createClient().auth.updateUser({ password });
    if (error) {
      setError(
        error.name === "AuthSessionMissingError"
          ? "El enlace venció o ya fue usado. Pedí uno nuevo desde el login."
          : authErrorMessage(error),
      );
      setIsSubmitting(false);
      return;
    }

    router.replace("/");
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0B0B10] px-6 py-12 text-[#F3F1EA] selection:bg-[#E10600] selection:text-white">
      
      <div className="gpt-carbon pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E10600]/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-sm">
        
        <div className="mb-10 flex justify-center">
          <Home isLarge={true} /> 
        </div>

        <div className="rounded-md border border-[#1C1D24] bg-[#0E0E13] p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#7C4DFF]">
              VUELTA A PISTA
            </span>
            <h1 className="font-display mt-2 text-2xl font-900 tracking-tight">
              Nueva contraseña
            </h1>
            <p className="mt-2 text-sm text-[#93949F]">
              Configurá tus nuevas credenciales para volver al circuito.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
                Crear contraseña
              </label>
              <PasswordInput 
                value={password} 
                onChange={setPassword} 
                placeholder="Tu nueva clave fuerte"
              /> 
              
              <PasswordStrengthMeter password={password} />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
                Confirmar contraseña
              </label>
              <PasswordInput 
                value={confirmPassword} 
                onChange={setConfirmPassword} 
                placeholder="Repetí la clave"
              />
              <div className="mt-1 flex items-center min-h-[16px]">
                {confirmPassword.length > 0 && (
                  <span className={`font-mono text-[10px] uppercase tracking-[0.1em] ${passwordsMatch ? 'text-[#34D399]' : 'text-[#E10600]'}`}>
                    {passwordsMatch ? "✓ LOS DATOS COINCIDEN" : "✕ LAS CLAVES NO SON IGUALES"}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <span role="alert" className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#E10600]">
                ✕ {error}
              </span>
            )}

            <ButtonChecker
              type="submit"
              className={`mt-2 w-full py-3.5 ${!canSubmit ? "opacity-50 grayscale" : ""}`}
              showArrow={!isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar y arrancar"}
            </ButtonChecker>
          </form>

          <div className="mt-8 border-t border-[#1C1D24] pt-6 text-center text-sm text-[#93949F]">
            ¿Recordaste tu clave?{" "}
            <a href="/login" className="font-semibold text-[#F3F1EA] transition-colors hover:text-[#E10600]">
              Volvé al box
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}