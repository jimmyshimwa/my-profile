"use client";

import { useState } from "react";
import Link from "next/link";
import SectionLabel from "./SectionLabel";
import { PROJECTS } from "@/lib/data";
import type { Project } from "@/types";

function ProjectItem({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={project.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "60px 1fr auto",
        gap: "2rem",
        alignItems: "center",
        padding: "2rem 0",
        borderTop: "1px solid var(--border)",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.7rem",
        color: hovered ? "var(--accent)" : "var(--muted)",
        letterSpacing: "0.1em",
        transition: "color 0.25s",
      }}>
        {project.number}
      </span>

      <div>
        <div style={{
          fontSize: "clamp(1.2rem, 2.5vw, 2rem)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: hovered ? "var(--accent)" : "var(--off-white)",
          transition: "color 0.25s",
          fontFamily: "var(--font-display)",
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          flexWrap: "wrap",
        }}>
          {project.title}
          <span style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            padding: "0.15rem 0.5rem",
            border: "1px solid var(--border)",
            color: "var(--muted)",
            letterSpacing: "0.08em",
            borderRadius: "2px",
            fontWeight: 400,
          }}>
            {project.tag}
          </span>
        </div>
        <div style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.7rem",
          color: "var(--muted)",
          marginTop: "0.4rem",
        }}>
          {project.meta}
        </div>
      </div>

      <span style={{
        fontSize: "1.5rem",
        color: hovered ? "var(--accent)" : "var(--muted)",
        transition: "all 0.25s",
        transform: hovered ? "rotate(0deg)" : "rotate(-45deg)",
        display: "inline-block",
      }}>
        ↗
      </span>
    </Link>
  );
}

export default function Projects() {
  return (
    <section id="projects" style={{ padding: "6rem 2.5rem" }}>
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: "3rem",
      }}>
        <div>
          <SectionLabel>003 — Selected work</SectionLabel>
          <h2 style={{
            fontSize: "clamp(2rem, 4vw, 4rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            fontFamily: "var(--font-display)",
          }}>
            Projects
          </h2>
        </div>
        <Link
          href="#"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.72rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--muted)",
            textDecoration: "none",
            paddingBottom: "0.2rem",
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
          View all →
        </Link>
      </div>

      <div className="reveal">
        {PROJECTS.map((project) => (
          <ProjectItem key={project.number} project={project} />
        ))}
      </div>
    </section>
  );
}