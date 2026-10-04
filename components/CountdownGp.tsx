import { F1CarSilhouette } from "./F1CarSilhouette";
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

  // Lógica real: Es en vivo si estamos entre viernes y domingo de la carrera
  const raceDate = new Date(nextRace.date);
  const startDate = new Date(raceDate);
  startDate.setDate(raceDate.getDate() - 2); // Asumimos viernes
  
  // Reseteamos las horas para comparar días enteros
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startNormalized = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const raceNormalized = new Date(raceDate.getFullYear(), raceDate.getMonth(), raceDate.getDate());
  
  const isLive = todayNormalized >= startNormalized && todayNormalized <= raceNormalized;

  return (
    <div className="gpt-hud-grid relative overflow-hidden rounded-md border border-[#1C1D24] bg-[#131318]/80 p-6 md:p-8">
      <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <StatusDot ok={isLive} />
            <span className="font-mono text-[11px] tracking-[0.3em] text-[#93949F]">
              {isLive ? "TRANSMISIÓN EN VIVO" : "EN VIVO · PRÓXIMA LARGADA"}
            </span>
          </div>
          <p className="font-display mt-2 text-xl font-700 md:text-2xl text-[#F3F1EA]">
            {nextRace.name}{" "}
            <span className="text-[#93949F]">— {nextRace.circuit}</span>
          </p>
        </div>

        {isLive ? (
          <div className="relative overflow-hidden flex w-full flex-col items-center justify-center rounded-md border border-[#E10600]/30 bg-[#E10600]/10 p-4 shadow-[0_0_15px_rgba(225,6,0,0.15)] md:w-auto md:min-w-[340px]">
            <style>{`
              @keyframes race-cars {
                0% { transform: translateX(-150px); }
                100% { transform: translateX(450px); }
              }
              @media (min-width: 768px) {
                @keyframes race-cars {
                  0% { transform: translateX(-150px); }
                  100% { transform: translateX(500px); }
                }
              }
              .animate-race {
                animation: race-cars 4s linear infinite;
              }
            `}</style>
            
            <span className="relative z-10 font-display text-xl font-900 tracking-tight text-[#E10600] uppercase animate-pulse">
              FIN DE SEMANA DE CARRERA
            </span>
            <p className="relative z-10 font-mono text-[10px] mt-1 text-center uppercase tracking-[0.2em] text-[#F3F1EA]">
              Los autos ya están girando en la pista
            </p>
            
            {/* Animación de autos en el borde inferior */}
            <div className="absolute bottom-[-10px] left-0 w-full h-8 pointer-events-none opacity-40">
               <div className="flex items-end animate-race w-full absolute bottom-0 gap-8">
                   <F1CarSilhouette className="w-14 text-[#E10600]" />
                   <F1CarSilhouette className="w-14 text-[#E10600]" />
               </div>
            </div>
          </div>
        ) : (
          <CountdownBoxes date={nextRace.date} />
        )}
      </div>
    </div>
  );
}
