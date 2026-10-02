"use client";

import React, { useEffect, useState } from "react";

interface ButtonProgressProps {
  text?: string;
  className?: string;
}

export default function ButtonProgress({
  text = "Procesando pago...",
  className = "",
}: ButtonProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Iniciar la animación al montarse. Llena hasta 90% lentamente
    // simulando progreso de red.
    const timer = setTimeout(() => setProgress(90), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={
        "relative flex items-center justify-center overflow-hidden rounded-sm border border-[#00A651] bg-[#0E0E13] " +
        className
      }
    >
      {/* Barra de progreso */}
      <div
        className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#00A651] to-[#34D399] transition-all duration-[3000ms] ease-out"
        style={{ width: progress + "%" }}
      />
      
      {/* Patrón de líneas diagonales para mantener el estilo de ButtonChecker pero en verde */}
      <div 
        className="absolute inset-0 z-0 opacity-20 transition-opacity"
        style={{
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 10px, #ffffff 10px, #ffffff 20px)"
        }}
      />

      {/* Texto centrado */}
      <span className="relative z-10 font-mono text-[11px] font-bold uppercase tracking-widest text-[#F3F1EA] drop-shadow-md">
        {text}
      </span>
    </div>
  );
}
