import SectionLabel from "./SectionLabel";
import type { Stat } from "@/types";

const STATS: Stat[] = [
  { value: "2+", label: "Year of experience" },
  { value: "5+", label: "Projects shipped" },
  { value: "∞", label: "Lines debugged" },
];

function StatItem({ stat }: { stat: Stat }) {
  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      gap: "6px",
      paddingRight: "2rem",
      borderRight: "1px solid var(--border)",
      marginRight: "2rem",
    }}>
      <div style={{
        fontSize: "3rem",
        fontWeight: 800,
        color: "var(--accent)",
        letterSpacing: "-0.04em",
        fontFamily: "var(--font-display)",
        lineHeight: 1,
      }}>
        {stat.value}
      </div>
      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.68rem",
        letterSpacing: "0.1em",
        color: "var(--muted)",
        textTransform: "uppercase",
        lineHeight: 1.6,
      }}>
        {stat.label}
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" style={{ padding: "6rem 2.5rem" }}>
      <SectionLabel>001 — About me</SectionLabel>

      {/* TOP ROW: photo left, heading + bio right */}
      <div
        className="reveal about-grid"
        style={{
          display: "grid",
          gap: "4rem",
          alignItems: "start",
          marginBottom: "4rem",
        }}
      >
        {/* Photo / placeholder */}
        <div>
          <div style={{ position: "relative", width: "220px" }}>
            {/* Corner brackets */}
            <div style={{
              position: "absolute", top: "-8px", left: "-8px",
              width: "20px", height: "20px",
              borderTop: "2px solid var(--accent)",
              borderLeft: "2px solid var(--accent)",
              zIndex: 2,
            }} />
            <div style={{
              position: "absolute", bottom: "-8px", right: "-8px",
              width: "20px", height: "20px",
              borderBottom: "2px solid var(--accent)",
              borderRight: "2px solid var(--accent)",
              zIndex: 2,
            }} />

            {/* Placeholder frame */}
            <div style={{
              width: "220px",
              height: "270px",
              background: "#111",
              border: "1px solid var(--border)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.6rem",
            }}>
              <div style={{
                fontSize: "3rem",
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                color: "var(--accent)",
                opacity: 0.3,
                letterSpacing: "-0.04em",
              }}>
                JS
              </div>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.6rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "var(--muted)",
                opacity: 0.4,
              }}>
                photo coming soon
              </div>
            </div>
          </div>

          {/* Caption */}
          <div style={{
            marginTop: "0.8rem",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--muted)",
            opacity: 0.5,
          }}>
            <div style={{
              width: "5px", height: "5px",
              borderRadius: "50%",
              background: "var(--accent)",
              flexShrink: 0,
            }} />
            Kigali, Rwanda
          </div>
        </div>

        {/* Heading + bio */}
        <div>
          <h2 style={{
            fontSize: "clamp(2.2rem, 4vw, 4.5rem)",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: "2rem",
            fontFamily: "var(--font-display)",
          }}>
            Building things
            <br />
            that{" "}
            <span style={{ color: "var(--accent)" }}>actually</span>
            <br />
            matter.
          </h2>

          <div style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
            lineHeight: 1.9,
            color: "var(--muted)",
          }}>
            <p>
              I&apos;m Jimmy Shimwa — a full-stack developer and project manager
              based in Kigali, Rwanda. I build web applications that are fast,
              accessible, and built to last.
            </p>
            <p style={{ marginTop: "1.2rem" }}>
              My work sits at the intersection of clean engineering and thoughtful
              design. I care deeply about performance, developer experience, and
              shipping things that genuinely help people — whether that means
              writing code or leading the team that does.
            </p>
          </div>
        </div>
      </div>

      {/* BOTTOM ROW: stats */}
      <div
        className="reveal stats-row"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          borderTop: "1px solid var(--border)",
          paddingTop: "2.5rem",
        }}
      >
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              paddingRight: i < STATS.length - 1 ? "2rem" : 0,
              borderRight: i < STATS.length - 1 ? "1px solid var(--border)" : "none",
              marginRight: i < STATS.length - 1 ? "2rem" : 0,
            }}
          >
            <div style={{
              fontSize: "3rem",
              fontWeight: 800,
              color: "var(--accent)",
              letterSpacing: "-0.04em",
              fontFamily: "var(--font-display)",
              lineHeight: 1,
            }}>
              {stat.value}
            </div>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.68rem",
              letterSpacing: "0.1em",
              color: "var(--muted)",
              textTransform: "uppercase",
              lineHeight: 1.6,
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}