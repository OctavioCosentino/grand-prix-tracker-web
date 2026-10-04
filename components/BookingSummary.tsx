import React from "react";
import { SummaryLine, formatDateES, formatUsd } from "@/utils/booking";

interface BookingSummaryProps {
  lines: SummaryLine[];
  stay: { checkIn: string; checkOut: string; nights: number };
  children?: React.ReactNode;
}

/** Resumen del paquete en curso. El total es orientativo: el real lo calcula el back. */
export default function BookingSummary({ lines, stay, children }: BookingSummaryProps) {
  const total = lines.reduce((acc, l) => acc + l.subtotal, 0);

  return (
    <aside className="w-full">
      <div className="sticky top-28 rounded-md border border-[#33343D] bg-[#181920] p-8 shadow-xl">
        <h2 className="font-display text-2xl font-bold tracking-tight text-[#F3F1EA]">
          Tu paquete
        </h2>
        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-[#93949F]">
          Estadía {formatDateES(stay.checkIn)} → {formatDateES(stay.checkOut)}
        </p>

        {lines.length === 0 ? (
          <p className="mt-6 text-base text-[#93949F]">
            Todavía no elegiste productos. Todos son opcionales, pero el paquete
            necesita al menos uno.
          </p>
        ) : (
          <ul className="mt-6 flex flex-col gap-4">
            {lines.map((line) => (
              <li key={line.id} className="flex justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-[#F3F1EA]">{line.label}</p>
                  <p className="font-mono text-xs text-[#93949F]">{line.detail}</p>
                </div>
                <span className="shrink-0 font-mono text-base text-[#D8D7CE]">
                  {formatUsd(line.subtotal)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-[#1C1D24] pt-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-[#93949F]">
              Total estimado
            </span>
            <p className="font-mono text-xs text-[#5C5D66]">
              El total final se confirma al pagar
            </p>
          </div>
          <span className="font-display text-3xl font-900 text-[#E10600]">
            {formatUsd(total)}
          </span>
        </div>

        {children && <div className="mt-6">{children}</div>}
      </div>
    </aside>
  );
}
