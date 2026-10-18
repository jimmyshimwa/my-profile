"use client";

import type { PerHat } from "@/lib/content/types";
import { Reveal } from "./reveal";
import { useSite } from "./site-context";

/** The hero statement for the current hat; re-reveals on a switch. */
export function HeroStatement({ copy }: { copy: PerHat<string> }) {
  const { hat } = useSite();
  return (
    <Reveal
      as="h1"
      text={copy[hat]}
      watch={hat}
      delay={0.1}
      className="max-w-[18ch] text-[clamp(2.6rem,7.2vw,7.4rem)] font-medium leading-[0.95] tracking-[-0.045em] sm:indent-[8vw]"
    />
  );
}
