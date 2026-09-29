import React from "react";
import BookingNavbar from "@/components/BookingNavbar";

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[#0B0B10] text-[#F3F1EA] selection:bg-[#E10600] selection:text-white">
      {/* Grilla de fondo temática F1 */}
      <div className="gpt-hud-grid pointer-events-none fixed inset-0 opacity-20" />
      
      <BookingNavbar />
      
      <main className="relative z-10 pt-24">
        {children}
      </main>
    </div>
  );
}

