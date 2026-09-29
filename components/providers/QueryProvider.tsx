"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEvents } from "@/hooks/useEvents";
import { isUnauthorized } from "@/services/http";

/**
 * Componente interno que se monta una única vez al cargar la aplicación.
 * Dispara inmediatamente la consulta de eventos contra el backend de Render
 * para despertarlo en caso de estar en cold-start y almacenar los datos en cache.
 */
function EventsInitializer() {
  useEvents();
  return null;
}

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            gcTime: 1000 * 60 * 60 * 24, // 24 horas en memoria cache
            // Los reintentos son para el cold start de Render; un 401 no se arregla reintentando
            retry: (failureCount, error) => !isUnauthorized(error) && failureCount < 4,
            retryDelay: (attemptIndex) =>
              Math.min(2000 * (attemptIndex + 1), 10000),
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <EventsInitializer />
      {children}
    </QueryClientProvider>
  );
}
