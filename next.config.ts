import type {NextConfig} from 'next';

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
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // For Vercel deployments, sharp is usually handled automatically.
  // If deploying elsewhere or facing issues, you might need:
  // experimental: {
  //   serverComponentsExternalPackages: ['sharp', 'svgo'], // svgo is used client-side, sharp server-side
  // },
};

export default nextConfig;
