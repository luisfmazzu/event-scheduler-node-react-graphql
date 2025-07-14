/**
 * Next.js Configuration for Event Scheduler
 * 
 * This configuration optimizes the Next.js build process for GraphQL/Relay
 * development and includes settings for performance and development experience.
 * 
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,
  
  // Optimize images (useful for event photos in the future)
  images: {
    domains: [], // Add image domains when needed
    formats: ['image/webp', 'image/avif'],
  },
  
  // Environment variables available to the client
  env: {
    GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
  },
  
  // Webpack configuration for Relay
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add Relay plugin for better integration
    config.plugins.push(
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(dev),
      })
    );
    
    // Bundle analyzer for production builds
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      );
    }
    
    return config;
  },
  
  // Experimental features
  experimental: {
    // Enable typed routes for better TypeScript experience
    typedRoutes: true,
  },
  
  // Compiler options
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Development-only settings
  ...(process.env.NODE_ENV === 'development' && {
    // Disable x-powered-by header
    poweredByHeader: false,
    // Enable source maps in development
    productionBrowserSourceMaps: false,
  }),
};

module.exports = nextConfig; 