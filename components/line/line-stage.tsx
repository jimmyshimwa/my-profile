"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { lineState, notifyLayoutChange } from "@/lib/line-store";
import { detectTier, type Tier } from "@/lib/tier";
import RibbonSvg from "./ribbon-svg";

// The 3D chunk loads after first paint and never blocks the hero.
const RibbonCanvas = dynamic(() => import("./ribbon-canvas"), { ssr: false });

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

  // Routes depend on layout: rebuild when anything resizes.
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
    const up = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") lineState.pointer.active = false;
    };
    const leave = () => {
      lineState.pointer.active = false;
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", move, { passive: true });
    window.addEventListener("pointerup", up, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  if (!tier) return null;
  if (tier === "svg" || tier === "static") return <RibbonSvg mode={tier} />;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 transition-opacity duration-700"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <RibbonCanvas tier={tier} onReady={() => setReady(true)} />
    </div>
  );
}
