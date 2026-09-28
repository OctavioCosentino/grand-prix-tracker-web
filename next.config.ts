import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Imágenes de hoteles que devuelve GET /events/{id}/hotels
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
