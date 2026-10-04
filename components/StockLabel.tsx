import React from "react";

interface StockLabelProps {
  stock: number;
  unit: string;
  /** Por debajo de este número se resalta como "últimos" */
  lowThreshold?: number;
  className?: string;
}

export default function StockLabel({
  stock,
  unit,
  lowThreshold = 5,
  className,
}: StockLabelProps) {
  const baseClass = className || "font-mono text-[10px] uppercase tracking-wider";

  if (stock === 0) {
    return (
      <span className={`${baseClass} text-[#E10600]`}>
        Agotado
      </span>
    );
  }

  return (
    <span
      className={`${baseClass} ${
        stock <= lowThreshold ? "text-[#E7B33C]" : className ? "" : "text-[#5C5D66]"
      }`}
    >
      {stock <= lowThreshold ? "Últimos " : ""}
      {stock} {unit}
    </span>
  );
}
