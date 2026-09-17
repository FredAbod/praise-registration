import type { Metadata, Viewport } from "next";
import { Libre_Baskerville, Source_Sans_3 } from "next/font/google";
import { EVENT } from "@/lib/event";
import "./globals.css";

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const libre = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: `${EVENT.title} — ${EVENT.theme}`,
  description: `${EVENT.org}. ${EVENT.title}: ${EVENT.theme}. ${EVENT.dates}. ${EVENT.venue}. Registration fee ₦500.`,
  icons: {
    icon: "/flyer.jpg",
    shortcut: "/flyer.jpg",
    apple: "/flyer.jpg",
  },
  openGraph: {
    title: `${EVENT.title} — ${EVENT.theme}`,
    description: `${EVENT.dates} · ${EVENT.venueShort}`,
    images: ["/flyer.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: `${EVENT.title} — ${EVENT.theme}`,
    description: `${EVENT.dates} · ${EVENT.venueShort}`,
    images: ["/flyer.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#241810",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sourceSans.variable} ${libre.variable}`}>
      <body className="font-body bg-ink-950 text-parchment-50 antialiased">
        {children}
      </body>
    </html>
  );
}
