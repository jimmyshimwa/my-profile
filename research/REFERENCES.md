# Reference study for the Jimmy Shimwa portfolio

Fetched 2026-10-16. For each site we fetched the homepage HTML and every linked JS/CSS bundle, searched the minified code for library signatures, config values and GLSL, and read any public write-ups. "Evidence" means read in code; "likely" means inferred.

Our concept: one glowing blue Three.js tube ("the Line") fixed behind the page, driven by scroll. It hikes across a contour map of Rwanda's hills, makes a move at each milestone (coil, frame, knot, write), and has personality (stretch, idle wiggle, pointer reaction, Kigali-time lighting). A full-screen gate offers three hats: Founder, Engineer, PM. Satoshi is the only typeface.

---

## 1. lusion.co

**Mechanics.** WebGL and DOM composited into one scroll-driven scene. Thin lines draw themselves along authored paths as sections enter, with a small cap marking the tip. Also tunnels, physics balloons, particles and a pointer "screen paint" trail.

**Implementation (evidence).** Astro and Vite with three.js r158 and custom `ShaderMaterial`s, plus its own `ScrollManager` (no Lenis). The `Line` class loads its path from a prebuilt binary (`lines/line_office.buf`). The attribute names (`CP`, `Cd`) follow Houdini conventions, and their 2019 Awwwards case study confirms they precompute data in Houdini. Each vertex's z stores its progress along the path. A `u_showRatio` uniform (eased `quadInOut` and mapped from the section's scroll range) sets how much is drawn, and a separate circle mesh is placed at the interpolated tip each frame. Radius scales with viewport width. Shaders use blue-noise dithering, with SMAA and bloom in post.

**Performance (evidence).** `DPR = Math.min(1.5, devicePixelRatio)`, plus `MAX_PIXEL_COUNT = 2560*1440`, which shrinks the buffer on big screens. On mobile: no bloom convolution, low-detail assets (`matcap_ld`, `stickers_low`, `mobile_video`), a smaller simulation texture, fewer instances, and the about-page lines skipped entirely. Lines are hidden when their bounding box is off-screen. The renderer uses `antialias:false` and `powerPreference:"high-performance"`, and handles context loss.

**What we take.** Treat the route as data. Precompute the Line's path into a buffer with per-vertex progress, and drive the visible extent with one `uDraw` uniform; the glowing tip is a separate cheap sprite. Copy the budget: DPR capped at 1.5, a pixel-count cap, and lighter phone assets.

## 2. iventions.com

**Mechanics.** Highlight projects arrive one at a time. Each holds a pinned or sticky stage for its share of the scroll, then hands over. Copy appears twice in the DOM, which points to masked line reveals.

**Implementation (evidence).** Next.js on headless WordPress, with GSAP 3.11, ScrollTrigger, SplitText (lines wrapped in `-mask` elements) and Lenis. A pin at `start:"center center"` with `pinSpacing:false` writes its progress to a CSS `--progress` variable, remapped from 0.25–1. A sticky stage is `200svh` tall on desktop and `100svh` on mobile, with `scrub:true`. The class `spotlightWrapper` appears. The developer's write-up says three.js is used, but we found no WebGL in the homepage bundles.

**Performance.** From the write-up: DPR capped at 2, only transform and opacity animated, render loops paused off-screen. `prefers-reduced-motion` is handled through `gsap.matchMedia` (also found in code). Mobile scroll runways are half as long.

**What we take.** Each milestone gets a sticky stage with a fixed scroll budget, and its progress feeds CSS (`--p`) and a Line uniform. Only the milestone the Line is performing is lit; neighbours dim.

## 3. minhpham.design

**Mechanics.** The "toggle" is a cursor lens. Every block exists twice, straight ("Design Lead") and joking ("Self-lead Designer"). A cursor-following circular mask reveals the joke layer, and a button expands the mask to fill the screen.

