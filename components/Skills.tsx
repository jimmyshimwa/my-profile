"use client";

import { useState } from "react";
import SectionLabel from "./SectionLabel";
import { SKILLS } from "@/lib/data";
import type { Skill } from "@/types";

function SkillCard({ skill }: { skill: Skill }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "2rem 1.8rem",
        position: "relative",
        overflow: "hidden",
        background: hovered ? "rgba(200,245,90,0.03)" : "transparent",
        transition: "background 0.3s",
        borderRight: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Accent left bar */}
      <div style={{
        position: "absolute",
        top: 0, left: 0,
        width: "3px",
        height: hovered ? "100%" : "0",
        background: "var(--accent)",
        transition: "height 0.35s cubic-bezier(0.7,0,0.3,1)",
      }} />

      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        color: "var(--accent)",
        letterSpacing: "0.15em",
        textTransform: "uppercase",
        marginBottom: "1.2rem",
      }}>
        {skill.number}
      </div>

      <div style={{
        fontSize: "1.1rem",
        fontWeight: 700,
        marginBottom: "0.8rem",
        letterSpacing: "-0.01em",
        fontFamily: "var(--font-display)",
      }}>
        {skill.name}
      </div>

      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
        color: "var(--muted)",
        lineHeight: 1.7,
      }}>
        {skill.description}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginTop: "1rem" }}>
        {skill.tags.map((tag) => (
          <span
            key={tag}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.62rem",
              padding: "0.2rem 0.6rem",
              background: "rgba(200,245,90,0.08)",
              color: "var(--accent)",
              letterSpacing: "0.08em",
              borderRadius: "2px",
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Skills() {
  return (
    <section id="skills" style={{ padding: "6rem 2.5rem" }}>
      <SectionLabel>002 — What I do</SectionLabel>

      <div
        className="reveal skills-grid"
        style={{
          display: "grid",
          border: "1px solid var(--border)",
          marginTop: "3rem",
        }}
      >
        {SKILLS.map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>
    </section>
  );
}
