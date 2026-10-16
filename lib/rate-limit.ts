import "server-only";
import { headers } from "next/headers";

/**
 * Small fixed-window limiter for the login and setup actions. It lives in
 * memory, so on Vercel each instance counts separately: it slows down
 * guessing, and Supabase Auth's own rate limits sit behind it.
 */
const hits = new Map<string, { count: number; resetAt: number }>();

export async function rateLimit(bucket: string, limit = 5, windowMs = 10 * 60_000) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count++;
  return entry.count <= limit;
}
