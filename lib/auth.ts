import "server-only";
import { redirect } from "next/navigation";
import { createSessionClient } from "./supabase/server";
import { supabaseConfigured } from "./supabase/env";

export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();

export function isAdminEmail(email: string | null | undefined) {
  return Boolean(ADMIN_EMAIL) && (email ?? "").trim().toLowerCase() === ADMIN_EMAIL;
}

/**
 * The one gate for every admin page and every mutation. The proxy only does
 * an optimistic redirect; this check is the real one. The database enforces
 * the same rule again with row level security.
 */
export async function requireAdmin() {
  if (!supabaseConfigured || !ADMIN_EMAIL) redirect("/admin/login?e=config");
  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !isAdminEmail(data.user.email)) {
    redirect("/admin/login");
  }
  return { supabase, email: data.user.email! };
}

/** Same check for server actions: throws instead of redirecting. */
export async function assertAdmin() {
  if (!supabaseConfigured || !ADMIN_EMAIL) throw new Error("Admin is not configured.");
  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user || !isAdminEmail(data.user.email)) {
    throw new Error("Not allowed.");
  }
  return { supabase, email: data.user.email! };
}
