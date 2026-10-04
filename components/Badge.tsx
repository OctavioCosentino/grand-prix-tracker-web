import React from 'react';

export default function Badge({ icon, label, active, detail }: { icon: React.ReactNode; label: string; active: boolean; detail?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-1.5 rounded-sm border py-3 px-2 text-center transition-colors ${active ? 'border-[#33343D] bg-[#1C1D24]' : 'border-[#1C1D24] bg-[#0E0E13] opacity-60'}`}>
      <div className="mb-1 flex h-6 w-6 items-center justify-center text-[#E10600]">
        {icon}
      </div>
      <span className="font-mono text-[11px] uppercase tracking-wider text-[#F3F1EA]">{label}</span>
      {detail && <span className="text-xs font-medium text-[#E7B33C]">{detail}</span>}
    </div>
  );
}