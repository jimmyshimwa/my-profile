import { AdminShell } from "@/components/admin/admin-shell";
import { MediaManager } from "@/components/admin/media-manager";
import { adminMedia } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export default async function AdminMedia() {
  const { supabase, email } = await requireAdmin();
  const items = await adminMedia(supabase);
  return (
    <AdminShell title="Media" email={email}>
      <MediaManager items={items} />
    </AdminShell>
  );
}
