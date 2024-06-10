/** @type {import('next').NextConfig} */

const PORT_FRONTEND = process.env.PORT_FRONTEND || 3000;
const PORT_BACKEND = process.env.PORT_BACKEND || 8000;
const BACKEND_URL = process.env.BACKEND_URL || `http://127.0.0.1:${PORT_BACKEND}`;
const FRONTEND_URL = process.env.FRONTEND_URL || `http://127.0.0.1:${PORT_FRONTEND}`;

const ACCESS_CONTROL_ALLOW_CREDENTIALS= process.env.ACCESS_CONTROL_ALLOW_CREDENTIALS || "true"
const ACCESS_CONTROL_ALLOW_ORIGIN= process.env.ACCESS_CONTROL_ALLOW_ORIGIN || "*"
const ACCESS_CONTROL_ALLOW_METHODS= process.env.ACCESS_CONTROL_ALLOW_METHODS || "GET,OPTIONS,PATCH,DELETE,POST,PUT"
const ACCESS_CONTROL_ALLOW_HEADERS= process.env.ACCESS_CONTROL_ALLOW_HEADERS || "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"

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
  async headers() {
    return [
        {
            // matching all API routes
            source: "/api/:path*",
            headers: [
                { key: "Access-Control-Allow-Credentials", value: ACCESS_CONTROL_ALLOW_CREDENTIALS },
                { key: "Access-Control-Allow-Origin", value: ACCESS_CONTROL_ALLOW_ORIGIN },
                { key: "Access-Control-Allow-Methods", value: ACCESS_CONTROL_ALLOW_METHODS },
                { key: "Access-Control-Allow-Headers", value: ACCESS_CONTROL_ALLOW_HEADERS },
            ]
        }
    ]
  },
  env: {
    PORT_FRONTEND: `${PORT_FRONTEND}`,
    PORT_BACKEND: `${PORT_BACKEND}`,
    FRONTEND_URL: `${FRONTEND_URL}`,
    BACKEND_URL: `${BACKEND_URL}`,
  },
};

module.exports = nextConfig;
