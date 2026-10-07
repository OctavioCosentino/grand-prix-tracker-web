"use client";

import React, { use, useState } from "react";
import { useRouter } from "next/navigation";
import Home from "@/components/Home";
import EmailInput from "@/components/EmailInput";
import PasswordInput from "@/components/PasswordInput";
import ButtonChecker from "@/components/ButtonChecker";
import ForgotPasswordModal from "@/components/ForgotPasswordModal";
import GoogleAuthButton from "@/components/GoogleAuthButton";
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
          <GoogleAuthButton text="Continuar con Google" />

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