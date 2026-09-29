import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente de Supabase para Client Components.
 * La sesión vive en cookies, así el server (proxy y layouts) puede leerla también.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
