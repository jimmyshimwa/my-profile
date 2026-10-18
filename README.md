# Jimmy Shimwa: portfolio (version 2)

A one-page portfolio for Jimmy Shimwa, in the style of lusion.co. A plain ribbon line draws itself through each section as you scroll and bends away from the pointer. Imigongo patterns appear in black and white in a few places. There are light and dark themes, and "See me as" switches the copy between Founder, Engineer and Project manager. There's a small admin for editing every word.

- Design and technical decisions: [DECISIONS.md](DECISIONS.md)
- Draft copy and guessed facts to check: [CONTENT_REVIEW.md](CONTENT_REVIEW.md)
- Reference research: [research/LUSION.md](research/LUSION.md) (the main reference) and [research/REFERENCES.md](research/REFERENCES.md)

## Run it locally

```bash
npm install
npm run dev          # http://localhost:3000
```

Without Supabase keys the site runs on the built-in content in `lib/content/seed.ts`. The admin needs Supabase.

Other scripts:

```bash
npm run build        # production build
npm run lint
npm run typecheck
npm test             # unit tests (Node test runner)
npm run db:seed      # write the seed content to Supabase (see below)
```

Add `?tier=full`, `?tier=lite`, `?tier=svg` or `?tier=static` to the URL to force a version of the line. This is useful on a real phone.

## Connect Supabase (one time, about 10 minutes)

1. Create a project at [supabase.com](https://supabase.com). Free is fine.
2. In **SQL Editor**, paste and run `supabase/migrations/0001_init.sql`. It creates the tables, the security rules and a public `media` storage bucket.
3. Copy `.env.example` to `.env.local` and fill it in from **Project Settings > API**: the URL, the `anon` key and the `service_role` key. Set `ADMIN_EMAIL` to your email.
4. Run `npm run db:seed`. It loads the launch content and registers `ADMIN_EMAIL` as the admin.
5. In **Authentication > URL Configuration**, set the Site URL to your live domain, and add `https://YOUR-DOMAIN/admin/auth/confirm` (and `http://localhost:3000/admin/auth/confirm`) to the redirect URLs.
6. Open `/admin/setup`, create your account with your email and a password of 12+ characters, and confirm the email Supabase sends.
7. In **Authentication > Providers > Email**, turn off **Allow new users to sign up**. Keep **Confirm email** on.

## Deploy on Vercel

The repo is already connected to Vercel. In **Project > Settings > Environment Variables**, add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
| `ADMIN_EMAIL` | your email |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain` (optional on Vercel) |

**Never** add `SUPABASE_SERVICE_ROLE_KEY` to Vercel. It's only for the seed script on your machine.

## Editing the site (from your phone too)

Go to `/admin` and sign in.

- **Profile and hats.** The three hero statements and bios side by side, plus contact links, stats and the photo.
- **Projects.**
  - Open a project to edit it.
  - Each hat has its own role label and one-liner.
  - The **first link** is where the card opens; leave links empty and the card isn't clickable.
  - Paste a Media URL into **Cover image** to replace the imigongo tile with a photo.
  - Reorder per hat with Up/Down.
  - Untick Published to hide a project.
- **Kigali clock.** The footer status lines by hour.
- **Media.** Upload images (alt text is required), then copy a URL into a project or your profile.

**Save and publish** makes a change live straight away. Unsaved edits are kept in the browser and the page warns you before you leave.

## Project layout

```
app/(site)/          the public page (one page: hero, work, about, contact)
app/admin/           admin pages and server actions (actions.ts)
components/line/     the line: WebGL ribbon, shaders, SVG fallback
components/site/     header and menu, hat switch, reveals, work grid, imigongo
components/admin/    admin forms
lib/content/         types, seed content, validation, row mapping
lib/lines.ts         lays out each section's line around the page
supabase/migrations/ database schema and security rules
scripts/seed.ts      loads seed content into Supabase
```
