"use client";

import React from "react";

interface TireWheelProps {
  color: string;
  size?: number; // en píxeles, default 56 (w-14 h-14)
  className?: string;
}

/**
 * Componente atómico que representa una rueda de F1 con la banda del compuesto especificado.
 * Réplica exacta del estilo visual de ProfileCircle (con válvula y llanta) pero sin letra y fija.
 */
export default function TireWheel({
  color,
  size = 56,
  className = "",
}: TireWheelProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex-shrink-0 select-none f1-tire ${className}`}
    >
      {/* Cuerpo del neumático exterior */}
      <div className="absolute inset-0 rounded-full bg-[#1C1D24] shadow-[inset_0_4px_6px_rgba(0,0,0,0.6),0_2px_4px_rgba(0,0,0,0.4)]">
        {/* Banda rayada externa */}
        <div
          className="absolute inset-[3px] rounded-full border-[3px] border-dashed opacity-80"
          style={{ borderColor: color }}
        />
        {/* Línea circular interna del compuesto */}
        <div
          className="absolute inset-[5px] rounded-full border-[1.5px]"
          style={{ borderColor: color }}
        />

        {/* Llanta oscura */}
        <div className="absolute inset-[8px] rounded-full border border-[#33343D] bg-[#0B0B10]" />

        {/* Válvula de inflado */}
        <div className="absolute top-[9px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#93949F] shadow-sm" />
      </div>

      {/* Tuerca central / Centerlock de llanta F1 (sin letra de usuario) */}
      <div className="absolute inset-[11px] z-10 flex items-center justify-center overflow-hidden rounded-full bg-[#131318] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
        <div className="h-3 w-3 rounded-full border border-[#33343D] bg-[#1C1D24] shadow-inner flex items-center justify-center">
          <div className="h-1 w-1 rounded-full bg-[#33343D]" />
        </div>
      </div>
    </div>
  );
}
