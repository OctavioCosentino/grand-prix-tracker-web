import React from "react";
import Image from "next/image";
import { Hotel, Ticket, Bus } from "lucide-react";

export interface ServicesCardProps {
  service: {
    title: string;
    body: string;
    tag: string;
    icon: string;
  };
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const LUCIDE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string; strokeWidth?: number }>
> = {
  "/hotel.png": Hotel,
  "/hotel.webp": Hotel,
  hotel: Hotel,
  "/tickets.png": Ticket,
  "/tickets.webp": Ticket,
  ticket: Ticket,
  "/transport.png": Bus,
  "/transport.webp": Bus,
  bus: Bus,
};

export default function ServicesCard({ service, Icon }: ServicesCardProps) {
  const isImagePath = service.icon.startsWith("/") || service.icon.includes(".");
  const LucideComponent = LUCIDE_ICONS[service.icon];

  return (
    <div className="group relative h-full overflow-hidden rounded-md border border-[#1C1D24] bg-[#131318] p-8 transition-colors hover:border-[#E10600]/50 cursor-pointer">
      <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-[#E10600] transition-transform duration-500 group-hover:scale-x-100" />
      
      <div className="relative h-8 w-8 shrink-0 flex items-center justify-center">
        {isImagePath && (
          <Image
            src={service.icon}
            alt={service.title}
            width={32}
            height={32}
            className="dark-icon h-8 w-8 object-contain shrink-0"
          />
        )}
        {LucideComponent ? (
          <LucideComponent
            className="light-icon h-8 w-8 text-[#E10600] shrink-0"
            strokeWidth={2.5}
          />
        ) : Icon ? (
          <Icon className="light-icon h-8 w-8 text-[#E10600] shrink-0" />
        ) : null}
      </div>

      <h3 className="font-display mt-5 text-xl font-700">
        {service.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[#93949F]">
        {service.body}
      </p>
      <span className="font-mono mt-5 inline-block text-[10px] tracking-[0.25em] text-[#7C4DFF]">
        {service.tag.toUpperCase()}
      </span>
    </div>
  );
}