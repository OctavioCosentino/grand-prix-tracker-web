"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import Home from "@/components/Home";
import EmailInput from "@/components/EmailInput";
import PasswordInput from "@/components/PasswordInput";
import ButtonChecker from "@/components/ButtonChecker";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage, safeNextPath } from "@/utils/auth";

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // ?next= lo pone el proxy al rebotar de una ruta privada; ?error= el callback de auth
  const params = use(searchParams);
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(
    params.error === "link_invalido"
      ? "El enlace venció o ya fue usado. Pedí uno nuevo."
      : null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { error } = await createClient().auth.signInWithPassword({ email, password });
    if (error) {
      setError(authErrorMessage(error));
      setIsSubmitting(false);
      return;
    }

    router.replace(next);
    router.refresh();
  };

  const handleGoogleLogin = () => {
    // TODO: Conectar con el proveedor OAuth de Supabase
    console.log("Google login intent");
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0B0B10] px-6 text-[#F3F1EA] selection:bg-[#E10600] selection:text-white">
      <div className="gpt-carbon pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#E10600]/10 blur-[120px]" />
      
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-10 flex justify-center">
          <Home isLarge={true} /> 
        </div>

        <div className="rounded-md border border-[#1C1D24] bg-[#0E0E13] p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[#7C4DFF]">
              ACCESO AL PADDOCK
            </span>
            <h1 className="font-display mt-2 text-2xl font-900 tracking-tight">
              Iniciar sesión
            </h1>
            <p className="mt-2 text-sm text-[#93949F]">
              Ingresá tus credenciales para continuar.
            </p>
          </div>

          {/* Google (En desarrollo) */}
          <div className="relative group w-full mb-6">
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex w-full items-center justify-center gap-3 rounded-sm border border-[#1C1D24] bg-[#0E0E13] py-3.5 text-sm font-semibold text-[#5C5D66] opacity-60 cursor-not-allowed select-none transition-opacity"
            >
              <svg className="h-5 w-5 grayscale opacity-50" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continuar con Google
            </button>
            <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 transition-opacity duration-200 delay-700 group-hover:opacity-100 z-30">
              <div className="flex flex-col items-center">
                <span className="rounded-sm border border-[#33343D] bg-[#1C1D24] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[#93949F] shadow-xl whitespace-nowrap">
                  En desarrollo
                </span>
                <div className="w-1.5 h-1.5 rotate-45 border-r border-b border-[#33343D] bg-[#1C1D24] -mt-1" />
              </div>
            </div>
          </div>

          {/* Divisor */}
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-full bg-[#1C1D24]"></div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#5C5D66]">
              O
            </span>
            <div className="h-px w-full bg-[#1C1D24]"></div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
                  Contraseña
                </label>
                <a className="cursor-pointer text-xs text-[#93949F] transition-colors hover:text-[#F3F1EA]" onClick={() => setModalOpen(true)}>
                  ¿Olvidaste tu clave?
                </a>
              </div>
              <PasswordInput 
                value={password} 
                onChange={setPassword} 
              /> 
            </div>

            {error && (
              <span role="alert" className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#E10600]">
                ✕ {error}
              </span>
            )}

            <ButtonChecker
              type="submit"
              className="mt-4 w-full py-3.5"
              showArrow={!isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Entrando..." : "Entrar al box"}
            </ButtonChecker>
          </form>

          <div className="mt-8 border-t border-[#1C1D24] pt-6 text-center text-sm text-[#93949F]">
            ¿No tenés tu butaca asegurada?{" "}
            <a href="/register" className="font-semibold text-[#F3F1EA] transition-colors hover:text-[#E10600]">
              Registrate acá
            </a>
          </div>
        </div>
      </div>
      {modalOpen && ( <ForgotPasswordModal isOpen={modalOpen} onClose={() => setModalOpen(false)} /> )}
    </div>
  );
}