"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface WarningModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  severity?: "warning" | "danger"; // warning = amarillo, danger = rojo
  onConfirm: () => void;
  onCancel: () => void;
}

export default function WarningModal({
  isOpen,
  title,
  message,
  confirmText = "Continuar",
  cancelText = "Cancelar",
  severity = "warning",
  onConfirm,
  onCancel,
}: WarningModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const isDanger = severity === "danger";
  const accentColor = isDanger ? "#E10600" : "#E7B33C";
  const flagText = isDanger ? "BANDERA ROJA" : "BANDERA AMARILLA";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0B10]/80 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-md border border-[#1C1D24] bg-[#0E0E13] shadow-2xl">
        <div
          className="absolute bottom-0 left-0 top-0 w-1.5"
          style={{ backgroundColor: accentColor }}
        />

        <div
          className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-10 blur-3xl"
          style={{ backgroundColor: accentColor }}
        />

        <div className="p-8">
          <div className="mb-2 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="h-5 w-5"
              style={{ color: accentColor }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span
              className="font-mono text-[10px] tracking-[0.2em]"
              style={{ color: accentColor }}
            >
              {flagText}
            </span>
          </div>

          <h2 className="font-display mt-4 text-2xl font-900 tracking-tight text-[#F3F1EA]">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#93949F]">
            {message}
          </p>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              onClick={onCancel}
              className="gpt-outline-btn rounded-sm border border-[#33343D] bg-transparent px-6 py-2.5 text-sm font-semibold text-[#F3F1EA] transition-colors hover:border-[#93949F] hover:bg-[#1C1D24] cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="inline-flex items-center justify-center rounded-sm px-6 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 cursor-pointer"
              style={{
                backgroundColor: accentColor,
                color: isDanger ? "#FFFFFF" : "#0B0B10",
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
