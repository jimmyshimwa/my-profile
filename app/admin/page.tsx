import { AdminShell } from "@/components/admin/admin-shell";
import { ProfileEditor } from "@/components/admin/profile-editor";
import { adminLog, adminProfile } from "@/lib/admin-data";
import { requireAdmin } from "@/lib/auth";

export default async function AdminHome() {
  const { supabase, email } = await requireAdmin();
  const [profile, log] = await Promise.all([adminProfile(supabase), adminLog(supabase)]);
  return (
    <AdminShell title="Profile and hats" email={email}>
      <ProfileEditor profile={profile} />
      <section className="mt-16">
        <h2 className="mb-3 text-xl font-bold">Recent changes</h2>
        {log.length === 0 ? <p className="text-sm text-muted">No changes yet.</p> : null}
        <ul className="text-sm">
          {log.map((l) => (
            <li key={l.id} className="flex flex-wrap gap-x-3 border-t border-rule py-2">
              <time className="tnum text-muted" dateTime={l.created_at}>
                {new Date(l.created_at).toLocaleString("en-GB", { timeZone: "Africa/Kigali" })}
              </time>
              <span className="font-medium">{l.action}</span>
              {l.target ? <span className="text-muted">{l.target}</span> : null}
            </li>
          ))}
        </ul>
      </section>
    </AdminShell>
  );
}
