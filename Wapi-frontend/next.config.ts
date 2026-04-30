import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Monorepo root (`wapi/`) so `output: "standalone"` emits a flat `.next/standalone` for Docker. */
const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  output: "standalone",
  reactStrictMode: false,
  // Use real env at build/deploy time (e.g. botfeed.io + your API host). Falls back to local API.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api",
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
    NEXT_PUBLIC_STORAGE_URL: process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:5000",
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL ?? process.env.NEXT_PUBLIC_STORAGE_URL ?? "http://localhost:5000",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
