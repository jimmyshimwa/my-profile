import Image from "next/image";
import { LineStage } from "@/components/line/line-stage";
import { LineVoice } from "@/components/line/line-voice";
import { HatGate } from "@/components/site/hat-gate";
import { HatSwitch } from "@/components/site/hat-switch";
import { HatText } from "@/components/site/hat-text";
import { RouteStations } from "@/components/site/route-stations";
import { Statement } from "@/components/site/statement";
import { getSiteContent } from "@/lib/data";
import { KIGALI_ELEVATION_M, SITE_URL } from "@/lib/site";

export default async function Home() {
  const { profile, positions, projects, alsoShipped, lineMessages } = await getSiteContent();
  const hats = profile.hats;
  const perHat = <K extends keyof (typeof hats)["founder"]>(k: K) => ({
    founder: hats.founder[k],
    engineer: hats.engineer[k],
    pm: hats.pm[k],
  });
  const featured = projects.filter((p) => p.featured);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    url: SITE_URL,
    email: `mailto:${profile.email}`,
    image: new URL(profile.avatarUrl, SITE_URL).toString(),
    jobTitle: "Founder, software engineer and project manager",
    address: { "@type": "PostalAddress", addressLocality: "Kigali", addressCountry: "RW" },
    worksFor: positions.filter((p) => p.current).map((p) => ({ "@type": "Organization", name: p.organization })),
    sameAs: [profile.github, profile.linkedin, profile.x].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <HatGate name={profile.name} />
      <LineStage />
      <LineVoice messages={lineMessages} />
      <HatSwitch />

      <main id="content" tabIndex={-1} className="relative overflow-x-clip px-4 outline-none sm:px-10 sm:pl-36">
        {/* Trailhead */}
        <section
          id="start"
          tabIndex={-1}
          className="flex min-h-svh flex-col justify-end pb-[14svh] pt-32 outline-none sm:justify-center sm:pb-0"
        >
          <p className="tnum mb-6 text-sm text-muted">
            {profile.location}, {KIGALI_ELEVATION_M.toLocaleString("en-US")} m above sea level
          </p>
          <div data-route="start">
            <div data-route-target className="inline-block">
              <Statement copy={perHat("hero")} />
            </div>
          </div>
          <HatText
            as="p"
            copy={perHat("short")}
            className="mt-20 block max-w-[44ch] text-lg leading-relaxed text-muted sm:text-xl"
          />
        </section>

        {/* Who */}
        <section id="about" tabIndex={-1} className="grid gap-10 py-24 outline-none sm:grid-cols-12 sm:gap-6 sm:py-40">
          <div data-route="about" className="sm:col-span-5 sm:col-start-1">
            <div data-route-target className="relative aspect-[4/5] w-full max-w-md overflow-hidden">
              <Image
                src={profile.avatarUrl}
                alt={profile.avatarAlt}
                fill
                priority={false}
                sizes="(min-width: 640px) 40vw, 92vw"
                className="object-cover object-[50%_68%] scale-[1.12] origin-[50%_60%]"
              />
            </div>
          </div>
          <div className="flex flex-col gap-10 sm:col-span-6 sm:col-start-7 sm:pt-24">
            <h2 className="text-[clamp(2rem,6vw,4rem)] font-bold leading-[0.95] tracking-[-0.035em]">
              {profile.name}
            </h2>
            <HatText
              copy={perHat("long")}
              paragraphs
              className="flex max-w-[52ch] flex-col gap-5 text-lg leading-relaxed"
            />
            <dl className="grid grid-cols-2 gap-6 border-t border-rule pt-6">
              <div>
                <dt className="text-sm text-muted">Years of experience</dt>
                <dd className="tnum text-5xl font-light tracking-tight sm:text-6xl">{profile.yearsExperience}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Projects delivered</dt>
                <dd className="tnum text-5xl font-light tracking-tight sm:text-6xl">{profile.projectCount}+</dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Where I am now */}
        <section aria-labelledby="now-title" className="py-16 sm:py-28">
          <div data-route="pass" className="sm:ml-[8.33%] sm:max-w-3xl">
            <h2 id="now-title" className="mb-8 text-2xl font-bold tracking-tight sm:text-3xl">
              Where I am now
            </h2>
            <ul className="flex flex-col">
              {positions.map((p) => (
                <li key={p.id} className="grid gap-1 border-t border-rule py-5 sm:grid-cols-[1fr_1.3fr] sm:gap-6">
                  <div>
                    <p className="text-lg font-semibold leading-tight">{p.title}</p>
                    <p className="text-muted">
                      {p.url ? (
                        <a href={p.url} target="_blank" rel="noreferrer" className="underline decoration-rule underline-offset-4 hover:text-ink">
                          {p.organization}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        p.organization
                      )}
                      {p.current ? ", now" : null}
                    </p>
                  </div>
                  <HatText as="p" copy={p.description} className="block leading-relaxed" />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* The route through the work */}
        <section id="route" tabIndex={-1} aria-labelledby="route-title" className="pt-16 outline-none sm:pt-28">
          <h2 id="route-title" className="max-w-[18ch] text-[clamp(2rem,6vw,4rem)] font-bold leading-[0.95] tracking-[-0.035em] sm:ml-[8.33%]">
            The route so far.
          </h2>
          <p className="mt-4 max-w-[40ch] text-lg text-muted sm:ml-[8.33%]">
            {featured.length} stops. The order changes with the trail you picked.
          </p>
          <RouteStations projects={featured} />
        </section>

        {/* Also shipped */}
        {alsoShipped.length ? (
          <section aria-labelledby="shipped-title" className="py-20 sm:py-32">
            <div data-route="pass" className="sm:ml-[33.33%] sm:max-w-2xl">
              <h2 id="shipped-title" className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
                Also built
              </h2>
              <ul>
                {alsoShipped.map((a) => (
                  <li key={a.id} className="grid gap-1 border-t border-rule py-4 sm:grid-cols-[1fr_auto] sm:gap-6">
                    <div>
                      <p className="text-lg font-semibold">
                        {a.url ? (
                          <a href={a.url} target="_blank" rel="noreferrer" className="underline decoration-rule underline-offset-4">
                            {a.title}
                            <span className="sr-only"> (opens in a new tab)</span>
                          </a>
                        ) : (
                          a.title
                        )}
                      </p>
                      <p className="text-muted">{a.note}</p>
                    </div>
                    <p className="text-sm text-muted sm:text-right">{a.status === "shipped" ? "Live" : "Finished"}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {/* The summit */}
        <section
          id="contact"
          tabIndex={-1}
          aria-labelledby="contact-title"
          className="flex min-h-svh flex-col justify-center gap-10 pb-24 outline-none"
        >
          <h2 id="contact-title" className="max-w-[14ch] text-[clamp(2.4rem,8vw,6.5rem)] font-bold leading-[0.92] tracking-[-0.04em]">
            That&rsquo;s the top. Let&rsquo;s talk.
          </h2>
          <div data-route="end" className="self-start">
            <a
              data-route-target
              href={`mailto:${profile.email}`}
              className="inline-block break-all py-3 text-[clamp(1.35rem,5vw,3rem)] font-medium tracking-tight underline decoration-line decoration-2 underline-offset-8"
            >
              {profile.email}
            </a>
          </div>
          <ul className="flex flex-wrap gap-x-8 gap-y-2 text-base">
            {[
              { label: "GitHub", href: profile.github },
              { label: "LinkedIn", href: profile.linkedin },
              { label: "X", href: profile.x },
            ]
              .filter((s) => s.href)
              .map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center underline decoration-rule underline-offset-4 hover:decoration-line">
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            <li>
              <a href="/cv" className="inline-flex min-h-11 items-center underline decoration-rule underline-offset-4 hover:decoration-line">
                CV
              </a>
            </li>
          </ul>
          <p className="mt-auto text-sm text-muted">Built in Kigali by {profile.name}.</p>
        </section>
      </main>
    </>
  );
}
