"use client";

import Link from "next/link";
import { NAV_LINKS } from "@/lib/data";

export default function Nav() {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0,
      zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "1.5rem 2.5rem",
      mixBlendMode: "difference",
    }}>
      <Link href="#hero" style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.78rem",
        letterSpacing: "0.08em",
        color: "var(--off-white)",
        textDecoration: "none",
      }}>
        JS_
      </Link>
      <ul style={{ display: "flex", gap: "2rem", listStyle: "none" }}>
        {NAV_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.72rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--off-white)",
                textDecoration: "none",
                opacity: 0.6,
                transition: "opacity 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.6")}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
