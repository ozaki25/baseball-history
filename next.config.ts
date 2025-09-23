import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static Site Generation for Vercel deployment (comment out for npm start)
  // output: 'export',
  
  // Enable trailing slashes for consistent routing
  trailingSlash: true,
  
  // Disable image optimization for static export
  images: {
    unoptimized: true
  },
  
  // PWA configuration
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
