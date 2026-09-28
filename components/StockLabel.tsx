import React from "react";

interface StockLabelProps {
  stock: number;
  unit: string;
  /** Por debajo de este número se resalta como "últimos" */
  lowThreshold?: number;
}

export default function StockLabel({ stock, unit, lowThreshold = 5 }: StockLabelProps) {
  if (stock === 0) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-wider text-[#E10600]">
        Agotado
      </span>
    );
  }

  return (
    <span
      className={`font-mono text-[10px] uppercase tracking-wider ${
        stock <= lowThreshold ? "text-[#E7B33C]" : "text-[#5C5D66]"
      }`}
    >
      {stock <= lowThreshold ? "Últimos " : ""}
      {stock} {unit}
    </span>
  );
}
