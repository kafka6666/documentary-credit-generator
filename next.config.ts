import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "127.0.0.1:52092", "127.0.0.1:50225"],
    },
  },
};

export default nextConfig;
