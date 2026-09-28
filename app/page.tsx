"use client";

/**
 * GrandPrix Tracker — Landing Page
 * ---------------------------------------------------------------
 * Archivo único (page.tsx) para Next.js App Router. Client Component
 * completo: usa hooks para el countdown en vivo, el reveal on-scroll,
 * el header que reacciona al scroll y el mini-form de lista de espera.
 *
 * Requisitos: Next.js 13+ (App Router) y Tailwind CSS ya configurados
 * en el proyecto. No depende de ninguna librería extra (los íconos son
 * SVG inline y las tipografías se cargan con next/font/google).
 *
 * Nota: como este archivo usa 'use client', no puede exportar
 * `metadata` (eso debe ir en layout.tsx o en un page.tsx server-side
 * que envuelva a este componente).
 *
 * PALETA (inspirada en F1, no literal):
 *   --carbon        #0B0B10   fondo base
 *   --carbon-2      #131318   paneles
 *   --asphalt       #1C1D24   bordes / cards
 *   --graphite      #33343D   bordes sutiles / divisores
 *   --off-white     #F3F1EA   texto primario sobre fondo oscuro
 *   --fog           #93949F   texto secundario
 *   --race-red      #E10600   acento primario (CTA, foco)
 *   --sector-purple #7C4DFF   acento secundario (dato técnico / "vuelta rápida")
 *   --flag-gold     #E7B33C   detalle premium, uso mínimo
 *
 * TIPOGRAFÍA:
 *   Titillium Web  -> display (la fuente histórica de los gráficos de F1 TV)
 *   Inter          -> texto de cuerpo
 *   JetBrains Mono -> datos, badges de protocolo, timers, ticker
 * ---------------------------------------------------------------
 */

import React, { useEffect, useRef, useState, type ReactNode } from "react";
import { Inter, Titillium_Web, JetBrains_Mono } from "next/font/google";
import { NotificationBell } from "./components/NotificationBell";
import { isLogged } from "@/utils/mockData/isLogged";

