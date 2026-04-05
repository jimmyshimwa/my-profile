"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/data";

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <>
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

        {/* Desktop links */}
        <ul className="nav-desktop" style={{ display: "flex", gap: "2rem", listStyle: "none" }}>
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

        {/* Hamburger button (mobile only) */}
        <button
          className="nav-hamburger"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "none",
            flexDirection: "column",
            gap: "5px",
            padding: "4px",
          }}
        >
          <span style={{ display: "block", width: "22px", height: "1.5px", background: "var(--off-white)", transition: "transform 0.2s", transform: open ? "translateY(6.5px) rotate(45deg)" : "none" }} />
          <span style={{ display: "block", width: "22px", height: "1.5px", background: "var(--off-white)", opacity: open ? 0 : 1, transition: "opacity 0.2s" }} />
          <span style={{ display: "block", width: "22px", height: "1.5px", background: "var(--off-white)", transition: "transform 0.2s", transform: open ? "translateY(-6.5px) rotate(-45deg)" : "none" }} />
        </button>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 99,
          background: "var(--background, #0a0a0a)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "2.5rem",
        }}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "1.1rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--off-white)",
                textDecoration: "none",
                opacity: 0.8,
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}