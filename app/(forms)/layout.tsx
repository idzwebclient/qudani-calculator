import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { AppHeader } from "@/components/app-header";
import { PwaRegistration } from "@/components/pwa-registration";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

// Borang guna layout akar sendiri supaya gaya borang (Tailwind, body) tidak
// bercampur dengan gaya kalkulator.
export const metadata: Metadata = {
  title: { default: "Form", template: "%s · Qudani" },
  description: "Jana dan cetak borang rasmi Qudani Jewels.",
  applicationName: "Qudani",
  appleWebApp: {
    capable: true,
    title: "Qudani",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c7a55",
};

export default function FormsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ms" className={manrope.variable}>
      <body>
        <PwaRegistration />
        <AppHeader />
        {children}
      </body>
    </html>
  );
}
