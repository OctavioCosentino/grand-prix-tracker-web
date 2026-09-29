import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Rutas de app/(private). El route group no aparece en la URL, así que acá van
 * los paths reales. Es una primera barrera: el control definitivo está en
 * app/(private)/layout.tsx, que protege cualquier página nueva de esa carpeta.
 */
const PRIVATE_PREFIXES = ["/booking", "/profile"];

/** Pantallas que no tienen sentido con la sesión iniciada. */
const GUEST_ONLY_PREFIXES = ["/login", "/register"];

function matchesPrefix(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Refresca el token de Supabase en cada request (los Server Components no pueden
 * escribir cookies) y redirige según haya o no sesión.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // No meter código entre createServerClient y getClaims: si el token no se
  // refresca acá, los usuarios pueden quedar deslogueados al azar.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);
  const { pathname, search } = request.nextUrl;

  if (!isLoggedIn && matchesPrefix(pathname, PRIVATE_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", `${pathname}${search}`);
    return redirectKeepingCookies(url, supabaseResponse);
  }

  if (isLoggedIn && matchesPrefix(pathname, GUEST_ONLY_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return redirectKeepingCookies(url, supabaseResponse);
  }

  return supabaseResponse;
}

/** Un redirect nuevo pierde las cookies refrescadas: se copian a mano. */
function redirectKeepingCookies(url: URL, supabaseResponse: NextResponse) {
  const redirect = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
