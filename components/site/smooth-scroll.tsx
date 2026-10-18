"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { lineState } from "@/lib/line-store";

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

export function getLenis() {
  return lenis;
}

/** Scroll to an element or the top, smoothly when Lenis runs. */
export function scrollToTarget(target: HTMLElement | number) {
  if (lenis) lenis.scrollTo(target, { offset: typeof target === "number" ? 0 : -24, duration: 1.4 });
  else if (typeof target === "number") window.scrollTo(0, target);
  else target.scrollIntoView();
}

/**
 * Weighted smooth scroll (Lenis), driven by GSAP's ticker so ScrollTrigger
 * and the line read the same scroll value in the same frame.
 * Off for reduced motion: native scrolling is the designed alternative.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let last = window.scrollY;

    const track = () => {
      const y = window.scrollY;
      const v = lenis ? lenis.velocity : y - last;
      lineState.velocity += (v - lineState.velocity) * 0.3;
      last = y;
    };

    if (reduce) {
      window.addEventListener("scroll", track, { passive: true });
      return () => window.removeEventListener("scroll", track);
    }

    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.1 });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => {
      lenis?.raf(time * 1000);
      track();
    };
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return null;
}
