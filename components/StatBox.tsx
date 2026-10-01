export default function StatBox({ label, value, unit, className }: { label: string; value: string; unit?: string, className?: string }) {
  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-sm border border-[#1C1D24] bg-[#131318] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#E10600]/50 hover:shadow-[0_0_15px_rgba(225,6,0,0.15)] ${className || ''}`}>
      <div className="absolute bottom-0 left-0 top-0 w-1 origin-bottom scale-y-0 bg-[#E10600] transition-transform duration-300 ease-out group-hover:scale-y-100 cursor-f1" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#E10600]/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 cursor-f1" />

      <span className="relative z-10 font-mono text-[10px] uppercase tracking-[0.15em] text-[#5C5D66] transition-colors duration-300 group-hover:text-[#E10600] cursor-f1">
        {label}
      </span>
      <div className="relative z-10 mt-1 flex items-baseline gap-1 cursor-f1">
        <span className="inline-block origin-left font-display text-2xl font-900 text-[#F3F1EA] transition-transform duration-300 ease-out group-hover:-skew-x-6 group-hover:scale-110">
          {value}
        </span>
        {unit && <span className="font-mono text-xs text-[#93949F] transition-colors duration-300 group-hover:text-[#D8D7CE]">{unit}</span>}
      </div>
    </div>
  );
}
