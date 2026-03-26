"use client";

import Link from "next/link";
import SectionLabel from "./SectionLabel";
import { SOCIAL_LINKS } from "@/lib/data";

export default function Contact() {
  return (
    <section
      id="contact"
      style={{
        minHeight: "100vh",
        padding: "6rem 2.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ghost background initials */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          fontSize: "30vw",
          fontWeight: 800,
          color: "transparent",
          WebkitTextStroke: "1px rgba(200,245,90,0.04)",
          pointerEvents: "none",
          userSelect: "none",
          letterSpacing: "-0.05em",
          lineHeight: 1,
          fontFamily: "var(--font-display)",
        }}
      >
        JS
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <SectionLabel>005 — Get in touch</SectionLabel>

        <h2
          className="reveal"
          style={{
            fontSize: "clamp(3rem, 8vw, 9rem)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
            marginBottom: "3rem",
            fontFamily: "var(--font-display)",
          }}
        >
          Let&apos;s build
          <br />
          something{" "}
          <span
            style={{
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              fontWeight: 400,
              color: "var(--accent)",
            }}
          >
            great
          </span>
          <br />
          together.
        </h2>

        <a
          href="mailto:jimmyshimwa@gmail.com"
          className="reveal"
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.8rem)",
            fontFamily: "var(--font-mono)",
            color: "var(--off-white)",
            textDecoration: "none",
            borderBottom: "1px solid rgba(240,237,230,0.2)",
            paddingBottom: "0.4rem",
            display: "inline-block",
            transition: "color 0.25s, border-color 0.25s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--accent)";
            e.currentTarget.style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--off-white)";
            e.currentTarget.style.borderColor = "rgba(240,237,230,0.2)";
          }}
        >
          jimmyshimwa@gmail.com
        </a>

        <div
          className="reveal"
          style={{
            display: "flex",
            gap: "2rem",
            flexWrap: "wrap",
            marginTop: "3rem",
          }}
        >
          {SOCIAL_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.78rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--muted)",
                textDecoration: "none",
                paddingBottom: "0.3rem",
                borderBottom: "1px solid var(--border)",
                transition: "color 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--accent)";
                e.currentTarget.style.borderColor = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--muted)";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
