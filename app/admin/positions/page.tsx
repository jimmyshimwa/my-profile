import { AdminShell } from "@/components/admin/admin-shell";
import { AlsoShippedEditor, PositionsEditor } from "@/components/admin/list-editors";
import { adminAlsoShipped, adminPositions } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPositions() {
  const { supabase, email } = await requireAdmin();
  const [positions, alsoShipped] = await Promise.all([adminPositions(supabase), adminAlsoShipped(supabase)]);
  return (
    <AdminShell title="Positions and smaller work" email={email}>
      <div className="flex flex-col gap-16">
        <PositionsEditor items={positions} />
        <AlsoShippedEditor items={alsoShipped} />
      </div>
    </AdminShell>
  );
}
