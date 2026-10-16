import Link from "next/link";
import type { ReactNode } from "react";
import { signOut } from "@/app/admin/actions";

const NAV = [
  { href: "/admin", label: "Profile and hats" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/positions", label: "Positions" },
  { href: "/admin/line", label: "Line and clock" },
  { href: "/admin/media", label: "Media" },
];

export function AdminShell({ title, email, children }: { title: string; email: string; children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-svh max-w-6xl flex-col px-4 pb-24 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-rule py-4">
        <Link href="/admin" className="font-bold">
          Admin
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-muted sm:inline">{email}</span>
          <a href="/" target="_blank" rel="noreferrer" className="underline underline-offset-4">
            View site
          </a>
          <form action={signOut}>
            <button type="submit" className="min-h-11 underline underline-offset-4">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <nav aria-label="Admin" className="-mx-4 overflow-x-auto border-b border-rule px-4 sm:mx-0 sm:px-0">
        <ul className="flex gap-1 whitespace-nowrap">
          {NAV.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="inline-flex min-h-11 items-center px-3 text-sm font-medium hover:underline">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <h1 className="mb-6 mt-8 text-3xl font-bold tracking-tight">{title}</h1>
      {children}
    </div>
  );
}
