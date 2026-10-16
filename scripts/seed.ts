/**
 * Writes the launch content (lib/content/seed.ts) to Supabase and registers
 * ADMIN_EMAIL as the admin. Safe to re-run: rows are upserted by id.
 *
 *   npm run db:seed
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ADMIN_EMAIL
 * in .env.local. The service role key bypasses row level security, so it is
 * only ever used here, on your machine, never in the app.
 */
import { createClient } from "@supabase/supabase-js";
import { seed } from "../lib/content/seed.ts";
import {
  alsoShippedToRow,
  clockStatusToRow,
  lineMessageToRow,
  positionToRow,
  profileToRow,
  projectToRow,
} from "../lib/content/rows.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
if (!url || !key || !adminEmail) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and ADMIN_EMAIL in .env.local");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

const steps: [string, () => PromiseLike<{ error: { message: string } | null }>][] = [
  ["admins", () => db.from("admins").upsert({ email: adminEmail })],
  ["profile", () => db.from("profile").upsert(profileToRow(seed.profile))],
  ["positions", () => db.from("positions").upsert(seed.positions.map(positionToRow))],
  ["projects", () => db.from("projects").upsert(seed.projects.map(projectToRow))],
  ["also_shipped", () => db.from("also_shipped").upsert(seed.alsoShipped.map(alsoShippedToRow))],
  ["line_messages", () => db.from("line_messages").upsert(seed.lineMessages.map(lineMessageToRow))],
  ["clock_statuses", () => db.from("clock_statuses").upsert(seed.clockStatuses.map(clockStatusToRow))],
];

for (const [name, run] of steps) {
  const { error } = await run();
  if (error) {
    console.error(`${name}: ${error.message}`);
    process.exit(1);
  }
  console.log(`${name}: ok`);
}
console.log("Seeded. Redeploy or save anything in the admin to refresh the cache.");
