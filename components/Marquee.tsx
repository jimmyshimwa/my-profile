import { MARQUEE_ITEMS } from "@/lib/data";

export default function Marquee() {
  // Duplicate for seamless loop
  const items = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <div style={{
      borderTop: "1px solid var(--border)",
      borderBottom: "1px solid var(--border)",
      overflow: "hidden",
      padding: "0.9rem 0",
      whiteSpace: "nowrap",
      background: "rgba(200,245,90,0.03)",
    }}>
      <div style={{
        display: "inline-flex",
        gap: "2rem",
        animation: "marquee 20s linear infinite",
        fontFamily: "var(--font-mono)",
        fontSize: "0.7rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--muted)",
      }}>
        {items.map((item, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "2rem" }}>
            {item}
            <span style={{ color: "var(--accent)" }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
