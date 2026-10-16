"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { PerHat } from "@/lib/content/types";
import { useSite } from "./site-context";

gsap.registerPlugin(ScrollTrigger);

const useIso = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The hero statement. It arrives word by word when the visitor picks a hat,
 * then, as you scroll away, each word gains weight and drifts at its own
 * pace, like the ground falling away as you climb. Reading is never blocked:
 * the words stay in place while the statement is in view.
 */
export function Statement({ copy }: { copy: PerHat<string> }) {
  const { hat, activeHat } = useSite();
  const ref = useRef<HTMLHeadingElement>(null);
  const words = copy[activeHat].split(" ");

  // Intro (and re-intro on hat switch).
  useIso(() => {
    const el = ref.current;
    if (!el || !hat) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = el.querySelectorAll<HTMLElement>(".kinetic-word > span");
    if (reduce) {
      gsap.set(items, { yPercent: 0, opacity: 1 });
      return;
    }
    const tl = gsap.fromTo(
      items,
      { yPercent: 105 },
      { yPercent: 0, duration: 0.9, ease: "power4.out", stagger: 0.045, delay: 0.15 },
    );
    return () => {
      tl.kill();
    };
  }, [hat, activeHat]);

  // Scroll: weight and drift.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wordsEls = Array.from(el.querySelectorAll<HTMLElement>(".kinetic-word"));
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top 20%",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        wordsEls.forEach((w, i) => {
          const drift = (i % 3) - 1;
          w.style.setProperty("--w", String(Math.round(520 + p * 380)));
          w.style.transform = `translate3d(${drift * p * 24}px, ${-p * (30 + (i % 4) * 22)}px, 0)`;
        });
      },
    });
    return () => st.kill();
  }, [activeHat]);

  return (
    <h1
      ref={ref}
      className="max-w-[16ch] text-[clamp(2.6rem,10.5vw,8.6rem)] leading-[0.94] tracking-[-0.035em] text-ink"
      aria-label={copy[activeHat]}
    >
      {words.map((w, i) => (
        <span key={`${activeHat}-${i}`}>
          <span aria-hidden className="kinetic-word overflow-hidden pb-[0.08em] align-bottom">
            <span className="inline-block">{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </h1>
  );
}