**Implementation (evidence).** A custom webpack build by DevHonTran, with three.js (GLTF, Draco, meshopt), GSAP and Lenis. The paired layers are `mask_el__masking` and `mask_el__deep` (38 each), revealed by a CSS `mask-position` driven by `--x`, `--y` and `--size`. Lenis stays stopped until the loader finishes, and smooth wheel is off on touch devices.

**Performance.** The reveal is pure CSS masking, with no WebGL.

**What we take.** Not the lens. What we take is that the alternate copy is written ahead of time and already in the DOM, so swapping is instant and needs no fetch. We will have three authored strings per slot, switched by a `data-hat` attribute, with scrolling locked until the gate is passed.

## 4. matvoyce.tv

**Mechanics.** Huge animated lettering (video, GIF, Lottie), odometer digit counters, and a "Scroll" marquee. Kinetic type stays in its own panels, and readable copy sits beside it at normal size.

**Implementation (evidence).** Built by Uncommon ("Design by Uncommon"; some chunks are shared with their site). Next.js with three.js r167 through react-three-fiber (r3f performance regress defaults present) and a noise-distort material. GSAP 3.12.5 with Observer, ScrollTrigger and ScrollTo, plus Lenis. The Awwwards case study mentions three distinct layouts, FreezeFrame.js to pause GIFs, and GIFs chosen over Lottie in places to save rendering.

**Performance.** Media lazy-loads, offscreen GIFs freeze, and video streams. The case study says performance testing should have started earlier.

**What we take.** Motion and reading get separate lanes. The Line's "write" move can draw a word, but body copy settles and never moves while it is being read. Stretch reads velocity from one source.

## 5. by-kin.com

**Mechanics.** Weighted smooth scroll, a percentage loader, a toggle between two grid layouts, and split-panel page transitions with a per-page message. Mobile is portrait-only.

**Implementation (evidence).** Next.js, GSAP 3.12.5 with ScrollTrigger, and Lenis feeding entry animations; the `pageTransition__part_left/right` components are present. There is no WebGL. From the write-up: navigation is one GSAP timeline (`expo.inOut`, 0.9s). A cover wipes in, the route swaps at the midpoint, and new content rises before the cover clears (`'<0.15'`).

**Performance.** No canvas, only transform and opacity, and reveals use `once:true`.

**What we take.** The seamless feel comes from one shared timeline and one set of easing tokens, not from WebGL. Every exit overlaps the next entrance. Our Line can act as the cover, sweeping across between the gate and the page and between milestones.

## 6. uncommonstudio.com.au (now redirects to uncommondesign.group)

**Mechanics.** Sticky stacking, clip-path reveals and cover moves make section changes feel like a camera moving. Reels play full-bleed.

**Implementation (evidence).** Next.js with three.js r158 and r3f, GSAP 3.12.5 with ScrollTrigger (`scrub:1`), Lenis 1.1.6 and Lottie. We found many `position:sticky`, `clipPath` and `mix-blend-mode` uses. From the write-up: the cover moves `yPercent` 0 to −100, content enters from 110 with a 0.05 stagger, and only one video plays at a time.

**Performance.** One active reel at a time, poster frames until load, sections start near the viewport and pause when they leave, and reduced motion is gated.

**What we take.** Transitions are real camera moves: the Three.js camera dollies or tilts across the contour map between milestones while DOM sections slide in step. The grid breaks where the Line passes. One heavy effect at a time.

## 7. obys.agency

**Mechanics.** An editorial index with numbered entries, discipline tags and large type. Each frame works as a composed poster.

**Implementation (evidence).** A custom vanilla build. An inline script detects the device and loads `/js/d.js` (120 KB, a hand-written WebGL2 renderer) on desktop or `/js/m.js` (60 KB, no WebGL, Web Animations API only) on mobile. The shader draws image planes with antialiased `fwidth` edge masks and a grayscale blend, and only redraws planes marked active. From Codrops: "You can break the grid only if you understand it… Freedom without structure is noise."

