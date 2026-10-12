"use client";

import React from "react";

interface TireWheelProps {
  color: string;
  size?: number; // en píxeles, default 56 (w-14 h-14)
  className?: string;
}

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
      <div className="absolute inset-0 rounded-full bg-[#1C1D24] shadow-[inset_0_4px_6px_rgba(0,0,0,0.6),0_2px_4px_rgba(0,0,0,0.4)]">
        <div
          className="absolute inset-[3px] rounded-full border-[3px] border-dashed opacity-80"
          style={{ borderColor: color }}
        />
        <div
          className="absolute inset-[5px] rounded-full border-[1.5px]"
          style={{ borderColor: color }}
        />

        <div className="absolute inset-[8px] rounded-full border border-[#33343D] bg-[#0B0B10]" />
        <div className="absolute top-[9px] left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-[#93949F] shadow-sm" />
      </div>

      <div className="absolute inset-[11px] z-10 flex items-center justify-center overflow-hidden rounded-full bg-[#131318] shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
        <div className="h-3 w-3 rounded-full border border-[#33343D] bg-[#1C1D24] shadow-inner flex items-center justify-center">
          <div className="h-1 w-1 rounded-full bg-[#33343D]" />
        </div>
      </div>
    </div>
  );
}
