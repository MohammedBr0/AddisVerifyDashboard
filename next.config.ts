import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for Vercel deployment
  images: {
    unoptimized: false, // Enable Vercel's image optimization
    domains: ['localhost', 'vercel.app'],
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  // Environment variables for Vercel
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
  },
  // Webpack configuration for better bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
};

export default nextConfig;
