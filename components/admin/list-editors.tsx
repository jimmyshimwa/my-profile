"use client";

import { useState, useTransition } from "react";
import type { ReactNode } from "react";
import {
  deleteAlsoShipped,
  deleteClockStatus,
  deleteLineMessage,
  deletePosition,
  saveAlsoShipped,
  saveClockStatus,
  saveLineMessage,
  savePosition,
  type ActionResult,
} from "@/app/admin/actions";
import {
  HATS,
  HAT_LABEL,
  LINE_TRIGGERS,
  TIMES_OF_DAY,
  type AlsoShipped,
  type ClockStatus,
  type LineMessage,
  type Position,
} from "@/lib/content/types";
import { Button, Check, Field, Input, SaveBar, Select, Textarea, useDraft } from "./ui";

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

export function PositionsEditor({ items }: { items: Position[] }) {
  return (
    <ListEditor<Position>
      title="Positions"
      items={items}
      label={(p) => (p.title ? `${p.title}, ${p.organization}` : "")}
      save={savePosition}
      remove={deletePosition}
      create={() => ({
        id: crypto.randomUUID(),
        title: "",
        organization: "",
        url: null,
        startDate: "2026-01-01",
        endDate: null,
        current: true,
        description: { founder: "", engineer: "", pm: "" },
        order: items.length,
        visible: true,
      })}
      fields={(p, set) => (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title"><Input value={p.title} onChange={(e) => set({ ...p, title: e.target.value })} /></Field>
            <Field label="Organization"><Input value={p.organization} onChange={(e) => set({ ...p, organization: e.target.value })} /></Field>
            <Field label="Link"><Input type="url" value={p.url ?? ""} onChange={(e) => set({ ...p, url: e.target.value || null })} /></Field>
            <Field label="Display order"><Input type="number" value={p.order} onChange={(e) => set({ ...p, order: Number(e.target.value) })} /></Field>
            <Field label="Start date"><Input type="date" value={p.startDate} onChange={(e) => set({ ...p, startDate: e.target.value })} /></Field>
            <Field label="End date" hint="Leave empty if current.">
              <Input type="date" value={p.endDate ?? ""} onChange={(e) => set({ ...p, endDate: e.target.value || null })} />
            </Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {HATS.map((h) => (
              <Field key={h} label={`Description, ${HAT_LABEL[h].toLowerCase()}`}>
                <Textarea rows={3} value={p.description[h]} onChange={(e) => set({ ...p, description: { ...p.description, [h]: e.target.value } })} />
              </Field>
            ))}
          </div>
          <div className="flex gap-6">
            <Check label="Current" checked={p.current} onChange={(e) => set({ ...p, current: e.target.checked })} />
            <Check label="Visible" checked={p.visible} onChange={(e) => set({ ...p, visible: e.target.checked })} />
          </div>
        </>
      )}
    />
  );
}

export function AlsoShippedEditor({ items }: { items: AlsoShipped[] }) {
  return (
    <ListEditor<AlsoShipped>
      title="Also built"
      items={items}
      label={(a) => a.title}
      save={saveAlsoShipped}
      remove={deleteAlsoShipped}
      create={() => ({ id: crypto.randomUUID(), title: "", note: "", url: null, status: "shipped", order: items.length, visible: true })}
      fields={(a, set) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title"><Input value={a.title} onChange={(e) => set({ ...a, title: e.target.value })} /></Field>
          <Field label="Link"><Input type="url" value={a.url ?? ""} onChange={(e) => set({ ...a, url: e.target.value || null })} /></Field>
          <Field label="Note"><Input value={a.note} onChange={(e) => set({ ...a, note: e.target.value })} /></Field>
          <Field label="Status">
            <Select value={a.status} onChange={(e) => set({ ...a, status: e.target.value as AlsoShipped["status"] })}>
              <option value="shipped">Live</option>
              <option value="finished">Finished, not launched</option>
            </Select>
          </Field>
          <Field label="Display order"><Input type="number" value={a.order} onChange={(e) => set({ ...a, order: Number(e.target.value) })} /></Field>
          <Check label="Visible" checked={a.visible} onChange={(e) => set({ ...a, visible: e.target.checked })} />
        </div>
      )}
    />
  );
}

const TRIGGER_LABEL: Record<LineMessage["trigger"], string> = {
  hello: "Right after a hat is picked",
  idle: "When the visitor stops scrolling",
  fast: "When the visitor scrolls fast",
  end: "At the end of the page",
};

export function LineMessagesEditor({ items }: { items: LineMessage[] }) {
  return (
    <ListEditor<LineMessage>
      title="What the Line says"
      items={items}
      label={(m) => (m.text ? `“${m.text}”  (${m.trigger}${m.active ? "" : ", off"})` : "")}
      save={saveLineMessage}
      remove={deleteLineMessage}
      create={() => ({ id: crypto.randomUUID(), trigger: "idle", hat: null, timeOfDay: null, text: "", active: true })}
      fields={(m, set) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Text" hint={`${m.text.length}/80. Short and plain.`}>
            <Input maxLength={80} value={m.text} onChange={(e) => set({ ...m, text: e.target.value })} />
          </Field>
          <Field label="When">
            <Select value={m.trigger} onChange={(e) => set({ ...m, trigger: e.target.value as LineMessage["trigger"] })}>
              {LINE_TRIGGERS.map((t) => (
                <option key={t} value={t}>{TRIGGER_LABEL[t]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Only for hat">
            <Select value={m.hat ?? ""} onChange={(e) => set({ ...m, hat: (e.target.value || null) as LineMessage["hat"] })}>
              <option value="">Any hat</option>
              {HATS.map((h) => (
                <option key={h} value={h}>{HAT_LABEL[h]}</option>
              ))}
            </Select>
          </Field>
          <Field label="Only at">
            <Select value={m.timeOfDay ?? ""} onChange={(e) => set({ ...m, timeOfDay: (e.target.value || null) as LineMessage["timeOfDay"] })}>
              <option value="">Any time</option>
              {TIMES_OF_DAY.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </Field>
          <Check label="On" checked={m.active} onChange={(e) => set({ ...m, active: e.target.checked })} />
        </div>
      )}
    />
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
