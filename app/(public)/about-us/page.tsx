"use client";

import React from "react";
import Image from "next/image";
import { teamMembers } from "@/utils/teamInfo";

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#0B0B10] pt-24 text-[#F3F1EA] selection:bg-[#E10600] selection:text-white">
      {/* Fondos F1 */}
      <div className="gpt-carbon pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-full max-w-[800px] -translate-x-1/2 rounded-full bg-[#E10600]/5 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 pb-24">
        {/* Encabezado */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-[10px] tracking-[0.2em] text-[#E10600]">
            DETRÁS DEL MURO DE BOXES
          </span>
          <h1 className="font-display mt-4 text-4xl font-900 tracking-tight sm:text-5xl">
            Conocé a la escudería
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#93949F] sm:text-base">
            Somos un equipo apasionado por la velocidad y la tecnología. Nuestra
            misión es diseñar la mejor plataforma para que tu único enfoque sea
            disfrutar la carrera, optimizando cada fase de tu viaje al Gran
            Premio.
          </p>
        </div>

        {/* Banner Fotográfico */}
        <div className="group relative mt-16 h-[300px] w-full overflow-hidden rounded-xl border border-[#1C1D24] bg-[#0E0E13] shadow-2xl sm:h-[400px]">
          <div className="absolute inset-0 flex items-center justify-center bg-[#131318] transition-transform duration-700 group-hover:scale-105">
            <Image
              src="/fangio.webp"
              alt="Foto de F1"
              fill
              className="object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B10] via-transparent to-transparent opacity-80" />
        </div>

        {/* Grilla del Equipo */}
        <div className="mt-20">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-900 tracking-tight">
              Ingenieros en pista
            </h2>
            <div className="mx-auto mt-4 h-px w-12 bg-[#E10600]" />
          </div>

          {/* Se amplió la grilla para acomodar ruedas más grandes sin que se choquen en pantallas medianas */}
          <div className="grid grid-cols-1 gap-14 sm:grid-cols-2 lg:grid-cols-4">
            {teamMembers.map((member) => (
              <a
                href={member.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                key={member.id}
                className="group flex flex-col items-center text-center cursor-pointer"
              >
                {/* Contenedor principal de la rueda ampliado a h-44 w-44 (176px) */}
                <div className="relative mb-6 h-44 w-44 flex-shrink-0 f1-tire">
                  {/* Capa 1: Neumático giratorio con grosores recalibrados */}
                  <div className="absolute inset-0 rounded-full bg-[#1C1D24] shadow-[inset_0_8px_10px_rgba(0,0,0,0.7),0_4px_6px_rgba(0,0,0,0.5)] transition-transform duration-700 ease-out group-hover:rotate-180">
                    <div
                      className="absolute inset-[8px] rounded-full border-[5px] border-dashed opacity-70"
                      style={{ borderColor: member.compoundColor }}
                    />
                    <div
                      className="absolute inset-[18px] rounded-full border-[3px]"
                      style={{ borderColor: member.compoundColor }}
                    />
                    <div className="absolute inset-[28px] rounded-full border border-[#33343D] bg-[#0B0B10]" />

                    {/* Válvula escalada proporcionalmente */}
                    <div className="absolute top-[29px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-[#93949F] shadow-md" />
                  </div>

                  {/* Capa 2: Centro estático */}
                  <div className="absolute inset-[36px] z-10 flex items-center justify-center overflow-hidden rounded-full bg-[#131318] shadow-[inset_0_4px_8px_rgba(0,0,0,0.9)]">
                    {member.photoUrl ? (
                      <Image
                        src={member.photoUrl}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="font-display text-4xl font-900 text-[#F3F1EA]">
                        {member.initials}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-display text-xl font-900 tracking-tight text-[#F3F1EA]">
                  {member.name}
                </h3>
                <span className="mt-1 font-mono text-[11px] tracking-[0.15em] text-[#5C5D66]">
                  {member.role}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
