"use client";

import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import Three.js scene (client-only, no SSR)
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

export default function Hero() {
  return (
    <>
      <style>{`
        .view-work-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.8rem;
          padding: 1rem 2rem;
          border: 1px solid rgba(200, 245, 90, 0.4);
          color: var(--accent);
          text-decoration: none;
          font-size: 0.8rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          background-color: transparent;
        }

        .view-work-btn:hover {
          background-color: var(--accent);
          color: #000;
          border-color: var(--accent);
        }

        .view-work-arrow {
          display: inline-block;
          transition: transform 0.3s ease;
        }

        .view-work-btn:hover .view-work-arrow {
          transform: rotate(45deg) translate(2px, -2px);
        }
      `}</style>
    <section
      id="hero"
      className="hero-section"
      style={{
        minHeight:      "100vh",
        display:        "flex",
        flexDirection:  "column",
        justifyContent: "flex-end",
        paddingBottom:  "5rem",
        position:       "relative",
        overflow:       "hidden",
      }}
    >
      {/* ── 3D Neural Lattice ─────────────────────────────────── */}
      <HeroScene />

      {/* ── Ghost background text ─────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position:          "absolute",
          top:               "50%",
          left:              "50%",
          transform:         "translate(-50%, -52%)",
          fontSize:          "clamp(120px, 20vw, 240px)",
          fontWeight:        800,
          color:             "transparent",
          WebkitTextStroke:  "1px rgba(200,245,90,0.06)",
          whiteSpace:        "nowrap",
          pointerEvents:     "none",
          letterSpacing:     "-0.04em",
          userSelect:        "none",
          fontFamily:        "var(--font-display)",
          zIndex:            1,
        }}
      >
        JIMMY
      </div>

      {/* ── Eyebrow ───────────────────────────────────────────── */}
      <div
        className="reveal"
        style={{
          fontFamily:     "var(--font-mono)",
          fontSize:       "0.72rem",
          letterSpacing:  "0.15em",
          textTransform:  "uppercase",
          color:          "var(--accent)",
          marginBottom:   "1.5rem",
          display:        "flex",
          alignItems:     "center",
          gap:            "0.8rem",
          position:       "relative",
          zIndex:         2,
        }}
      >
        <span
          style={{
            display:    "block",
            width:      "40px",
            height:     "1px",
            background: "var(--accent)",
          }}
        />
        Available for work · Kigali, Rwanda
      </div>

      {/* ── Name ─────────────────────────────────────────────── */}
      <h1
        className="reveal"
        style={{
          fontSize:     "clamp(4rem, 9vw, 10rem)",
          fontWeight:   800,
          lineHeight:   0.9,
          letterSpacing:"-0.03em",
          marginBottom: "2rem",
          fontFamily:   "var(--font-display)",
          position:     "relative",
          zIndex:       2,
        }}
      >
        Jimmy
        <br />
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle:  "italic",
            fontWeight: 400,
            color:      "var(--accent)",
          }}
        >
          Shimwa
        </span>
      </h1>

      {/* ── Bottom row ───────────────────────────────────────── */}
      <div
        className="reveal"
        style={{
          display:        "flex",
          alignItems:     "flex-end",
          justifyContent: "space-between",
          flexWrap:       "wrap",
          gap:            "2rem",
          position:       "relative",
          zIndex:         2,
        }}
      >
        <p
          style={{
            maxWidth:   "380px",
            fontFamily: "var(--font-mono)",
            fontSize:   "0.82rem",
            lineHeight: 1.8,
            color:      "var(--muted)",
            fontStyle:  "italic",
          }}
        >
          Full-stack engineer & project manager
          <br />
          building fast products and leading teams
          <br />
          from idea to deployment.
          <span className="caret" />
        </p>

        <Link
          href="#projects"
          className="view-work-btn"
        >
          View my work <span className="view-work-arrow">↗</span>
        </Link>
      </div>
    </section>
    </>
  );
}
