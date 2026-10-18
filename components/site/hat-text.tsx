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
  const { hat, chosen } = useSite();
  const text = copy[hat];
  // No animation on first render: that is the static page.
  const cls = `${className ?? ""} ${chosen ? "hat-wipe" : ""}`;

  return (
    <Tag key={hat} className={cls}>
      {paragraphs ? text.split(/\n\n+/).map((p, i) => <p key={i}>{p}</p>) : text}
    </Tag>
  );
}
