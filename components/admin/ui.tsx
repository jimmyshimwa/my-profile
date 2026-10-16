"use client";

import { useEffect, useState, useTransition } from "react";
import type { ComponentProps, ReactNode } from "react";
import type { ActionResult } from "@/app/admin/actions";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-semibold">{label}</span>
      {children}
      {hint ? <span className="text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

const inputCls =
  "w-full border border-rule bg-[var(--surface)] px-3 py-2.5 text-base text-ink outline-none transition-colors focus:border-[var(--line)]";

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={`${inputCls} min-h-24 leading-relaxed ${props.className ?? ""}`} />;
}

export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

export function Check({ label, ...props }: ComponentProps<"input"> & { label: string }) {
  return (
    <label className="flex min-h-11 items-center gap-2 text-sm">
      <input type="checkbox" {...props} className="size-4 accent-[var(--line)]" />
      {label}
    </label>
  );
}

export function Button({ variant = "primary", ...props }: ComponentProps<"button"> & { variant?: "primary" | "ghost" | "danger" }) {
  const cls =
    variant === "primary"
      ? "bg-[var(--ink)] text-[var(--bg)]"
      : variant === "danger"
        ? "border border-red-500/60 text-[var(--danger)]"
        : "border border-rule text-ink";
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex min-h-11 items-center justify-center px-4 text-sm font-semibold disabled:opacity-50 ${cls} ${props.className ?? ""}`}
    />
  );
}

/** Warn before leaving with unsaved changes. */
export function useUnsavedWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}

/**
 * Edit a draft locally, save it with a server action. Drafts are also kept
 * in localStorage, so a closed tab or a dropped connection loses nothing.
 */
export function useDraft<T>(key: string, initial: T, save: (value: T) => Promise<ActionResult>) {
  const storageKey = `admin-draft:${key}`;
  const [value, setValue] = useState<T>(initial);
  const [dirty, setDirty] = useState(false);
  const [restored, setRestored] = useState(false);
  const [status, setStatus] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        // Restoring from storage after hydration is the point of this effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setValue(JSON.parse(raw) as T);
        setDirty(true);
        setRestored(true);
      }
    } catch {
      /* storage unavailable */
    }
  }, [storageKey]);

  useEffect(() => {
    if (!dirty) return;
    const t = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(value));
      } catch {
        /* storage unavailable */
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [value, dirty, storageKey]);

  useUnsavedWarning(dirty);

  return {
    value,
    dirty,
    restored,
    pending,
    status,
    set(next: T | ((v: T) => T)) {
      setValue(next);
      setDirty(true);
      setStatus(null);
    },
    discard() {
      try {
        localStorage.removeItem(storageKey);
      } catch {}
      setValue(initial);
      setDirty(false);
      setRestored(false);
    },
    save() {
      start(async () => {
        const res = await save(value);
        setStatus(res);
        if (res.ok) {
          setDirty(false);
          setRestored(false);
          try {
            localStorage.removeItem(storageKey);
          } catch {}
        }
      });
    },
  };
}

export function SaveBar({
  dirty,
  pending,
  status,
  restored,
  onSave,
  onDiscard,
  children,
}: {
  dirty: boolean;
  pending: boolean;
  status: ActionResult | null;
  restored?: boolean;
  onSave: () => void;
  onDiscard?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-3 border-t border-rule bg-[var(--bg)] px-4 py-3 sm:mx-0 sm:px-0">
      <Button onClick={onSave} disabled={!dirty || pending}>
        {pending ? "Saving…" : "Save and publish"}
      </Button>
      {dirty && onDiscard ? (
        <Button variant="ghost" onClick={onDiscard} disabled={pending}>
          Discard changes
        </Button>
      ) : null}
      {children}
      <p role="status" className="text-sm">
        {status ? (
          status.ok ? (
            <span className="text-muted">{status.message}</span>
          ) : (
            <span className="text-[var(--danger)]">{status.error}</span>
          )
        ) : dirty ? (
          <span className="text-muted">{restored ? "Restored an unsaved draft." : "Unsaved changes."}</span>
        ) : null}
      </p>
    </div>
  );
}
