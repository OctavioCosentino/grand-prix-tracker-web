"use client";

import React, { useState, useRef, useEffect } from "react";

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
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizar el valor temporal cuando cambia el prop desde afuera
  useEffect(() => {
    if (!isEditing) {
      setTempValue(String(value));
    }
  }, [value, isEditing]);

  // Foco automático y selección del número al entrar en modo edición
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitValue = () => {
    setIsEditing(false);
    if (tempValue.trim() === "") {
      onChange(min);
      return;
    }
    const parsed = parseInt(tempValue, 10);
    if (isNaN(parsed) || parsed < min) {
      onChange(min);
    } else if (parsed > max) {
      onChange(max);
    } else {
      onChange(parsed);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, "");
    if (clean === "") {
      setTempValue("");
      return;
    }
    const num = parseInt(clean, 10);
    if (num > max) {
      setTempValue(String(max));
    } else {
      setTempValue(clean);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitValue();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsEditing(false);
      setTempValue(String(value));
    }
  };

  const buttonClasses =
    "flex h-9 w-9 items-center justify-center font-mono text-sm text-[#F3F1EA] transition-colors hover:bg-[#1C1D24] disabled:cursor-not-allowed disabled:text-[#33343D] disabled:hover:bg-transparent cursor-pointer select-none";

  return (
    <div
      className={`inline-flex items-center rounded-sm border ${
        value > 0 || isEditing ? "border-[#E10600]" : "border-[#33343D]"
      } bg-[#131318] transition-colors`}
    >
      <button
        type="button"
        aria-label={`Quitar ${label.toLowerCase()}`}
        className={buttonClasses}
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>

      {isEditing ? (
        <div className="relative h-9 w-9 flex items-center justify-center">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            value={tempValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onBlur={commitValue}
            className="w-full h-full text-center font-mono text-sm font-bold text-[#F3F1EA] bg-transparent outline-none p-0"
          />
          <span className="absolute bottom-1.5 left-1.5 right-1.5 h-[2px] bg-[#E10600] pointer-events-none" />
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            if (!disabled) {
              setTempValue(String(value));
              setIsEditing(true);
            }
          }}
          onDoubleClick={() => {
            if (!disabled) {
              setTempValue(String(value));
              setIsEditing(true);
            }
          }}
          title="Click para editar cantidad"
          className="h-9 w-9 flex items-center justify-center text-center font-mono text-sm font-bold text-[#F3F1EA] cursor-text hover:bg-[#1C1D24]/50 transition-colors select-none"
        >
          {value}
        </button>
      )}

      <button
        type="button"
        aria-label={`Agregar ${label.toLowerCase()}`}
        className={buttonClasses}
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        +
      </button>
    </div>
  );
}
