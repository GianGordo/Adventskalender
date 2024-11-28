const nextConfig = {
  reactStrictMode: true,
  webpack: (config: { externals: any[]; }, { isServer }: any) => {
    if (isServer) {
      config.externals = [
        ...config.externals,
        'firebase-admin', // Exclude firebase-admin from bundling
        'node:stream',    // Exclude node:stream from bundling
        'zlib',           // Add other related modules if needed
      ];
    }

    return config;
  },
};

module.exports = nextConfig;
