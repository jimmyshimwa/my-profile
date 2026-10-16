import { AdminShell } from "@/components/admin/admin-shell";
import { ClockStatusEditor, LineMessagesEditor } from "@/components/admin/list-editors";
import { adminClockStatuses, adminLineMessages } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLine() {
  const { supabase, email } = await requireAdmin();
  const [messages, statuses] = await Promise.all([adminLineMessages(supabase), adminClockStatuses(supabase)]);
  return (
    <AdminShell title="The Line and the Kigali clock" email={email}>
      <div className="flex flex-col gap-16">
        <LineMessagesEditor items={messages} />
        <ClockStatusEditor items={statuses} />
      </div>
    </AdminShell>
  );
}
