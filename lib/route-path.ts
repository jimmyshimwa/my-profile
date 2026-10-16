import type { LineMove } from "./content/types";

/**
 * Builds the Line's route from the page layout. Elements marked with
 * `data-route` are waypoints, in document order. Between waypoints the Line
 * sweeps out to a margin and wraps around the content; at each project it
 * performs that project's move (data-move) around its title.
 *
 * Points are in page CSS px: x from the viewport's left, y from the page top.
 */
export type RoutePoint = [x: number, y: number, z: number];

type Rect = { left: number; right: number; top: number; bottom: number; w: number; h: number; cx: number; cy: number };

function pageRect(el: Element): Rect {
  const r = el.getBoundingClientRect();
  const top = r.top + window.scrollY;
  return {
    left: r.left,
    right: r.right,
    top,
    bottom: top + r.height,
    w: r.width,
    h: r.height,
    cx: r.left + r.width / 2,
    cy: top + r.height / 2,
  };
}

const TAU = Math.PI * 2;

export function buildRoute(root: ParentNode = document): RoutePoint[] {
  const W = window.innerWidth;
  const narrow = W < 768;
  const marginL = narrow ? 14 : Math.max(40, W * 0.05);
  const marginR = W - marginL;
  const clampX = (x: number) => Math.min(W - 6, Math.max(6, x));

  const pts: RoutePoint[] = [];
  const push = (x: number, y: number, z = 0) => pts.push([clampX(x), y, z]);

  const anchors = Array.from(root.querySelectorAll<HTMLElement>("[data-route]"));
  let side = 1; // 1 = sweep to the right margin next, -1 = left
  let prevBottom = 0;

  anchors.forEach((el, i) => {
    const kind = el.dataset.route;
    const target = el.querySelector("[data-route-target]") ?? el;
    const r = pageRect(target);

    if (i > 0) {
      // Sweep out to a margin, travel down beside the content, come back in.
      const sx = side > 0 ? marginR : marginL;
      const gapTop = prevBottom + Math.min(140, (r.top - prevBottom) * 0.25);
      const gapBottom = r.top - Math.min(120, (r.top - prevBottom) * 0.2);
      if (gapBottom - gapTop > 80) {
        push(sx, gapTop, 20);
        push(sx, (gapTop + gapBottom) / 2, 0);
        push(sx - side * (narrow ? 30 : 90), gapBottom, -20);
      } else {
        push(sx, (prevBottom + r.top) / 2);
      }
      side = -side;
    }

    switch (kind) {
      case "start": {
        // The trailhead: enter from the screen edge, then a level run under
        // the statement.
        pts.push([-40, r.top + r.h * 0.55, 0]);
        push(r.left - (narrow ? 4 : 50), r.bottom + 10);
        push(r.left, r.bottom + 28);
        push(r.left + Math.min(r.w, 260) * 0.5, r.bottom + 34);
        push(r.left + Math.min(r.w, 260), r.bottom + 26);
        break;
      }
      case "about": {
        // Hug the portrait: down its outer edge and under it.
        const p = narrow ? 14 : 26;
        push(r.right + p, r.top - p);
        push(r.right + p, r.cy);
        push(r.right + p * 0.6, r.bottom + p);
        push(r.cx, r.bottom + p * 1.4);
        push(r.left - p, r.bottom + p);
        break;
      }
      case "pass": {
        // Run along the left edge of a block, ticking past it.
        const x = r.left - (narrow ? 6 : 28);
        push(x, r.top);
        push(x - 6, r.cy);
        push(x, r.bottom);
        break;
      }
      case "station": {
        const move = (el.dataset.move as LineMove | undefined) ?? "coil";
        moveAround(move, r, narrow, push);
        break;
      }
      case "end": {
        // The summit: one and a quarter loops around the call to action.
        const rx = r.w / 2 + (narrow ? 18 : 40);
        const ry = r.h / 2 + (narrow ? 18 : 30);
        const steps = 30;
        for (let s = 0; s <= steps; s++) {
          const t = Math.PI * 0.75 + (s / steps) * TAU * 1.25;
          push(r.cx + rx * Math.cos(t), r.cy + ry * Math.sin(t), Math.sin(t) * 20);
        }
        break;
      }
      default: {
        push(r.cx, r.cy);
      }
    }
    prevBottom = r.bottom;
  });

  return dedupe(pts);
}

function moveAround(
  move: LineMove,
  r: Rect,
  narrow: boolean,
  push: (x: number, y: number, z?: number) => void,
) {
  const pad = narrow ? 14 : 30;
  switch (move) {
    case "coil": {
      // A spring wound around the title, moving down through it.
      const turns = narrow ? 2 : 3;
      const steps = turns * 14;
      const rx = r.w / 2 + pad;
      const ry = Math.max(22, r.h * (narrow ? 0.22 : 0.32));
      for (let s = 0; s <= steps; s++) {
        const k = s / steps;
        const t = Math.PI + k * turns * TAU;
        push(r.cx + rx * Math.cos(t), r.top - pad + k * (r.h + pad * 2) + ry * Math.sin(t), Math.sin(t) * 30);
      }
      break;
    }
    case "frame": {
      // A square frame, with tight corners.
      const L = r.left - pad, R = r.right + pad, T = r.top - pad, B = r.bottom + pad;
      const c = 8;
      push(L, T + c); push(L + c, T);
      push(R - c, T); push(R, T + c);
      push(R, B - c); push(R - c, B);
      push(L + c, B); push(L, B - c);
      push(L, T + c * 3);
      push(L + c * 2, T + c);
      break;
    }
    case "knot": {
      // A figure eight tied across the title: two partners, one line.
      const a = r.w / 2 + pad;
      const b = Math.max(40, r.h * 0.9);
      const steps = 40;
      for (let s = 0; s <= steps; s++) {
        const t = (s / steps) * TAU;
        push(r.cx + a * Math.sin(t), r.cy + b * Math.sin(t) * Math.cos(t), Math.cos(t) * 30);
      }
      break;
    }
    case "write": {
      // A handwritten underline: a run of small loops, like a signature.
      const loops = narrow ? 5 : 8;
      const steps = loops * 10;
      const rad = narrow ? 9 : 14;
      for (let s = 0; s <= steps; s++) {
        const k = s / steps;
        const th = k * loops * TAU;
        push(r.left + k * r.w - rad * Math.sin(th), r.bottom + pad - rad * Math.cos(th) + Math.sin(k * Math.PI) * 6);
      }
      break;
    }
    case "steps": {
      // A rising staircase, read as a growing balance.
      const n = 5;
      const stepW = (r.w + pad) / n;
      const rise = narrow ? 14 : 22;
      let x = r.left - pad / 2;
      let y = r.bottom + pad + rise * n;
      push(x, y);
      for (let s = 0; s < n; s++) {
        x += stepW;
        push(x - 4, y); push(x, y - 4);
        y -= rise;
        push(x, y + 4); push(x + 4, y);
      }
      break;
    }
  }
}

function dedupe(pts: RoutePoint[]) {
  const out: RoutePoint[] = [];
  for (const p of pts) {
    const last = out[out.length - 1];
    if (!last || Math.hypot(p[0] - last[0], p[1] - last[1]) > 2) out.push(p);
  }
  return out;
}
