import Link from "next/link";

export default function NotFound() {
  return (
    <main className="topo-fallback flex min-h-svh flex-col justify-center px-4 sm:px-10">
      <p className="tnum text-sm text-muted">404</p>
      <h1 className="mt-3 max-w-[14ch] text-[clamp(2.6rem,10vw,7rem)] font-bold leading-[0.9] tracking-[-0.045em]">
        This trail doesn&rsquo;t go anywhere.
      </h1>
      <p className="mt-6 max-w-[40ch] text-lg text-muted">
        The page you wanted isn&rsquo;t here. It may have moved, or the link may be wrong.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex min-h-12 items-center self-start font-semibold underline decoration-line decoration-2 underline-offset-8"
      >
        Back to the trailhead
      </Link>
    </main>
  );
}