const display = Titillium_Web({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

/* ================================================================
   DATA
   ================================================================ */

const NAV_LINKS = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#servicios", label: "Servicios" },
  { href: "#calendario", label: "Calendario" },
  { href: "#bajo-el-capo", label: "Bajo el capó" },
];

const CALENDAR_TICKER = [
  "GP de Países Bajos — Zandvoort",
  "GP de Italia — Monza",
  "GP de Azerbaiyán — Bakú",
  "GP de Singapur — Marina Bay",
  "GP de Estados Unidos — Austin",
  "GP de México — CDMX",
  "GP de Brasil — Interlagos",
  "GP de Las Vegas",
  "GP de Qatar — Lusail",
  "GP de Abu Dabi — Yas Marina",
];

const STEPS = [
  {
    n: "01",
    title: "Elegí tu Gran Premio",
    body: "Recorré el calendario de la temporada y elegí el circuito al que querés ir. San Pablo, Mónaco, Austin: donde sea que se corra, ahí llegamos.",
  },
  {
    n: "02",
    title: "Armá tu paquete",
    body: "Cruzamos en simultáneo entradas, hotel y traslados disponibles para tus fechas, y te mostramos el mejor combo según presupuesto y ubicación.",
  },
  {
    n: "03",
    title: "Confirmá y guardá tu lugar",
    body: "Pagás una sola vez. Nosotros coordinamos con el hotel, la ticketera y la flota de ómnibus para que lo único que tengas que hacer sea aparecer.",
  },
];

const SERVICES = [
  {
    icon: "hotel",
    title: "Alojamiento asociado",
    body: "Red de hoteles cerca del circuito, conectados en tiempo real: la disponibilidad que ves en pantalla es la que realmente queda.",
    tag: "Habitaciones en tiempo real",
  },
  {
    icon: "ticket",
    title: "Entradas oficiales",
    body: "Ubicaciones de tribuna emitidas directo con la ticketera del evento. Sin intermediarios, sin reventa, sin sorpresas en el acceso.",
    tag: "Emisión digital directa",
  },
  {
    icon: "bus",
    title: "Traslados dedicados",
    body: "Flota de ómnibus del hotel al circuito, ida y vuelta, con tu asiento asignado antes de que pongas un pie en el destino.",
    tag: "Asiento garantizado",
  },
];

const DESTINATIONS = [
  {
    name: "San Pablo",
    circuit: "Autódromo José Carlos Pace — Interlagos",
    img: "https://picsum.photos/seed/interlagos-gp/900/1150",
    blurb:
      "Curvas rápidas, tribunas pegadas a la pista y la energía más eléctrica del calendario sudamericano.",
    badge: "Próxima carrera",
  },
  {
    name: "Mónaco",
    circuit: "Circuito de Mónaco — Monte Carlo",
    img: "https://picsum.photos/seed/monaco-gp/900/1150",
    blurb:
      "El clásico entre yates y balcones. La joya del calendario, sin perderte ni un metro de guardarraíl.",
    badge: "Ícono de la temporada",
  },
  {
    name: "Austin",
    circuit: "Circuit of the Americas",
    img: "https://picsum.photos/seed/cota-gp/900/1150",
    blurb:
      "Peraltes, desnivel y un ambiente que mezcla previa de fútbol americano con paddock de Fórmula 1.",
    badge: "Favorito del público",
  },
];

const SYSTEM_PANELS = [
  {
    tag: "SOAP",
    title: "Hoteles y alojamiento",
    status: "operativo",
    body: "Hablamos el idioma de cada cadena asociada: nos conectamos a sus sistemas de gestión (PMS) para consultar habitaciones y confirmar reservas en tiempo real.",
  },
  {
    tag: "REST",
    title: "Entradas oficiales",
    status: "operativo",
    body: "La disponibilidad de butacas y la emisión de tu entrada digital se resuelven contra la API moderna de la ticketera oficial del evento.",
  },
  {
    tag: "ASYNC · COLA",
    title: "Traslados en ómnibus",
    status: "operativo",
    body: "Tu compra se confirma al instante. La asignación de asiento en el ómnibus del hotel al circuito se coordina en segundo plano, sin que tengas que esperar.",
  },
  {
    tag: "FACADE",
    title: "Orquestación del checkout",
    status: "operativo",
    body: "Un único punto de entrada coordina, al mismo tiempo, la comunicación con hoteles y ticketeras durante el proceso de pago.",
  },
  {
    tag: "STRATEGY",
    title: "Precio dinámico",
    status: "en evaluación",
    body: "Estamos evaluando variar el precio del paquete según qué tan cerca esté la fecha de la carrera. Todavía en la mesa de diseño.",
  },
];

/* ================================================================
   HOOKS
   ================================================================ */

function useScrolled(thresholdPx = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > thresholdPx);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [thresholdPx]);
  return scrolled;
}

function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, visible] as const;
}

// FIX: initialize remaining to 0 so SSR and client produce the same
// markup (no Date.now() on the server). A setTimeout with delay 0
// fires after hydration to set the real value immediately, followed
// by a regular 1 s interval — avoids the synchronous-setState-in-effect
// lint error while still snapping to the correct value on first render.
function useCountdown(targetMs: number) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const calc = () => Math.max(targetMs - Date.now(), 0);

    // Snap to correct value after paint without calling setState
    // synchronously inside the effect body.
    const snapId = setTimeout(() => {
      setRemaining(calc());
    }, 0);

    const id = setInterval(() => {
      setRemaining(calc());
    }, 1000);

    return () => {
      clearTimeout(snapId);
      clearInterval(id);
    };
  }, [targetMs]);

  const days = Math.floor(remaining / 86_400_000);
  const hours = Math.floor((remaining / 3_600_000) % 24);
  const minutes = Math.floor((remaining / 60_000) % 60);
  const seconds = Math.floor((remaining / 1_000) % 60);
  return { days, hours, minutes, seconds };
}

/* ================================================================
   ÁTOMOS DE UI
   ================================================================ */

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={
        "transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 " +
        (visible ? "opacity-100 translate-y-0 " : "opacity-0 translate-y-8 ") +
        className
      }
    >
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span
      className={
        mono.className +
        " inline-flex items-center gap-2 text-[11px] tracking-[0.35em] uppercase text-[#7C4DFF]"
      }
    >
      <span className="h-1 w-1 rounded-full bg-[#7C4DFF]" />
      {children}
    </span>
  );
}

function StatusDot({ ok = true }: { ok?: boolean }) {
  return (
    <span className="relative flex h-2 w-2">
      <span
        className={
          "absolute inline-flex h-full w-full rounded-full opacity-60 motion-reduce:hidden " +
          (ok ? "animate-ping bg-emerald-400" : "animate-ping bg-amber-400")
        }
      />
      <span
        className={
          "relative inline-flex h-2 w-2 rounded-full " +
          (ok ? "bg-emerald-400" : "bg-amber-400")
        }
      />
    </span>
  );
}

