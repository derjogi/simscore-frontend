/** @type {import('next').NextConfig} */

const PORT_FRONTEND = process.env.PORT_FRONTEND || 3000;
const PORT_BACKEND = process.env.PORT_BACKEND || 8000;
const BACKEND_URL = process.env.BACKEND_URL || `http://127.0.0.1:${PORT_BACKEND}`;
const FRONTEND_URL = process.env.FRONTEND_URL || `http://127.0.0.1:${PORT_FRONTEND}`;

const nextConfig = {
  env: {
    PORT_FRONTEND: `${PORT_FRONTEND}`,
    PORT_BACKEND: `${PORT_BACKEND}`,
    FRONTEND_URL: `${FRONTEND_URL}`,
    SIMSCORE_API: `${BACKEND_URL}`,
  },
};

module.exports = nextConfig;
