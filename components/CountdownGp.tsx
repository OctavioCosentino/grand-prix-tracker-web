import CountdownBoxes from "@/components/CoutdownBoxes";
import StatusDot from "./StatusDot";
import { useEvents } from "@/hooks/useEvents";

export default function CountdownGp() {
  const { races, isPending } = useEvents();
  const today = new Date();

  const nextRace =
    races.find((race) => new Date(race.date) > today) ||
    races[races.length - 1];

  if (isPending || !nextRace) {
    return (
      <div className="gpt-hud-grid relative overflow-hidden rounded-md border border-[#1C1D24] bg-[#131318]/80 p-6 md:p-8 animate-pulse">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="space-y-3">
            <div className="h-3 w-40 rounded-sm bg-[#1C1D24]" />
            <div className="h-6 w-64 rounded-sm bg-[#23242E]" />
          </div>
          <div className="h-16 w-full max-w-sm rounded-sm bg-[#1C1D24] md:w-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="gpt-hud-grid relative overflow-hidden rounded-md border border-[#1C1D24] bg-[#131318]/80 p-6 md:p-8">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <StatusDot />
            <span className="font-mono text-[11px] tracking-[0.3em] text-[#93949F]">
              EN VIVO · PRÓXIMA LARGADA
            </span>
          </div>
          <p className="font-display mt-2 text-xl font-700 md:text-2xl text-[#F3F1EA]">
            {nextRace.name}{" "}
            <span className="text-[#93949F]">— {nextRace.circuit}</span>
          </p>
        </div>

        <CountdownBoxes date={nextRace.date} />
      </div>
    </div>
  );
}
