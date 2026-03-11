import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "project-restaurant-search-5.onrender.com",
      },
    ],
  },

  transpilePackages: ["leaflet"],
};

export default nextConfig;