import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "12mb" },
  },
  logging: {
    browserToTerminal: true,
    fetches: { fullUrl: true },
  },
};

export default nextConfig;
