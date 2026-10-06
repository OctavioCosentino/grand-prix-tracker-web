import React from "react";

interface HotelFiltersProps {
  priceRange: number;
  setPriceRange: (val: number) => void;
  minStars: number;
  setMinStars: (val: number) => void;
  transferOnly: boolean;
  setTransferOnly: (val: boolean) => void;
  disabledTransfer?: boolean;
  maxPrice: number;
}

export default function HotelFilters({
  priceRange,
  setPriceRange,
  minStars,
  setMinStars,
  transferOnly,
  setTransferOnly,
  disabledTransfer = false,
  maxPrice,
}: HotelFiltersProps) {
  return (
    <aside className="w-full">
      <div className="flex flex-col gap-6 rounded-md border border-[#1C1D24] bg-[#0E0E13] p-6 shadow-xl md:flex-row md:items-center md:justify-between md:gap-8">
        <div className="hidden md:block">
          <h2 className="font-display text-xl font-bold tracking-tight text-[#F3F1EA]">
            Filtros
          </h2>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:flex-1 md:items-end md:justify-end md:gap-8">
          {/* Filtro Estrellas */}
          <div className="flex-1 md:max-w-[200px]">
            <label className="mb-3 block font-mono text-xs uppercase tracking-widest text-[#5C5D66]">
              Estrellas
            </label>
            <div className="flex gap-2">
              {[3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setMinStars(star)}
                  className={`flex h-10 flex-1 cursor-pointer items-center justify-center rounded-sm border font-mono text-xs transition-colors ${
                    minStars === star
                      ? "border-[#E10600] bg-[#E10600]/10 text-[#E10600]"
                      : "border-[#33343D] bg-[#131318] text-[#93949F] hover:border-[#5C5D66]"
                  }`}
                >
                  {star} ★
                </button>
              ))}
            </div>
          </div>

          {/* Filtro Precio */}
          <div className="flex-1 md:max-w-[250px]">
            <div className="mb-3 flex items-center justify-between">
              <label className="font-mono text-xs uppercase tracking-widest text-[#5C5D66]">
                Precio Máx
              </label>
              <span className="font-mono text-xs font-bold text-[#E10600]">
                ${priceRange}
              </span>
            </div>
            <div className="relative pt-1">
              <input
                type="range"
                min="50"
                max={maxPrice}
                step="50"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full outline-none
                  [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-[#E10600] [&::-moz-range-thumb]:shadow-[0_0_10px_rgba(225,6,0,0.8)] [&::-moz-range-thumb]:transition-transform hover:[&::-moz-range-thumb]:scale-125
                  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#E10600] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(225,6,0,0.8)] [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-125"
                style={{
                  background: `linear-gradient(to right, #E10600 ${((priceRange - 50) / (maxPrice - 50)) * 100}%, #1C1D24 ${((priceRange - 50) / (maxPrice - 50)) * 100}%)`,
                }}
              />
            </div>
          </div>

          {/* Filtro Traslado */}
          <div className={`flex shrink-0 items-center md:h-10 ${disabledTransfer ? 'opacity-50 pointer-events-none' : ''}`}>
            <label className={`flex items-center gap-3 ${disabledTransfer ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={transferOnly}
                  onChange={(e) => setTransferOnly(e.target.checked)}
                  disabled={disabledTransfer}
                />
                <div
                  className={`hotel-transfer-toggle h-5 w-9 rounded-full transition-colors border ${
                    transferOnly
                      ? "on bg-[#E10600] border-[#E10600]"
                      : "off bg-[#1C1D24] border-[#33343D]"
                  }`}
                />
                <div
                  className={`absolute top-[2px] h-4 w-4 rounded-full bg-white shadow-sm border border-black/10 transition-transform ${
                    transferOnly ? "translate-x-4 left-[2px]" : "translate-x-0 left-[2px]"
                  }`}
                />
              </div>
              <span className="font-mono text-xs uppercase tracking-widest text-[#D8D7CE]">
                Traslado Incluido
              </span>
            </label>
          </div>
        </div>
      </div>
    </aside>
  );
}
