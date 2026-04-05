import Link from "next/link";

export default function Hero() {
  return (
    <section
      id="hero"
      className="hero-section"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        paddingBottom: "5rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Ghost background text */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -52%)",
          fontSize: "clamp(120px, 20vw, 240px)",
          fontWeight: 800,
          color: "transparent",
          WebkitTextStroke: "1px rgba(200,245,90,0.06)",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          letterSpacing: "-0.04em",
          userSelect: "none",
          fontFamily: "var(--font-display)",
        }}
      >
        JIMMY
      </div>

      {/* Eyebrow */}
      <div
        className="reveal"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--accent)",
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
        }}
      >
        <span style={{ display: "block", width: "40px", height: "1px", background: "var(--accent)" }} />
        Available for work · Kigali, Rwanda
      </div>

      {/* Name */}
      <h1
        className="reveal"
        style={{
          fontSize: "clamp(4rem, 9vw, 10rem)",
          fontWeight: 800,
          lineHeight: 0.9,
          letterSpacing: "-0.03em",
          marginBottom: "2rem",
          fontFamily: "var(--font-display)",
        }}
      >
        Jimmy
        <br />
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontWeight: 400,
            color: "var(--accent)",
          }}
        >
          Shimwa
        </span>
      </h1>

      {/* Bottom row */}
      <div
        className="reveal"
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "2rem",
        }}
      >
        <p
          style={{
            maxWidth: "380px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.82rem",
            lineHeight: 1.8,
            color: "var(--muted)",
            fontStyle: "italic",
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
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.8rem",
            padding: "1rem 2rem",
            border: "1px solid rgba(200,245,90,0.4)",
            color: "var(--accent)",
            textDecoration: "none",
            fontSize: "0.8rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            position: "relative",
            overflow: "hidden",
            transition: "color 0.3s",
          }}
        >
          View my work ↗
        </Link>
      </div>
    </section>
  );
}
