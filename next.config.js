/** @type {import('next').NextConfig} */

const PORT_BACKEND = process.env.PORT_BACKEND || 8000;
const BACKEND_URL = process.env.BACKEND_URL || `http://127.0.0.1:${PORT_BACKEND}`;

const nextConfig = {
  env: {
    SIMSCORE_API: `${BACKEND_URL}`,
  },
  rewrites: async () => [
    {
      source: `/fastapi/:path*`,
      destination: `${BACKEND_URL}/:path*`,
    },
  ],
};

module.exports = nextConfig;
