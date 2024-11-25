import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
