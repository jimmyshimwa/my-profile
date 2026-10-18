"use client";

import { HATS, HAT_LABEL, type Hat } from "@/lib/content/types";
import { useSite } from "./site-context";

/**
 * "See me as: Founder / Engineer / Project manager". Three words in a row,
 * the current one in full ink with a dot. Arrow keys move between them.
 */
export function HatSwitch() {
  const { hat, chooseHat } = useSite();

  function onKey(e: React.KeyboardEvent<HTMLDivElement>) {
    const i = HATS.indexOf(hat);
    let next: Hat | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = HATS[(i + 1) % HATS.length]!;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = HATS[(i + HATS.length - 1) % HATS.length]!;
    if (!next) return;
    e.preventDefault();
    chooseHat(next);
    requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-hat-option="${next}"]`)?.focus());
  }

  return (
    <div className="flex flex-col gap-2">
      <p id="hat-label" className="label text-muted">
        See me as
      </p>
      <div role="radiogroup" aria-labelledby="hat-label" onKeyDown={onKey} className="flex flex-wrap gap-x-5 gap-y-1">
        {HATS.map((h) => {
          const on = h === hat;
          return (
            <button
              key={h}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              data-hat-option={h}
              onClick={() => chooseHat(h)}
              className={`group relative flex min-h-11 items-center gap-2 text-xl tracking-[-0.01em] transition-colors duration-300 sm:text-2xl ${
                on ? "font-bold text-ink" : "font-normal text-muted hover:text-ink"
              }`}
            >
              <span
                aria-hidden
                className={`size-2 rounded-full bg-current transition-transform duration-400 ease-[var(--ease-lusion)] ${on ? "scale-100" : "scale-0 group-hover:scale-75"}`}
              />
              {HAT_LABEL[h]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
