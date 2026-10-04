import React from "react";
import Home from "./Home";
import FooterColumn from "./FooterColumn";
import { productoLinks, proyectoLinks, contactoLinks } from "@/utils/links";

export default function Footer() {
  return (
    <footer className="border-t border-[#1C1D24] bg-[#0E0E13]">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <Home disableHoverScale={true} />
            <p className="mt-4 max-w-xs text-sm text-[#5C5D66]">
              Hoteles, translados, entradas y vuelos para tu próximo Gran
              Premio, en un solo lugar.
            </p>
          </div>

          {/* Columnas de navegación */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterColumn title="PRODUCTO" links={productoLinks} />
            <FooterColumn title="PROYECTO" links={proyectoLinks} />
            <FooterColumn title="CONTACTO" links={contactoLinks} />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#1C1D24] pt-6 text-xs text-[#5C5D66] sm:flex-row">
          <p>© {new Date().getFullYear()} GrandPrix Tracker</p>
          <p className="font-mono tracking-[0.2em]">P1 · SIEMPRE EN CARRERA</p>
        </div>
      </div>
    </footer>
  );
}
