import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/site/case-study";
import { getProject, getSiteContent } from "@/lib/data";
import { seed } from "@/lib/content/seed";

export async function generateStaticParams() {
  const { projects } = await getSiteContent();
  const list = projects.length ? projects : seed.projects;
  return list.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  return {
    title: p.seoTitle ?? p.title,
    description: p.seoDescription ?? p.summary,
    alternates: { canonical: `/work/${p.slug}` },
    openGraph: { title: p.seoTitle ?? p.title, description: p.seoDescription ?? p.summary },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) notFound();
  const { projects } = await getSiteContent();
  const i = projects.findIndex((p) => p.slug === slug);
  const next = projects[(i + 1) % projects.length];

  return <CaseStudy project={project} next={next} />;
}
