"use client";
import { useEvents } from "@/hooks/useEvents";
import StatusDot from "./StatusDot";
import { isToday } from "@/utils/isToday";

export default function RacesCarrousel() {
  const { races, isPending } = useEvents();
  const today = new Date();

  if (isPending) {
    return (
      <div className="relative overflow-hidden border-y border-[#1C1D24] bg-[#0E0E13] py-3">
        <div className="flex w-full items-center justify-center">
          <span className="font-mono text-xs text-[#33343D] animate-pulse">
            Sincronizando telemetría...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden border-y border-[#1C1D24] bg-[#0E0E13] py-3">
      <div className="gpt-marquee-track flex w-max gap-10 whitespace-nowrap">
        {[...races, ...races].map((race, i) => {
          const liveNow = isToday(race.date);
          const raceDate = new Date(race.date);
          const hasPassed = !liveNow && raceDate < today;

          return (
            <span
              key={i}
              className="font-mono flex items-center gap-3 text-xs tracking-wide text-[#93949F]"
            >
              {liveNow ? (
                <StatusDot ok={false} />
              ) : (
                <span
                  className={hasPassed ? "text-emerald-400" : "text-[#E10600]"}
                >
                  ●
                </span>
              )}
              {race.name}
            </span>
          );
        })}
      </div>
    </div>
  );
}
