import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "55mb" },
  },
  logging: {
    browserToTerminal: true,
    fetches: { fullUrl: true },
  },
};

export default nextConfig;
