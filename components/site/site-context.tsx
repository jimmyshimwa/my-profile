"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Hat } from "@/lib/content/types";
import { lineState, notifyLayoutChange } from "@/lib/line-store";
import { THEME_KEY, type Theme } from "@/lib/theme";

type SiteState = {
  hat: Hat;
  /** True once the visitor has picked a hat themselves. */
  chosen: boolean;
  chooseHat: (hat: Hat) => void;
  theme: Theme;
  toggleTheme: () => void;
};

const SiteContext = createContext<SiteState | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [hat, setHat] = useState<Hat>("founder");
  const [chosen, setChosen] = useState(false);
  // The pre-paint script already set data-theme; read it once on mount.
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const t = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    lineState.theme = t;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from the DOM set before hydration
    setTheme(t);
  }, []);

  const chooseHat = useCallback((h: Hat) => {
    setHat(h);
    setChosen(true);
    // Project order changes with the hat, so the line is re-laid out.
    requestAnimationFrame(() => notifyLayoutChange());
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      lineState.theme = next;
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        /* storage unavailable: the theme still applies for this visit */
      }
      return next;
    });
  }, []);

  const value = useMemo<SiteState>(
    () => ({ hat, chosen, chooseHat, theme, toggleTheme }),
    [hat, chosen, chooseHat, theme, toggleTheme],
  );

  return <SiteContext value={value}>{children}</SiteContext>;
}

export function useSite() {
  const ctx = use(SiteContext);
  if (!ctx) throw new Error("useSite must be used inside SiteProvider");
  return ctx;
}
