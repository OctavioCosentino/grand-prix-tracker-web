import React from "react";
import Image from "next/image";

export interface ServicesCardProps {
  service: {
    title: string;
    body: string;
    tag: string;
    icon: string;
  };
  Icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export default function ServicesCard({ service, Icon }: ServicesCardProps) {
  const isImagePath = service.icon.startsWith("/") || service.icon.includes(".");

  return (
    <div className="group relative h-full overflow-hidden rounded-md border border-[#1C1D24] bg-[#131318] p-8 transition-colors hover:border-[#E10600]/50 cursor-pointer">
      <div className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-[#E10600] transition-transform duration-500 group-hover:scale-x-100" />
      
      {isImagePath ? (
        <div className="relative h-8 w-8 shrink-0">
          <Image
            src={service.icon}
            alt={service.title}
            width={32}
            height={32}
            className="h-8 w-8 object-contain shrink-0"
          />
        </div>
      ) : Icon ? (
        <Icon className="h-8 w-8 text-[#E10600]" />
      ) : null}

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