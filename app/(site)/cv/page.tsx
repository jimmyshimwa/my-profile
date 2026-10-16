import type { Metadata } from "next";
import { getSiteContent } from "@/lib/data";

export const metadata: Metadata = {
  title: "CV",
  description: "Download Jimmy Shimwa's CV.",
  alternates: { canonical: "/cv" },
};

export default async function CvPage() {
  const { profile } = await getSiteContent();
  return (
    <main id="content" tabIndex={-1} className="topo-fallback flex min-h-svh flex-col px-4 pb-10 pt-32 outline-none sm:px-10 sm:pt-40">
      <h1 className="text-[clamp(2.6rem,10vw,7rem)] font-bold leading-[0.9] tracking-[-0.045em]">CV</h1>
      <p className="mt-6 max-w-[44ch] text-lg text-muted">
        Everything on one page, if you prefer paper to scrolling.
      </p>
      <div className="mt-8 flex flex-wrap gap-6">
        <a
          href={profile.cvUrl}
          download
          className="inline-flex min-h-12 items-center bg-[var(--ink)] px-6 font-semibold text-[var(--bg)]"
        >
          Download the CV (PDF)
        </a>
        <a href={profile.cvUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center underline decoration-line underline-offset-4">
          Open in a new tab
        </a>
      </div>
      <object
        data={profile.cvUrl}
        type="application/pdf"
        aria-label="Jimmy Shimwa's CV"
        className="mt-10 hidden min-h-[80svh] w-full border border-rule sm:block"
      >
        <p className="p-4">
          Your browser can&rsquo;t show the PDF here. <a href={profile.cvUrl} className="underline">Download it instead.</a>
        </p>
      </object>
    </main>
  );
}
