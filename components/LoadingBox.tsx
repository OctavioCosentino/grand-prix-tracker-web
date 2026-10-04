import React from "react";

interface LoadingBoxProps {
  text?: string;
  className?: string;
  minHeight?: string;
  boxed?: boolean;
}

export default function LoadingBox({
  text = "Cargando...",
  className = "",
  minHeight,
  boxed = true,
}: LoadingBoxProps) {
  const boxStyles = boxed
    ? "rounded-md border border-[#1C1D24] bg-[#0E0E13]"
    : "";

  const resolvedMinHeight =
    minHeight ??
    (className.includes("min-h-") || className.includes("h-") || className.includes("flex-1")
      ? ""
      : "min-h-[200px]");

  return (
    <div
      className={`flex ${resolvedMinHeight} flex-col items-center justify-center gap-4 ${boxStyles} ${className}`.trim()}
    >
      <span className="h-8 w-8 rounded-full border-2 border-[#E10600] border-t-transparent animate-spin" />
      {text && (
        <p className="font-mono text-xs uppercase tracking-widest text-[#93949F]">
          {text}
        </p>
      )}
    </div>
  );
}
