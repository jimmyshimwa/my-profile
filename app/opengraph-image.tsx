import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Jimmy Shimwa, Kigali: founder, engineer and project manager";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  // ImageResponse needs a static font file (TTF/OTF/WOFF), not WOFF2.
  const font = await readFile(join(process.cwd(), "app/fonts/Satoshi-Bold.woff")).catch(() => null);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#070b1c",
          color: "#e7ecf7",
          fontFamily: font ? "Satoshi" : "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#93a0be" }}>Kigali, 1,567 m</div>
        <svg width="1056" height="120" viewBox="0 0 1056 120" style={{ position: "absolute", left: 72, top: 250 }}>
          <path d="M0 90 C 180 10, 300 120, 470 60 S 760 0, 1056 70" stroke="#4d7dff" strokeWidth="6" fill="none" strokeLinecap="round" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 112, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>Jimmy Shimwa</div>
          <div style={{ fontSize: 36, marginTop: 20, color: "#93a0be" }}>Founder, engineer and project manager</div>
        </div>
      </div>
    ),
    { ...size, fonts: font ? [{ name: "Satoshi", data: font, weight: 700, style: "normal" }] : [] },
  );
}
