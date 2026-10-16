import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/site/case-study";
import { projectFromRow } from "@/lib/content/rows";
import { requireAdmin } from "@/lib/auth";

/** A saved project, published or not, in the real case-study design. */
export default async function PreviewPage({ params }: PageProps<"/admin/preview/[slug]">) {
  const { slug } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("projects").select("*").eq("slug", slug).maybeSingle();
  if (!data) notFound();
  const project = projectFromRow(data);
  return (
    <>
      <p className="fixed inset-x-0 top-0 z-50 bg-[var(--ink)] px-4 py-2 text-center text-sm text-[var(--bg)]">
        Preview{project.published ? "" : " of a draft. Visitors can't see this yet."}
      </p>
      <CaseStudy project={project} />
    </>
  );
}
