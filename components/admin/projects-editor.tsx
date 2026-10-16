"use client";

import { useState, useTransition } from "react";
import { deleteProject, saveProject } from "@/app/admin/actions";
import { HATS, HAT_LABEL, LINE_MOVES, type Hat, type Project } from "@/lib/content/types";
import { Button, Check, Field, Input, SaveBar, Select, Textarea, useDraft } from "./ui";

const MOVE_HINT: Record<Project["move"], string> = {
  coil: "Coils around the title",
  frame: "Draws a frame around it",
  knot: "Ties a figure eight across it",
  write: "Writes a looped underline",
  steps: "Climbs a staircase under it",
};

function blankProject(order: number): Project {
  return {
    id: crypto.randomUUID(),
    slug: "",
    title: "",
    summary: "",
    body: "",
    coverUrl: null,
    coverAlt: null,
    roles: {
      founder: { label: "", line: "" },
      engineer: { label: "", line: "" },
      pm: { label: "", line: "" },
    },
    stack: [],
    links: [],
    year: 2026,
    featured: true,
    order: { founder: order, engineer: order, pm: order },
    published: false,
    move: "coil",
    seoTitle: null,
    seoDescription: null,
  };
}

export function ProjectsEditor({ projects }: { projects: Project[] }) {
  const [list, setList] = useState(projects);
  const [openId, setOpenId] = useState<string | null>(null);
  const [orderHat, setOrderHat] = useState<Hat>("founder");
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const ordered = [...list].sort((a, b) => a.order[orderHat] - b.order[orderHat]);

  function move(id: string, dir: -1 | 1) {
    const i = ordered.findIndex((p) => p.id === id);
    const j = i + dir;
    if (j < 0 || j >= ordered.length) return;
    const next = [...ordered];
    [next[i], next[j]] = [next[j]!, next[i]!];
    const updated = next.map((p, k) => ({ ...p, order: { ...p.order, [orderHat]: k } }));
    setList(updated);
    start(async () => {
      // Save only the two projects that swapped.
      const results = await Promise.all([updated[i]!, updated[j]!].map((p) => saveProject(p)));
      const failed = results.find((r) => !r.ok);
      setMessage(failed && !failed.ok ? failed.error : `Order for ${HAT_LABEL[orderHat]} saved.`);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Field label="Order shown for">
          <Select value={orderHat} onChange={(e) => setOrderHat(e.target.value as Hat)}>
            {HATS.map((h) => (
              <option key={h} value={h}>
                {HAT_LABEL[h]}
              </option>
            ))}
          </Select>
        </Field>
        <Button
          onClick={() => {
            const p = blankProject(list.length);
            setList([...list, p]);
            setOpenId(p.id);
          }}
        >
          New project
        </Button>
      </div>
      <p role="status" className="text-sm text-muted">
        {pending ? "Saving order…" : message}
      </p>

      <ol className="flex flex-col border-t border-rule">
        {ordered.map((p, i) => (
          <li key={p.id} className="border-b border-rule">
            <div className="flex flex-wrap items-center gap-3 py-3">
              <span className="tnum w-6 text-sm text-muted">{i + 1}</span>
              <button
                type="button"
                className="min-h-11 flex-1 text-left font-semibold"
                aria-expanded={openId === p.id}
                onClick={() => setOpenId(openId === p.id ? null : p.id)}
              >
                {p.title || "Untitled project"}
                <span className="ml-2 text-sm font-normal text-muted">{p.published ? "Published" : "Draft"}</span>
              </button>
              <div className="flex gap-1">
                <Button variant="ghost" aria-label={`Move ${p.title} up`} disabled={i === 0 || pending} onClick={() => move(p.id, -1)}>
                  Up
                </Button>
                <Button
                  variant="ghost"
                  aria-label={`Move ${p.title} down`}
                  disabled={i === ordered.length - 1 || pending}
                  onClick={() => move(p.id, 1)}
                >
                  Down
                </Button>
              </div>
            </div>
            {openId === p.id ? (
              <ProjectForm
                project={p}
                onSaved={(saved) => setList((l) => l.map((x) => (x.id === saved.id ? saved : x)))}
                onDeleted={() => {
                  setList((l) => l.filter((x) => x.id !== p.id));
                  setOpenId(null);
                }}
              />
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function ProjectForm({
  project,
  onSaved,
  onDeleted,
}: {
  project: Project;
  onSaved: (p: Project) => void;
  onDeleted: () => void;
}) {
  const d = useDraft(`project:${project.id}`, project, async (v) => {
    const res = await saveProject(v);
    if (res.ok) onSaved(v);
    return res;
  });
  const p = d.value;
  const set = <K extends keyof Project>(k: K, v: Project[K]) => d.set({ ...p, [k]: v });
  const [deleting, startDelete] = useTransition();

  return (
    <div className="flex flex-col gap-6 pb-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title">
          <Input
            value={p.title}
            onChange={(e) => {
              const title = e.target.value;
              const auto = !project.slug && (!p.slug || p.slug === slugify(p.title));
              d.set({ ...p, title, slug: auto ? slugify(title) : p.slug });
            }}
          />
        </Field>
        <Field label="Slug" hint={`/work/${p.slug || "…"}`}>
          <Input value={p.slug} onChange={(e) => set("slug", e.target.value)} />
        </Field>
        <Field label="Year">
          <Input type="number" value={p.year} onChange={(e) => set("year", Number(e.target.value))} />
        </Field>
        <Field label="The Line's move here" hint={MOVE_HINT[p.move]}>
          <Select value={p.move} onChange={(e) => set("move", e.target.value as Project["move"])}>
            {LINE_MOVES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Summary" hint="One or two sentences, shown on the home page.">
        <Textarea rows={3} value={p.summary} onChange={(e) => set("summary", e.target.value)} />
      </Field>

      <div className="grid gap-4 lg:grid-cols-3">
        {HATS.map((h) => (
          <div key={h} className="flex flex-col gap-3 border border-rule p-3">
            <h3 className="text-sm font-bold">Role, as seen by a {HAT_LABEL[h].toLowerCase()}</h3>
            <Field label="Label">
              <Input value={p.roles[h].label} onChange={(e) => set("roles", { ...p.roles, [h]: { ...p.roles[h], label: e.target.value } })} />
            </Field>
            <Field label="One line">
              <Input value={p.roles[h].line} onChange={(e) => set("roles", { ...p.roles, [h]: { ...p.roles[h], line: e.target.value } })} />
            </Field>
          </div>
        ))}
      </div>

      <Field label="Case study" hint='Blank line between paragraphs. Start a line with "## " for a heading.'>
        <Textarea rows={12} value={p.body} onChange={(e) => set("body", e.target.value)} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Cover image URL" hint="Paste a URL from the Media page.">
          <Input value={p.coverUrl ?? ""} onChange={(e) => set("coverUrl", e.target.value || null)} />
        </Field>
        <Field label="Cover alt text" hint="Required when there is a cover.">
          <Input value={p.coverAlt ?? ""} onChange={(e) => set("coverAlt", e.target.value || null)} />
        </Field>
        <Field label="Built with" hint="Comma separated.">
          <Input
            value={p.stack.join(", ")}
            onChange={(e) => set("stack", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
          />
        </Field>
        <Field label="Links" hint="One per line: Label | https://…">
          <Textarea
            rows={3}
            value={p.links.map((l) => `${l.label} | ${l.url}`).join("\n")}
            onChange={(e) =>
              set(
                "links",
                e.target.value
                  .split("\n")
                  .map((line) => line.split("|").map((s) => s.trim()))
                  .filter(([label, url]) => label && url)
                  .map(([label, url]) => ({ label: label!, url: url! })),
              )
            }
          />
        </Field>
        <Field label="SEO title" hint="Optional. Defaults to the title.">
          <Input value={p.seoTitle ?? ""} onChange={(e) => set("seoTitle", e.target.value || null)} />
        </Field>
        <Field label="SEO description" hint="Optional. Defaults to the summary.">
          <Input value={p.seoDescription ?? ""} onChange={(e) => set("seoDescription", e.target.value || null)} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <Check label="Published" checked={p.published} onChange={(e) => set("published", e.target.checked)} />
        <Check label="Featured on the route" checked={p.featured} onChange={(e) => set("featured", e.target.checked)} />
      </div>

      <SaveBar dirty={d.dirty} pending={d.pending} status={d.status} restored={d.restored} onSave={d.save} onDiscard={d.discard}>
        {p.slug ? (
          <a href={`/admin/preview/${p.slug}`} target="_blank" rel="noreferrer" className="text-sm underline underline-offset-4">
            Preview saved version
          </a>
        ) : null}
        <Button
          variant="danger"
          disabled={deleting}
          onClick={() => {
            if (!confirm(`Delete "${p.title || "this project"}"? This can't be undone.`)) return;
            startDelete(async () => {
              const res = await deleteProject(p.id);
              if (res.ok) {
                d.discard();
                onDeleted();
              } else alert(res.error);
            });
          }}
        >
          Delete
        </Button>
      </SaveBar>
    </div>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
