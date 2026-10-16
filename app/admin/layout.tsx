import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<p className="p-8 text-muted">Loading…</p>}>{children}</Suspense>
  );
}
