export const HATS = ["founder", "engineer", "pm"] as const;
export type Hat = (typeof HATS)[number];

export const HAT_LABEL: Record<Hat, string> = {
  founder: "Founder",
  engineer: "Engineer",
  pm: "Project manager",
};

export type PerHat<T> = Record<Hat, T>;

/** How the Line behaves when it reaches a milestone. */
export const LINE_MOVES = ["coil", "frame", "knot", "write", "steps"] as const;
export type LineMove = (typeof LINE_MOVES)[number];

export const TIMES_OF_DAY = ["dawn", "day", "dusk", "night"] as const;
export type TimeOfDay = (typeof TIMES_OF_DAY)[number];

export type HatCopy = {
  hero: string;
  short: string;
  long: string;
};

export type Profile = {
  name: string;
  location: string;
  email: string;
  github: string;
  linkedin: string;
  x: string;
  cvUrl: string;
  avatarUrl: string;
  avatarAlt: string;
  yearsExperience: number;
  projectCount: number;
  hats: PerHat<HatCopy>;
};

export type Position = {
  id: string;
  title: string;
  organization: string;
  url: string | null;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: PerHat<string>;
  order: number;
  visible: boolean;
};

export type ProjectLink = { label: string; url: string };

export type Project = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  /** Case study. Paragraphs separated by blank lines; lines starting with "## " are headings. */
  body: string;
  coverUrl: string | null;
  coverAlt: string | null;
  roles: PerHat<{ label: string; line: string }>;
  stack: string[];
  links: ProjectLink[];
  year: number;
  featured: boolean;
  order: PerHat<number>;
  published: boolean;
  move: LineMove;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type AlsoShipped = {
  id: string;
  title: string;
  note: string;
  url: string | null;
  status: "shipped" | "finished";
  order: number;
  visible: boolean;
};

export const LINE_TRIGGERS = ["hello", "idle", "fast", "end"] as const;
export type LineTrigger = (typeof LINE_TRIGGERS)[number];

export type LineMessage = {
  id: string;
  trigger: LineTrigger;
  hat: Hat | null;
  timeOfDay: TimeOfDay | null;
  text: string;
  active: boolean;
};

export type ClockStatus = {
  id: string;
  /** Inclusive start hour, 0–23, Kigali time. */
  startHour: number;
  /** Exclusive end hour, 1–24. */
  endHour: number;
  text: string;
};

export type MediaItem = {
  id: string;
  url: string;
  alt: string;
  createdAt: string;
};

export type SiteContent = {
  profile: Profile;
  positions: Position[];
  projects: Project[];
  alsoShipped: AlsoShipped[];
  lineMessages: LineMessage[];
  clockStatuses: ClockStatus[];
};
