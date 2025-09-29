import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Static Site Generation for deployment
  output: 'export',

  // Enable trailing slashes for consistent routing
  trailingSlash: true,

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
