import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Todo lo que esté dentro de app/(private) requiere sesión.
 * getClaims valida el JWT (no confía solo en la cookie). El proxy ya redirige
 * antes con ?next=; esto cubre cualquier ruta nueva que no esté en su lista.
 */
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  return <>{children}</>;
}
