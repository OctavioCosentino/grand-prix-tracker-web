import React from "react";
import ButtonChecker from "./ButtonChecker";
import { isLogged } from "@/utils/mockData/isLogged";
import { useRouter } from "next/navigation";

interface RaceBookingSidebarProps {
  id: string;
  name: string;
  hasPassed: boolean;
}

export default function RaceBookingSidebar({ id, name, hasPassed }: RaceBookingSidebarProps) {
  const router = useRouter();

  const handleBookingClick = () => {
    if (hasPassed) return;
    
    if (!isLogged) {
      router.push("/login");
    } else {
      router.push(`/booking/${id}`);
    }
  };

  return (
    <aside className="w-full shrink-0 lg:w-96">
      <div className="sticky top-28 rounded-md border border-[#1C1D24] bg-[#0E0E13] p-8 shadow-xl">
        <h3 className="font-display mb-2 text-2xl font-900 tracking-tight text-[#F3F1EA]">
          Disfruta de {name.replace(' GP', '')}
        </h3>
        <p className="mb-8 text-sm text-[#93949F] leading-relaxed">
          {hasPassed 
            ? "Este evento ya ha finalizado. Te esperamos en la próxima temporada para vivir toda la adrenalina de la F1." 
            : "Reserva ahora el paquete completo y asegurate tu lugar en la grilla para este increíble fin de semana."}
        </p>
        
        <ButtonChecker 
          className="w-full py-4 font-mono text-[11px] uppercase tracking-widest" 
          showArrow={!hasPassed} 
          disabled={hasPassed}
          onClick={handleBookingClick}
        >
          {hasPassed ? "Reservas cerradas" : (!isLogged ? "Inicia sesión para reservar" : "Reservar Paquete")}
        </ButtonChecker>

        <p className="mt-4 text-center font-mono text-[10px] tracking-wider text-[#5C5D66]">
          {hasPassed ? "Evento finalizado" : "Sujeto a disponibilidad"}
        </p>
      </div>
    </aside>
  );
}

