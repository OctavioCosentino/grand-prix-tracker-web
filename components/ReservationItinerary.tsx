import React from "react";
import { Reserva } from "@/services/bookings";
import { formatDateES, formatDateTimeES, formatUsd } from "@/utils/booking";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-[#1C1D24] pt-6">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#7C4DFF]">
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-4">{children}</ul>
    </section>
  );
}

function Line({ label, detail, subtotal }: { label: string; detail: string; subtotal: number }) {
  return (
    <li className="flex justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-[#F3F1EA]">{label}</p>
        <p className="font-mono text-[11px] text-[#93949F]">{detail}</p>
      </div>
      <span className="shrink-0 font-mono text-sm text-[#D8D7CE]">{formatUsd(subtotal)}</span>
    </li>
  );
}

/**
 * Detalle completo de una reserva tal como la devuelve el back.
 * Los precios son los de la compra, no los actuales.
 */
export default function ReservationItinerary({ reserva }: { reserva: Reserva }) {
  const { metodoPago } = reserva;

  return (
    <div className="flex flex-col gap-6">
      {(reserva.habitaciones.length > 0 || reserva.incluyeTransporte) && (
        <Section title="Estadía">
          {reserva.habitaciones.map((h, i) => (
            <Line
              key={`${h.idHabitacion}-${i}`}
              label={`${h.hotel} · ${h.tipo}`}
              detail={`${formatDateES(h.fechaCheckIn)} → ${formatDateES(h.fechaCheckOut)} · ${h.cantidadNoches} noches × ${formatUsd(h.precioPorNocheUsd)}`}
              subtotal={h.subtotalUsd}
            />
          ))}
          {reserva.incluyeTransporte && (
            <Line 
              label="Traslado Incluido" 
              detail="Servicio de transporte ida y vuelta al circuito" 
              subtotal={30} 
            />
          )}
        </Section>
      )}

      {reserva.entradas.length > 0 && (
        <Section title="Entradas">
          {reserva.entradas.map((e) => (
            <Line
              key={e.idEntrada}
              label={`${e.nombreTribuna} · ${e.tipo}`}
              detail={`${e.cantidad} × ${formatUsd(e.precioUnitarioUsd)}`}
              subtotal={e.subtotalUsd}
            />
          ))}
        </Section>
      )}

      {reserva.vuelos.length > 0 && (
        <Section title="Vuelos">
          {reserva.vuelos.map((v) => (
            <Line
              key={v.idVuelo}
              label={`${v.aerolinea} · ${v.origen} → ${v.destino}`}
              detail={`${formatDateTimeES(v.fechaSalida)} · ${v.cantidadPasajeros} pasajero${v.cantidadPasajeros > 1 ? "s" : ""} × ${formatUsd(v.precioUnitarioUsd)}`}
              subtotal={v.subtotalUsd}
            />
          ))}
        </Section>
      )}

      <div className="flex items-end justify-between border-t border-[#33343D] pt-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#93949F]">
            Total pagado
          </span>
          {metodoPago && (
            <p className="font-mono text-[10px] text-[#5C5D66]">
              {metodoPago.tipo === "Credito" ? "Crédito" : "Débito"} ••••{" "}
              {metodoPago.ultimos4Digitos}
            </p>
          )}
        </div>
        <span className="font-display text-3xl font-900 text-[#E10600]">
          {formatUsd(reserva.totalUsd)}
        </span>
      </div>
    </div>
  );
}
