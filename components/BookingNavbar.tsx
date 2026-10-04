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
            className="group flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-[#0B0B10]/50 text-white transition-colors hover:bg-white hover:text-[#0B0B10]"
            aria-label="Volver atrás"
          >
            <ArrowLeft strokeWidth={3} className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
          </button>

          <Home />
        </div>
      </header>
    </>
  );
}

