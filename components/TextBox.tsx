import React from "react";

export interface TextBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxWords?: number;
  disabled?: boolean;
}

export default function TextBox({
  value,
  onChange,
  placeholder = "Escribí acá...",
  maxWords = 100,
  disabled = false,
}: TextBoxProps) {
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (disabled) return;
    const text = e.target.value;
    const currentWords = text.trim() ? text.trim().split(/\s+/).length : 0;

    if (currentWords <= maxWords || text.length < value.length) {
      onChange(text);
    }
  };

  return (
    <div className="relative w-full">
      <textarea
        required
        disabled={disabled}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={5}
        className="w-full resize-none rounded-sm border border-[#33343D] bg-[#131318] p-4 pb-8 text-sm text-[#F3F1EA] placeholder-[#5C5D66] outline-none transition-colors focus:border-[#E10600] disabled:opacity-60 disabled:cursor-not-allowed"
      />
      <div
        className={`absolute bottom-3 right-4 font-mono text-[10px] ${
          words >= maxWords ? "text-[#E10600] font-bold" : "text-[#5C5D66]"
        }`}
      >
        {words}/{maxWords} palabras
      </div>
    </div>
  );
}
