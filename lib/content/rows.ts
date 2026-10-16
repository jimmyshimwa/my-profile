import type {
  AlsoShipped,
  ClockStatus,
  LineMessage,
  Position,
  Profile,
  Project,
} from "./types.ts";

/* Map between database rows (snake_case) and app types (camelCase). */

type Row = Record<string, unknown>;

export function profileFromRow(r: Row): Profile {
  return {
    name: r.name as string,
    location: r.location as string,
    email: r.email as string,
    github: r.github as string,
    linkedin: r.linkedin as string,
    x: r.x as string,
    cvUrl: r.cv_url as string,
    avatarUrl: r.avatar_url as string,
    avatarAlt: r.avatar_alt as string,
    yearsExperience: r.years_experience as number,
    projectCount: r.project_count as number,
    hats: r.hats as Profile["hats"],
  };
}

export function profileToRow(p: Profile) {
  return {
    id: 1,
    name: p.name,
    location: p.location,
    email: p.email,
    github: p.github,
    linkedin: p.linkedin,
    x: p.x,
    cv_url: p.cvUrl,
    avatar_url: p.avatarUrl,
    avatar_alt: p.avatarAlt,
    years_experience: p.yearsExperience,
    project_count: p.projectCount,
    hats: p.hats,
    updated_at: new Date().toISOString(),
  };
}

export function positionFromRow(r: Row): Position {
  return {
    id: r.id as string,
    title: r.title as string,
    organization: r.organization as string,
    url: (r.url as string | null) ?? null,
    startDate: r.start_date as string,
    endDate: (r.end_date as string | null) ?? null,
    current: r.current as boolean,
    description: r.description as Position["description"],
    order: r.sort_order as number,
    visible: r.visible as boolean,
  };
}

export function positionToRow(p: Position) {
  return {
    id: p.id,
    title: p.title,
    organization: p.organization,
    url: p.url,
    start_date: p.startDate,
    end_date: p.endDate,
    current: p.current,
    description: p.description,
    sort_order: p.order,
    visible: p.visible,
    updated_at: new Date().toISOString(),
  };
}

export function projectFromRow(r: Row): Project {
  return {
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as string,
    summary: r.summary as string,
    body: r.body as string,
    coverUrl: (r.cover_url as string | null) ?? null,
    coverAlt: (r.cover_alt as string | null) ?? null,
    roles: r.roles as Project["roles"],
    stack: (r.stack as string[]) ?? [],
    links: (r.links as Project["links"]) ?? [],
    year: r.year as number,
    featured: r.featured as boolean,
    order: r.sort_order as Project["order"],
    published: r.published as boolean,
    move: r.line_move as Project["move"],
    seoTitle: (r.seo_title as string | null) ?? null,
    seoDescription: (r.seo_description as string | null) ?? null,
  };
}

export function projectToRow(p: Project) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    body: p.body,
    cover_url: p.coverUrl,
    cover_alt: p.coverAlt,
    roles: p.roles,
    stack: p.stack,
    links: p.links,
    year: p.year,
    featured: p.featured,
    sort_order: p.order,
    published: p.published,
    line_move: p.move,
    seo_title: p.seoTitle,
    seo_description: p.seoDescription,
    updated_at: new Date().toISOString(),
  };
}

export function alsoShippedFromRow(r: Row): AlsoShipped {
  return {
    id: r.id as string,
    title: r.title as string,
    note: r.note as string,
    url: (r.url as string | null) ?? null,
    status: r.status as AlsoShipped["status"],
    order: r.sort_order as number,
    visible: r.visible as boolean,
  };
}

export function alsoShippedToRow(a: AlsoShipped) {
  return {
    id: a.id,
    title: a.title,
    note: a.note,
    url: a.url,
    status: a.status,
    sort_order: a.order,
    visible: a.visible,
    updated_at: new Date().toISOString(),
  };
}

export function lineMessageFromRow(r: Row): LineMessage {
  return {
    id: r.id as string,
    trigger: r.trigger as LineMessage["trigger"],
    hat: (r.hat as LineMessage["hat"]) ?? null,
    timeOfDay: (r.time_of_day as LineMessage["timeOfDay"]) ?? null,
    text: r.text as string,
    active: r.active as boolean,
  };
}

export function lineMessageToRow(m: LineMessage) {
  return {
    id: m.id,
    trigger: m.trigger,
    hat: m.hat,
    time_of_day: m.timeOfDay,
    text: m.text,
    active: m.active,
    updated_at: new Date().toISOString(),
  };
}

export function clockStatusFromRow(r: Row): ClockStatus {
  return {
    id: r.id as string,
    startHour: r.start_hour as number,
    endHour: r.end_hour as number,
    text: r.text as string,
  };
}

export function clockStatusToRow(c: ClockStatus) {
  return {
    id: c.id,
    start_hour: c.startHour,
    end_hour: c.endHour,
    text: c.text,
    updated_at: new Date().toISOString(),
  };
}
