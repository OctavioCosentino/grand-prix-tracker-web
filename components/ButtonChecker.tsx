import React, { ReactNode } from "react";
import IconArrow from "./icons/IconArrow";

interface ButtonCheckerProps {
  children: ReactNode;
  href?: string;
  onClick?: (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  showArrow?: boolean;
  disabled?: boolean;
}

export default function ButtonChecker({
  children,
  href,
  onClick,
  type = "button",
  className = "",
  showArrow = false,
  disabled = false,
}: ButtonCheckerProps) {
  const baseClasses =
    "gpt-checker-btn inline-flex shrink-0 items-center justify-center gap-2 rounded-sm text-sm font-semibold transition-transform " +
    (disabled
      ? "bg-[#33343D] text-[#93949F] cursor-not-allowed grayscale "
      : "bg-[#E10600] text-white hover:-translate-y-0.5 cursor-pointer ") +
    className;

  if (href && !disabled) {
    return (
      <a href={href} onClick={onClick} className={baseClasses}>
        {children}
        {showArrow && <IconArrow className="h-4 w-4" />}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={baseClasses}
      disabled={disabled}
    >
      {children}
      {showArrow && <IconArrow className="h-4 w-4" />}
    </button>
  );
}
