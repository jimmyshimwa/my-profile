/**
 * The lines, Lusion-style: one ribbon per section, pinned to that section so
 * it scrolls with the content, drawn by how far the section has travelled up
 * the screen. Each route is laid out around real elements (marked with
 * data-line-target) so loops pass behind the photo and the project tiles
 * and keep clear of the text, at every screen size.
 *
 * Points are in CSS px: x from the viewport's left, y from the section's top.
 */
export type Pt = [x: number, y: number];

export type LineSpec = {
  id: string;
  points: Pt[];
  /** Drawing starts when the section top is at f0 × viewport height... */
  f0: number;
  /** ...and completes after the section moves a further f1 × viewport height. */
  f1: number;
  /** Stretch of the line (0–1) drawn with the imigongo chevron pattern. */
  pattern: [number, number] | null;
};

type Rect = { left: number; right: number; top: number; bottom: number; w: number; h: number; cx: number; cy: number };

function relRect(el: Element, sectionTop: number): Rect {
  const r = el.getBoundingClientRect();
  const top = r.top - sectionTop;
  return { left: r.left, right: r.right, top, bottom: top + r.height, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: top + r.height / 2 };
}

const TAU = Math.PI * 2;

/** Points around an ellipse, from angle a0 to a1 (radians, y down). */
function arc(out: Pt[], cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, steps: number) {
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  }
}

