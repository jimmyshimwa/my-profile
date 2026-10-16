"use client";

import { useEffect, useRef, useState } from "react";
import { lineState, onLayoutChange } from "@/lib/line-store";
import { buildRoute, type RoutePoint } from "@/lib/route-path";

/** Catmull-Rom through the points, as cubic Bézier segments. */
function toPath(pts: RoutePoint[]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0]![0].toFixed(1)},${pts[0]![1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/**
 * The Line without WebGL. "svg" draws it with scroll; "static" (reduced
 * motion) shows the whole route at once, like a printed trail map.
 */
export default function LineSvg({ mode }: { mode: "svg" | "static" }) {
  const [d, setD] = useState("");
  const [height, setHeight] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const rebuild = () => {
      setD(toPath(buildRoute()));
      setHeight(document.documentElement.scrollHeight);
    };
    rebuild();
    return onLayoutChange(rebuild);
  }, []);

  useEffect(() => {
    const path = pathRef.current;
    if (!path || !d) return;
    if (mode === "static") {
      path.style.strokeDasharray = "none";
      return;
    }
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    let raf = 0;
    const tick = () => {
      // Draw up to the point level with ~58% of the viewport height.
      const target = window.scrollY + window.innerHeight * 0.58;
      const started = lineState.startedAt > 0 ? 1 : 0;
      const k = Math.min(1, Math.max(0, target / Math.max(1, height)));
      path.style.strokeDashoffset = `${length * (1 - k * started)}`;
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [d, height, mode]);

  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 z-0 w-full"
      style={{ height }}
      viewBox={`0 0 ${typeof window === "undefined" ? 1 : window.innerWidth} ${height || 1}`}
      preserveAspectRatio="none"
    >
      <path
        ref={pathRef}
        d={d}
        fill="none"
        stroke="var(--line)"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 5px var(--line))" }}
      />
    </svg>
  );
}
