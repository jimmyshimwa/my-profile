"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { assertAdmin, isAdminEmail, ADMIN_EMAIL } from "@/lib/auth";
import {
  alsoShippedToRow,
  clockStatusToRow,
  lineMessageToRow,
  positionToRow,
  profileToRow,
  projectToRow,
} from "@/lib/content/rows";
import {
  alsoShippedSchema,
  clockStatusSchema,
  credentialsSchema,
  lineMessageSchema,
  positionSchema,
  profileSchema,
  projectSchema,
} from "@/lib/content/schemas";
import { CONTENT_TAG } from "@/lib/data";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/site";
import { createSessionClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

function zodError(e: z.ZodError) {
  const first = e.issues[0];
  return first ? `${first.path.join(".") || "Input"}: ${first.message}` : "Invalid input";
}

/** Every write: check the admin, run it, log it, refresh the public site. */
async function mutate(
  action: string,
  target: string | null,
  run: (db: Awaited<ReturnType<typeof assertAdmin>>["supabase"]) => PromiseLike<{ error: { message: string } | null }>,
): Promise<ActionResult> {
  let admin;
  try {
    admin = await assertAdmin();
  } catch {
    return { ok: false, error: "You are signed out. Sign in again." };
  }
  const { error } = await run(admin.supabase);
  if (error) return { ok: false, error: error.message };
  await admin.supabase.from("admin_log").insert({ email: admin.email, action, target });
  // One tag covers every public page; the next visit renders fresh content.
  updateTag(CONTENT_TAG);
  return { ok: true, message: "Saved. It's live." };
}

/* Auth ------------------------------------------------------------------ */

export async function signIn(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!(await rateLimit("login"))) return { ok: false, error: "Too many attempts. Try again in 10 minutes." };
  const parsed = credentialsSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { ok: false, error: "Wrong email or password." };
  if (!isAdminEmail(parsed.data.email)) return { ok: false, error: "Wrong email or password." };
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: error.message.includes("confirm") ? "Confirm your email first." : "Wrong email or password." };
  redirect("/admin");
}

export async function setupAccount(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  if (!(await rateLimit("setup", 3))) return { ok: false, error: "Too many attempts. Try again later." };
  if (!ADMIN_EMAIL) return { ok: false, error: "ADMIN_EMAIL is not set on the server." };
  const parsed = credentialsSchema.safeParse({ email: form.get("email"), password: form.get("password") });
  if (!parsed.success) return { ok: false, error: zodError(parsed.error) };
  if (!isAdminEmail(parsed.data.email)) {
    return { ok: false, error: "Only the site owner's email can create the admin account." };
  }
  const supabase = await createSessionClient();
  const { error } = await supabase.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: `${SITE_URL}/admin/auth/confirm` },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true, message: "Check your inbox and confirm your email. Then sign in." };
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* Content ---------------------------------------------------------------- */

export async function saveProfile(input: unknown): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: zodError(parsed.error) };
  return mutate("profile.save", null, (db) => db.from("profile").upsert(profileToRow(parsed.data)));
}

export async function saveProject(input: unknown): Promise<ActionResult> {
  const parsed = projectSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: zodError(parsed.error) };
  return mutate("project.save", parsed.data.slug, (db) => db.from("projects").upsert(projectToRow(parsed.data)));
}

export async function deleteProject(id: string): Promise<ActionResult> {
  return mutate("project.delete", id, (db) => db.from("projects").delete().eq("id", id));
}

export async function savePosition(input: unknown): Promise<ActionResult> {
  const parsed = positionSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: zodError(parsed.error) };
  return mutate("position.save", parsed.data.title, (db) => db.from("positions").upsert(positionToRow(parsed.data)));
}

export async function deletePosition(id: string): Promise<ActionResult> {
  return mutate("position.delete", id, (db) => db.from("positions").delete().eq("id", id));
}

export async function saveAlsoShipped(input: unknown): Promise<ActionResult> {
  const parsed = alsoShippedSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: zodError(parsed.error) };
  return mutate("also_shipped.save", parsed.data.title, (db) =>
    db.from("also_shipped").upsert(alsoShippedToRow(parsed.data)),
  );
}

export async function deleteAlsoShipped(id: string): Promise<ActionResult> {
  return mutate("also_shipped.delete", id, (db) => db.from("also_shipped").delete().eq("id", id));
}

export async function saveLineMessage(input: unknown): Promise<ActionResult> {
  const parsed = lineMessageSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: zodError(parsed.error) };
  return mutate("line_message.save", parsed.data.text, (db) =>
    db.from("line_messages").upsert(lineMessageToRow(parsed.data)),
  );
}

export async function deleteLineMessage(id: string): Promise<ActionResult> {
  return mutate("line_message.delete", id, (db) => db.from("line_messages").delete().eq("id", id));
}

export async function saveClockStatus(input: unknown): Promise<ActionResult> {
  const parsed = clockStatusSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: zodError(parsed.error) };
  return mutate("clock_status.save", parsed.data.text, (db) =>
    db.from("clock_statuses").upsert(clockStatusToRow(parsed.data)),
  );
}

export async function deleteClockStatus(id: string): Promise<ActionResult> {
  return mutate("clock_status.delete", id, (db) => db.from("clock_statuses").delete().eq("id", id));
}

/* Media ------------------------------------------------------------------ */

const IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export async function uploadMedia(_: ActionResult | null, form: FormData): Promise<ActionResult> {
  const file = form.get("file");
  const alt = String(form.get("alt") ?? "").trim();
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose an image." };
  if (!alt) return { ok: false, error: "Alt text is required. Describe the image for people who can't see it." };
  if (alt.length > 200) return { ok: false, error: "Keep alt text under 200 characters." };
  const ext = IMAGE_TYPES.get(file.type);
  if (!ext) return { ok: false, error: "Use a JPG, PNG, WebP or AVIF image." };
  if (file.size > 8 * 1024 * 1024) return { ok: false, error: "Images must be under 8 MB." };

  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.${ext}`;
  return mutate("media.upload", path, async (db) => {
    const up = await db.storage.from("media").upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (up.error) return { error: up.error };
    const { data } = db.storage.from("media").getPublicUrl(path);
    return db.from("media").insert({ path, url: data.publicUrl, alt });
  });
}

export async function deleteMedia(id: string, path: string): Promise<ActionResult> {
  return mutate("media.delete", path, async (db) => {
    const rm = await db.storage.from("media").remove([path]);
    if (rm.error) return { error: rm.error };
    return db.from("media").delete().eq("id", id);
  });
}
