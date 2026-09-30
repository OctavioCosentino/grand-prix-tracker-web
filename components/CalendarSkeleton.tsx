import React from "react";

export function DestinationCardSkeleton() {
  return (
    <div className="relative h-[420px] overflow-hidden rounded-md border border-[#1C1D24] bg-[#0E0E13] shadow-lg animate-pulse">
      {/* Shimmer gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#1C1D24]/10 to-[#0B0B10]" />

      {/* Top-left Badge Skeleton */}
      <div className="absolute left-4 top-4 h-6 w-20 rounded-sm border border-[#23242E] bg-[#171821]" />

      {/* Bottom Card Content Skeleton */}
      <div className="absolute inset-x-0 bottom-0 p-6 space-y-3">
        {/* GP Title line */}
        <div className="h-6 w-3/4 rounded-sm bg-[#1C1D24]" />
        {/* Circuit Name line */}
        <div className="h-3.5 w-1/2 rounded-sm bg-[#16171F]" />
        {/* Telemetry Accent Bar */}
        <div className="h-1 w-12 rounded-full bg-[#E10600]/40" />
      </div>
    </div>
  );
}

export default function CalendarSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <DestinationCardSkeleton key={i} />
      ))}
    </div>
  );
}
