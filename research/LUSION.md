# Lusion (lusion.co): close analysis

Captured 18 Oct 2026 by scrolling the live site in Chrome (desktop 1440×900, phone 390×844) and by reading its JavaScript and CSS bundles. This is the reference Jimmy chose for version 2's layout, transitions and, above all, the line.

## How the line works

What you see is a solid ribbon about 16–22 px wide on desktop. It has a soft blue gradient along its length and a round tip. It comes in from the edge of the screen, sweeps across the headline, and loops right around the media card, passing behind it. It isn't a glowing tube: there's no glow, bloom or light on it at all.

How it's built (from the `Line` class and its shaders):

- **Separate lines, one per section.** It isn't one path for the whole page. There are four lines (`line_reel`, `line_goal`, `line_capability`, `line_office`), each drawn in the space of the viewport (x = width, y = height). Each one is pinned to its section, so it **scrolls with the content** instead of floating.
- **Drawn by scroll position.** Each line has two factors. Its drawn amount is `quadInOut(saturate(-(sectionTop - f0·vh) / (f1·vh)))`, so it grows as its section moves up the screen, with easing at both ends. The fragment shader discards everything past that point along the length.
- **A flat ribbon.** The geometry is a strip: the centre line plus an offset times the radius. The edges are antialiased with `fwidth`. The radius scales with viewport width, about 2× at 540 px down to 1× at 1920 px.
- **A round cap at the tip.** A separate small disc sits at the current end point every frame.
- **Crossings read as over and under.** A per-vertex shade value darkens the ribbon where it passes over itself, once the drawing passes a threshold.
- **Colour.** Each line blends between two colours along its length.
- **Cost.** Lines are hidden when off-screen, DPR is capped at 1.5, and antialiasing is off.

## Layout and look

- **Palette.** The background is `#f0f1fa` (off-white with a hint of lavender), text is black, pills are `#e4e6ef`, dark pills `#2b2e3a`, and blue `#1a2ffb` is the one accent.
- **Header.**
  - The wordmark sits on the left.
  - A three-line statement sits at the top (desktop only).
  - Round buttons on the right: sound, a dark "LET'S TALK •" pill, and a light "MENU ••" pill. On phones it's just one round menu button.
- **Hero.**
  - A huge rounded media card fills the width, inside 72 px margins.
  - A row of `+` markers sits on the column grid under it, with "SCROLL TO EXPLORE" between them.
- **Display type.** Very large (around 130 px desktop, 64 px phone) with tight leading and an indented first line. Body copy is about 20 px with plenty of space.
- **Work.**
  - A huge "Featured Work" heading, with a small uppercase blurb on the right.
  - Below it, a two-column grid of rounded image cards (10 px radius), each with tags and a title underneath.
- **Buttons.** Fully rounded pills, with a small dot before the label.
- **Motion.**
  - Smooth scroll.
  - Media cards travel and scale slightly as they enter.
  - Headings reveal line by line.
  - The easing is `cubic-bezier(.4, 0, .1, 1)`, with 0.4–0.5 s transitions.
  - The menu slides in as an overlay.
- **Fonts.** Aeonik (sans) and IBM Plex Mono for labels. We keep Satoshi, which has a similar geometric tone.

## What we take for Jimmy's site

1. **The line works like Lusion's.**
   - One plain ribbon per section, pinned to that section, drawn by scroll with `quadInOut`, with a round tip and over/under crossings.
   - It loops around the photo and the work heading.
   - It's **black** on the light theme and **white** on the dark one, with no glow.
   - Jimmy's additions: it bends away from the pointer and finger, and some stretches carry a black-and-white **imigongo chevron** pattern inside the ribbon.
2. **The page structure is Lusion's, simplified.** Header (wordmark, theme toggle, "Let's talk", menu), then hero, work, about, contact. Nothing else.
3. **Lusion's palette logic, our identity.** An off-white light theme and a deep near-black dark theme, with black and white only. Imigongo appears in a few places only, always in black and white: the grid markers become small imigongo diamonds, the project tiles use patterns until real photos exist, the line has patterned stretches, and a thin band runs in the footer.
4. **Compact work.** Five small cards, so a phone reaches the contact section in a few swipes. Each card links to the live project.
5. **The same motion grammar.** Lenis smooth scroll, line-by-line heading reveals, gently scaling cards, pill buttons, a sliding menu, and the `.4, 0, .1, 1` easing.
