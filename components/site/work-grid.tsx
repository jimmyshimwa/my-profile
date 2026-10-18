"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Project } from "@/lib/content/types";
import { ImigongoTile } from "./imigongo";
import { useSite } from "./site-context";

gsap.registerPlugin(ScrollTrigger);

/**
 * Five small cards, so a phone reaches the contact section in a few swipes.
 * A card links to the live project when there is one. Order and role line
 * follow the hat.
 */
export function WorkGrid({ projects }: { projects: Project[] }) {
  const { hat, chosen } = useSite();
  const ordered = useMemo(() => [...projects].sort((a, b) => a.order[hat] - b.order[hat]), [projects, hat]);
  const list = useRef<HTMLUListElement>(null);

  // Cards rise and settle as they enter, like Lusion's media.
  useEffect(() => {
    const el = list.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      for (const card of el.querySelectorAll<HTMLElement>("[data-card]")) {
        gsap.fromTo(
          card,
          { y: 60, scale: 0.94 },
          { y: 0, scale: 1, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "top 62%", scrub: 0.6 } },
        );
      }
    }, el);
    return () => ctx.revert();
  }, [ordered]);

  return (
    <ul ref={list} data-line-target="grid" className="grid gap-x-6 gap-y-4 sm:grid-cols-2 sm:gap-y-12 lg:grid-cols-3">
      {ordered.map((p) => {
        const link = p.links[0];
        const role = p.roles[hat];
        const body = (
          <>
            <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-[10px] bg-[var(--card)] text-ink sm:aspect-[4/3] sm:w-full">
              {p.coverUrl ? (
                <Image
                  src={p.coverUrl}
                  alt={p.coverAlt ?? ""}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 96px"
                  className="object-cover transition-transform duration-700 ease-[var(--ease-lusion)] group-hover:scale-105"
                />
              ) : (
                <div className="size-full p-3 transition-transform duration-700 ease-[var(--ease-lusion)] group-hover:scale-105 sm:p-5">
                  <ImigongoTile index={projects.indexOf(p)} />
                </div>
              )}
              {link ? (
                <span className="pill pill-dark absolute bottom-3 left-3 hidden scale-90 opacity-0 transition-all duration-400 group-hover:scale-100 group-hover:opacity-100 sm:inline-flex">
                  Visit <span className="pill-dot" />
                </span>
              ) : null}
            </div>
            <div className="flex min-w-0 flex-col gap-1 sm:mt-4">
              <p className="label tnum text-muted">
                {p.year}
                <span aria-hidden> / </span>
                <span key={hat} className={chosen ? "hat-wipe inline-block" : ""}>
                  {role.label}
                </span>
              </p>
              <h3 className="text-2xl font-medium leading-tight tracking-[-0.02em] sm:text-[1.9rem]">{p.title}</h3>
              <p key={hat} className={`text-sm leading-snug text-muted sm:text-base ${chosen ? "hat-wipe" : ""}`}>
                {role.line}
              </p>
            </div>
          </>
        );
        return (
          <li key={p.id} data-card>
            {link ? (
              <a
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="group flex items-center gap-4 rounded-[12px] sm:block"
              >
                {body}
                <span className="sr-only"> (opens {link.label} in a new tab)</span>
              </a>
            ) : (
              <div className="group flex items-center gap-4 sm:block">{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
