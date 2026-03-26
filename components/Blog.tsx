"use client";

import { useState } from "react";
import Link from "next/link";
import SectionLabel from "./SectionLabel";
import { BLOG_POSTS } from "@/lib/data";
import type { BlogPost } from "@/types";

function BlogCard({ post }: { post: BlogPost }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={post.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: "1px solid var(--border)",
        padding: "2rem",
        textDecoration: "none",
        color: "inherit",
        display: "flex",
        flexDirection: "column",
        gap: "1.2rem",
        position: "relative",
        overflow: "hidden",
        background: hovered ? "rgba(200,245,90,0.02)" : "transparent",
        transition: "background 0.3s",
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, right: 0,
        height: "2px",
        background: "var(--accent)",
        transform: hovered ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left",
        transition: "transform 0.35s cubic-bezier(0.7,0,0.3,1)",
      }} />

      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.65rem",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: "var(--accent)",
      }}>
        {post.date}
      </div>

      <div style={{
        fontSize: "1.1rem",
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: "-0.01em",
        fontFamily: "var(--font-display)",
      }}>
        {post.title}
      </div>

      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.75rem",
        color: "var(--muted)",
        lineHeight: 1.7,
        flex: 1,
      }}>
        {post.excerpt}
      </div>

      <div style={{
        fontFamily: "var(--font-mono)",
        fontSize: "0.68rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--accent)",
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
      }}>
        Read more →
      </div>
    </Link>
  );
}

export default function Blog() {
  return (
    <section id="blog" style={{ padding: "6rem 2.5rem" }}>
      <SectionLabel>004 — Writing</SectionLabel>

      <div
        className="reveal"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "2rem",
          marginTop: "3rem",
        }}
      >
        {BLOG_POSTS.map((post) => (
          <BlogCard key={post.title} post={post} />
        ))}
      </div>
    </section>
  );
}
