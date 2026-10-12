import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: __dirname },
  async redirects() {
    // Pautan lama /kalkulator kini terus ke halaman utama, /ringkas ke /report.
    return [
      { source: "/kalkulator/:path*", destination: "/", permanent: true },
      { source: "/ringkas", destination: "/report", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;
