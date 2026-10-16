"use client";

import Image from "next/image";
import Link from "next/link";
import { ViewTransition, useEffect, useMemo, useRef, useState } from "react";
import type { Project } from "@/lib/content/types";
import { HAT_LABEL } from "@/lib/content/types";
import { HatText } from "./hat-text";
import { useSite } from "./site-context";

/**
 * The work, one project at a time. Each project is a station on the route:
 * the one in the middle of the screen is lit, the rest wait in the dark,
 * and the Line performs that project's move around its title.
 */
export function RouteStations({ projects }: { projects: Project[] }) {
  const { activeHat } = useSite();
  const ordered = useMemo(
    () => [...projects].sort((a, b) => a.order[activeHat] - b.order[activeHat]),
    [projects, activeHat],
  );
  const [active, setActive] = useState<string | null>(ordered[0]?.id ?? null);
  const refs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive((e.target as HTMLElement).dataset.id ?? null);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const el of refs.current.values()) io.observe(el);
    return () => io.disconnect();
  }, [ordered]);

  return (
    <ol className="flex flex-col">
      {ordered.map((p, i) => (
        <li
          key={p.id}
          ref={(el) => {
            if (el) refs.current.set(p.id, el);
            else refs.current.delete(p.id);
          }}
          data-id={p.id}
          data-route="station"
          data-move={p.move}
          data-active={active === p.id}
          className={`station grid min-h-[78svh] content-center gap-y-6 py-16 sm:min-h-svh sm:grid-cols-12 sm:gap-x-6 ${
            i % 2 ? "sm:[&>*]:col-start-5" : "sm:[&>*]:col-start-2"
          }`}
        >
          <p className="tnum text-sm text-muted sm:col-span-7">
            {p.year}, as <HatText copy={roleLabels(p)} className="font-medium text-ink" />
          </p>
          <div data-route-target className="sm:col-span-7 justify-self-start">
            <ViewTransition name={`project-${p.slug}`} share="morph" default="none">
              <h3 className="text-[clamp(2.4rem,9vw,7rem)] font-bold leading-[0.92] tracking-[-0.04em]">
                {p.title}
              </h3>
            </ViewTransition>
          </div>
          <HatText
            as="p"
            copy={roleLines(p)}
            className="mt-6 block max-w-[34ch] text-xl leading-snug sm:col-span-6 sm:text-2xl"
          />
          <p className="max-w-[52ch] text-base leading-relaxed text-muted sm:col-span-6">{p.summary}</p>
          {p.coverUrl ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden sm:col-span-7">
              <Image
                src={p.coverUrl}
                alt={p.coverAlt ?? ""}
                fill
                sizes="(min-width: 640px) 58vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-base sm:col-span-7">
            <Link
              href={`/work/${p.slug}`}
              className="min-h-11 content-center font-semibold underline decoration-line decoration-2 underline-offset-[6px]"
            >
              Read the case study<span className="sr-only">: {p.title}</span>
            </Link>
            {p.links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noreferrer"
                className="min-h-11 content-center text-muted underline decoration-rule underline-offset-[6px] hover:text-ink"
              >
                {l.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </div>
        </li>
      ))}
    </ol>
  );
}

function roleLabels(p: Project) {
  return {
    founder: p.roles.founder.label || HAT_LABEL.founder,
    engineer: p.roles.engineer.label || HAT_LABEL.engineer,
    pm: p.roles.pm.label || HAT_LABEL.pm,
  };
}

function roleLines(p: Project) {
  return { founder: p.roles.founder.line, engineer: p.roles.engineer.line, pm: p.roles.pm.line };
}
