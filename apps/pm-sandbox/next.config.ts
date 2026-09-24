import type { NextConfig } from 'next';
import path from 'node:path';
const nextConfig: NextConfig = {
  transpilePackages: ['@austin/design-criteria'],
  outputFileTracingRoot: path.join(__dirname, '../..'),
};
export default nextConfig;
