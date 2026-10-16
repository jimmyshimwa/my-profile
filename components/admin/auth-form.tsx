"use client";

import Link from "next/link";
import { useActionState } from "react";
import { setupAccount, signIn, type ActionResult } from "@/app/admin/actions";
import { Button, Field, Input } from "./ui";

export function AuthForm({ mode, notice }: { mode: "login" | "setup"; notice?: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(
    mode === "login" ? signIn : setupAccount,
    null,
  );
  return (
    <main className="mx-auto flex min-h-svh max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-3xl font-bold tracking-tight">{mode === "login" ? "Sign in" : "Create the admin account"}</h1>
      {mode === "setup" ? (
        <p className="text-sm text-muted">
          Do this once. Only the email set as <code>ADMIN_EMAIL</code> on the server is accepted. You&rsquo;ll get a
          confirmation email.
        </p>
      ) : null}
      {notice ? <p className="border border-rule p-3 text-sm">{notice}</p> : null}
      <form action={action} className="flex flex-col gap-4">
        <Field label="Email">
          <Input name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Password" hint={mode === "setup" ? "At least 12 characters." : undefined}>
          <Input
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={12}
            required
          />
        </Field>
        <Button type="submit" disabled={pending}>
          {pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </Button>
        <p role="status" className="text-sm">
          {state ? state.ok ? state.message : <span className="text-[var(--danger)]">{state.error}</span> : null}
        </p>
      </form>
      <p className="text-sm text-muted">
        {mode === "login" ? (
          <>
            First time? <Link href="/admin/setup" className="underline">Create the admin account</Link>.
          </>
        ) : (
          <>
            Already set up? <Link href="/admin/login" className="underline">Sign in</Link>.
          </>
        )}
      </p>
    </main>
  );
}
