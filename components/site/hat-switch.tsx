"use client";

import { HATS, type Hat } from "@/lib/content/types";
import { getLenis } from "./smooth-scroll";
import { useSite } from "./site-context";

const SHORT: Record<Hat, string> = { founder: "Founder", engineer: "Engineer", pm: "PM" };

/**
 * A trail sign in the corner: three stacked trails, the current one marked.
 * Bottom-left on phones (thumb reach), mid-left on desktop.
 */
export function HatSwitch() {
  const { hat, activeHat, chooseHat } = useSite();
  if (!hat) return null;

  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    const i = HATS.indexOf(activeHat);
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      switchTo(HATS[(i + 1) % HATS.length]!);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      switchTo(HATS[(i + HATS.length - 1) % HATS.length]!);
    }
  }

  function switchTo(h: Hat) {
    if (h === activeHat) return;
    chooseHat(h);
    // Keep the visitor where they are; the route redraws around them.
    getLenis()?.resize();
    requestAnimationFrame(() =>
      document.querySelector<HTMLButtonElement>(`[data-hat-option="${h}"]`)?.focus(),
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="See Jimmy as"
      onKeyDown={onKey}
      className="fixed bottom-0 left-0 z-40 flex border-t border-rule bg-[var(--bg)]/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:bottom-auto sm:left-4 sm:top-1/2 sm:-translate-y-1/2 sm:flex-col sm:border-l sm:border-t-0 sm:bg-transparent sm:pb-0 sm:backdrop-blur-none"
    >
      {HATS.map((h) => {
        const on = h === activeHat;
        return (
          <button
            key={h}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            data-hat-option={h}
            onClick={() => switchTo(h)}
            className="group relative flex min-h-10 items-center gap-2 px-3 text-left text-[13px] sm:min-h-11 sm:text-sm"
          >
            <span
              aria-hidden
              className="absolute inset-x-3 -top-px h-[3px] transition-all duration-500 sm:inset-x-auto sm:-left-px sm:top-1/2 sm:h-6 sm:w-[3px] sm:-translate-y-1/2"
              style={{ background: on ? "var(--accent)" : "transparent" }}
            />
            <span
              className={
                on
                  ? "font-bold text-ink"
                  : "font-normal text-muted transition-colors group-hover:text-ink"
              }
            >
              {SHORT[h]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
