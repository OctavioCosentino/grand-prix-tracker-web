import IconHotel from "@/components/icons/IconHotel";
import IconTicket from "@/components/icons/IconTicket";
import IconBus from "@/components/icons/IconBus";

export const SERVICE_ICONS: Record<
  string,
  (props: { className?: string }) => React.ReactElement
> = {
  hotel: IconHotel,
  ticket: IconTicket,
  bus: IconBus,
};

export const SERVICES = [
  {
    icon: "/hotel.webp",
    title: "Alojamiento asociado",
    body: "Red de hoteles cerca del circuito, conectados en tiempo real: la disponibilidad que ves en pantalla es la que realmente queda.",
    tag: "Habitaciones en tiempo real",
  },
  {
    icon: "/tickets.webp",
    title: "Entradas oficiales",
    body: "Ubicaciones de tribuna emitidas directo con la ticketera del evento. Sin intermediarios, sin reventa, sin sorpresas en el acceso.",
    tag: "Emisión digital directa",
  },
  {
    icon: "/transport.webp",
    title: "Traslados dedicados",
    body: "Flota de ómnibus del hotel al circuito, ida y vuelta, con tu asiento asignado antes de que pongas un pie en el destino.",
    tag: "Asiento garantizado",
  },
];