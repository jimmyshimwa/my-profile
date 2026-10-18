"use client";

import { useEffect, useState } from "react";
import type { ClockStatus } from "@/lib/content/types";
import { kigaliTime, statusFor } from "@/lib/kigali";

/** "Kigali 22:14, probably debugging". Lines are editable in the admin. */
export function KigaliStatus({ statuses }: { statuses: ClockStatus[] }) {
  const [now, setNow] = useState<{ hour: number; label: string } | null>(null);

  useEffect(() => {
    const tick = () => setNow(kigaliTime());
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, []);

  const status = now ? statusFor(now.hour, statuses) : "";
  return (
    <p className="tnum">
      Kigali {now?.label ?? "--:--"}
      {status ? <span className="text-muted">, {status}</span> : null}
    </p>
  );
}
