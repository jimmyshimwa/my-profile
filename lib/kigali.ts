import type { ClockStatus } from "./content/types";

export const KIGALI_TZ = "Africa/Kigali";

/** Hours and minutes in Kigali, whatever the visitor's own timezone. */
export function kigaliTime(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: KIGALI_TZ,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
  return { hour, minute, label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` };
}

export function statusFor(hour: number, statuses: ClockStatus[]) {
  return statuses.find((s) => hour >= s.startHour && hour < s.endHour)?.text ?? "";
}
