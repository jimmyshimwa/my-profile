import { AdminShell } from "@/components/admin/admin-shell";
import { ProjectsEditor } from "@/components/admin/projects-editor";
import { adminProjects } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export default async function AdminProjects() {
  const { supabase, email } = await requireAdmin();
  const projects = await adminProjects(supabase);
  return (
    <AdminShell title="Projects" email={email}>
      <ProjectsEditor projects={projects} />
    </AdminShell>
  );
}
