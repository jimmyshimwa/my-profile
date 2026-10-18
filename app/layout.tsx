import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { themeScript } from "@/lib/theme";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const satoshi = localFont({
  src: [
    { path: "./fonts/Satoshi-Variable.woff2", style: "normal", weight: "300 900" },
    { path: "./fonts/Satoshi-VariableItalic.woff2", style: "italic", weight: "300 900" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jimmy Shimwa: founder, engineer and project manager in Kigali",
    template: "%s | Jimmy Shimwa",
  },
  description:
    "Jimmy Shimwa builds companies, software and teams in Kigali, Rwanda. Founder of The Forge Hub, CEO of Smart Clinics Exchange in Rwanda.",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Jimmy Shimwa", locale: "en" },
  twitter: { card: "summary_large_image", creator: "@jimmyshimwa" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f0f1f4" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0d10" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="light" className={satoshi.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-svh">{children}</body>
    </html>
  );
}
