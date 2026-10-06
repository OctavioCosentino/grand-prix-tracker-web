"use client";

import React from "react";

export interface EmptyStateProps {
  message: string;
  className?: string;
  children?: React.ReactNode;
}

export default function EmptyState({ message, className = "h-64", children }: EmptyStateProps) {
  return (
    <div className={"empty-state-card relative flex flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-[#33343D] bg-[#0E0E13] " + className}>
      <div
        className="empty-state-photo absolute inset-0 z-0 bg-cover bg-center opacity-30 grayscale"
        style={{ backgroundImage: "url('/empty.webp')" }}
      />
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 text-center">
        <p className="empty-state-text font-mono text-sm uppercase tracking-widest text-[#ffffff] drop-shadow-md">
          {message}
        </p>
        {children}
      </div>
    </div>
  );
}
