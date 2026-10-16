"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteMedia, uploadMedia, type ActionResult } from "@/app/admin/actions";
import type { MediaItem } from "@/lib/content/types";
import { Button, Field, Input } from "./ui";

export function MediaManager({ items }: { items: (MediaItem & { path: string })[] }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(uploadMedia, null);
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, start] = useTransition();

  return (
    <div className="flex flex-col gap-10">
      <form action={action} className="flex flex-col gap-4 border border-rule p-4">
        <h2 className="text-xl font-bold">Upload an image</h2>
        <Field label="Image" hint="JPG, PNG, WebP or AVIF, under 8 MB. The site resizes and compresses it for each screen.">
          <input
            name="file"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            required
            className="text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setPreview(f ? URL.createObjectURL(f) : null);
            }}
          />
        </Field>
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="max-h-56 w-auto self-start border border-rule object-contain" />
        ) : null}
        <Field label="Alt text" hint="Required. Say what the image shows, in a sentence.">
          <Input name="alt" required maxLength={200} />
        </Field>
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={pending}>
            {pending ? "Uploading…" : "Upload"}
          </Button>
          <p role="status" className="text-sm">
            {state ? state.ok ? "Uploaded. Refresh to see it in the list." : <span className="text-[var(--danger)]">{state.error}</span> : null}
          </p>
        </div>
      </form>

      <section>
        <h2 className="mb-4 text-xl font-bold">Library</h2>
        {items.length === 0 ? <p className="text-muted">Nothing uploaded yet.</p> : null}
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <li key={m.id} className="flex flex-col gap-2 border border-rule p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.url} alt={m.alt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <p className="text-sm">{m.alt}</p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await navigator.clipboard.writeText(m.url);
                    setCopied(m.id);
                  }}
                >
                  {copied === m.id ? "Copied" : "Copy URL"}
                </Button>
                <Button
                  variant="danger"
                  disabled={deleting}
                  onClick={() => {
                    if (!confirm("Delete this image? Pages using it will lose it.")) return;
                    start(async () => {
                      const res = await deleteMedia(m.id, m.path);
                      if (!res.ok) alert(res.error);
                      else location.reload();
                    });
                  }}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
