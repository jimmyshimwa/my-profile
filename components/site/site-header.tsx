"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronBand } from "./imigongo";
import { getLenis, scrollToTarget } from "./smooth-scroll";
import { useSite } from "./site-context";

const LINKS = [
  { id: "top", label: "Home" },
  { id: "work", label: "Work" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
];

function go(id: string) {
  if (id === "top") return scrollToTarget(0);
  const el = document.getElementById(id);
  if (!el) return;
  scrollToTarget(el);
  el.focus({ preventScroll: true });
}

export function SiteHeader({ name, cvUrl }: { name: string; cvUrl: string }) {
  const { theme, toggleTheme } = useSite();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  // Out of the way while reading down, back as soon as you scroll up.
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 120);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    getLenis()?.stop();
    panel.current?.querySelector<HTMLElement>("button, a")?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      getLenis()?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className="pointer-events-none fixed inset-x-0 top-0 z-40 transition-transform duration-500 ease-[var(--ease-lusion)]"
      style={{ transform: hidden && !open ? "translateY(-120%)" : "none" }}
      onFocusCapture={() => setHidden(false)}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-4 sm:px-[5vw] sm:pt-8">
        <button
          type="button"
          onClick={() => go("top")}
          className="pointer-events-auto min-h-11 whitespace-nowrap text-left text-base font-bold uppercase tracking-[0.04em] sm:text-2xl"
        >
          {name}
        </button>
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="pill-light grid size-11 place-items-center rounded-full transition-transform duration-400 ease-[var(--ease-lusion)] hover:scale-105"
          >
            <ThemeIcon dark={theme === "dark"} />
          </button>
          <button type="button" onClick={() => go("contact")} className="pill pill-dark hidden sm:inline-flex">
            Let&rsquo;s talk <span className="pill-dot" />
          </button>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((o) => !o)}
            className="pill pill-light"
          >
            {open ? "Close" : "Menu"}
            <span aria-hidden className="flex gap-[3px]">
              <span className="pill-dot" />
              <span className="pill-dot" />
            </span>
          </button>
        </div>
      </div>

      {/* Menu: a panel that slides down from the top right. */}
      <div
        id="site-menu"
        ref={panel}
        hidden={!open}
        className="pointer-events-auto absolute right-4 top-[4.5rem] w-[calc(100%-2rem)] overflow-hidden rounded-2xl bg-[var(--pill)] text-[var(--pill-ink)] shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)] sm:right-[5vw] sm:top-24 sm:w-[24rem]"
      >
        <nav aria-label="Site" className="p-3">
          <ul>
            {LINKS.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    go(l.id);
                  }}
                  className="group flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-3xl font-medium tracking-[-0.02em] transition-colors hover:bg-[var(--bg)]"
                >
                  {l.label}
                  <span className="size-2 scale-0 rounded-full bg-current transition-transform duration-400 ease-[var(--ease-lusion)] group-hover:scale-100" />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex flex-wrap gap-2 px-1 pb-1">
            <a href={cvUrl} download className="pill pill-dark">
              Download CV <span className="pill-dot" />
            </a>
          </div>
        </nav>
        <ChevronBand id="imi-band-menu" className="text-[var(--pill-ink)] opacity-90" />
      </div>
    </header>
  );
}

function ThemeIcon({ dark }: { dark: boolean }) {
  return dark ? (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" />
    </svg>
  ) : (
    <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="currentColor">
      <path d="M14.5 3.2a8.8 8.8 0 1 0 6.3 12.6A7.4 7.4 0 0 1 14.5 3.2Z" />
    </svg>
  );
}
