import { AdminShell } from "@/components/admin/admin-shell";
import { ClockStatusEditor } from "@/components/admin/list-editors";
import { adminClockStatuses } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export default async function AdminClock() {
  const { supabase, email } = await requireAdmin();
  const statuses = await adminClockStatuses(supabase);
  return (
    <AdminShell title="The Kigali clock" email={email}>
      <p className="mb-8 max-w-prose text-sm text-muted">
        The footer shows the time in Kigali and one of these lines, picked by the hour.
      </p>
      <ClockStatusEditor items={statuses} />
    </AdminShell>
  );
}
