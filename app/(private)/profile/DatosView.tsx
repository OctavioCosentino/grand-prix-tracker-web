"use client";

import React from "react";
import ButtonChecker from "@/components/ButtonChecker"; 
import { useAuth } from "@/components/providers/AuthProvider";
import { getDisplayName } from "@/utils/auth";

export default function DatosView() {
  const { user } = useAuth();

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h3 className="font-display mb-6 text-2xl font-900 tracking-tight">Telemetría del Piloto</h3>
      {/* key: los defaultValue se toman al montar, hay que remontar cuando llega la sesión */}
      <form key={user?.id} className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">Nombre Completo</label>
          <input type="text" defaultValue={user ? getDisplayName(user) : ""} className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] outline-none focus:border-[#E10600]" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">Correo Electrónico</label>
          <input type="email" defaultValue={user?.email ?? ""} disabled className="w-full rounded-sm border border-[#1C1D24] bg-[#0B0B10] px-4 py-3.5 text-sm text-[#5C5D66] outline-none opacity-70 cursor-not-allowed" />
        </div>
        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">Pasaporte / ID (Para Vuelos y Hotel)</label>
          <input type="text" placeholder="Número de documento" className="w-full rounded-sm border border-[#33343D] bg-[#131318] px-4 py-3.5 text-sm text-[#F3F1EA] outline-none focus:border-[#E10600]" />
        </div>

        <div className="md:col-span-2 mt-4 border-t border-[#1C1D24] pt-6">
          <ButtonChecker type="submit" showArrow={true} className="px-8 py-3">
            Actualizar Setup
          </ButtonChecker>
        </div>
      </form>
    </div>
  );
}