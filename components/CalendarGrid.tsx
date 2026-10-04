import React from "react";
import DestinationCard from "./DestinationsCard";
import { Race } from "@/utils/races";
import SearchBar from "./SearchBar";
import EmptyState from "./EmptyState";
import CalendarSkeleton from "./CalendarSkeleton";

interface CalendarGridProps {
  currentYear: number;
  filteredRaces: Race[];
  onClearFilters: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function CalendarGrid({
  currentYear,
  filteredRaces,
  onClearFilters,
  searchQuery,
  onSearchChange,
  isLoading = false,
  error = null,
  onRetry,
}: CalendarGridProps) {
  return (
    <main className="flex-grow">
      <div className="mb-8 border-b border-[#1C1D24] pb-6">
        <span className="font-mono text-[10px] tracking-[0.2em] text-[#E10600]">
          TEMPORADA OFICIAL
        </span>
        <h1 className="font-display mt-2 text-4xl font-900 tracking-tight sm:text-5xl">
          Calendario {currentYear}
        </h1>

        <SearchBar value={searchQuery} onChange={onSearchChange} />

        <div className="mt-4 flex items-center justify-between text-sm text-[#93949F]">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#E10600] animate-ping" />
              <span className="font-mono text-xs text-[#E10600] tracking-wider uppercase">
                Sincronizando con telemetría de eventos...
              </span>
            </div>
          ) : error ? (
            <span className="text-red-400">Error al sincronizar eventos</span>
          ) : (
            <p>
              {filteredRaces.length}{" "}
              {filteredRaces.length === 1
                ? "carrera encontrada"
                : "carreras encontradas"}
              .
            </p>
          )}
        </div>
      </div>

      {isLoading ? (
        <CalendarSkeleton count={6} />
      ) : error ? (
        <EmptyState message="NO HAY CARRERAS EN ESTE SECTOR">
            <button
              onClick={onClearFilters}
              className="mt-4 text-m font-bold text-[#f10b03] hover:underline cursor-pointer"
            >
              Limpiar filtros
            </button>
          </EmptyState>
      ) : filteredRaces.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filteredRaces.map((race, i) => (
            <div
              key={race.id || i}
              className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <DestinationCard
                id={race.id}
                name={race.name}
                img={race.img}
                circuit={race.circuit}
                badge={race.badge}
                blurb={race.blurb}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="relative flex h-64 flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-[#33343D] bg-[#0E0E13]">
          <div
            className="absolute inset-0 z-0 bg-cover bg-center opacity-30 grayscale"
            style={{ backgroundImage: "url('/empty.png')" }}
          />
          <div className="relative z-10 flex flex-col items-center">
            <p className="mt-4 font-mono text-s tracking-widest text-[#ffffff]">
              NO HAY CARRERAS EN ESTE SECTOR
            </p>
            <button
              onClick={onClearFilters}
              className="mt-4 text-m font-bold text-[#f10b03] hover:underline cursor-pointer"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
