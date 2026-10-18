import { test } from "node:test";
import assert from "node:assert/strict";
import { kigaliTime, statusFor } from "../lib/kigali.ts";
import { quadInOut, showRatio } from "../lib/lines.ts";
import { seed } from "../lib/content/seed.ts";
import {
  alsoShippedSchema,
  clockStatusSchema,
  lineMessageSchema,
  positionSchema,
  profileSchema,
  projectSchema,
} from "../lib/content/schemas.ts";

test("Kigali time ignores the visitor's timezone (UTC+2, no DST)", () => {
  const t = kigaliTime(new Date("2026-01-15T20:14:00Z"));
  assert.equal(t.hour, 22);
  assert.equal(t.label, "22:14");
});

test("line draw ratio follows the section, eased at both ends", () => {
  assert.equal(quadInOut(0), 0);
  assert.equal(quadInOut(1), 1);
  assert.equal(quadInOut(0.5), 0.5);
  // Not started while the section is below its start point.
  assert.equal(showRatio(900, 800, 1, 1), 0);
  // Complete once it has moved f1 viewports past the start point.
  assert.equal(showRatio(-100, 800, 1, 1.125), 1);
});

test("every hour has a status line", () => {
  for (let h = 0; h < 24; h++) assert.ok(statusFor(h, seed.clockStatuses), `hour ${h}`);
  assert.equal(statusFor(22, seed.clockStatuses), "probably debugging");
});

test("seed content passes the admin validation", () => {
  assert.ok(profileSchema.safeParse(seed.profile).success);
  for (const p of seed.positions) assert.ok(positionSchema.safeParse(p).success, p.title);
  for (const p of seed.projects) {
    const r = projectSchema.safeParse(p);
    assert.ok(r.success, `${p.slug}: ${r.success ? "" : r.error.message}`);
  }
  for (const a of seed.alsoShipped) assert.ok(alsoShippedSchema.safeParse(a).success, a.title);
  for (const m of seed.lineMessages) assert.ok(lineMessageSchema.safeParse(m).success, m.text);
  for (const c of seed.clockStatuses) assert.ok(clockStatusSchema.safeParse(c).success, c.text);
});

test("validation rejects unsafe input", () => {
  const p = seed.projects[0]!;
  assert.equal(projectSchema.safeParse({ ...p, slug: "../etc" }).success, false);
  assert.equal(projectSchema.safeParse({ ...p, coverUrl: "https://x.test/a.png", coverAlt: null }).success, false);
  assert.equal(projectSchema.safeParse({ ...p, links: [{ label: "x", url: "javascript:alert(1)" }] }).success, false);
  assert.equal(lineMessageSchema.safeParse({ ...seed.lineMessages[0]!, text: "x".repeat(81) }).success, false);
});

test("each hat has its own project order with no ties", () => {
  for (const hat of ["founder", "engineer", "pm"] as const) {
    const orders = seed.projects.map((p) => p.order[hat]);
    assert.equal(new Set(orders).size, orders.length, hat);
  }
});
