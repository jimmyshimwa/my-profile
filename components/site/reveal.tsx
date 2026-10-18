"use client";

import { useEffect, useRef } from "react";
import type { ElementType } from "react";
import { gsap } from "gsap";

/**
 * Display text that rises word by word out of a mask when it scrolls into
 * view (Lusion's heading reveal). The full text stays in the DOM for
 * readers and crawlers; without JavaScript it simply shows.
 */
export function Reveal({
  text,
  as: Tag = "h2",
  className,
  id,
  delay = 0,
  watch,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  id?: string;
  delay?: number;
  /** Re-run the reveal when this changes (e.g. the hat). */
  watch?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.removeAttribute("data-revealed");
    const words = el.querySelectorAll<HTMLElement>(".reveal-word > span");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-revealed", "");
      return;
    }
    let tween: gsap.core.Tween | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        // Drop the CSS hidden state and let GSAP own the transform from here
        // (y: 0 clears the offset GSAP would otherwise read from the CSS).
        el.setAttribute("data-revealed", "");
        tween = gsap.fromTo(
          words,
          { y: 0, yPercent: 105 },
          { yPercent: 0, duration: 1, ease: "expo.out", stagger: 0.05, delay },
        );
      },
      { rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
    };
  }, [delay, watch]);

  const words = text.split(" ");
  return (
    <Tag ref={ref} id={id} data-reveal className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={`${watch ?? ""}-${i}`} aria-hidden>
          <span className="reveal-word">
            <span>{w}</span>
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </Tag>
  );
}
