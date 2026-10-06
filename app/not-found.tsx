"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import useScrolled from "@/hooks/useScrolled";
import ButtonChecker from "@/components/ButtonChecker";
import {
  Flag,
  Compass,
  RotateCcw,
  Calendar,
  AlertTriangle,
  Radio,
  ShieldAlert,
  ArrowRight,
  Home,
  Gauge,
} from "lucide-react";

export default function NotFound() {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#0B0B10] text-[#F3F1EA] selection:bg-[#E10600] selection:text-white">
      <Navbar
        scrolled={scrolled}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
      <main className="relative flex-grow flex items-center justify-center pt-28 pb-20 px-6 overflow-hidden gpt-hud-grid">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#E10600]/10 blur-[130px] rounded-full" />
          <div className="absolute top-2/3 right-10 w-[300px] h-[300px] bg-[#7C4DFF]/10 blur-[120px] rounded-full" />
          <div className="gpt-streak absolute top-1/4 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#E10600]/40 to-transparent" />
          <div
            className="gpt-streak absolute bottom-1/3 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#7C4DFF]/30 to-transparent"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#E10600]/40 bg-[#E10600]/10 px-4 py-1.5 font-mono text-xs font-semibold tracking-wider text-[#FF4D4D] uppercase shadow-[0_0_20px_rgba(225,6,0,0.2)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E10600] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E10600]"></span>
            </span>
            <Flag className="h-3.5 w-3.5 text-[#E10600]" />
            <span>BANDERA ROJA · SECTOR 404</span>
          </div>

          <div className="mt-8 relative w-full max-w-3xl mx-auto">
            <div className="relative overflow-hidden rounded-2xl border border-[#1C1D24] bg-[#131318]/90 shadow-2xl backdrop-blur-md">
              <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-10 grayscale"
                style={{ backgroundImage: "url('/crash.webp')" }}
              />

              <div className="relative z-10 p-8 sm:p-12">
                <div className="font-mono text-xs tracking-[0.3em] uppercase text-[#7C4DFF] mb-2 flex items-center justify-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  <span>TELEMETRÍA DE PISTA: FUERA DE LÍMITES</span>
                </div>

                <h1 className="font-display text-8xl sm:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-[#F3F1EA] to-[#5C5D66] drop-shadow-[0_0_30px_rgba(225,6,0,0.3)]">
                  404
                </h1>

                <div className="mt-2 font-mono text-xs text-[#93949F] uppercase tracking-widest">
                  [ DNF · DID NOT FINISH ]
                </div>

                <h2 className="font-display mt-6 text-2xl sm:text-4xl font-bold text-[#F3F1EA]">
                  Te saliste del trazado
                </h2>

                <p className="mt-4 max-w-lg mx-auto text-sm sm:text-base text-[#93949F] leading-relaxed">
                  La página que intentas consultar no existe o cambió de
                  posición en el circuito. La telemetría sugiere regresar
                  inmediatamente al garaje principal.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <ButtonChecker
                    href="/"
                    showArrow
                    className="px-7 py-3 text-sm font-bold w-full sm:w-auto"
                  >
                    Volver al Garaje (Inicio)
                  </ButtonChecker>

                  <Link
                    href="/calendar"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-sm border border-[#1C1D24] bg-[#0E0E13] px-6 py-3 text-sm font-semibold text-[#F3F1EA] hover:border-[#E10600]/60 hover:bg-[#1C1D24] transition-all duration-200 group"
                  >
                    <Calendar className="h-4 w-4 text-[#E10600] group-hover:scale-110 transition-transform" />
                    Ver Calendario GP
                  </Link>

                  <button
                    onClick={() => window.history.back()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-sm border border-transparent px-4 py-3 text-sm font-semibold text-[#93949F] hover:text-[#F3F1EA] hover:bg-[#1C1D24]/50 transition-colors"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Regresar Giro
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Motorsport Telemetry Cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="rounded-lg border border-[#1C1D24] bg-[#131318] p-5 transition-all hover:border-[#33343D]">
              <div className="flex items-center justify-between text-xs font-mono text-[#7C4DFF] mb-2">
                <span>ESTADO PISTA</span>
                <Radio className="h-3.5 w-3.5 text-[#E10600] gpt-flicker" />
              </div>
              <p className="font-display text-base font-bold text-[#F3F1EA]">
                Sin Señal GPS
              </p>
              <p className="mt-1 text-xs text-[#93949F]">
                La ruta consultada no emite telemetría válida.
              </p>
            </div>

            <div className="rounded-lg border border-[#1C1D24] bg-[#131318] p-5 transition-all hover:border-[#33343D]">
              <div className="flex items-center justify-between text-xs font-mono text-[#7C4DFF] mb-2">
                <span>DIRECTOR DE CARRERA</span>
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <p className="font-display text-base font-bold text-[#F3F1EA]">
                Límites Excedidos
              </p>
              <p className="mt-1 text-xs text-[#93949F]">
                Sanción de tiempo evitada. Reingresa al circuito.
              </p>
            </div>

            <div className="rounded-lg border border-[#1C1D24] bg-[#131318] p-5 transition-all hover:border-[#33343D]">
              <div className="flex items-center justify-between text-xs font-mono text-[#7C4DFF] mb-2">
                <span>PIT WALL</span>
                <Gauge className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <p className="font-display text-base font-bold text-[#F3F1EA]">
                Estrategia OK
              </p>
              <p className="mt-1 text-xs text-[#93949F]">
                Nuestros boxes y calendarios siguen operativos 24/7.
              </p>
            </div>
          </div>

          {/* Quick Access Circuit Navigation */}
          <div className="mt-8 rounded-lg border border-[#1C1D24] bg-[#0E0E13]/80 p-6 backdrop-blur">
            <p className="font-mono text-xs tracking-widest text-[#5C5D66] uppercase mb-4 text-center">
              ACCESOS RÁPIDOS AL CIRCUITO
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-[#D8D7CE]">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 hover:text-[#E10600] transition-colors"
              >
                <Home className="h-4 w-4" /> Inicio
              </Link>
              <span className="text-[#33343D]">|</span>
              <Link
                href="/calendar"
                className="inline-flex items-center gap-1.5 hover:text-[#E10600] transition-colors"
              >
                <Calendar className="h-4 w-4" /> Calendario GP
              </Link>
              <span className="text-[#33343D]">|</span>
              <Link
                href="/#servicios"
                className="inline-flex items-center gap-1.5 hover:text-[#E10600] transition-colors"
              >
                <Compass className="h-4 w-4" /> Servicios
              </Link>
              <span className="text-[#33343D]">|</span>
              <Link
                href="/profile"
                className="inline-flex items-center gap-1.5 hover:text-[#E10600] transition-colors"
              >
                <ArrowRight className="h-4 w-4 text-[#7C4DFF]" /> Mi Cuenta
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
