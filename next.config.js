/** @type {import('next').NextConfig} */

const PORT_FRONTEND = process.env.PORT_FRONTEND || 3000;
const PORT_BACKEND = process.env.PORT_BACKEND || 8000;
const BACKEND_URL = process.env.BACKEND_URL || `http://127.0.0.1:${PORT_BACKEND}`;

const nextConfig = {
  rewrites: async () => {
    return [
      {
        source: "/api/:path*",
        destination:
          process.env.NODE_ENV === "development"
            ? `http://127.0.0.1:${PORT_BACKEND}/api/:path*`
            : "/api/",
      },
      {
        source: "/docs",
        destination:
          process.env.NODE_ENV === "development"
            ? `http://127.0.0.1:${PORT_BACKEND}/docs`
            : "/api/docs",
      },
      {
        source: "/openapi.json",
        destination:
          process.env.NODE_ENV === "development"
            ? `http://127.0.0.1:${PORT_BACKEND}/openapi.json`
            : "/api/openapi.json",
      },
    ];
  },
  env: {
    PORT_FRONTEND: `${PORT_FRONTEND}`,
    PORT_BACKEND: `${PORT_BACKEND}`,
    BACKEND_URL: `${BACKEND_URL}`,
  },
};

module.exports = nextConfig;
