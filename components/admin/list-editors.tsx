"use client";

import { useState, useTransition } from "react";
import type { ReactNode } from "react";
import { deleteClockStatus, saveClockStatus, type ActionResult } from "@/app/admin/actions";
import type { ClockStatus } from "@/lib/content/types";
import { Button, Field, Input, SaveBar, useDraft } from "./ui";

/** A list of rows, each opened into its own form with save and delete. */
function ListEditor<T extends { id: string }>({
  items,
  title,
  create,
  label,
  save,
  remove,
  fields,
}: {
  items: T[];
  title: string;
  create: () => T;
  label: (item: T) => string;
  save: (item: T) => Promise<ActionResult>;
  remove: (id: string) => Promise<ActionResult>;
  fields: (item: T, set: (next: T) => void) => ReactNode;
}) {
  const [list, setList] = useState(items);
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <Button
          variant="ghost"
          onClick={() => {
            const item = create();
            setList([...list, item]);
            setOpenId(item.id);
          }}
        >
          Add
        </Button>
      </div>
      <ul className="border-t border-rule">
        {list.map((item) => (
          <li key={item.id} className="border-b border-rule">
            <button
              type="button"
              aria-expanded={openId === item.id}
              onClick={() => setOpenId(openId === item.id ? null : item.id)}
              className="min-h-11 w-full py-2 text-left font-medium"
            >
              {label(item) || "New item"}
            </button>
            {openId === item.id ? (
              <RowForm
                item={item}
                save={async (v) => {
                  const res = await save(v);
                  if (res.ok) setList((l) => l.map((x) => (x.id === v.id ? v : x)));
                  return res;
                }}
                remove={async () => {
                  const res = await remove(item.id);
                  if (res.ok) {
                    setList((l) => l.filter((x) => x.id !== item.id));
                    setOpenId(null);
                  }
                  return res;
                }}
                fields={fields}
              />
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

function RowForm<T extends { id: string }>({
  item,
  save,
  remove,
  fields,
}: {
  item: T;
  save: (item: T) => Promise<ActionResult>;
  remove: () => Promise<ActionResult>;
  fields: (item: T, set: (next: T) => void) => ReactNode;
}) {
  const d = useDraft(`row:${item.id}`, item, save);
  const [deleting, start] = useTransition();
  return (
    <div className="flex flex-col gap-4 pb-4">
      {fields(d.value, d.set)}
      <SaveBar dirty={d.dirty} pending={d.pending} status={d.status} restored={d.restored} onSave={d.save} onDiscard={d.discard}>
        <Button
          variant="danger"
          disabled={deleting}
          onClick={() => {
            if (!confirm("Delete this? This can't be undone.")) return;
            start(async () => {
              const res = await remove();
              if (res.ok) d.discard();
              else alert(res.error);
            });
          }}
        >
          Delete
        </Button>
      </SaveBar>
    </div>
  );
}

export function ClockStatusEditor({ items }: { items: ClockStatus[] }) {
  return (
    <ListEditor<ClockStatus>
      title="Kigali status lines"
      items={[...items].sort((a, b) => a.startHour - b.startHour)}
      label={(c) => (c.text ? `${String(c.startHour).padStart(2, "0")}:00 to ${String(c.endHour).padStart(2, "0")}:00, ${c.text}` : "")}
      save={saveClockStatus}
      remove={deleteClockStatus}
      create={() => ({ id: crypto.randomUUID(), startHour: 0, endHour: 1, text: "" })}
      fields={(c, set) => (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="From hour (0–23)">
            <Input type="number" min={0} max={23} value={c.startHour} onChange={(e) => set({ ...c, startHour: Number(e.target.value) })} />
          </Field>
          <Field label="To hour (1–24)">
            <Input type="number" min={1} max={24} value={c.endHour} onChange={(e) => set({ ...c, endHour: Number(e.target.value) })} />
          </Field>
          <Field label="Text" hint='Shown as "Kigali 22:14, <text>"'>
            <Input maxLength={80} value={c.text} onChange={(e) => set({ ...c, text: e.target.value })} />
          </Field>
        </div>
      )}
    />
  );
}
