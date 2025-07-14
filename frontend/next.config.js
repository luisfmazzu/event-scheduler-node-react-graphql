/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
  },
  compiler: {
    // Enable Relay compiler for Next.js
    relay: {
      src: './src',
      artifactDirectory: './src/__generated__',
      language: 'typescript',
    },
  },
  webpack: (config, { dev, isServer }) => {
    // Ensure __generated__ files are included in builds
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig; 