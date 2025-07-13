import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Increase body size limit for file uploads (e.g., 10 MB)
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
