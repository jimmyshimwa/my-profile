"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Hat, TimeOfDay } from "@/lib/content/types";
import { kigaliTime, timeOfDayFor } from "@/lib/kigali";
import { lineState, notifyLayoutChange } from "@/lib/line-store";

type SiteState = {
  /** null until the visitor picks a hat on the gate. Never persisted. */
  hat: Hat | null;
  /** The hat used for rendering: the chosen one, or Founder before choosing. */
  activeHat: Hat;
  chooseHat: (hat: Hat) => void;
  /** The real Kigali time of day. */
  liveTime: TimeOfDay;
  /** What the page shows: a preview, or the live time. */
  time: TimeOfDay;
  previewTime: TimeOfDay | null;
  setPreviewTime: (t: TimeOfDay | null) => void;
};

const SiteContext = createContext<SiteState | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [hat, setHat] = useState<Hat | null>(null);
  const [liveTime, setLiveTime] = useState<TimeOfDay>("day");
  const [previewTime, setPreviewTime] = useState<TimeOfDay | null>(null);

  useEffect(() => {
    const tick = () => setLiveTime(timeOfDayFor(kigaliTime().hour));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const activeHat = hat ?? "founder";
  const time = previewTime ?? liveTime;

  useEffect(() => {
    document.documentElement.dataset.hat = activeHat;
    lineState.hat = activeHat;
    // Project order changes with the hat, so the route has to be redrawn.
    requestAnimationFrame(() => notifyLayoutChange());
  }, [activeHat]);

  useEffect(() => {
    document.documentElement.dataset.time = time;
    lineState.time = time;
  }, [time]);

  const chooseHat = useCallback((h: Hat) => setHat(h), []);

  const value = useMemo<SiteState>(
    () => ({ hat, activeHat, chooseHat, liveTime, time, previewTime, setPreviewTime }),
    [hat, activeHat, chooseHat, liveTime, time, previewTime],
  );

  return <SiteContext value={value}>{children}</SiteContext>;
}

export function useSite() {
  const ctx = use(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}
