import { SiteHeader } from "@/components/site/site-header";
import { SiteProvider } from "@/components/site/site-context";
import { SmoothScroll } from "@/components/site/smooth-scroll";
import { getSiteContent } from "@/lib/data";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const { profile } = await getSiteContent();
  return (
    <SiteProvider>
      <SmoothScroll />
      <a
        href="#content"
        className="sr-only z-[60] rounded-full bg-[var(--bg)] px-4 py-3 focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
      >
        Skip to content
      </a>
      <SiteHeader name={profile.name} cvUrl={profile.cvUrl} />
      {children}
    </SiteProvider>
  );
}
