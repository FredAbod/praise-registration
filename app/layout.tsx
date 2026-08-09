import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "The Praise Gathering — Praise Unfiltered 1.0",
  description:
    "Register for Praise Unfiltered 1.0 with Gbolahan Sings — 6th September 2026, 3PM. Limited to 50 guests.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Praise Unfiltered 1.0 — The Praise Gathering",
    description:
      "Gbolahan Sings · 6th September 2026 · 3PM. Limited seats — reserve yours.",
    images: ["/flyer.jpeg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Praise Unfiltered 1.0 — The Praise Gathering",
    description:
      "Gbolahan Sings · 6th September 2026 · 3PM. Limited seats — reserve yours.",
    images: ["/flyer.jpeg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d2f2c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-body bg-navy-900 text-cream-50 antialiased">
        {children}
      </body>
    </html>
  );
}
