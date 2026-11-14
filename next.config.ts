import type { NextConfig } from "next";

/** Origen (protocolo + host + puerto) de una URL, sin path ni barra final. */
function toOrigin(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url.trim()).origin;
  } catch {
    return null;
  }
}

// Mismo fallback que usan los servicios cuando no está la variable
const apiOrigin = toOrigin(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
);
const supabaseOrigin = toOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL);
// Realtime de Supabase va por WebSocket al mismo host
const supabaseWsOrigin = supabaseOrigin?.replace(/^http/, "ws") ?? null;

const isDev = process.env.NODE_ENV !== "production";

const contentSecurityPolicy = [
  "default-src 'self'",
  // 'unsafe-inline': script del tema en app/layout.tsx y scripts inline de Next.
  // 'unsafe-eval' solo en desarrollo: lo usan React/Next para el hot reload y los stacks de error.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://cf.bstatic.com",
  "font-src 'self' data:",
  "media-src 'self'",
  [
    "connect-src 'self'",
    apiOrigin,
    supabaseOrigin,
    supabaseWsOrigin,
    // Servicios que consulta /calentando-motores
    "https://microservice-ticketing-gp.onrender.com",
    "https://f1-ticketing-legacy-soap.onrender.com",
  ]
    .filter(Boolean)
    .join(" "),
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    // Imágenes de hoteles que devuelve GET /events/{id}/hotels
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cf.bstatic.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
