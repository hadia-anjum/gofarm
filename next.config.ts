import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // TypeScript errors ignore karein
  },
  images: {
    unoptimized: true, // Images ko local rakhne ke liye
  }
};

export default nextConfig;
