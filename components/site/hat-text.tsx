"use client";

import type { ElementType } from "react";
import type { PerHat } from "@/lib/content/types";
import { useSite } from "./site-context";

/**
 * Text that belongs to a hat. On a switch the new copy wipes in from the
 * left (keyed remount + CSS), so the change reads as a rewrite.
 */
export function HatText({
  copy,
  as: Tag = "span",
  className,
  paragraphs = false,
}: {
  copy: PerHat<string>;
  as?: ElementType;
  className?: string;
  paragraphs?: boolean;
}) {
  const { activeHat, hat } = useSite();
  const text = copy[activeHat];
  // No animation before a hat is chosen: the first render is the static page.
  const cls = `${className ?? ""} ${hat ? "hat-wipe" : ""}`;

  if (paragraphs) {
    return (
      <Tag key={activeHat} className={cls}>
        {text.split(/\n\n+/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </Tag>
    );
  }
  return (
    <Tag key={activeHat} className={cls}>
      {text}
    </Tag>
  );
}
