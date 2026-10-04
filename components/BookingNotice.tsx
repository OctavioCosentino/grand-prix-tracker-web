import React from "react";

interface BookingNoticeProps {
  severity?: "info" | "warning" | "danger";
  title?: string;
  children: React.ReactNode;
  action?: { label: string; onClick: () => void };
}

const ACCENTS = {
  info: "#7C4DFF",
  warning: "#E7B33C",
  danger: "#E10600",
};

export default function BookingNotice({
  severity = "info",
  title,
  children,
  action,
}: BookingNoticeProps) {
  const accent = ACCENTS[severity];

  return (
    <div
      role={severity === "info" ? "status" : "alert"}
      className="relative overflow-hidden rounded-md border border-[#1C1D24] bg-[#0E0E13] px-6 py-4"
    >
      <div className="absolute bottom-0 left-0 top-0 w-1" style={{ backgroundColor: accent }} />
      {title && (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: accent }}>
          {title}
        </p>
      )}
      <div className="mt-1 text-sm leading-relaxed text-[#D8D7CE]">{children}</div>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 text-sm font-bold hover:underline cursor-pointer"
          style={{ color: accent }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

/** Estado de carga/error de una consulta del wizard. */
export function QueryStatus({
  isPending,
  error,
  onRetry,
  loadingText,
  className = "",
}: {
  isPending: boolean;
  error: Error | null;
  onRetry: () => void;
  loadingText: string;
  className?: string;
}) {
  if (isPending) {
    return (
      <div className={"flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-md border border-[#1C1D24] bg-[#0E0E13] " + className}>
        <span className="h-8 w-8 rounded-full border-2 border-[#E10600] border-t-transparent animate-spin" />
        <p className="font-mono text-xs uppercase tracking-widest text-[#93949F]">{loadingText}</p>
      </div>
    );
  }
  if (error) {
    return (
      <BookingNotice
        severity="danger"
        title="Sin señal del box"
        action={{ label: "Reintentar", onClick: onRetry }}
      >
        No pudimos cargar esta información. Revisá tu conexión e intentá de nuevo.
      </BookingNotice>
    );
  }
  return null;
}
