import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  serverExternalPackages: ["mongoose"],
  // Explicitly set the root to avoid detecting parent lockfiles
  experimental: {
    turbo: {
      root: "./",
    },
  },
};

export default nextConfig;
