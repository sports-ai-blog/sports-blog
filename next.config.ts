import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Länder-Flaggen/Logos aus der ESPN-API
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a.espncdn.com',
        pathname: '/i/teamlogos/**',
      },
    ],
  },
};

export default nextConfig;
