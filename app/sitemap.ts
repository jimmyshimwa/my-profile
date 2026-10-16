import type { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/data";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getSiteContent();
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/cv`, changeFrequency: "monthly", priority: 0.6 },
    ...projects.map((p) => ({
      url: `${SITE_URL}/work/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