/* --- Íconos SVG inline (sin dependencias externas) --- */

function IconFlagMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="6" fill="#E10600" />
      <g fill="#F3F1EA">
        <rect x="6" y="6" width="5" height="5" />
        <rect x="16" y="6" width="5" height="5" />
        <rect x="11" y="11" width="5" height="5" />
        <rect x="21" y="11" width="5" height="5" />
        <rect x="6" y="16" width="5" height="5" />
        <rect x="16" y="16" width="5" height="5" />
        <rect x="11" y="21" width="5" height="5" />
        <rect x="21" y="21" width="5" height="5" />
      </g>
    </svg>
  );
}

function IconMenu({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 6h18M3 12h18M3 18h18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClose({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7 17L17 7M17 7H9M17 7v8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconHotel({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3 20V6a1 1 0 011-1h4a1 1 0 011 1v14M3 20h18M9 20v-5a1 1 0 011-1h4a1 1 0 011 1v5M13 9h4a1 1 0 011 1v3M5 9h2M5 12h2M5 15h2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTicket({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 9a2 2 0 002-2V6a1 1 0 011-1h10a1 1 0 011 1v1a2 2 0 002 2v0a2 2 0 00-2 2v1a2 2 0 002 2v0a2 2 0 00-2 2v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-1a2 2 0 00-2-2v0a2 2 0 002-2v-1a2 2 0 00-2-2v0z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 5.5v13"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 2"
      />
    </svg>
  );
}

function IconBus({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 16V6a1 1 0 011-1h14a1 1 0 011 1v10M4 16h16M4 16v2a1 1 0 001 1h1a1 1 0 001-1v-1h10v1a1 1 0 001 1h1a1 1 0 001-1v-2M7 9h10M7 12.5h.01M16.99 12.5h.01"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const SERVICE_ICONS: Record<
  string,
  (props: { className?: string }) => React.ReactElement
> = {
  hotel: IconHotel,
  ticket: IconTicket,
  bus: IconBus,
};

/* ================================================================
   PÁGINA
   ================================================================ */

export default function Page() {
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);

  // Fecha ilustrativa (placeholder) para el próximo GP — en producción
  // esto vendría del backend / API de calendario, no hardcodeado.
  const nextRaceTarget = new Date("2026-11-22T13:00:00-03:00").getTime();
  const { days, hours, minutes, seconds } = useCountdown(nextRaceTarget);

  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <div
      className={
        body.className +
        " bg-[#0B0B10] text-[#F3F1EA] antialiased selection:bg-[#E10600] selection:text-white"
      }
    >
      {/* ---------- estilos y animaciones a medida ---------- */}
      <style>{`
        @keyframes gpt-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes gpt-streak {
          0% { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
          12% { opacity: .55; }
          100% { transform: translateX(220%) skewX(-12deg); opacity: 0; }
        }
        @keyframes gpt-flicker {
          0%, 92%, 100% { opacity: 1; }
          94% { opacity: .55; }
          96% { opacity: 1; }
        }
        @keyframes gpt-checker-sweep {
          from { background-position: 0 0; }
          to { background-position: 56px 0; }
        }
        .gpt-marquee-track {
          animation: gpt-marquee 32s linear infinite;
        }
        .gpt-streak {
          animation: gpt-streak 4.5s ease-in-out infinite;
        }
        .gpt-flicker {
          animation: gpt-flicker 5s ease-in-out infinite;
        }
        .gpt-checker-btn {
          background-image: repeating-linear-gradient(45deg, rgba(243,241,234,.18) 0 7px, transparent 7px 14px);
          background-size: 56px 14px;
          background-position: 0 0;
          transition: background-position .6s ease;
        }
        .gpt-checker-btn:hover {
          animation: gpt-checker-sweep 1.1s linear infinite;
        }
        .gpt-carbon {
          background-image:
            repeating-linear-gradient(45deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 6px),
            repeating-linear-gradient(-45deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 6px);
        }
        .gpt-hud-grid {
          background-image:
            linear-gradient(to right, rgba(243,241,234,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(243,241,234,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        @media (prefers-reduced-motion: reduce) {
          .gpt-marquee-track, .gpt-streak, .gpt-flicker, .gpt-checker-btn:hover {
            animation: none !important;
          }
        }
      `}</style>

      {/* ================= HEADER ================= */}
      <header
        className={
          "fixed inset-x-0 top-0 z-50 transition-colors duration-300 " +
          (scrolled
            ? "bg-[#0B0B10]/90 backdrop-blur border-b border-[#1C1D24]"
            : "bg-transparent border-b border-transparent")
        }
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#inicio" className="flex items-center gap-3">
            <IconFlagMark className="h-8 w-8" />
            <span className="flex flex-col leading-none">
              <span
                className={
                  display.className + " text-[15px] font-900 tracking-tight"
                }
              >
                GRAND<span className="text-[#E10600]">PRIX</span>
              </span>
              <span
                className={
                  mono.className +
                  " text-[9px] tracking-[0.35em] text-[#93949F]"
                }
              >
                TRACKER
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative text-sm text-[#D8D7CE] transition-colors hover:text-[#F3F1EA]"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-[#E10600] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {isLogged && <NotificationBell />}
            <div className="hidden md:block">
              <a
                href="#lista-de-espera"
                className="gpt-checker-btn inline-flex items-center gap-2 rounded-sm border border-[#E10600] bg-[#E10600] px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                Sumarme a la lista
              </a>
            </div>

            <button
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setMenuOpen((v) => !v)}
              className="text-[#F3F1EA] md:hidden"
            >
              {menuOpen ? (
                <IconClose className="h-6 w-6" />
              ) : (
                <IconMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-[#1C1D24] bg-[#0B0B10] px-6 pb-6 md:hidden">
            <nav className="flex flex-col gap-4 pt-4">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm text-[#D8D7CE] hover:text-[#F3F1EA]"
                >
                  {link.label}
                </a>
              ))}
              <a
                href="#lista-de-espera"
                onClick={() => setMenuOpen(false)}
                className="mt-2 inline-flex items-center justify-center rounded-sm bg-[#E10600] px-4 py-2 text-sm font-semibold text-white"
              >
                Sumarme a la lista
              </a>
            </nav>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}
      <section
        id="inicio"
        className="relative overflow-hidden pt-36 pb-20 md:pt-44 md:pb-28"
      >
        {/* fondo: carbono + resplandor + streaks de velocidad */}
        <div className="gpt-carbon pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#E10600]/20 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span
            className="gpt-streak absolute top-[20%] h-px w-1/3 bg-gradient-to-r from-transparent via-[#F3F1EA]/70 to-transparent"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="gpt-streak absolute top-[45%] h-px w-1/4 bg-gradient-to-r from-transparent via-[#E10600]/70 to-transparent"
            style={{ animationDelay: "1.4s" }}
          />
          <span
            className="gpt-streak absolute top-[68%] h-px w-1/5 bg-gradient-to-r from-transparent via-[#7C4DFF]/60 to-transparent"
            style={{ animationDelay: "2.7s" }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <Eyebrow>Nombre preliminar del proyecto</Eyebrow>
          </Reveal>

          <Reveal delay={80}>
            <h1
              className={
                display.className +
                " mt-5 max-w-4xl text-[13vw] font-900 leading-[0.95] tracking-tight sm:text-6xl md:text-7xl"
              }
            >
              Tu fin de semana de Gran Premio,{" "}
              <span className="text-[#E10600]">armado como un pit stop.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-lg text-[#B9B8B0]">
              Entradas, hotel y traslados en un solo paquete. GrandPrix Tracker
              cruza en segundos la oferta de hoteles, ticketeras y flotas de
              ómnibus para que armar el viaje a tu próximo Gran Premio te lleve
              minutos, no quince pestañas abiertas.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#lista-de-espera"
                className="gpt-checker-btn inline-flex items-center justify-center gap-2 rounded-sm bg-[#E10600] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_0_0_1px_rgba(225,6,0,0.4)] transition-transform hover:-translate-y-0.5"
              >
                Sumarme a la lista de espera
                <IconArrow className="h-4 w-4" />
              </a>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center gap-2 rounded-sm border border-[#33343D] px-6 py-3.5 text-sm font-semibold text-[#F3F1EA] transition-colors hover:border-[#7C4DFF] hover:text-white"
              >
                Ver cómo funciona
              </a>
            </div>
          </Reveal>

          {/* ---- countdown / HUD de telemetría (elemento firma) ---- */}
          <Reveal delay={320} className="mt-16">
            <div className="gpt-hud-grid relative overflow-hidden rounded-md border border-[#1C1D24] bg-[#131318]/80 p-6 md:p-8">
              <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <StatusDot />
                    <span
                      className={
                        mono.className +
                        " text-[11px] tracking-[0.3em] text-[#93949F]"
                      }
                    >
                      EN VIVO · PRÓXIMA LARGADA
                    </span>
                  </div>
                  <p
                    className={
                      display.className + " mt-2 text-xl font-700 md:text-2xl"
                    }
                  >
                    GP de Brasil{" "}
                    <span className="text-[#93949F]">— Interlagos</span>
                  </p>
                </div>

                <div className="flex gap-3 md:gap-4">
                  {[
                    { v: days, l: "DÍAS" },
                    { v: hours, l: "HS" },
                    { v: minutes, l: "MIN" },
                    { v: seconds, l: "SEG" },
                  ].map((box) => (
                    <div
                      key={box.l}
                      className="gpt-flicker flex w-16 flex-col items-center rounded-sm border border-[#33343D] bg-[#0B0B10] py-3 md:w-20"
                    >
                      <span
                        className={
                          mono.className +
                          " text-2xl font-700 tabular-nums md:text-3xl"
                        }
                      >
                        {String(box.v).padStart(2, "0")}
                      </span>
                      <span
                        className={
                          mono.className +
                          " mt-1 text-[9px] tracking-[0.25em] text-[#7C4DFF]"
                        }
                      >
                        {box.l}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p
                className={mono.className + " mt-4 text-[10px] text-[#5C5D66]"}
              >
                * fecha ilustrativa mientras el proyecto está en desarrollo — se
                conecta al calendario oficial
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= TICKER DE CALENDARIO ================= */}
      <div className="relative overflow-hidden border-y border-[#1C1D24] bg-[#0E0E13] py-3">
        <div className="gpt-marquee-track flex w-max gap-10 whitespace-nowrap">
          {[...CALENDAR_TICKER, ...CALENDAR_TICKER].map((race, i) => (
            <span
              key={i}
              className={
                mono.className +
                " flex items-center gap-3 text-xs tracking-wide text-[#93949F]"
              }
            >
              <span className="text-[#E10600]">●</span>
              {race}
            </span>
          ))}
        </div>
      </div>

      {/* ================= CÓMO FUNCIONA ================= */}
      <section
        id="como-funciona"
        className="mx-auto max-w-7xl px-6 py-24 md:py-32"
      >
        <Reveal>
          <Eyebrow>Vuelta de formación</Eyebrow>
          <h2
            className={
              display.className +
              " mt-4 max-w-2xl text-3xl font-900 tracking-tight md:text-5xl"
            }
          >
            Tres pasos, un solo checkout.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-md border border-[#1C1D24] bg-[#1C1D24] md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 120} className="h-full">
              <div className="flex h-full flex-col bg-[#0F0F14] p-8">
                <span className={mono.className + " text-sm text-[#7C4DFF]"}>
                  {step.n}
                </span>
                <h3 className={display.className + " mt-4 text-xl font-700"}>
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#93949F]">
                  {step.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= SERVICIOS ================= */}
      <section
        id="servicios"
        className="relative border-t border-[#1C1D24] bg-[#0E0E13] py-24 md:py-32"
      >
        <div className="mx-auto max-w-7xl px-6">
          <Reveal>
            <Eyebrow>Todo en un box</Eyebrow>
            <h2
              className={
                display.className +
                " mt-4 max-w-2xl text-3xl font-900 tracking-tight md:text-5xl"
              }
            >
              Lo que coordinamos por vos.
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {SERVICES.map((service, i) => {
              const Icon = SERVICE_ICONS[service.icon];
              return (
                <Reveal key={service.title} delay={i * 120}>
                  <div className="group relative h-full overflow-hidden rounded-md border border-[#1C1D24] bg-[#131318] p-8 transition-colors hover:border-[#E10600]/50">
                    <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-[#E10600] transition-transform duration-500 group-hover:scale-x-100" />
                    <Icon className="h-8 w-8 text-[#E10600]" />
                    <h3
                      className={display.className + " mt-5 text-xl font-700"}
                    >
                      {service.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#93949F]">
                      {service.body}
                    </p>
                    <span
                      className={
                        mono.className +
                        " mt-5 inline-block text-[10px] tracking-[0.25em] text-[#7C4DFF]"
                      }
                    >
                      {service.tag.toUpperCase()}
                    </span>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= CALENDARIO / DESTINOS ================= */}
      <section
        id="calendario"
        className="mx-auto max-w-7xl px-6 py-24 md:py-32"
      >
        <Reveal>
          <Eyebrow>Próximas paradas</Eyebrow>
          <h2
            className={
              display.className +
              " mt-4 max-w-2xl text-3xl font-900 tracking-tight md:text-5xl"
            }
          >
            Elegí el circuito, nosotros el resto.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {DESTINATIONS.map((dest, i) => (
            <Reveal key={dest.name} delay={i * 120}>
              <div className="group relative h-[420px] overflow-hidden rounded-md border border-[#1C1D24]">
                <img
                  src={dest.img}
                  alt={`${dest.circuit}, ${dest.name}`}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B10] via-[#0B0B10]/30 to-transparent" />
                <span
                  className={
                    mono.className +
                    " absolute left-4 top-4 rounded-sm border border-[#F3F1EA]/20 bg-[#0B0B10]/70 px-3 py-1 text-[10px] tracking-[0.2em] text-[#F3F1EA] backdrop-blur"
                  }
                >
                  {dest.badge.toUpperCase()}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className={display.className + " text-2xl font-900"}>
                    {dest.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#B9B8B0]">{dest.circuit}</p>
                  <p className="mt-3 max-h-0 overflow-hidden text-sm leading-relaxed text-[#D8D7CE] opacity-0 transition-all duration-500 group-hover:mt-3 group-hover:max-h-24 group-hover:opacity-100">
                    {dest.blurb}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= BAJO EL CAPÓ ================= */}
      <section
        id="bajo-el-capo"
        className="relative border-t border-[#1C1D24] bg-[#0E0E13] py-24 md:py-32"
      >
        <div className="gpt-hud-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <Eyebrow>Telemetría del sistema</Eyebrow>
            <h2
              className={
                display.className +
                " mt-4 max-w-2xl text-3xl font-900 tracking-tight md:text-5xl"
              }
            >
              Bajo el capó, tan preciso como un pit stop.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#93949F]">
              Cada reserva pasa por varios sistemas al mismo tiempo — hoteles,
              ticketeras, logística de ómnibus — sin que vos notes la costura.
              Así se ve el tablero, en criollo.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SYSTEM_PANELS.map((panel, i) => (
              <Reveal key={panel.tag} delay={i * 100}>
                <div className="flex h-full flex-col rounded-md border border-[#1C1D24] bg-[#131318] p-6">
                  <div className="flex items-center justify-between">
                    <span
                      className={
                        mono.className +
                        " rounded-sm border border-[#33343D] px-2 py-1 text-[10px] tracking-[0.2em] text-[#7C4DFF]"
                      }
                    >
                      {panel.tag}
                    </span>
                    <div className="flex items-center gap-2">
                      <StatusDot ok={panel.status === "operativo"} />
                      <span
                        className={
                          mono.className +
                          " text-[10px] uppercase tracking-[0.2em] text-[#93949F]"
                        }
                      >
                        {panel.status}
                      </span>
                    </div>
                  </div>
                  <h3 className={display.className + " mt-4 text-lg font-700"}>
                    {panel.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#93949F]">
                    {panel.body}
                  </p>
                </div>
              </Reveal>
            ))}

            {/* panel de cierre: resumen de arquitectura */}
            <Reveal
              delay={SYSTEM_PANELS.length * 100}
              className="lg:col-span-1"
            >
              <div className="flex h-full flex-col justify-center rounded-md border border-dashed border-[#33343D] bg-transparent p-6">
                <p
                  className={
                    mono.className +
                    " text-[10px] tracking-[0.2em] text-[#5C5D66]"
                  }
                >
                  ARQUITECTURA · EN DEFINICIÓN
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#93949F]">
                  Un patrón <span className="text-[#F3F1EA]">Facade</span>{" "}
                  orquesta hoteles y ticketeras durante el checkout. Evaluamos
                  sumar <span className="text-[#F3F1EA]">Strategy</span> para el
                  precio dinámico según la cercanía de la fecha de carrera.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= LISTA DE ESPERA ================= */}
      <section
        id="lista-de-espera"
        className="relative overflow-hidden border-t border-[#1C1D24] py-24 md:py-32"
      >
        <div className="pointer-events-none absolute -bottom-40 left-1/2 h-[420px] w-[800px] -translate-x-1/2 rounded-full bg-[#7C4DFF]/15 blur-[120px]" />
        <div className="relative mx-auto max-w-3xl px-6 text-center">
          <Reveal>
            <Eyebrow>Todavía en boxes</Eyebrow>
            <h2
              className={
                display.className +
                " mt-4 text-3xl font-900 tracking-tight md:text-5xl"
              }
            >
              Antes de la largada, sumate.
            </h2>
            <p className="mt-4 text-[#93949F]">
              GrandPrix Tracker está en construcción. Dejanos tu mail y sé de
              los primeros en armar tu paquete al circuito cuando abramos la
              pista.
            </p>
          </Reveal>

          <Reveal delay={120} className="mt-8">
            {submitted ? (
              <div className="mx-auto flex max-w-md items-center justify-center gap-3 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-6 py-4 text-sm text-emerald-300">
                <span className="text-lg">🏁</span>
                ¡Anotado en la grilla! Te escribimos apenas larguemos.
              </div>
            ) : (
              <form
                onSubmit={handleWaitlistSubmit}
                className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className={
                    body.className +
                    " w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] placeholder-[#5C5D66] outline-none transition-colors focus:border-[#E10600]"
                  }
                />
                <button
                  type="submit"
                  className="gpt-checker-btn inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-[#E10600] px-6 py-3.5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
                >
                  Sumarme
                  <IconArrow className="h-4 w-4" />
                </button>
              </form>
            )}
            <p
              className={
                mono.className +
                " mt-4 text-[10px] tracking-[0.15em] text-[#5C5D66]"
              }
            >
              SIN SPAM · SOLO NOVEDADES DEL LANZAMIENTO
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-[#1C1D24] bg-[#0E0E13]">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
            <div>
              <a href="#inicio" className="flex items-center gap-3">
                <IconFlagMark className="h-7 w-7" />
                <span
                  className={
                    display.className + " text-sm font-900 tracking-tight"
                  }
                >
                  GRAND<span className="text-[#E10600]">PRIX</span> TRACKER
                </span>
              </a>
              <p className="mt-4 max-w-xs text-sm text-[#5C5D66]">
                Entradas, hotel y traslados para tu próximo Gran Premio, en un
                solo lugar. Nombre preliminar del proyecto — todavía en
                desarrollo.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              <div>
                <p
                  className={
                    mono.className +
                    " text-[10px] tracking-[0.25em] text-[#5C5D66]"
                  }
                >
                  PRODUCTO
                </p>
                <ul className="mt-4 space-y-2 text-sm text-[#93949F]">
                  <li>
                    <a href="#como-funciona" className="hover:text-[#F3F1EA]">
                      Cómo funciona
                    </a>
                  </li>
                  <li>
                    <a href="#servicios" className="hover:text-[#F3F1EA]">
                      Servicios
                    </a>
                  </li>
                  <li>
                    <a href="#calendario" className="hover:text-[#F3F1EA]">
                      Calendario
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <p
                  className={
                    mono.className +
                    " text-[10px] tracking-[0.25em] text-[#5C5D66]"
                  }
                >
                  PROYECTO
                </p>
                <ul className="mt-4 space-y-2 text-sm text-[#93949F]">
                  <li>
                    <a href="#bajo-el-capo" className="hover:text-[#F3F1EA]">
                      Arquitectura
                    </a>
                  </li>
                  <li>
                    <a href="#lista-de-espera" className="hover:text-[#F3F1EA]">
                      Lista de espera
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <p
                  className={
                    mono.className +
                    " text-[10px] tracking-[0.25em] text-[#5C5D66]"
                  }
                >
                  CONTACTO
                </p>
                <ul className="mt-4 space-y-2 text-sm text-[#93949F]">
                  <li>
                    <a
                      href="mailto:hola@grandprixtracker.app"
                      className="hover:text-[#F3F1EA]"
                    >
                      hola@grandprixtracker.app
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#1C1D24] pt-6 text-xs text-[#5C5D66] sm:flex-row">
            <p>
              © {new Date().getFullYear()} GrandPrix Tracker. Proyecto en etapa
              de diseño.
            </p>
            <p className={mono.className + " tracking-[0.2em]"}>
              P1 · SIEMPRE EN CARRERA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
