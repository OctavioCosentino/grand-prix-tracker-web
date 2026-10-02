"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface CircuitViewerProps {
  imgUrl: string;
}

export default function CircuitViewer({ imgUrl }: CircuitViewerProps) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = (step = 0.5) => setScale((s) => Math.min(s + step, 4));
  const handleZoomOut = (step = 0.5) => {
    setScale((s) => {
      const newScale = Math.max(s - step, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 }); // reset pan on full un-zoom
      return newScale;
    });
  };

  const startDrag = (clientX: number, clientY: number) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStart.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const doDrag = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPosition({ 
      x: clientX - dragStart.current.x, 
      y: clientY - dragStart.current.y 
    });
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  // Prevenir scroll de la página al usar la ruedita sobre el mapa
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // Evita que la página scrollee
      if (e.deltaY < 0) {
        handleZoomIn(0.25);
      } else if (e.deltaY > 0) {
        handleZoomOut(0.25);
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  return (
    <div 
      className="relative flex flex-col h-[500px] md:h-[600px] w-full rounded-md border border-[#1C1D24] bg-[#F3F1EA] overflow-hidden select-none"
      style={{
        backgroundImage: 'linear-gradient(rgba(28, 29, 36, 0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(28, 29, 36, 0.07) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
        backgroundPosition: 'center center'
      }}
    >
      
      {/* TOOLBAR */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          type="button"
          onClick={() => handleZoomOut(0.5)}
          disabled={scale <= 1}
          className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#33343D] bg-[#131318] text-[#F3F1EA] hover:border-[#E10600] disabled:opacity-50 disabled:hover:border-[#33343D] shadow-md transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
        </button>
        <button
          type="button"
          onClick={() => handleZoomIn(0.5)}
          disabled={scale >= 4}
          className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#33343D] bg-[#131318] text-[#F3F1EA] hover:border-[#E10600] disabled:opacity-50 shadow-md transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      {/* VIEWER PORT */}
      <div 
        ref={containerRef}
        className={`relative w-full h-full ${scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'}`}
        onMouseDown={(e) => startDrag(e.clientX, e.clientY)}
        onMouseMove={(e) => doDrag(e.clientX, e.clientY)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchMove={(e) => doDrag(e.touches[0].clientX, e.touches[0].clientY)}
        onTouchEnd={endDrag}
      >
        <div 
          className="absolute inset-0 w-full h-full ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transitionDuration: isDragging ? '0ms' : '200ms',
            transitionProperty: 'transform'
          }}
        >
          {imgUrl ? (
            <Image
              src={imgUrl}
              alt="Mapa del Circuito"
              fill
              draggable={false}
              className="object-contain p-6 pointer-events-none"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-[#0B0B10] font-mono text-xs font-bold tracking-widest">MAPA NO DISPONIBLE</span>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}
