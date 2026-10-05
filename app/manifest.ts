import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Qudani",
    short_name: "Qudani",
    description: "Kalkulator pajak & emas serta laporan closing harian Qudani.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f5f6f3",
    theme_color: "#0c7a55",
    orientation: "portrait",
    lang: "ms",
    categories: ["business", "finance", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Kalkulator", short_name: "Kalkulator", url: "/", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Staff Closing", short_name: "Closing", url: "/closing", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
