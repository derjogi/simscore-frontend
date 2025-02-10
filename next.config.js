/** @type {import('next').NextConfig} */

const BACKEND_URL = process.env.NEXT_PUBLIC_SIMSCORE_API || `http://127.0.0.1:8000`;

const nextConfig = {
  rewrites: async () => [
    {
      source: `/fastapi/:path*`,
      destination: `${BACKEND_URL}/:path*`,
    },
  ],
  experimental: {
    proxyTimeout: 300000
  }
};

module.exports = nextConfig;
