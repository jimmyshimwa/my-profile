import type { ClockStatus, TimeOfDay } from "./content/types";

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

/** Kigali sits near the equator: sunrise and sunset barely move all year. */
export function timeOfDayFor(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 17) return "day";
  if (hour >= 17 && hour < 19) return "dusk";
  return "night";
}

/** A representative hour, used when a visitor previews another time of day. */
export const PREVIEW_HOUR: Record<TimeOfDay, number> = {
  dawn: 6,
  day: 11,
  dusk: 18,
  night: 22,
};

export function statusFor(hour: number, statuses: ClockStatus[]) {
  return statuses.find((s) => hour >= s.startHour && hour < s.endHour)?.text ?? "";
}

/**
 * Inline script for <head>: sets data-time before first paint so the page
 * never flashes the wrong palette.
 */
export const timeOfDayScript = `(function(){try{var h=Number(new Intl.DateTimeFormat("en-GB",{timeZone:"${KIGALI_TZ}",hour:"2-digit",hourCycle:"h23"}).format(new Date()));var t=h>=5&&h<7?"dawn":h>=7&&h<17?"day":h>=17&&h<19?"dusk":"night";var d=document.documentElement;d.dataset.time=t;d.classList.add("js")}catch(e){}})();`;