export function buildLines(root: ParentNode = document): LineSpec[] {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const narrow = W < 768;
  const specs: LineSpec[] = [];

  for (const section of Array.from(root.querySelectorAll<HTMLElement>("[data-line]"))) {
    const s = section.getBoundingClientRect();
    const target = (name: string) => {
      const el = section.querySelector(`[data-line-target="${name}"]`);
      return el ? relRect(el, s.top) : null;
    };
    const sectionH = s.height;
    const pts: Pt[] = [];
    const id = section.dataset.line!;

    if (id === "hero") {
      const t = target("statement");
      const row = target("row");
      if (!t || !row) continue;
      // In from the left edge, through the gap under the statement...
      const gapY = (t.bottom + row.top) / 2;
      pts.push([-0.12 * W, gapY - 0.04 * H], [0.12 * W, gapY + 0.01 * H], [0.42 * W, gapY]);
      if (narrow) {
        // ...a small loop in the gap, then down the right edge.
        const r = Math.min(0.11 * W, (row.top - t.bottom) * 0.42);
        pts.push([0.62 * W, gapY + r * 0.2]);
        arc(pts, 0.72 * W, gapY, r, r, Math.PI * 0.75, Math.PI * 0.75 + TAU, 28);
        pts.push([0.94 * W, gapY + r * 1.6], [0.975 * W, sectionH * 0.82], [0.97 * W, sectionH + 0.08 * H]);
      } else {
        // ...rising into the empty space after the statement's last line for
        // a loop (measured from the words, so it fits every hat's sentence).
        const words = Array.from(section.querySelectorAll('[data-line-target="statement"] .reveal-word')).map((w) =>
          relRect(w, s.top),
        );
        const lastTop = Math.max(...words.map((w) => w.top));
        const last = words.filter((w) => Math.abs(w.top - lastTop) < 4);
        const lastRight = last.length ? Math.max(...last.map((w) => w.right)) : t.right;
        const lineH = last[0]?.h ?? t.h / 2;
        const r = Math.min(0.045 * W, lineH * 0.42);
        const cx = Math.min(0.9 * W, lastRight + 0.05 * W + r);
        const cy = (last[0]?.cy ?? t.bottom - r) + lineH * 0.05;
        pts.push([cx - r * 1.6, gapY - 0.005 * H]);
        arc(pts, cx, cy, r, r, Math.PI * 0.8, Math.PI * 0.8 + TAU, 32);
        pts.push([cx + r * 1.8, cy - r * 0.2], [0.985 * W, row.top - 0.02 * H], [0.985 * W, row.bottom], [0.98 * W, sectionH + 0.1 * H]);
      }
      specs.push({ id, points: pts, f0: 0.85, f1: 1.05, pattern: null });
    }

    if (id === "work") {
      const h = target("heading");
      const g = target("grid");
      if (!h || !g) continue;
      if (narrow) {
        // Phone: across above the heading, then down the left edge, where
        // the thumbnails hide it and only the margin shows.
        pts.push([0.975 * W, -0.12 * H], [0.9 * W, h.top - 0.07 * H], [0.4 * W, h.top - 0.06 * H], [8, h.top + h.h * 0.2]);
        pts.push([7, g.top + 10], [7, g.bottom - 10], [4, g.bottom + 0.04 * H], [-0.2 * W, g.bottom + 0.1 * H]);
        specs.push({ id, points: pts, f0: 0.95, f1: Math.max(0.9, (sectionH / H) * 0.85), pattern: [0.45, 0.8] });
        continue;
      }
      const m = 0.025 * W;
      // Down the right edge, across the space above the heading...
      pts.push([0.975 * W, -0.12 * H], [0.97 * W, h.top - 0.09 * H], [0.6 * W, h.top - 0.11 * H], [0.12 * W, h.top - 0.07 * H]);
      // ...down the left margin (clear of the heading) to the tiles...
      pts.push([m, h.top + 0.01 * H], [m, h.bottom], [m, g.top + g.h * 0.12]);
      // ...then twice across behind the tiles: it shows in the gaps.
      pts.push([0.5 * W, g.top + g.h * 0.28], [1.04 * W, g.top + g.h * 0.36]);
      pts.push([0.55 * W, g.top + g.h * 0.62], [-0.04 * W, g.top + g.h * 0.72]);
      pts.push([m, g.bottom + 0.04 * H], [-0.15 * W, g.bottom + 0.14 * H]);
      specs.push({ id, points: pts, f0: 1, f1: Math.max(0.9, (sectionH / H) * 0.85), pattern: [0.42, 0.7] });
    }

    if (id === "about") {
      const p = target("photo");
      if (!p) continue;
      const padX = narrow ? 10 : 0.035 * W;
      const padY = narrow ? 0.035 * H : 0.06 * H;
      const rx = p.w / 2 + padX;
      const ry = p.h / 2 + padY;
      // In from the left, once all the way around the photo (behind it)...
      const a0 = -Math.PI * 0.7;
      pts.push([-0.12 * W, p.cy + ry * Math.sin(a0) - padY * 0.6]);
      arc(pts, p.cx, p.cy, rx, ry, a0, a0 + TAU * 1.05, 44);
      // ...and out to the right: under the text on desktop, between the
      // photo and the title on a phone.
      if (narrow) pts.push([p.cx + rx * 0.5, p.bottom + padY * 0.9], [1.12 * W, p.bottom + padY * 0.6]);
      else pts.push([p.cx + rx * 0.4, p.bottom + padY * 1.5], [0.7 * W, Math.max(p.bottom, sectionH * 0.86) + padY], [1.12 * W, sectionH * 0.94]);
      specs.push({ id, points: pts, f0: 0.95, f1: Math.max(0.9, (sectionH / H) * 0.8), pattern: [0.18, 0.4] });
    }

    if (id === "contact") {
      const t = target("title");
      const e = target("email");
      if (!t || !e) continue;
      const m = narrow ? 6 : 0.025 * W;
      // From the right, over the title, down the margin...
      pts.push([1.12 * W, t.top - 0.12 * H], [0.6 * W, t.top - 0.09 * H], [0.15 * W, t.top - 0.06 * H], [m, t.cy]);
      // ...and it ends as the underline of the email: the call to action.
      pts.push([m + 4, e.bottom - 4], [e.left + 8, e.bottom + 10], [e.cx, e.bottom + 12], [e.right + (narrow ? 4 : 16), e.bottom + 6]);
      specs.push({ id, points: pts, f0: 0.95, f1: 0.75, pattern: null });
    }
  }
  return specs;
}

/** Lusion's easing for the drawn amount. */
export function quadInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Drawn amount (0–1) for a line, given its section's top on screen. */
export function showRatio(sectionTop: number, viewportH: number, f0: number, f1: number) {
  const r = -(sectionTop - f0 * viewportH) / (f1 * viewportH);
  return quadInOut(Math.min(1, Math.max(0, r)));
}

/** Ribbon width in px: wider on small screens relative to size, like Lusion. */
export function ribbonWidth(viewportW: number) {
  const t = Math.min(1, Math.max(0, (viewportW - 390) / (1920 - 390)));
  return 9 + t * 9; // 9 px on a phone, 18 px on a large desktop
}
