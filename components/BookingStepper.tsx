import React from "react";
import { BOOKING_STEPS, BookingStep } from "@/utils/booking";

interface BookingStepperProps {
  current: BookingStep;
  isStepEnabled: (step: BookingStep) => boolean;
  onStepClick: (step: BookingStep) => void;
}

export default function BookingStepper({
  current,
  isStepEnabled,
  onStepClick,
}: BookingStepperProps) {
  const currentIndex = BOOKING_STEPS.findIndex((s) => s.id === current);

  return (
    <nav aria-label="Pasos de la reserva" className="mt-8">
      <ol className="flex flex-wrap gap-2">
        {BOOKING_STEPS.map((step, i) => {
          const isActive = step.id === current;
          const isDone = i < currentIndex;
          const enabled = isStepEnabled(step.id);

          return (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => onStepClick(step.id)}
                disabled={!enabled}
                aria-current={isActive ? "step" : undefined}
                className={`flex items-center gap-2 rounded-sm border px-4 py-2 font-mono text-[11px] uppercase tracking-widest transition-colors ${
                  isActive
                    ? "border-[#E10600] bg-[#E10600]/10 text-[#F3F1EA]"
                    : isDone
                      ? "border-[#33343D] bg-[#131318] text-[#D8D7CE] hover:border-[#5C5D66] cursor-pointer"
                      : "border-[#1C1D24] bg-[#0E0E13] text-[#5C5D66] enabled:hover:border-[#33343D] enabled:cursor-pointer"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <span className={isActive ? "text-[#E10600]" : ""}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {step.label}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
