# Decisions

A log of the design and technical choices in version 2, and why. Newest at the bottom of each section.

## Process

- **One art direction instead of three.** The brief asks for three directions in Phase 1. Jimmy asked for something visible within a five-hour build, so I committed to one direction, "The Route" (below), and built it end to end. If it doesn't land, the other directions can be explored on a branch.
- **Branches.** `version-1` is a snapshot of the old site. `version-2` is the rebuild, started from an empty tree except `public/`. It merges into `main` when approved; no force push is needed, so the old history stays.

## Revision 2 (18 Oct 2026): the Lusion direction

Jimmy reviewed "The Route" below and asked for a change. He found it too dark, said it had no identity, and found the glowing line too quick and too unlike Lusion's. He also wanted a simpler one-page site that gets a visitor from "who is this" to "contact" fast. This revision **replaces** the art direction, the Line and the page structure described further down. The stack, security and admin sections still apply.

- **The reference is studied, not guessed.** [research/LUSION.md](research/LUSION.md) records how lusion.co is actually built: one flat ribbon per section, pinned to that section, drawn with `quadInOut` by scroll position, with a round tip and over/under crossings.
- **Themes.** Light by default (`#f0f1f4`, close to Lusion's off-white) with a dark toggle (`#0c0d10`). The choice is saved in `localStorage` and applied before first paint. The Kigali time no longer changes the palette; it lives in the footer status line ("Kigali 22:14, probably debugging").
- **Identity: imigongo, in black and white only.** It appears in just these places:
  - The grid markers under the hero are lozenges, where Lusion uses "+".
  - Each project tile is an imigongo panel until real photos are uploaded (chevrons, lozenges, steps, concentric squares, zigzags).
  - A chevron band sits in the menu and in the footer.
  - The line takes a chevron pattern on a few stretches.
  
  There's no red or ochre, at Jimmy's request.
- **The line.**
  - It's a plain ribbon: black on light, white on dark, with no glow and no lighting.
  - There's one ribbon per section (hero, work, about, contact), each laid out around real elements (`data-line-target`). Loops pass behind the photo and the tiles, and the paths stay clear of text at phone and desktop widths. The hero loop is placed after the statement's measured last line, so it fits every hat's sentence.
  - The drawn amount follows Lusion's formula, eased toward the scroll position so it trails a beat behind.
  - It bends away from the pointer or finger and gets a slight travelling wave while scrolling.
  - A thin page-coloured edge makes crossings read as over and under.
  - The width scales from 9 px on phones to 18 px on large screens.
  - The SVG fallback and the reduced-motion version draw the same routes.
- **Structure.** Four sections only: hero, work, about, contact.
  - The hero answers everything a visitor needs at once: what Jimmy does (the statement), how long (3 years, 10+ projects), and how to reach him (Let's talk, Download CV).
  - The hat gate is gone. The site opens on the hero, and "See me as" switches hats in place.
- **Work.** Five small cards, rows with a square thumbnail on phones and a three-column grid on desktop. A card opens the project's first link in a new tab. There are no project pages and no `/cv` page (the CV downloads directly), so it's one page.
- **Motion, after Lusion.**
  - Lenis smooth scroll.
  - Headings rise word by word out of a mask as they enter (`expo.out`).
  - Cards rise and settle as they scroll in.
  - Pill buttons with a dot, and a menu panel sliding from the top right.
  - Easing is `cubic-bezier(.4, 0, .1, 1)`.
  - The header slides away while you scroll down and returns when you scroll up.
- **Removed:** the hat gate, the time-of-day themes, the topographic shader, the line's speech bubbles, the positions and "Also built" sections, project case-study pages, `/cv` and the admin preview. Their data is still in the database, so nothing is lost. The admin now shows Profile and hats, Projects, Kigali clock and Media.

## Art direction: "The Route" (superseded by revision 2)

- **Concept.** Jimmy hikes, and Rwanda is the land of a thousand hills. The page is a topographic map. The Line is the trail across it, and his milestones are the stops on that trail. The site opens on the gate ("three ways up the same hill") and ends at the summit, where the Line loops around his email.
- **Why it isn't generic.** There's no hero gradient blob, card grid, eyebrow labels, marquee or pill toggle. The hero is a statement, not a name. The background is a generated contour map, never a stock image. The Rwanda reference comes through elevation ("Kigali, 1,567 m"), the hills and the light, not flags.
- **Typeface.** Satoshi only (Jimmy's choice), self-hosted variable woff2 via `next/font/local`, weights 300–900. Type carries the personality through weight. The gate choices go from light to extra-bold on focus. The hero statement gains weight and drifts word by word as you scroll away. The menu items do the same on hover. One family, used as a material.
- **Palette follows Kigali's real time** (`Africa/Kigali`, set before first paint by an inline script so there's no flash):
  - dawn `#dce3ec` mist, ink `#0f1830`
  - day `#eef2f4` cool paper, ink `#0b1424`
  - dusk `#1c1730` violet, ink `#f1ecf6`
  - night `#070b1c` deep indigo, ink `#e7ecf7`
  Kigali is near the equator, so the dawn/day/dusk/night hours are fixed all year (05–07, 07–17, 17–19, 19–05).
- **Contrast.** Body text is ink on background (over 14:1 in every theme). Muted text is at least 5.5:1 (dawn `#4a5672` on `#dce3ec` is the lowest). Hat accents (amber `#e8a33d`, teal `#2fc5b5`, rose `#e2668a`) are only used for marks such as the selected-hat bar, Line ticks and pulses, and the sun icon, never for text.
- **The Line is blue in every theme** (`#1f4fff` by day up to `#5a8cff` at dusk), a 2.4 px core with a 15 px glow sleeve. It's thin enough to read as a drawn trail and bright enough to lead the eye. The glow is additive on dark themes and alpha-blended on light ones, so it never washes out paper.
- **Spending the boldness.** The Line, the gate and the hero statement are loud. Everything else uses plain rules, generous space and one size of body type.

## The Line

- **One fixed R3F canvas behind the page.** An orthographic camera with 1 world unit = 1 CSS px follows `scrollY`, so the Line lines up exactly with the DOM.
- **The route is built from the layout, not hand-authored.** `lib/route-path.ts` reads `data-route` waypoints in document order. Between them the Line sweeps to alternating margins (wrapping around content). At each project it performs that project's move around the title. The route rebuilds on resize, font load and hat change. Lusion authors its paths offline (see `research/REFERENCES.md`). We can't, because the admin changes the content, so the path has to come from the layout.
- **Moves per milestone** (editable per project in the admin):
  - coil: a spring wound through the title (The Forge Hub)
  - frame: a square frame (RNMU Conference)
  - knot: a figure eight (Smart Clinics Exchange, two partners tied by one line)
  - write: a looped signature underline (Rabbi Residences)
  - steps: a rising staircase, read as a growing balance (Root CFO)
  - The summit is a loop and a quarter around the email.
- **One TubeGeometry with radius 1, drawn twice** (core and glow). The vertex shader recovers the centreline (`position - normal`), so thickness, wobble and pointer push are all uniforms. Nothing rebuilds per frame.
- **Reveal is a single uniform** (`uHead`, fraction of arc length), mapped from scroll through a 1,600-point lookup table. The head runs further ahead near the top so the trailhead is visible on arrival.
- **Personality.**
  - The Line stretches and thins with scroll speed. Velocity is clamped, so a jump doesn't spike it.
  - After about 3 s of stillness the head "looks around".
  - Pointer and touch push it aside.
  - It speaks short lines from the admin: hello after a hat is picked, idle, fast scroll, and the end.
- **Hats change the Line.**
  - Founder: smooth centripetal curve with a slow, confident sway.
  - Engineer: near-zero Catmull-Rom tension, so the route becomes straight measured segments, with tick marks in the accent colour.
  - PM: rhythmic pulses travel along it.
- **Tiers** (`lib/tier.ts`):
  - **full:** DPR up to 1.75, up to 2,400 segments, hillshaded 5-octave contours.
  - **lite:** for ≤4 cores, ≤2–4 GB memory, coarse pointers or 3G. DPR 1, ≤1,000 segments, 3-octave contours, no antialias.
  - **svg:** no WebGL, a software renderer, Save-Data or 2G. The same route as an SVG path drawn with scroll, plus a CSS contour pattern.
  - **static:** `prefers-reduced-motion`. The whole route drawn at once, like a printed trail map. No smooth scroll and no kinetic type.
  - Force a tier for testing with `?tier=full|lite|svg|static`.
- **Loading.** The 3D chunk is `next/dynamic` with `ssr: false`, requested in `requestIdleCallback` after first paint. The hero is complete type before WebGL arrives, and the canvas fades in. GPU resources are disposed on unmount. rAF pauses in hidden tabs.
- **Colour.** Palette hex values are sRGB and written straight out (`legacy` + `linear` + `flat` on the Canvas). Otherwise three's colour management darkened every colour.

## Hats

- **The gate is required, and the choice is never remembered** (Jimmy's call). The page underneath is `inert` while the gate is up. The gate is only shown when JavaScript runs (`html.js`), so crawlers and no-JS visitors get the full page in the Founder voice.
- **Switching** is a "trail sign": three stacked words, mid-left on desktop and a bottom strip on phones, with a `radiogroup` and arrow-key support. Copy re-wipes left to right, project order changes, the accent changes, and the Line redraws with that hat's behaviour.

## Stack

- **Next.js 16.4** (App Router, Cache Components, Turbopack), React 19.3, TypeScript strict with `noUncheckedIndexedAccess`.
- **Tailwind CSS 4.** It's fast to compose mobile-first layouts, and design tokens live as CSS variables so the time-of-day themes are pure CSS.
- **Supabase** (Jimmy's choice) for Postgres, Auth and Storage in one place, in place of the brief's Prisma/Drizzle + Auth.js + Blob. There's no ORM: the schema is small and plain SQL (`supabase/migrations/0001_init.sql`) with row level security is the clearest source of truth.
- **Caching.** All public content is one `"use cache"` read tagged `content` (`cacheLife("max")`). Every admin save calls `updateTag("content")`, so the next visit renders fresh content and Jimmy sees his edit immediately. On a site this small, one tag is simpler and safer than per-page tags.
- **No Supabase, no problem.** If the env vars are missing or a read fails, the site serves `lib/content/seed.ts`. The public site can be deployed before the database exists.
- **GSAP + ScrollTrigger + Lenis.** Lenis is driven from GSAP's ticker, so the scroll value that ScrollTrigger and the Line read is the same in each frame.
- **Case-study transitions** use React 19.3 `<ViewTransition>`. The project title morphs from the route into the case study.
- **Rich text** is plain text with `## ` headings and blank-line paragraphs, not Tiptap. It's enough for case studies, has no editor bundle, and has no HTML injection surface. It can move to Tiptap later if posts get rich.

## Security

- **One admin.** Supabase Auth email + password, accepted only for `ADMIN_EMAIL`. Account creation is at `/admin/setup` and requires confirming the email. Turn off public sign-ups in Supabase once the account exists.
- **Checks at three layers.**
  - `proxy.ts` does an optimistic redirect and refreshes the session.
  - `requireAdmin()` and `assertAdmin()` run in every admin page and every server action.
  - Postgres RLS allows writes only when `auth.jwt()->>'email'` is in `public.admins`.
- **Zod on every input.** Slugs are restricted to `[a-z0-9-]`. URLs must be http(s). Alt text is required for covers (also enforced by a DB check constraint) and for every upload.
- **Rate limiting** on login and setup is a per-instance in-memory limiter, with Supabase Auth's own limits behind it.
- **Headers.** CSP, HSTS, `X-Frame-Options: SAMEORIGIN`, `nosniff`, Referrer-Policy and Permissions-Policy. Admin responses are `no-store` and `noindex`.
- **The CSP allows `'unsafe-inline'` scripts.** Next's prerendered pages and the pre-paint theme script need it, and nonces would make every page dynamic.
- **Admin log.** Every mutation writes `admin_log` (email, action, target, timestamp). The last 15 entries show on the admin home.

## Deferred, deliberately

- **Blog.** Jimmy wants a one-page site. The brief only shows the blog once a post exists, and none does, so no blog routes ship. The schema can add `blog_posts` later.
- **Image cropping in the admin.** Images use `object-fit: cover`, and `next/image` serves AVIF/WebP at each size.
- **Drag-and-drop reordering.** Reordering uses Up/Down buttons per hat. They're easier on a phone and accessible by keyboard.
- **Not done yet:** Lighthouse CI, Playwright end-to-end tests, and testing on a real Android phone. Jimmy will test on a phone later.
