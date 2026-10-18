"use client";

import { useEffect, useRef, useState } from "react";
import { onLayoutChange } from "@/lib/line-store";
import { buildLines, ribbonWidth, showRatio, type LineSpec, type Pt } from "@/lib/lines";

/** Catmull-Rom through the points, as cubic Bézier segments. */
function toPath(pts: Pt[], dy: number) {
  if (pts.length < 2) return "";
  const f = (n: number) => n.toFixed(1);
  let d = `M${f(pts[0]![0])},${f(pts[0]![1] + dy)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6 + dy)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6 + dy)} ${f(p2[0])},${f(p2[1] + dy)}`;
  }
  return d;
}

type Drawn = { spec: LineSpec; d: string; pageTop: number };

/**
 * The lines without WebGL. "svg" draws them with scroll; "static" (reduced
 * motion) shows them complete.
 */
export default function RibbonSvg({ mode }: { mode: "svg" | "static" }) {
  const [lines, setLines] = useState<Drawn[]>([]);
  const [size, setSize] = useState({ w: 1, h: 1, stroke: 10 });
  const paths = useRef<(SVGPathElement | null)[]>([]);

  useEffect(() => {
    const rebuild = () => {
      const specs = buildLines();
      setLines(
        specs.map((spec) => {
          const el = document.querySelector<HTMLElement>(`[data-line="${spec.id}"]`)!;
          const pageTop = el.getBoundingClientRect().top + window.scrollY;
          return { spec, d: toPath(spec.points, pageTop), pageTop };
        }),
      );
      setSize({ w: window.innerWidth, h: document.documentElement.scrollHeight, stroke: ribbonWidth(window.innerWidth) * 0.7 });
    };
    rebuild();
    return onLayoutChange(rebuild);
  }, []);

  useEffect(() => {
    const els = paths.current;
    const lengths = els.map((p) => p?.getTotalLength() ?? 0);
    if (mode === "static") {
      for (const p of els) if (p) p.style.strokeDasharray = "none";
      return;
    }
    let raf = 0;
    const shown = lines.map(() => 0);
    const tick = () => {
      const H = window.innerHeight;
      lines.forEach((l, i) => {
        const p = els[i];
        if (!p) return;
        const target = showRatio(l.pageTop - window.scrollY, H, l.spec.f0, l.spec.f1);
        shown[i]! += (target - shown[i]!) * 0.12;
        p.style.strokeDasharray = `${lengths[i]}`;
        p.style.strokeDashoffset = `${lengths[i]! * (1 - shown[i]!)}`;
      });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [lines, mode]);

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 w-full"
      style={{ height: size.h }}
      viewBox={`0 0 ${size.w} ${size.h}`}
      preserveAspectRatio="none"
    >
      {lines.map((l, i) => (
        <path
          key={l.spec.id}
          ref={(p) => void (paths.current[i] = p)}
          d={l.d}
          fill="none"
          stroke="var(--ink)"
          strokeWidth={size.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
