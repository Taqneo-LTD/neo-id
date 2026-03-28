import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.ufs.sh",
      },
      {
        protocol: "https",
        hostname: "*.uploadthing.com",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/**": ["./lib/generated/prisma/**/*"],
  },
};

export default nextConfig;
