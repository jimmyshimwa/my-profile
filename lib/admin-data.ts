import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  alsoShippedFromRow,
  clockStatusFromRow,
  lineMessageFromRow,
  positionFromRow,
  profileFromRow,
  projectFromRow,
} from "./content/rows";
import { seed } from "./content/seed";

/* Admin reads: as the signed-in admin, so drafts and hidden rows show too. */

export async function adminProfile(db: SupabaseClient) {
  const { data } = await db.from("profile").select("*").eq("id", 1).maybeSingle();
  return data ? profileFromRow(data) : seed.profile;
}

export async function adminProjects(db: SupabaseClient) {
  const { data } = await db.from("projects").select("*");
  return (data ?? []).map(projectFromRow);
}

export async function adminPositions(db: SupabaseClient) {
  const { data } = await db.from("positions").select("*").order("sort_order");
  return (data ?? []).map(positionFromRow);
}

export async function adminAlsoShipped(db: SupabaseClient) {
  const { data } = await db.from("also_shipped").select("*").order("sort_order");
  return (data ?? []).map(alsoShippedFromRow);
}

export async function adminLineMessages(db: SupabaseClient) {
  const { data } = await db.from("line_messages").select("*").order("trigger");
  return (data ?? []).map(lineMessageFromRow);
}

export async function adminClockStatuses(db: SupabaseClient) {
  const { data } = await db.from("clock_statuses").select("*").order("start_hour");
  return (data ?? []).map(clockStatusFromRow);
}

export async function adminMedia(db: SupabaseClient) {
  const { data } = await db.from("media").select("*").order("created_at", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id as string,
    path: r.path as string,
    url: r.url as string,
    alt: r.alt as string,
    createdAt: r.created_at as string,
  }));
}

export async function adminLog(db: SupabaseClient) {
  const { data } = await db.from("admin_log").select("*").order("created_at", { ascending: false }).limit(15);
  return (data ?? []) as { id: number; email: string; action: string; target: string | null; created_at: string }[];
}
