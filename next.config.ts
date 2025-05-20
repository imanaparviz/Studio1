import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // Output standalone build for containerized deployments
  output: "standalone",

  // Environment variable configuration
  env: {
    // Public variables - will be exposed to the browser
    NEXT_PUBLIC_DEFAULT_LANGUAGE:
      process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "de",
  },

  // For Vercel deployments, sharp is usually handled automatically.
  // If deploying elsewhere or facing issues, you might need:
  // experimental: {
  //   serverComponentsExternalPackages: ['sharp', 'svgo'], // svgo is used client-side, sharp server-side
  // },

  // Ensure server-side environment variables aren't included in client bundles
  // This is handled automatically by Next.js but making it explicit
  serverRuntimeConfig: {
    // Private server-only variables
    // These are not exposed to the browser
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY,
  },
  publicRuntimeConfig: {
    // Public variables that are available on both server and client
    // Do NOT put sensitive information here
    defaultLanguage: process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "de",
  },
};

export default nextConfig;
