"use client";
/**
 * GrandPrix Tracker — Landing Page
 * ---------------------------------------------------------------
 *
 * PALETA F1:
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
 * ---------------------------------------------------------------
 */

import React from "react";
import { SERVICES, SERVICE_ICONS } from "../../utils/services";
import { STEPS } from "@/utils/steps";
import { DESTINATIONS } from "@/utils/destinations";
import { SYSTEM_PANELS } from "@/utils/mockData/systemPanels";
import { useEvents } from "@/hooks/useEvents";
import ButtonChecker from "../../components/ButtonChecker";
import ButtonOutline from "../../components/ButtonOutline";
import FeedbackSection from "@/components/FeedbackSection";
import RacesCarrousel from "@/components/RacesCarrousel";
import StepsCard from "@/components/StepsCard";
import Eyebrow from "@/components/EyeBrow";
import ServicesCard from "@/components/ServicesCard";
import DestinationCard from "@/components/DestinationsCard";
import { DestinationCardSkeleton } from "@/components/CalendarSkeleton";
import SystemPanelCard from "@/components/SystemPanelCard";
import CountdownGp from "@/components/CountdownGp";

import Reveal from "@/components/Reveal";
import Link from "next/dist/client/link";

/* ======== DATA =============== */
/* Aca irian futuros, igual en lo posible separlos en su respectiva carpeta (NO a la gilada)*/

