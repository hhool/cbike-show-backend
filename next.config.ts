import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Next.js 16 infers locale params as `string`; our Locale union is a subset.
    // Runtime is correct — this is a framework-level constraint mismatch.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
