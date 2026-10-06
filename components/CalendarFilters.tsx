import React from "react";

const REGIONS = [
  "Todos",
  "Norteamérica",
  "Europa",
  "Asia",
  "Medio Oriente",
  "Latinoamérica",
];
const MONTHS = [
  { id: 3, label: "MAR" },
  { id: 4, label: "ABR" },
  { id: 5, label: "MAY" },
  { id: 6, label: "JUN" },
  { id: 7, label: "JUL" },
  { id: 8, label: "AGO" },
  { id: 9, label: "SEP" },
  { id: 10, label: "OCT" },
  { id: 11, label: "NOV" },
  { id: 12, label: "DIC" },
];

interface CalendarFiltersProps {
  currentYear: number;
  selectedRegion: string;
  setSelectedRegion: (region: string) => void;
  selectedMonth: number | null;
  setSelectedMonth: (month: number | null) => void;
}

export default function CalendarFilters({
  currentYear,
  selectedRegion,
  setSelectedRegion,
  selectedMonth,
  setSelectedMonth,
}: CalendarFiltersProps) {
  return (
    <aside className="w-full shrink-0 md:w-64">
      <div className="sticky top-24 max-h-[calc(100dvh-7rem)] overflow-y-auto overscroll-contain rounded-md border border-[#1C1D24] bg-[#0E0E13] p-5 shadow-xl custom-scrollbar md:p-6">
        <h2 className="font-display mb-4 text-xl font-900 tracking-tight md:mb-5">
          Filtros de Pista
        </h2>

        <div className="mb-5 md:mb-6">
          <h3 className="font-mono mb-2 text-[10px] uppercase tracking-[0.15em] text-[#5C5D66] md:mb-3">
            Región
          </h3>
          <div className="flex flex-col gap-1">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`group flex items-center justify-between rounded-sm px-3 py-1.5 text-left text-sm transition-colors cursor-pointer md:py-2 ${
                  selectedRegion === region
                    ? "bg-[#1C1D24] text-[#F3F1EA] font-semibold border-l-2 border-[#E10600]"
                    : "bg-transparent text-[#93949F] hover:bg-[#131318] hover:text-[#F3F1EA] border-l-2 border-transparent"
                }`}
              >
                {region}
                {selectedRegion === region && (
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E10600]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between md:mb-3">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66]">
              Mes ({currentYear})
            </h3>
            {selectedMonth !== null && (
              <button
                onClick={() => setSelectedMonth(null)}
                className="font-mono text-[9px] uppercase text-[#E10600] hover:underline cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-1.5 md:gap-2">
            {MONTHS.map((month) => {
              const isActive = selectedMonth === month.id;
              return (
                <button
                  key={month.id}
                  onClick={() => setSelectedMonth(isActive ? null : month.id)}
                  className={`rounded-sm border py-1.5 text-center font-mono text-[10px] font-semibold cursor-pointer transition-all md:py-2 ${
                    isActive
                      ? "border-[#E10600] bg-[#E10600] text-white shadow-[0_0_10px_rgba(225,6,0,0.3)]"
                      : "border-[#1C1D24] bg-[#131318] text-[#5C5D66] hover:border-[#33343D] hover:text-[#F3F1EA]"
                  }`}
                >
                  {month.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
