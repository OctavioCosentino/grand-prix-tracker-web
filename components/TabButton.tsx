export interface TabButtonProps {
  label: string;
  active: boolean;
  sublabel: string;
  onClick: () => void;
}

export default function TabButton({
  label,
  active,
  onClick,
  sublabel,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full flex-col items-start border-l-2 px-6 py-4 text-left transition-colors ${
        active
          ? "border-[#E10600] bg-[#1C1D24] text-[#F3F1EA] cursor-pointer"
          : "border-transparent text-[#93949F] hover:border-[#33343D] hover:bg-[#131318] cursor-pointer"
      }`}
    >
      <span className="font-display text-base font-900 tracking-tight">
        {label}
      </span>
      <span
        className={`font-mono text-[10px] uppercase tracking-wider ${active ? "text-[#E10600]" : "text-[#5C5D66]"}`}
      >
        {sublabel}
      </span>
    </button>
  );
}
