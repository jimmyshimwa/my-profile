"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ClockStatus } from "@/lib/content/types";
import { KigaliClock } from "./kigali-clock";
import { getLenis } from "./smooth-scroll";

const LINKS = [
  { href: "/#start", label: "Start" },
  { href: "/#about", label: "About" },
  { href: "/#route", label: "Work" },
  { href: "/#contact", label: "Contact" },
  { href: "/cv", label: "CV" },
];

export function SiteHeader({ name, statuses }: { name: string; statuses: ClockStatus[] }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    getLenis()?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      getLenis()?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function go(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    setOpen(false);
    const hash = href.startsWith("/#") ? href.slice(1) : null;
    if (hash && window.location.pathname === "/") {
      e.preventDefault();
      const target = document.querySelector<HTMLElement>(hash);
      if (!target) return;
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(target, { offset: -40, duration: 1.6 });
      else target.scrollIntoView();
      target.focus({ preventScroll: true });
    }
  }

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 bg-gradient-to-b from-[var(--bg)] from-55% to-transparent pb-4">
      <div className="pointer-events-auto flex items-start justify-between gap-4 px-4 pt-3 sm:px-10 sm:pt-6">
        <Link href="/" className="flex min-h-11 items-center text-sm font-bold tracking-tight">
          {name}
        </Link>
        <div className="flex items-start gap-4 sm:gap-8">
          <div className="hidden sm:block">
            <KigaliClock statuses={statuses} />
          </div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen((o) => !o)}
            className="min-h-11 text-sm font-medium"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      <div className="pointer-events-auto px-4 sm:hidden">
        <KigaliClock statuses={statuses} />
      </div>

      {open ? (
        <nav
          id="site-menu"
          aria-label="Site"
          className="pointer-events-auto fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col justify-end bg-[var(--bg)] px-4 pb-10 sm:top-20 sm:px-10"
        >
          <ul>
            {LINKS.map((l) => (
              <li key={l.href} className="border-t border-rule">
                <Link
                  href={l.href}
                  onClick={(e) => go(e, l.href)}
                  className="block py-2 text-[clamp(2.2rem,9vw,5.5rem)] font-light leading-tight tracking-[-0.035em] transition-[font-weight] duration-300 hover:font-bold focus-visible:font-bold"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