/* ======== PÁGINA =========== */
export default function Page() {
  const { races, isPending } = useEvents();

  const today = new Date();
  const nextRace = races.find((race) => new Date(race.date) >= today);

  return (
    <div
      className={
        " bg-[#0B0B10] text-[#F3F1EA] antialiased selection:bg-[#E10600] selection:text-white"
      }
    >
      {/* ================= Banner principal ================= */}
      <section
        id="inicio"
        className="relative overflow-hidden pt-36 pb-20 md:pt-44 md:pb-28"
      >
        <div className="gpt-carbon pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[#E10600]/20 blur-[120px]" />
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span
            className="gpt-streak absolute top-[20%] h-px w-1/3 bg-linear-to-r from-transparent via-[#F3F1EA]/70 to-transparent"
            style={{ animationDelay: "0s" }}
          />
          <span
            className="gpt-streak absolute top-[45%] h-px w-1/4 bg-linear-to-r from-transparent via-[#E10600]/70 to-transparent"
            style={{ animationDelay: "1.4s" }}
          />
          <span
            className="gpt-streak absolute top-[68%] h-px w-1/5 bg-linear-to-r from-transparent via-[#7C4DFF]/60 to-transparent"
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
                "font-display mt-5 max-w-4xl text-[13vw] font-900 leading-[0.95] tracking-tight sm:text-6xl md:text-7xl"
              }
            >
              Tu fin de semana de Gran Premio,{" "}
              <span className="text-[#E10600]">armado como un pit stop.</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-xl text-lg text-[#B9B8B0]">
              Entradas, translados, hoteles y vuelos en un solo paquete.
              GrandPrix Tracker cruza en segundos la oferta de hoteles,
              ticketeras y flotas de ómnibus y aviones para que armar el viaje a
              tu próximo Gran Premio te lleve minutos, no quince pestañas
              abiertas.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <ButtonChecker
                href="/calendar"
                className="px-6 py-3.5 shadow-[0_0_0_1px_rgba(225,6,0,0.4)]"
                showArrow={true}
              >
                Empieza y reservá tu paquete!
              </ButtonChecker>
              <ButtonOutline href="#como-funciona">
                Ver cómo funciona
              </ButtonOutline>
            </div>
          </Reveal>

          {/* ---- Countdown / HUD de telemetría ---- */}
          <Reveal delay={320} className="mt-16">
            <CountdownGp />
          </Reveal>
        </div>
      </section>

      <RacesCarrousel />

      {/* ================= CÓMO FUNCIONA ================= */}
      <section
        id="como-funciona"
        className="scroll-mt-28 mx-auto max-w-7xl px-6 py-24 md:py-32"
      >
        <Reveal>
          <Eyebrow>Vuelta de formación</Eyebrow>
          <h2
            className={
              "font-display" +
              " mt-4 max-w-2xl text-3xl font-900 tracking-tight md:text-5xl"
            }
          >
            Tres pasos, un solo checkout.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-px overflow-hidden rounded-md border border-[#1C1D24] bg-[#1C1D24] md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} delay={i * 120} className="h-full">
              <StepsCard step={step} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= SERVICIOS ================= */}
      <section
        id="servicios"
        className="scroll-mt-55 relative overflow-hidden border-t border-[#1C1D24] bg-[#0E0E13] py-24 md:py-32"
      >
        {/* VIDEO BACKGROUND */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-15 scale-[1.55] origin-center"
        >
          <source src="/franco_overtake.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0E0E13] via-transparent to-[#0E0E13]" />

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <Reveal>
            <Eyebrow>Todo en un box</Eyebrow>
            <h2
              className={
                "font-display" +
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
                  <ServicesCard service={service} Icon={Icon} />
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
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <Eyebrow>Próximas paradas</Eyebrow>
            <h2 className="font-display mt-4 max-w-2xl text-3xl font-900 tracking-tight md:text-5xl">
              Elegí el circuito, nosotros el resto.
            </h2>
          </Reveal>

          <Reveal delay={150}>
            <Link
              href="/calendar"
              className="group inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-[#93949F] transition-colors hover:text-[#F3F1EA]"
            >
              Ver calendario completo
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-4 w-4 text-white transition-transform duration-300 group-hover:translate-x-1"
              >
                <path
                  fillRule="evenodd"
                  d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {/* Próxima Parada (Card 1) */}
          <Reveal delay={0}>
            {isPending || !nextRace ? (
              <DestinationCardSkeleton />
            ) : (
              <DestinationCard
                id={nextRace.id}
                name={nextRace.name}
                img={nextRace.img}
                circuit={nextRace.circuit}
                badge="PRÓXIMA PARADA"
                blurb={nextRace.blurb}
              />
            )}
          </Reveal>

          {/* Cards from DESTINATIONS (Cards 2 & 3) */}
          {DESTINATIONS.map((dest, i) => (
            <Reveal key={dest.name} delay={(i + 1) * 120}>
              <DestinationCard
                id={dest.id}
                name={dest.name}
                img={dest.img}
                circuit={dest.circuit}
                badge={dest.badge}
                blurb={dest.blurb}
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= BAJO EL CAPÓ ================= */}
      <section
        id="bajo-el-capo"
        className="scroll-mt-28 relative border-t border-[#1C1D24] bg-[#0E0E13] py-24 md:py-32"
      >
        <div className="gpt-hud-grid pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <Eyebrow>Telemetría del sistema</Eyebrow>
            <h2 className="font-display mt-4 w-full text-2xl font-900 tracking-tight sm:text-3xl md:text-4xl lg:text-[42px] xl:text-5xl lg:whitespace-nowrap">
              Bajo el capó, tan preciso como un pit stop.
            </h2>
            <p className="mt-4 w-full text-justify text-sm leading-relaxed text-[#93949F]">
              Cada reserva pasa por varios sistemas al mismo tiempo, hoteles,
              ticketeras, logística de omibús y vuelos, sin que notes la
              costura. Para lograr esta fluidez, nuestra plataforma emplea una
              arquitectura basada en microservicios independientes que se
              encargan de la comunicación con proveedores externos de hoteles y
              entradas de Fórmula 1. Estos servicios actúan como puentes (patrón
              Adapter), transformando las complejas estructuras de datos de
              proveedores como Booking o sistemas heredados SOAP a nuestro
              modelo interno optimizado, almacenando la información en bases de
              datos PostgreSQL para garantizar respuestas instantáneas. Al
              momento de la compra, un patrón Facade en el backend organiza
              atómicamente la reserva de tu alojamiento, vuelo y entrada,
              asegurando que, si un servicio falla o se queda sin stock, la
              transacción entera se cancele limpiamente, garantizando que nunca
              te quedes a mitad de camino.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SYSTEM_PANELS.map((panel, i) => (
              <Reveal key={panel.tag} delay={i * 100}>
                <SystemPanelCard
                  tag={panel.tag}
                  title={panel.title}
                  status={panel.status}
                  body={panel.body}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FeedbackSection />
    </div>
  );
}
