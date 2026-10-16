import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { seed } from "./content/seed";
import {
  alsoShippedFromRow,
  clockStatusFromRow,
  lineMessageFromRow,
  positionFromRow,
  profileFromRow,
  projectFromRow,
} from "./content/rows";
import type { Project, SiteContent } from "./content/types";
import { supabaseConfigured } from "./supabase/env";
import { createPublicClient } from "./supabase/server";

/** Every public page reads through this tag; admin saves expire it. */
export const CONTENT_TAG = "content";

/**
 * All public content in one cached read. The site is small, so one query
 * batch keeps it simple and makes revalidation a single tag.
 */
export async function getSiteContent(): Promise<SiteContent> {
  "use cache";
  cacheTag(CONTENT_TAG);
  cacheLife("max");

  if (!supabaseConfigured) return seed;

  const db = createPublicClient();
  const [profile, positions, projects, alsoShipped, lineMessages, clockStatuses] =
    await Promise.all([
      db.from("profile").select("*").eq("id", 1).maybeSingle(),
      db.from("positions").select("*").eq("visible", true).order("sort_order"),
      db.from("projects").select("*").eq("published", true),
      db.from("also_shipped").select("*").eq("visible", true).order("sort_order"),
      db.from("line_messages").select("*").eq("active", true),
      db.from("clock_statuses").select("*").order("start_hour"),
    ]);

  const failed = [profile, positions, projects, alsoShipped, lineMessages, clockStatuses].find(
    (r) => r.error,
  );
  if (failed?.error) {
    console.error("Supabase read failed, serving seed content:", failed.error.message);
    return seed;
  }

  return {
    profile: profile.data ? profileFromRow(profile.data) : seed.profile,
    positions: (positions.data ?? []).map(positionFromRow),
    projects: (projects.data ?? []).map(projectFromRow),
    alsoShipped: (alsoShipped.data ?? []).map(alsoShippedFromRow),
    lineMessages: (lineMessages.data ?? []).map(lineMessageFromRow),
    clockStatuses: (clockStatuses.data ?? []).map(clockStatusFromRow),
  };
}

export async function getProject(slug: string): Promise<Project | null> {
  const { projects } = await getSiteContent();
  return projects.find((p) => p.slug === slug) ?? null;
}
