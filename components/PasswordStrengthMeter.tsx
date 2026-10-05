import React from "react";
import PasswordRequirements from "@/utils/passwordRequirements";

interface PasswordStrengthMeterProps {
  password: string;
}

/**
 * Indicador visual de seguridad de contraseña al estilo luces de largada de F1,
 * acompañado de la grilla de verificación de requisitos.
 */
export default function PasswordStrengthMeter({
  password,
}: PasswordStrengthMeterProps) {
  const { requirements, getLightColor } = PasswordRequirements({ password });

  return (
    <div className="mt-2 rounded-sm border border-[#1C1D24] bg-[#0B0B10] p-3">
      {/* Luces de largada */}
      <div className="mb-3 flex justify-between gap-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-1.5 w-full rounded-full transition-all duration-300 ${getLightColor(index)}`}
          />
        ))}
      </div>

      {/* Grilla de requisitos */}
      <div className="grid grid-cols-2 gap-y-2">
        {requirements.map((req) => (
          <div key={req.id} className="flex items-center gap-1.5">
            <div
              className={`h-1.5 w-1.5 rounded-full ${
                req.met ? "bg-[#7C4DFF]" : "bg-[#33343D]"
              }`}
            />
            <span
              className={`font-mono text-[9px] uppercase tracking-wider transition-colors ${
                req.met ? "text-[#F3F1EA]" : "text-[#5C5D66]"
              }`}
            >
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
