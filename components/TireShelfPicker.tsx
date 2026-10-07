"use client";

import React from "react";
import TireWheel from "./TireWheel";
import { tireColors } from "@/utils/tireColors";

export interface CompoundOption {
  id: string;
  name: string;
  label: string;
  hex: string;
}

export const SHELF_TOP_COMPOUNDS: CompoundOption[] = [
  { id: "soft", name: "Soft", label: "Blando", hex: tireColors.soft },
  { id: "medium", name: "Medium", label: "Medio", hex: tireColors.medium },
  { id: "hard", name: "Hard", label: "Duro", hex: tireColors.hard },
];

export const SHELF_BOTTOM_COMPOUNDS: CompoundOption[] = [
  { id: "inter", name: "Inter", label: "Intermedio", hex: tireColors.inter },
  { id: "full_wet", name: "Wet", label: "Lluvia", hex: tireColors.full_wet },
];

interface TireShelfPickerProps {
  selectedColor: string | null;
  onSelectColor: (colorHex: string | null) => void;
}

/**
 * Selector estético de compuestos de neumáticos en formato de estantería de F1.
 * Muestra 3 neumáticos en el estante superior y 2 en el inferior.
 * Al seleccionar una rueda, se eleva suavemente y proyecta sombra sobre el estante.
 * Un segundo clic sobre la rueda seleccionada la deselecciona (enviando null).
 */
export default function TireShelfPicker({
  selectedColor,
  onSelectColor,
}: TireShelfPickerProps) {
  const isSelected = (hex: string) => {
    if (!selectedColor) return false;
    return selectedColor.toLowerCase() === hex.toLowerCase();
  };

  const renderWheelItem = (compound: CompoundOption) => {
    const selected = isSelected(compound.hex);

    return (
      <button
        key={compound.id}
        type="button"
        onClick={() => {
          if (selected) {
            onSelectColor(null);
          } else {
            onSelectColor(compound.hex);
          }
        }}
        className="group relative flex flex-col items-center justify-end focus:outline-none cursor-pointer p-1"
        aria-label={`${selected ? "Deseleccionar" : "Seleccionar"} compuesto ${compound.name}`}
      >
        {/* Rueda con elevación suave cuando está seleccionada */}
        <div
          className={`relative transition-all duration-300 ease-out transform ${
            selected
              ? "-translate-y-4 scale-105"
              : "translate-y-0 group-hover:-translate-y-1.5"
          }`}
          style={{
            filter: selected
              ? `drop-shadow(0 0 10px ${compound.hex}55)`
              : undefined,
          }}
        >
          {selected && (
            <div
              data-compound={compound.id}
              className="tire-selected-halo pointer-events-none absolute -inset-1 rounded-full blur-[3px] transition-all duration-300"
              style={{
                backgroundColor:
                  compound.id === "hard"
                    ? "rgba(243, 241, 234, 0.5)"
                    : `${compound.hex}`,
                color: compound.hex,
              }}
            />
          )}
          <TireWheel color={compound.hex} size={58} />
        </div>

        {/* Sombra proyectada en la superficie del estante */}
        <div className="h-3 flex items-center justify-center w-full mt-1">
          <div
            className={`tire-contact-shadow rounded-full bg-black transition-all duration-300 ease-out ${
              selected
                ? "w-11 h-2 opacity-90 blur-[3px] scale-110"
                : "w-8 h-1 opacity-45 blur-[1px] scale-90 group-hover:w-9 group-hover:opacity-60"
            }`}
          />
        </div>

        {/* Nombre del compuesto */}
        <span
          className={`mt-1 font-mono text-[10px] uppercase font-bold tracking-widest transition-colors ${
            selected
              ? "text-[#F3F1EA]"
              : "text-[#5C5D66] group-hover:text-[#93949F]"
          }`}
          style={{ color: selected ? compound.hex : undefined }}
        >
          {compound.name}
        </span>
      </button>
    );
  };

  return (
    <div className="w-full flex flex-col gap-14 sm:gap-16 pt-3 pb-2">
      {/* Estante Superior: 3 ruedas */}
      <div className="flex flex-col items-center">
        <div className="flex items-end justify-center gap-4 sm:gap-14 pb-1">
          {SHELF_TOP_COMPOUNDS.map(renderWheelItem)}
        </div>
        {/* Barra metálica del estante */}
        <div className="shelf-bar relative w-full max-w-md h-2 rounded-sm bg-gradient-to-r from-[#1C1D24] via-[#33343D] to-[#1C1D24] border-t border-[#4E505E] shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex justify-between px-3 items-center">
          <div className="h-1 w-2 rounded-xs bg-[#131318]" />
          <div className="h-1 w-2 rounded-xs bg-[#131318]" />
        </div>
      </div>

      {/* Estante Inferior: 2 ruedas */}
      <div className="flex flex-col items-center">
        <div className="flex items-end justify-center gap-8 sm:gap-20 pb-1">
          {SHELF_BOTTOM_COMPOUNDS.map(renderWheelItem)}
        </div>
        {/* Barra metálica del estante (mismo ancho que el superior: max-w-md) */}
        <div className="shelf-bar relative w-full max-w-md h-2 rounded-sm bg-gradient-to-r from-[#1C1D24] via-[#33343D] to-[#1C1D24] border-t border-[#4E505E] shadow-[0_4px_10px_rgba(0,0,0,0.8)] flex justify-between px-3 items-center">
          <div className="h-1 w-2 rounded-xs bg-[#131318]" />
          <div className="h-1 w-2 rounded-xs bg-[#131318]" />
        </div>
      </div>
    </div>
  );
}
