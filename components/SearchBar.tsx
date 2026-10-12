import React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Buscar circuito o carrera...",
}: SearchBarProps) {
  return (
    <div className="relative mt-5 mb-2 w-full max-w-md">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Search className="h-4 w-4 text-[#5C5D66]" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-full border border-[#1C1D24] bg-[#131318] py-2.5 pl-11 pr-4 text-sm text-[#F3F1EA] placeholder:text-[#5C5D66] transition-colors focus:border-[#E10600] focus:outline-none focus:ring-1 focus:ring-[#E10600]"
      />
    </div>
  );
}
