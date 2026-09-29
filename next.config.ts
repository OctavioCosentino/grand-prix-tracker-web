import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
};

export default nextConfig;
