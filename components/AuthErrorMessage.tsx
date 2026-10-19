import React from "react";
import { AlertCircle } from "lucide-react";

interface AuthErrorMessageProps {
  message: string;
  title?: string;
  className?: string;
}

export default function AuthErrorMessage({
  message,
  title = "Error de acceso",
  className = "",
}: AuthErrorMessageProps) {
  return (
    <div
      role="alert"
      className={`auth-error-banner flex items-start gap-2.5 rounded-sm border border-[#E10600]/30 border-l-4 border-l-[#E10600] bg-[#E10600]/10 px-3.5 py-2.5 text-left shadow-sm animate-in fade-in slide-in-from-top-1 duration-200 ${className}`}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#E10600]" />
      <div className="flex flex-col gap-0.5 min-w-0">
        {title && (
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-[#E10600]">
            {title}
          </span>
        )}
        <span className="text-xs text-[#F3F1EA] leading-relaxed">
          {message}
        </span>
      </div>
    </div>
  );
}
