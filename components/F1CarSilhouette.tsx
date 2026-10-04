import React from "react";

export function F1CarSilhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 65" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Alerón Trasero */}
      <path d="M10,20 h20 v20 h-20 z" />
      {/* Chasis y Cockpit */}
      <path d="M30,35 l20,-10 h20 l20,-15 h30 l20,15 h30 l30,5 l20,5 v5 h-190 z" />
      {/* Alerón Delantero */}
      <path d="M220,35 l20,5 v5 h-20 z" />
      {/* Neumáticos */}
      <circle cx="50" cy="45" r="15" />
      <circle cx="190" cy="45" r="15" />
      {/* Llantas */}
      <circle cx="50" cy="45" r="7" fill="#0E0E13" />
      <circle cx="190" cy="45" r="7" fill="#0E0E13" />
    </svg>
  );
}
