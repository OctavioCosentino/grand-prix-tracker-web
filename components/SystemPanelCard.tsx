import React, { ReactNode } from "react";
import StatusDot from "./StatusDot";

interface SystemPanelCardProps {
  tag?: string;
  title?: string;
  status?: string;
  body: ReactNode;
  isClosing?: boolean;
}

export default function SystemPanelCard({
  tag,
  title,
  status,
  body,
  isClosing = false,
}: SystemPanelCardProps) {
  // -- Cierre --
  if (isClosing) {
    return (
      <div className="flex h-full flex-col justify-center rounded-md border border-dashed border-[#33343D] bg-transparent p-6">
        <p className="font-mono text-[10px] tracking-[0.2em] text-[#5C5D66]">
          {title}
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#93949F]">{body}</p>
      </div>
    );
  }

  // --- NORMAL ---
  return (
    <div className="flex h-full flex-col rounded-md border border-[#1C1D24] bg-[#131318] p-6">
      <div className="flex items-center justify-between">
        <span className="font-mono rounded-sm border border-[#33343D] px-2 py-1 text-[10px] tracking-[0.2em] text-[#7C4DFF]">
          {tag}
        </span>
        <div className="flex items-center gap-2">
          <StatusDot ok={status === "operativo"} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#93949F]">
            {status}
          </span>
        </div>
      </div>
      <h3 className="font-display mt-4 text-lg font-700">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[#93949F]">{body}</p>
    </div>
  );
}
