import React, { ReactNode } from "react";

interface ButtonOutlineProps {
  children: ReactNode;
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  disabled?: boolean;
}

export default function ButtonOutline({
  children,
  href,
  onClick,
  type = "button",
  className = "",
  disabled = false,
}: ButtonOutlineProps) {
  const baseClasses =
    "gpt-outline-btn inline-flex items-center justify-center gap-2 rounded-sm border border-[#33343D] px-6 py-3.5 text-sm font-semibold text-[#F3F1EA] transition-colors hover:border-[#7C4DFF] hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed " +
    className;

  if (href && !disabled) {
    return (
      <a href={href} onClick={onClick} className={baseClasses}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={baseClasses} disabled={disabled}>
      {children}
    </button>
  );
}