**Performance.** Mobile gets a different bundle, not a scaled-down one; there is no three.js; and rendering is dirty-flag only.

**What we take.** Every milestone must work as a still poster: Satoshi at scale, a strict grid, the Line in a composed pose. WebGL is a separate module that loads later.

## 8. activetheory.net

**Mechanics.** A fully WebGL site (canvas `#Stage`, with a hidden `GLA11y` text layer for accessibility) with particles, volumetric light, bloom and interactive tubes. It still runs on phones.

**Implementation (evidence).** Their in-house framework, Hydra; we found no public write-up. KTX2/Basis textures and Draco geometry. A `Tests` class picks settings by GPU tier (`GPU.lt(n)` / `GPU.mobileLT(n)`):
- DPR: `mobileLT(1|2)?min(dpr,1) : mobileLT(3)?min(dpr,1.25) : mobileLT(4)?min(dpr,1.5)`
- `capFPS`: 30 on low tiers, and 60 or 100 on high-refresh screens
- `particleCount` from 16,384 to 1,048,576
- `bloom`, `lensStreak` and `volumetricLight` only at tier 3 and up; `interactiveTubes` needs WebGL2 and volumetric light; no music on mobile

Each render callback can set its own frame rate, and everything pauses when the tab is hidden.

**What we take.** Write a small `quality.ts` that returns one tier, based on GPU detection plus the measured frame rate in the first second. Every Line feature reads from it: tube and radial segments, bloom, glow passes, contour count, DPR and fps cap. The idle wiggle and Kigali-light updates can run at 30 fps or less, while the scroll-driven draw stays at full rate.

---

## Synthesis: rules for our build

1. **One number drives the route.** Precompute the path with per-vertex progress, and let scroll set one `uDraw` uniform. Milestone moves are authored path segments, not runtime physics.
2. **Tiers from day one.** Pick tier 0–3 at boot. DPR (1.5 on desktop, 1.25 on mid-range phones), pixel cap, segments, bloom, contour density and fps cap all come from the tier.
3. **Pause aggressively.** Stop rendering when the tab is hidden, when nothing has changed, or when the canvas is covered. Wiggle and light updates run at a reduced rate.
4. **The page works without WebGL.** The DOM is complete on its own, the Line loads later, and reduced motion gets a static drawn route.
5. **One motion vocabulary.** DOM and Line share easing and duration tokens. Transitions run on one timeline, and every exit overlaps the next entrance.
6. **Reading comes first.** Never move text while it is being read; kinetic moves happen in the gaps.
7. **One milestone at a time.** Sticky stages with fixed scroll budgets and only the current milestone lit. Shorter runways on mobile.
8. **Every frame is a poster.** Each milestone works as a still, and the grid breaks only where the Line needs room.
9. **Hats are authored copy.** Three strings per slot in the DOM, switched by `data-hat`. The gate locks scroll and stores the choice.
10. **Camera moves are the transitions.** One heavy effect at a time.
11. **Velocity from one source.** Stretch and pointer reactions read smoothed, clamped velocity from the smooth-scroll instance, so a flick can't break the tube.
12. **Phones get their own design.** Fewer contours, a thinner tube, no bloom on low tiers, and possibly a separate lighter chunk.

## Method and limits

All findings come from fetched HTML, minified bundles and public write-ups: Awwwards on Lusion (the 2019 site) and Mat Voyce, Codrops on Obys, and hontran.dev on iventions, by-kin and Uncommon. **We did not watch any of these animations live**, so motion is inferred from code and DOM structure, not observed. Every site was fetchable. uncommonstudio.com.au redirects to uncommondesign.group, which is what we analysed. We found no build write-up for the current Lusion site or for Active Theory. The hontran.dev posts reuse near-identical snippets, so treat their specifics as indicative. We only fetched homepages, so code lazy-loaded on other routes (such as iventions' three.js) may be missing. We read code to learn techniques and copied none of it.
