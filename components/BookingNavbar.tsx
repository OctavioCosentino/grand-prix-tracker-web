"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Home from "./Home";

export default function BookingNavbar() {
  const router = useRouter();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#1C1D24] bg-[#0B0B10]/90 px-6 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            onClick={() => router.back()}
            className="booking-back-btn group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-[#33343D] bg-[#131318] text-[#F3F1EA] transition-all hover:border-[#E10600] hover:text-[#E10600]"
            aria-label="Volver atrás"
          >
            <ArrowLeft strokeWidth={2.5} className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
          </button>

          <Home />
        </div>
      </header>
    </>
  );
}

