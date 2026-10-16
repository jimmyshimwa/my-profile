"use client";

import { useEffect, useId, useRef, useState } from "react";
import { TIMES_OF_DAY, type ClockStatus, type TimeOfDay } from "@/lib/content/types";
import { PREVIEW_HOUR, kigaliTime, statusFor } from "@/lib/kigali";
import { useSite } from "./site-context";

const LABEL: Record<TimeOfDay, string> = { dawn: "Dawn", day: "Day", dusk: "Dusk", night: "Night" };

/**
 * "Kigali 22:14, probably debugging". Opens a small picker to preview the
 * site at another time of day.
 */
export function KigaliClock({ statuses }: { statuses: ClockStatus[] }) {
  const { time, previewTime, setPreviewTime, liveTime } = useSite();
  const [now, setNow] = useState<{ hour: number; label: string } | null>(null);
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => setNow(kigaliTime());
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !wrap.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("pointerdown", close);
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  const hour = previewTime ? PREVIEW_HOUR[previewTime] : now?.hour;
  const label = previewTime ? `${String(PREVIEW_HOUR[previewTime]).padStart(2, "0")}:00` : now?.label;
  const status = hour === undefined ? "" : statusFor(hour, statuses);

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="group flex min-h-11 items-center gap-2 text-left text-sm leading-tight"
      >
        <SunMark time={time} />
        <span>
          <span className="tnum font-medium text-ink">
            Kigali {label ?? "--:--"}
            {previewTime ? " (preview)" : ""}
          </span>
          {status ? <span className="text-muted">, {status}</span> : null}
        </span>
      </button>
      {open ? (
        <div
          id={panelId}
          className="absolute right-0 top-full z-40 mt-2 w-64 border border-rule bg-[var(--bg)] p-3 text-sm shadow-[0_18px_40px_-24px_rgb(0_0_0/0.5)]"
        >
          <p className="mb-2 text-muted">See the site at another time of day in Kigali.</p>
          <div role="radiogroup" aria-label="Time of day" className="grid grid-cols-2 gap-1">
            {TIMES_OF_DAY.map((t) => (
              <button
                key={t}
                type="button"
                role="radio"
                aria-checked={previewTime === t}
                onClick={() => setPreviewTime(t)}
                className="flex min-h-11 items-center gap-2 px-2 text-left aria-checked:bg-[var(--rule)] aria-checked:font-semibold"
              >
                <SunMark time={t} /> {LABEL[t]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              setPreviewTime(null);
              setOpen(false);
            }}
            className="mt-2 min-h-11 w-full border-t border-rule pt-2 text-left font-medium"
          >
            Back to live ({LABEL[liveTime].toLowerCase()} now)
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** The sun's height over a hill line, for each time of day. */
function SunMark({ time }: { time: TimeOfDay }) {
  const y = { dawn: 13, day: 6, dusk: 13, night: 9 }[time];
  return (
    <svg aria-hidden viewBox="0 0 24 18" className="h-[18px] w-6 shrink-0" fill="none">
      {time === "night" ? (
        <path d="M14 4.5a4.5 4.5 0 1 0 3.5 7.3A4 4 0 0 1 14 4.5Z" fill="currentColor" className="text-ink" />
      ) : (
        <circle cx="12" cy={y} r="3.6" fill="var(--accent)" />
      )}
      <path d="M1 16 C 6 11, 9 11, 13 14 S 20 12, 23 15" stroke="currentColor" strokeWidth="1.5" className="text-ink" />
    </svg>
  );
}
