import Image from "next/image";
import { LineStage } from "@/components/line/line-stage";
import { HatSwitch } from "@/components/site/hat-switch";
import { HatText } from "@/components/site/hat-text";
import { HeroStatement } from "@/components/site/hero-statement";
import { ChevronBand, Lozenge } from "@/components/site/imigongo";
import { KigaliStatus } from "@/components/site/kigali-status";
import { Reveal } from "@/components/site/reveal";
import { ScrollCue } from "@/components/site/scroll-cue";
import { WorkGrid } from "@/components/site/work-grid";
import { getSiteContent } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default async function Home() {
  const { profile, positions, projects, clockStatuses } = await getSiteContent();
  const hats = profile.hats;
  const perHat = <K extends keyof (typeof hats)["founder"]>(k: K) => ({
    founder: hats.founder[k],
    engineer: hats.engineer[k],
    pm: hats.pm[k],
  });
  const featured = projects.filter((p) => p.featured);
  const socials = [
    { label: "GitHub", href: profile.github },
    { label: "LinkedIn", href: profile.linkedin },
    { label: "X", href: profile.x },
  ].filter((s) => s.href);

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
    sameAs: socials.map((s) => s.href),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <LineStage />

      <main id="content" tabIndex={-1} className="relative overflow-x-clip outline-none">
        {/* Hero: who, what, how long, and the way to get in touch. */}
        <section
          id="top"
          data-line="hero"
          className="flex min-h-svh flex-col justify-end gap-10 px-4 pb-4 pt-28 sm:gap-[10svh] sm:px-[5vw] sm:pb-8 sm:pt-40"
        >
          <div data-line-target="statement" className="self-start">
            <HeroStatement copy={perHat("hero")} />
          </div>

          <div data-line-target="row" className="grid gap-8 sm:grid-cols-12 sm:gap-6">
            <div className="sm:col-span-5">
              <HatSwitch />
            </div>
            <div className="flex flex-col gap-6 sm:col-span-6 sm:col-start-7">
              <HatText
                as="p"
                copy={perHat("short")}
                className="block max-w-[46ch] text-lg leading-relaxed sm:text-xl"
              />
              <dl className="grid grid-cols-2 gap-4 border-t border-rule pt-4">
                <div>
                  <dt className="label text-muted">Experience</dt>
                  <dd className="tnum text-3xl font-medium tracking-tight">{profile.yearsExperience} years</dd>
                </div>
                <div>
                  <dt className="label text-muted">Delivered</dt>
                  <dd className="tnum text-3xl font-medium tracking-tight">{profile.projectCount}+ projects</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2">
                <a href={`mailto:${profile.email}`} className="pill pill-dark">
                  Let&rsquo;s talk <span className="pill-dot" />
                </a>
                <a href={profile.cvUrl} download className="pill pill-light">
                  Download CV <span className="pill-dot" />
                </a>
              </div>
            </div>
          </div>

          <ScrollCue />
        </section>

        {/* Work */}
        <section
          id="work"
          tabIndex={-1}
          data-line="work"
          aria-labelledby="work-title"
          className="px-4 pb-24 pt-32 outline-none sm:px-[5vw] sm:pb-40 sm:pt-56"
        >
          <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-16 sm:flex-row sm:items-end">
            <div data-line-target="heading">
              <Reveal
                id="work-title"
                text="Selected work"
                className="text-[clamp(2.8rem,9vw,8rem)] font-medium leading-[0.92] tracking-[-0.045em]"
              />
            </div>
            <p className="label max-w-[30ch] text-muted sm:text-right">
              Things I started, led or built. Tap one to visit it.
            </p>
          </div>
          <WorkGrid projects={featured} />
        </section>

        {/* About */}
        <section
          id="about"
          tabIndex={-1}
          data-line="about"
          aria-labelledby="about-title"
          className="grid gap-12 px-4 py-24 outline-none sm:grid-cols-12 sm:gap-6 sm:px-[5vw] sm:py-40"
        >
          <div className="px-6 sm:col-span-5 sm:px-0">
            <div
              data-line-target="photo"
              className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[10px] bg-[var(--card)] sm:max-w-none"
            >
              <Image
                src={profile.avatarUrl}
                alt={profile.avatarAlt}
                fill
                sizes="(min-width: 640px) 38vw, 80vw"
                className="origin-[50%_45%] scale-[1.14] object-cover object-[50%_42%]"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center gap-8 sm:col-span-6 sm:col-start-7">
            <Reveal
              id="about-title"
              text={`Hi, I'm ${profile.name.split(" ")[0]}.`}
              className="text-[clamp(2.4rem,6vw,5.5rem)] font-medium leading-[0.95] tracking-[-0.04em]"
            />
            <HatText copy={perHat("long")} paragraphs className="flex max-w-[52ch] flex-col gap-5 text-lg leading-relaxed" />
            <ul className="flex flex-col gap-2 border-t border-rule pt-5">
              {positions.slice(0, 3).map((p) => (
                <li key={p.id} className="flex items-baseline gap-3">
                  <Lozenge className="relative top-0.5 size-3 shrink-0" />
                  <span>
                    <span className="font-semibold">{p.title}</span>
                    <span className="text-muted">, {p.organization}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Contact */}
        <section
          id="contact"
          tabIndex={-1}
          data-line="contact"
          aria-labelledby="contact-title"
          className="flex min-h-[70svh] flex-col justify-end gap-10 px-4 pt-24 sm:min-h-[90svh] outline-none sm:px-[5vw] sm:pt-48"
        >
          <div data-line-target="title">
            <Reveal
              id="contact-title"
              text="Let's work together."
              className="max-w-[12ch] text-[clamp(3rem,10vw,9.5rem)] font-medium leading-[0.9] tracking-[-0.05em]"
            />
          </div>
          <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <a
              data-line-target="email"
              href={`mailto:${profile.email}`}
              className="self-start break-all text-[clamp(1.4rem,4.2vw,3.4rem)] font-medium tracking-[-0.02em]"
            >
              {profile.email}
            </a>
            <ul className="flex flex-wrap gap-2">
              {socials.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noreferrer" className="pill pill-light">
                    {s.label} <span className="pill-dot" />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <footer className="mt-16 flex flex-col gap-4 pb-6 text-sm sm:mt-24">
            <ChevronBand id="imi-band-footer" className="text-ink" />
            <div className="flex flex-col justify-between gap-2 sm:flex-row">
              <KigaliStatus statuses={clockStatuses} />
              <p className="text-muted">
                {profile.name}, {profile.location}
              </p>
            </div>
          </footer>
        </section>
      </main>
    </>
  );
}
