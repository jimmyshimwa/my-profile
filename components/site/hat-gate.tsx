"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { HATS, type Hat } from "@/lib/content/types";
import { lineState } from "@/lib/line-store";
import { KIGALI_ELEVATION_M } from "@/lib/site";
import { useSite } from "./site-context";
import { getLenis } from "./smooth-scroll";

const OPTIONS: Record<Hat, { word: string; note: string }> = {
  founder: { word: "Founder", note: "The companies, and the people in them" },
  engineer: { word: "Engineer", note: "The software, and how it holds up" },
  pm: { word: "Project manager", note: "The plans, the teams, the launch days" },
};

/**
 * The first screen: three trails up the same hill. Nothing else is shown
 * until the visitor picks one. The choice is not remembered between visits.
 */
export function HatGate({ name }: { name: string }) {
  const { chooseHat } = useSite();
  const [gone, setGone] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState<Hat | null>(null);

  // While the gate is up, the page behind it is inert and doesn't scroll.
  useEffect(() => {
    const content = document.getElementById("content");
    if (gone) {
      content?.removeAttribute("inert");
      return;
    }
    content?.setAttribute("inert", "");
    window.scrollTo(0, 0);
    const stopLenis = window.setTimeout(() => getLenis()?.stop(), 0);
    document.documentElement.style.overflow = "hidden";
    // Focus the dialog itself; Tab then reaches the three choices.
    root.current?.focus({ preventScroll: true });
    return () => {
      window.clearTimeout(stopLenis);
      document.documentElement.style.overflow = "";
    };
  }, [gone]);

  function pick(h: Hat) {
    if (picked) return;
    setPicked(h);
    const el = root.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finish = () => {
      chooseHat(h);
      lineState.startedAt = performance.now();
      lineState.lastScrollAt = performance.now();
      setGone(true);
      getLenis()?.start();
      document.getElementById("content")?.removeAttribute("inert");
      document.querySelector<HTMLElement>("#content h1")?.focus({ preventScroll: true });
    };
    if (!el || reduce) return finish();
    // The other trails fade; the chosen word holds, then the map lifts away
    // like a camera rising off the trailhead.
    const tl = gsap.timeline({ onComplete: finish });
    tl.to(el.querySelectorAll(`[data-option]:not([data-option="${h}"])`), { opacity: 0, duration: 0.35, ease: "power2.out" })
      .to(el.querySelector(`[data-option="${h}"] [data-word]`), { fontWeight: 860, duration: 0.45, ease: "power2.out" }, 0)
      .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "power4.inOut" }, 0.45)
      .call(() => chooseHat(h), [], 0.6);
  }

  if (gone) return null;

  return (
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      tabIndex={-1}
      className="hat-gate outline-none topo-fallback fixed inset-0 z-50 flex-col justify-between px-4 pb-6 pt-5 sm:px-10 sm:pb-10 sm:pt-8"
      style={{ clipPath: "inset(0 0 0 0)" }}
    >
      <div className="flex items-baseline justify-between text-sm text-muted">
        <span className="font-medium text-ink">{name}</span>
        <span className="tnum">Kigali, {KIGALI_ELEVATION_M.toLocaleString("en-US")} m</span>
      </div>

      <div className="flex flex-col gap-6 sm:gap-10">
        <h2 id="gate-title" className="max-w-[22ch] text-lg leading-snug text-muted sm:text-2xl">
          Three ways up the same hill. <span className="text-ink">Which one do you want to see?</span>
        </h2>
        <ul className="flex flex-col">
          {HATS.map((h) => (
            <li key={h} data-option={h} className="border-t border-rule last:border-b">
              <button
                type="button"
                onClick={() => pick(h)}
                className="group grid w-full grid-cols-[auto_1fr] items-center gap-x-4 py-3 text-left sm:grid-cols-[auto_1fr_auto] sm:gap-x-8 sm:py-4"
                aria-describedby={`gate-note-${h}`}
              >
                <TrailGlyph hat={h} />
                <span
                  data-word
                  className="text-[clamp(2.4rem,11vw,7.5rem)] font-light leading-none tracking-[-0.04em] transition-[font-weight] duration-500 ease-[var(--ease-trail)] group-hover:font-extrabold group-focus-visible:font-extrabold"
                >
                  {OPTIONS[h].word}
                </span>
                <span
                  id={`gate-note-${h}`}
                  className="col-start-2 mt-1 text-sm text-muted sm:col-start-3 sm:mt-0 sm:max-w-[16rem] sm:text-right sm:text-base"
                >
                  {OPTIONS[h].note}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm text-muted">You can change trail at any point on the way.</p>
    </div>
  );
}

/** A tiny trail marker per hat: a curve, a measured line, a rhythm. */
function TrailGlyph({ hat }: { hat: Hat }) {
  const d =
    hat === "founder"
      ? "M2 30 C 12 4, 26 34, 38 8"
      : hat === "engineer"
        ? "M2 30 L 14 30 L 14 18 L 26 18 L 26 6 L 38 6"
        : "M2 18 Q 7 4 12 18 T 22 18 T 32 18 T 38 14";
  return (
    <svg aria-hidden viewBox="0 0 40 36" className="h-7 w-8 shrink-0 overflow-visible sm:h-10 sm:w-12" fill="none">
      <path
        d={d}
        stroke="var(--line)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray="1"
        className="[stroke-dashoffset:0.62] transition-[stroke-dashoffset] duration-700 ease-[var(--ease-trail)] group-hover:[stroke-dashoffset:0] group-focus-visible:[stroke-dashoffset:0]"
      />
      <circle cx="38" cy={hat === "founder" ? 8 : hat === "engineer" ? 6 : 14} r="3" className="fill-[var(--line)] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100" />
    </svg>
  );
}
