/*
 * Imigongo: the geometric relief art of eastern Rwanda (chevrons, nested
 * lozenges, stepped triangles, concentric squares). Used here in black and
 * white only, and only in a few places: grid markers, project tiles before
 * real photos exist, and one band in the footer.
 */

/** A small lozenge, used where Lusion places "+" grid markers. */
export function Lozenge({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 14 14" className={`size-3.5 ${className}`} fill="none">
      <path d="M7 0.8 13.2 7 7 13.2 0.8 7Z" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 4.4 9.6 7 7 9.6 4.4 7Z" fill="currentColor" />
    </svg>
  );
}

/** A thin chevron band, full width. */
export function ChevronBand({ id, className = "" }: { id: string; className?: string }) {
  return (
    <svg aria-hidden className={`block h-4 w-full ${className}`} preserveAspectRatio="none">
      <defs>
        <pattern id={id} width="24" height="16" patternUnits="userSpaceOnUse">
          <path d="M0 16 12 4 24 16" fill="none" stroke="currentColor" strokeWidth="3" />
          <path d="M0 6 6 0M18 0 24 6" stroke="currentColor" strokeWidth="3" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

const MOTIFS = ["chevrons", "lozenges", "steps", "squares", "zigzag"] as const;

/**
 * A project tile drawn as an imigongo panel. Each project gets its own
 * motif; real images replace these once they are uploaded.
 */
export function ImigongoTile({ index, className = "" }: { index: number; className?: string }) {
  const motif = MOTIFS[index % MOTIFS.length]!;
  const id = `imi-${motif}`;
  return (
    <svg aria-hidden viewBox="0 0 120 90" preserveAspectRatio="xMidYMid slice" className={`block size-full ${className}`}>
      <defs>
        {motif === "chevrons" ? (
          <pattern id={id} width="20" height="14" patternUnits="userSpaceOnUse">
            <path d="M-2 14 10 3 22 14" fill="none" stroke="currentColor" strokeWidth="4" />
          </pattern>
        ) : motif === "lozenges" ? (
          <pattern id={id} width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M15 1 29 15 15 29 1 15Z" fill="none" stroke="currentColor" strokeWidth="3" />
            <path d="M15 9 21 15 15 21 9 15Z" fill="currentColor" />
          </pattern>
        ) : motif === "steps" ? (
          <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M0 24V18H6V12H12V6H18V0H24V24Z" fill="currentColor" />
          </pattern>
        ) : motif === "squares" ? (
          <pattern id={id} width="36" height="36" patternUnits="userSpaceOnUse">
            <rect x="2" y="2" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="3" />
            <rect x="10" y="10" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="3" />
            <rect x="16" y="16" width="4" height="4" fill="currentColor" />
          </pattern>
        ) : (
          <pattern id={id} width="16" height="22" patternUnits="userSpaceOnUse">
            <path d="M0 0 8 11 0 22M8 0 16 11 8 22" fill="none" stroke="currentColor" strokeWidth="3.5" />
          </pattern>
        )}
      </defs>
      <rect width="120" height="90" fill={`url(#${id})`} />
    </svg>
  );
}
