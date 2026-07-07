import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
  },
  // Yeh line automatic system prefetching loop ko block kar degi
  productionBrowserSourceMaps: false,
};

export default nextConfig;
