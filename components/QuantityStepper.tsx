import React from "react";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max: number;
  disabled?: boolean;
  label?: string;
}

export default function QuantityStepper({
  value,
  onChange,
  min = 0,
  max,
  disabled = false,
  label = "Cantidad",
}: QuantityStepperProps) {
  const buttonClasses =
    "flex h-9 w-9 items-center justify-center font-mono text-sm text-[#F3F1EA] transition-colors hover:bg-[#1C1D24] disabled:cursor-not-allowed disabled:text-[#33343D] disabled:hover:bg-transparent cursor-pointer";

  return (
    <div
      className={`inline-flex items-center rounded-sm border ${
        value > 0 ? "border-[#E10600]" : "border-[#33343D]"
      } bg-[#131318]`}
    >
      <button
        type="button"
        aria-label={`Quitar ${label.toLowerCase()}`}
        className={buttonClasses}
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <span
        aria-label={label}
        className="w-8 text-center font-mono text-sm font-bold text-[#F3F1EA]"
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`Agregar ${label.toLowerCase()}`}
        className={buttonClasses}
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
