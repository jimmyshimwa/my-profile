"use client";

import { saveProfile } from "@/app/admin/actions";
import { HATS, HAT_LABEL, type Profile } from "@/lib/content/types";
import { Field, Input, SaveBar, Textarea, useDraft } from "./ui";

export function ProfileEditor({ profile }: { profile: Profile }) {
  const d = useDraft("profile", profile, saveProfile);
  const p = d.value;
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => d.set({ ...p, [k]: v });

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">The three hats</h2>
        <p className="max-w-prose text-sm text-muted">
          Each hat rewrites the hero statement and the bio. Edit them side by side so they stay one voice.
        </p>
        <div className="grid gap-6 lg:grid-cols-3">
          {HATS.map((h) => (
            <div key={h} className="flex flex-col gap-4 border border-rule p-4">
              <h3 className="font-bold">{HAT_LABEL[h]}</h3>
              <Field label="Hero statement" hint={`${p.hats[h].hero.length}/140`}>
                <Textarea
                  rows={3}
                  maxLength={140}
                  value={p.hats[h].hero}
                  onChange={(e) => set("hats", { ...p.hats, [h]: { ...p.hats[h], hero: e.target.value } })}
                />
              </Field>
              <Field label="Short bio" hint="Under the statement.">
                <Textarea
                  rows={4}
                  value={p.hats[h].short}
                  onChange={(e) => set("hats", { ...p.hats, [h]: { ...p.hats[h], short: e.target.value } })}
                />
              </Field>
              <Field label="Long bio" hint="Leave a blank line between paragraphs.">
                <Textarea
                  rows={9}
                  value={p.hats[h].long}
                  onChange={(e) => set("hats", { ...p.hats, [h]: { ...p.hats[h], long: e.target.value } })}
                />
              </Field>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name"><Input value={p.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Location"><Input value={p.location} onChange={(e) => set("location", e.target.value)} /></Field>
          <Field label="Email"><Input type="email" value={p.email} onChange={(e) => set("email", e.target.value)} /></Field>
          <Field label="GitHub URL"><Input type="url" value={p.github} onChange={(e) => set("github", e.target.value)} /></Field>
          <Field label="LinkedIn URL"><Input type="url" value={p.linkedin} onChange={(e) => set("linkedin", e.target.value)} /></Field>
          <Field label="X URL"><Input type="url" value={p.x} onChange={(e) => set("x", e.target.value)} /></Field>
          <Field label="CV file URL" hint="Upload a PDF to /public or paste a link.">
            <Input value={p.cvUrl} onChange={(e) => set("cvUrl", e.target.value)} />
          </Field>
          <Field label="Photo URL" hint="Paste a URL from the Media page.">
            <Input value={p.avatarUrl} onChange={(e) => set("avatarUrl", e.target.value)} />
          </Field>
          <Field label="Photo alt text" hint="Required. Describe the photo.">
            <Input value={p.avatarAlt} onChange={(e) => set("avatarAlt", e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Years of experience">
              <Input type="number" min={0} value={p.yearsExperience} onChange={(e) => set("yearsExperience", Number(e.target.value))} />
            </Field>
            <Field label="Projects delivered">
              <Input type="number" min={0} value={p.projectCount} onChange={(e) => set("projectCount", Number(e.target.value))} />
            </Field>
          </div>
        </div>
      </section>

      <SaveBar dirty={d.dirty} pending={d.pending} status={d.status} restored={d.restored} onSave={d.save} onDiscard={d.discard} />
    </div>
  );
}
