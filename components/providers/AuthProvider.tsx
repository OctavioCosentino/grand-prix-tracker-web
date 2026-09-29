"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { bookingQueryKeys } from "@/hooks/useBooking";

interface AuthContextValue {
  user: User | null;
  /** true hasta que Supabase informa la sesión inicial. */
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Sesión del usuario para los Client Components.
 * Proteger rutas NO depende de esto: eso lo hacen el proxy y app/(private)/layout.tsx.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    // Dispara INITIAL_SESSION apenas se suscribe, así que no hace falta pedir la sesión aparte.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
      // Las reservas y tarjetas cacheadas son del usuario anterior.
      if (event === "SIGNED_OUT") {
        queryClient.removeQueries({ queryKey: bookingQueryKeys.bookings });
        queryClient.removeQueries({ queryKey: bookingQueryKeys.paymentMethods });
      }
    });
    return () => data.subscription.unsubscribe();
  }, [queryClient]);

  const signOut = async () => {
    await createClient().auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth tiene que usarse dentro de <AuthProvider>");
  return context;
}
