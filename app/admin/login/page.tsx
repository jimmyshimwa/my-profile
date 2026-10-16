import { AuthForm } from "@/components/admin/auth-form";

const NOTICES: Record<string, string> = {
  config: "The admin isn't connected yet. Add the Supabase keys and ADMIN_EMAIL to the environment (see README).",
  confirmed: "Email confirmed. Sign in now.",
  link: "That link has expired or was already used. Sign in, or create the account again.",
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { e } = await searchParams;
  const notice = typeof e === "string" ? NOTICES[e] : undefined;
  return <AuthForm mode="login" notice={notice} />;
}
