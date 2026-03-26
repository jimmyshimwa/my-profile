import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jimmy Shimwa — Developer",
  description: "Full-stack developer based in Kigali, Rwanda. Crafting fast, purposeful digital products — from idea to deployment.",
  keywords: ["developer", "full-stack", "React", "Next.js", "Kigali", "Rwanda"],
  authors: [{ name: "Jimmy Shimwa" }],
  openGraph: {
    title: "Jimmy Shimwa — Developer",
    description: "Full-stack developer crafting fast, purposeful digital products.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:ital,wght@0,300;0,400;1,300&family=Instrument+Serif:ital@0;1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}