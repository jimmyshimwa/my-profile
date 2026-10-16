import { z } from "zod";
import { LINE_MOVES, LINE_TRIGGERS, TIMES_OF_DAY } from "./types.ts";

/* Validation for every admin input. Server actions parse with these. */

const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => z.string().trim().min(1, "Required").max(max);
const url = z.union([z.literal(""), z.url({ protocol: /^https?$/ })]);
// Site-relative paths (e.g. /images/x.png) or full http(s) URLs.
const asset = z.union([z.literal(""), z.string().regex(/^\/[\w\-./]*$/), z.url({ protocol: /^https?$/ })]);
const nullableUrl = z
  .union([z.literal(""), z.url({ protocol: /^https?$/ }), z.null()])
  .transform((v) => (v ? v : null));

const perHat = <T extends z.ZodType>(s: T) => z.object({ founder: s, engineer: s, pm: s });

export const hatCopySchema = z.object({
  hero: required(140),
  short: required(400),
  long: required(2000),
});

export const profileSchema = z.object({
  name: required(80),
  location: required(80),
  email: z.email(),
  github: url,
  linkedin: url,
  x: url,
  cvUrl: asset,
  avatarUrl: asset,
  avatarAlt: required(200),
  yearsExperience: z.coerce.number().int().min(0).max(60),
  projectCount: z.coerce.number().int().min(0).max(1000),
  hats: perHat(hatCopySchema),
});

export const positionSchema = z.object({
  id: z.uuid(),
  title: required(120),
  organization: required(120),
  url: nullableUrl,
  startDate: z.iso.date(),
  endDate: z.union([z.iso.date(), z.literal(""), z.null()]).transform((v) => (v ? v : null)),
  current: z.boolean(),
  description: perHat(text(400)),
  order: z.coerce.number().int(),
  visible: z.boolean(),
});

export const projectSchema = z
  .object({
    id: z.uuid(),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes only"),
    title: required(120),
    summary: required(400),
    body: text(20000),
    coverUrl: z.union([asset, z.null()]).transform((v) => (v ? v : null)),
    coverAlt: z.union([text(200), z.null()]).transform((v) => (v ? v : null)),
    roles: perHat(z.object({ label: text(60), line: text(200) })),
    stack: z.array(required(40)).max(20),
    links: z.array(z.object({ label: required(60), url: z.url({ protocol: /^https?$/ }) })).max(8),
    year: z.coerce.number().int().min(2000).max(2100),
    featured: z.boolean(),
    order: perHat(z.coerce.number().int()),
    published: z.boolean(),
    move: z.enum(LINE_MOVES),
    seoTitle: z.union([text(70), z.null()]).transform((v) => (v ? v : null)),
    seoDescription: z.union([text(170), z.null()]).transform((v) => (v ? v : null)),
  })
  .refine((p) => !p.coverUrl || Boolean(p.coverAlt), {
    message: "Alt text is required when there is a cover image",
    path: ["coverAlt"],
  });

export const alsoShippedSchema = z.object({
  id: z.uuid(),
  title: required(120),
  note: text(240),
  url: nullableUrl,
  status: z.enum(["shipped", "finished"]),
  order: z.coerce.number().int(),
  visible: z.boolean(),
});

export const lineMessageSchema = z.object({
  id: z.uuid(),
  trigger: z.enum(LINE_TRIGGERS),
  hat: z.union([z.enum(["founder", "engineer", "pm"]), z.null()]),
  timeOfDay: z.union([z.enum(TIMES_OF_DAY), z.null()]),
  text: required(80),
  active: z.boolean(),
});

export const clockStatusSchema = z
  .object({
    id: z.uuid(),
    startHour: z.coerce.number().int().min(0).max(23),
    endHour: z.coerce.number().int().min(1).max(24),
    text: required(80),
  })
  .refine((c) => c.endHour > c.startHour, { message: "End must be after start", path: ["endHour"] });

export const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(12, "At least 12 characters").max(200),
});
