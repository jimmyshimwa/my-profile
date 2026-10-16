"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { lineState, notifyLayoutChange } from "@/lib/line-store";
import { detectTier, type Tier } from "@/lib/tier";
import LineSvg from "./line-svg";

// The 3D chunk loads after first paint and never blocks the hero.
const LineCanvas = dynamic(() => import("./line-canvas"), { ssr: false });

export function LineStage() {
  const [tier, setTier] = useState<Tier | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const id = idle(() => setTier(detectTier()));
    return () => {
      if (window.cancelIdleCallback && typeof id === "number") window.cancelIdleCallback(id);
    };
  }, []);

  // Route geometry depends on layout: rebuild when anything resizes.
  useEffect(() => {
    let t = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(t);
      t = window.setTimeout(notifyLayoutChange, 160);
    });
    ro.observe(document.body);
    document.fonts?.ready.then(() => notifyLayoutChange());
    return () => {
      ro.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  // Pointer on desktop, touch on phones.
  useEffect(() => {
    const move = (e: PointerEvent) => {
      lineState.pointer.x = e.clientX;
      lineState.pointer.y = e.clientY;
      lineState.pointer.active = true;
    };
    const leave = () => {
      lineState.pointer.active = false;
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true });
    window.addEventListener("pointerup", (e) => e.pointerType !== "mouse" && leave(), { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  if (!tier) return null;

  if (tier === "svg" || tier === "static") {
    return (
      <>
        <div aria-hidden className="topo-fallback pointer-events-none fixed inset-0 -z-10" />
        <LineSvg mode={tier} />
      </>
    );
  }

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-1000"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <LineCanvas tier={tier} onReady={() => setReady(true)} />
    </div>
  );
}
