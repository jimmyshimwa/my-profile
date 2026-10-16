import Image from "next/image";
import Link from "next/link";
import { ViewTransition } from "react";
import { HATS, HAT_LABEL, type Project } from "@/lib/content/types";

/** A project's case study. Used by /work/[slug] and the admin preview. */
export function CaseStudy({ project, next }: { project: Project; next?: Project }) {
  return (
    <main id="content" tabIndex={-1} className="topo-fallback min-h-svh px-4 pb-24 pt-32 outline-none sm:px-10 sm:pt-40">
      <article className="mx-auto max-w-5xl">
        <Link href="/#route" className="inline-flex min-h-11 items-center text-sm text-muted underline decoration-rule underline-offset-4 hover:text-ink">
          Back to the route
        </Link>
        <p className="tnum mt-10 text-sm text-muted">{project.year}</p>
        <ViewTransition name={`project-${project.slug}`} share="morph" default="none">
          <h1 className="mt-2 text-[clamp(2.8rem,11vw,8rem)] font-bold leading-[0.9] tracking-[-0.045em]">
            {project.title}
          </h1>
        </ViewTransition>
        <p className="mt-8 max-w-[46ch] text-xl leading-snug sm:text-2xl">{project.summary}</p>

        <dl className="mt-12 grid gap-6 border-t border-rule pt-6 sm:grid-cols-3">
          {HATS.map((h) => (
            <div key={h}>
              <dt className="text-sm text-muted">As {HAT_LABEL[h].toLowerCase()}</dt>
              <dd className="mt-1 font-semibold">{project.roles[h].label}</dd>
              <dd className="text-muted">{project.roles[h].line}</dd>
            </div>
          ))}
        </dl>

        {project.coverUrl ? (
          <div className="relative mt-16 aspect-[16/9] w-full overflow-hidden">
            <Image src={project.coverUrl} alt={project.coverAlt ?? ""} fill sizes="(min-width: 1024px) 64rem, 100vw" className="object-cover" priority />
          </div>
        ) : null}

        <div className="mt-16 grid gap-10 sm:grid-cols-12">
          <div className="flex flex-col gap-5 text-lg leading-relaxed sm:col-span-8">
            <Body text={project.body} />
          </div>
          <aside className="flex flex-col gap-6 text-sm sm:col-span-3 sm:col-start-10">
            {project.stack.length ? (
              <div>
                <h2 className="mb-2 text-muted">Built with</h2>
                <p>{project.stack.join(", ")}</p>
              </div>
            ) : null}
            {project.links.length ? (
              <div>
                <h2 className="mb-2 text-muted">Links</h2>
                <ul>
                  {project.links.map((l) => (
                    <li key={l.url}>
                      <a href={l.url} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center font-medium underline decoration-line underline-offset-4">
                        {l.label}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>

        {next && next.slug !== project.slug ? (
          <Link href={`/work/${next.slug}`} className="group mt-28 block border-t border-rule pt-6">
            <span className="text-sm text-muted">Next stop</span>
            <span className="mt-2 block text-[clamp(2rem,7vw,5rem)] font-light leading-none tracking-[-0.04em] transition-[font-weight] duration-500 group-hover:font-bold">
              {next.title}
            </span>
          </Link>
        ) : null}
      </article>
    </main>
  );
}

/** Case study text: blank lines split paragraphs, "## " starts a heading. */
function Body({ text }: { text: string }) {
  return text
    .split(/\n\n+/)
    .filter(Boolean)
    .map((block, i) =>
      block.startsWith("## ") ? (
        <h2 key={i} className="mt-6 text-2xl font-bold tracking-tight first:mt-0">
          {block.slice(3)}
        </h2>
      ) : (
        <p key={i} className="max-w-[60ch]">
          {block}
        </p>
      ),
    );
}
