"use client";

import { Lozenge } from "./imigongo";
import { scrollToTarget } from "./smooth-scroll";

/** Lusion's marker row under the hero, with imigongo lozenges for "+". */
export function ScrollCue() {
  return (
    <div className="flex items-center justify-between text-ink">
      <Lozenge />
      <Lozenge className="hidden sm:block" />
      <button
        type="button"
        onClick={() => {
          const el = document.getElementById("work");
          if (el) scrollToTarget(el);
        }}
        className="label min-h-11 px-2"
      >
        Scroll to explore
      </button>
      <Lozenge className="hidden sm:block" />
      <Lozenge />
    </div>
  );
}
