import React from "react";
import StatBox from "./StatBox";
import { Race } from "@/utils/races";

interface RaceDetailsPanelProps {
  race: Race;
}

export default function RaceDetailsPanel({ race }: RaceDetailsPanelProps) {
  return (
    <div className="flex-grow rounded-md border border-[#1C1D24] bg-[#0E0E13] p-8 shadow-xl">
      <h2 className="font-display mb-6 text-3xl font-900 tracking-tight text-[#F3F1EA]">
        Detalles del Circuito
      </h2>
      <p className="mb-8 text-[#D8D7CE] leading-relaxed">
        {race.blurb} Prepárate para vivir una experiencia inolvidable en uno de los trazados más emocionantes del calendario.
      </p>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
        <StatBox label="Longitud" value={String(race.longitud_km || "-")} unit="km" />
        <StatBox label="Vueltas" value={String(race.vueltas || "-")} />
        <StatBox label="Curvas" value={String(race.curvas || "-")} />
        <StatBox label="Capacidad" value={race.capacidad || "-"} />
        <StatBox label="Récord de Pista" value={race.record || "-"} />
        <StatBox label="Vel. Máxima" value={race.velocidad_maxima || "-"} unit="km/h" />
        <StatBox label="Máx. Ganador" value={race.maximo_ganador || "-"} />
      </div>
    </div>
  );
}

