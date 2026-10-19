import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { NextConfig } from 'next';

const apiInternalUrl = process.env.API_INTERNAL_URL ?? 'http://localhost:4000';
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const nextConfig: NextConfig = {
  // Permite verificar un build sin pisar el `.next` de un `next dev` en marcha.
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  outputFileTracingRoot: repoRoot,
  transpilePackages: ['@repo/contracts'],
  webpack: (config) => {
    // @repo/contracts uses NodeNext-style `.js` imports that map to `.ts` sources.
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.tsx', '.js'],
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiInternalUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
