"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Home from "@/components/Home";
import EmailInput from "@/components/EmailInput";
import PasswordInput from "@/components/PasswordInput";
import ButtonChecker from "@/components/ButtonChecker";
import GoogleAuthButton from "@/components/GoogleAuthButton";
import PasswordStrengthMeter from "@/components/PasswordStrengthMeter";
import PasswordRequirements from "@/utils/passwordRequirements";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/utils/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const { requirements, score, getLightColor } = PasswordRequirements({ password });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (score < 4) return;
    setIsSubmitting(true);
    setError(null);

    // nombre y apellido viajan en user_metadata: el trigger de la base los copia a `clientes`
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { nombre: nombre.trim(), apellido: apellido.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(authErrorMessage(error));
      setIsSubmitting(false);
      return;
    }

    // Con la confirmación de email activada, Supabase no devuelve sesión todavía
    if (!data.session) {
      setAwaitingConfirmation(true);
      setIsSubmitting(false);
      return;
    }

    router.replace("/");
    router.refresh();
  };

  const handleGoogleRegister = () => {
    // TODO: Conectar con el proveedor OAuth de Supabase
    console.log("Google register intent");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-clip bg-[#0B0B10] px-4 py-12 text-[#F3F1EA] selection:bg-[#E10600] selection:text-white sm:px-6">
      <div className="gpt-carbon pointer-events-none fixed inset-0 opacity-70" />
      <div className="pointer-events-none fixed top-1/2 left-1/2 h-[400px] w-full max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E10600]/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-sm">
        
        <div className="mb-10 flex justify-center">
          <Home isLarge={true} /> 
        </div>

        <div className="rounded-md border border-[#1C1D24] bg-[#0E0E13] p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#7C4DFF]">
              NUEVA INCORPORACIÓN
            </span>
            <h1 className="font-display mt-2 text-2xl font-900 tracking-tight">
              Asegurá tu butaca
            </h1>
            <p className="mt-2 text-sm text-[#93949F]">
              Completá tus datos para unirte a la grilla.
            </p>
          </div>

          {/* Google (En desarrollo) */}
          <GoogleAuthButton text="Registrate con Google" />

          {/* Divisor */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-full bg-[#1C1D24]"></div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#5C5D66]">
              O
            </span>
            <div className="h-px w-full bg-[#1C1D24]"></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Nombre y apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ayrton"
                  className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] placeholder-[#5C5D66] outline-none transition-colors focus:border-[#E10600]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
                  Apellido
                </label>
                <input
                  type="text"
                  required
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  placeholder="Senna"
                  className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] placeholder-[#5C5D66] outline-none transition-colors focus:border-[#E10600]"
                />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
                Correo electrónico
              </label>
              <EmailInput 
                email={email} 
                setEmail={setEmail} 
                placeholder="piloto@escuderia.com" 
              /> 
            </div>

            {/* Contraseña + Telemetría */}
            <div className="flex flex-col gap-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
                Contraseña
              </label>
              <PasswordInput 
                value={password} 
                onChange={setPassword} 
                placeholder="Creá una clave fuerte"
              /> 
              
              <PasswordStrengthMeter password={password} />
            </div>

            {error && (
              <span role="alert" className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#E10600]">
                ✕ {error}
              </span>
            )}

            {awaitingConfirmation && (
              <span role="status" className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#34D399]">
                ✓ Te mandamos un correo para confirmar tu cuenta
              </span>
            )}

            <ButtonChecker
              type="submit"
              className={`mt-4 w-full py-3.5 ${score < 4 ? "opacity-50 grayscale" : ""}`}
              showArrow={!isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registrando..." : "Confirmar registro"}
            </ButtonChecker>
          </form>

          <div className="mt-8 border-t border-[#1C1D24] pt-6 text-center text-sm text-[#93949F]">
            ¿Ya sos parte del equipo?{" "}
            <a href="/login" className="font-semibold text-[#F3F1EA] transition-colors hover:text-[#E10600]">
              Entrá al box
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}