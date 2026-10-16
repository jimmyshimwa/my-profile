"use client";

import { useEffect, useRef, useState } from "react";
import type { LineMessage, LineTrigger } from "@/lib/content/types";
import { lineState } from "@/lib/line-store";
import { useSite } from "@/components/site/site-context";

/**
 * The Line's short lines of dialogue, shown next to its head.
 * Decorative (aria-hidden): nothing here is needed to use the site.
 */
export function LineVoice({ messages }: { messages: LineMessage[] }) {
  const { hat, activeHat, time } = useSite();
  const [text, setText] = useState<string | null>(null);
  const bubble = useRef<HTMLDivElement>(null);
  const lastSaid = useRef<Record<string, number>>({});
  const hideTimer = useRef(0);

  // Pick a line for a trigger, preferring ones written for this hat and hour.
  const say = useRef<(trigger: LineTrigger) => void>(() => {});
  useEffect(() => {
    say.current = (trigger: LineTrigger) => {
    const now = performance.now();
    const cooldown = trigger === "end" ? 60_000 : 18_000;
    if (now - (lastSaid.current[trigger] ?? -Infinity) < cooldown) return;
    const pool = messages.filter(
      (m) => m.trigger === trigger && (!m.hat || m.hat === activeHat) && (!m.timeOfDay || m.timeOfDay === time),
    );
    if (!pool.length) return;
    const specific = pool.filter((m) => m.hat || m.timeOfDay);
    const from = specific.length && Math.random() < 0.6 ? specific : pool;
    const pick = from[Math.floor(Math.random() * from.length)]!;
    lastSaid.current[trigger] = now;
    setText(pick.text);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setText(null), 3600);
    };
  }, [messages, activeHat, time]);

  useEffect(() => {
    if (hat) window.setTimeout(() => say.current("hello"), 1500);
  }, [hat]);

  useEffect(() => {
    if (!hat) return;
    let raf = 0;
    let fastFrames = 0;
    const tick = () => {
      const el = bubble.current;
      const { head } = lineState;
      if (el) {
        const x = Math.min(window.innerWidth - 16, Math.max(16, head.x));
        const flip = x > window.innerWidth * 0.6;
        el.style.transform = `translate3d(${x}px, ${head.y}px, 0) translate(${flip ? "calc(-100% - 18px)" : "18px"}, -130%)`;
        el.style.visibility = head.visible && head.y > 40 && head.y < window.innerHeight - 20 ? "visible" : "hidden";
      }
      const idleFor = performance.now() - lineState.lastScrollAt;
      if (idleFor > 5200 && idleFor < 5300) say.current("idle");
      fastFrames = Math.abs(lineState.velocity) > 38 ? fastFrames + 1 : 0;
      if (fastFrames === 12) say.current("fast");
      if (lineState.progress > 0.985) say.current("end");
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [hat]);

  return (
    <div
      ref={bubble}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-30 max-w-[15rem] text-sm font-medium will-change-transform"
    >
      <span
        className="block rounded-[2px] border border-line/40 bg-surface px-3 py-1.5 text-ink backdrop-blur-sm transition-all duration-500"
        style={{
          opacity: text ? 1 : 0,
          transform: text ? "translateY(0)" : "translateY(4px)",
        }}
      >
        {text ?? " "}
      </span>
    </div>
  );
}
