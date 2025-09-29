/* eslint-disable @typescript-eslint/no-explicit-any */
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

  // Webpack configuration to avoid build errors and handle server-only modules
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    config.optimization.minimize = false;

    // Exclude server-only modules from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }

    return config;
  },
};

export default nextConfig;
