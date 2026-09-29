import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Button, Input, Textarea } from '../ui/index.js';
import { cn } from '../../utils/cn.js';

/**
 * Editable view of the Master Career Profile for the Studio review step.
 * Every section can be edited, added to or removed. Fields the importer
 * flagged (`needsReview`) are highlighted so the candidate checks them —
 * nothing is used for documents until they confirm.
 */

const lines = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');
const toLines = (text) => String(text).split('\n').map((s) => s.trim()).filter(Boolean);
const csv = (arr) => (Array.isArray(arr) ? arr.join(', ') : '');
const toCsv = (text) => String(text).split(',').map((s) => s.trim()).filter(Boolean);

function Flag({ show }) {
  if (!show) return null;
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-caption font-semibold text-amber-600">
      <AlertTriangle className="h-3 w-3" aria-hidden /> Check this
    </span>
  );
}

function Section({ title, onAdd, addLabel, children }) {
  return (
    <fieldset className="rounded-lg border border-line bg-white p-4 sm:p-5">
      <legend className="px-1 text-small font-bold text-ink">{title}</legend>
      <div className="space-y-4">{children}</div>
      {onAdd && (
        <Button type="button" variant="quiet" size="sm" className="mt-4" onClick={onAdd}>
          <Plus className="h-4 w-4" aria-hidden /> {addLabel}
        </Button>
      )}
    </fieldset>
  );
}

function RemoveButton({ onClick, label }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1 text-caption font-semibold text-danger hover:underline" aria-label={label}>
      <Trash2 className="h-3.5 w-3.5" aria-hidden /> Remove
    </button>
  );
}

const flagged = (needsReview, path) => needsReview.some((p) => p === path || p.startsWith(`${path}.`));
const box = (on) => cn(on && 'rounded-md ring-2 ring-amber-300 ring-offset-2');

export function ProfileEditor({ value, onChange, needsReview = [] }) {
  const r = value;
  const set = (patch) => onChange({ ...r, ...patch });
  const setPersonal = (k, v) => set({ personal: { ...r.personal, [k]: v } });
  const setItem = (key, i, patch) => set({ [key]: r[key].map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const removeItem = (key, i) => set({ [key]: r[key].filter((_, j) => j !== i) });

  const p = r.personal || {};
  return (
    <div className="space-y-5">
      <Section title="Profile header">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['name', 'Full name'], ['headline', 'Professional headline'], ['email', 'Email'], ['phone', 'Phone'],
            ['location', 'City and country'], ['linkedin', 'LinkedIn URL'], ['website', 'Portfolio / website'],
          ].map(([k, label]) => (
            <div key={k} className={box(flagged(needsReview, `personal.${k}`))}>
              <Input label={<>{label}<Flag show={flagged(needsReview, `personal.${k}`)} /></>} value={p[k] || ''} onChange={(e) => setPersonal(k, e.target.value)} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="About / professional summary">
        <Textarea label="Summary" rows={5} value={r.summary || ''} onChange={(e) => set({ summary: e.target.value })} hint="Your own words. The AI works from this, never beyond it." />
      </Section>

      <Section
        title="Experience"
        addLabel="Add a role"
        onAdd={() => set({ experience: [...(r.experience || []), { company: '', title: '', location: '', startDate: '', endDate: '', current: false, responsibilities: [], achievements: [], skillsUsed: [] }] })}
      >
        {(r.experience || []).length === 0 && <p className="text-small text-slate-500">No roles yet. Freshers can skip this and add projects instead.</p>}
        {(r.experience || []).map((role, i) => (
          <div key={i} className="rounded-md border border-line p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {[['title', 'Job title'], ['company', 'Company'], ['location', 'Location'], ['employmentType', 'Employment type']].map(([k, label]) => (
                <div key={k} className={box(flagged(needsReview, `experience.${i}.${k}`))}>
                  <Input label={<>{label}<Flag show={flagged(needsReview, `experience.${i}.${k}`)} /></>} value={role[k] || ''} onChange={(e) => setItem('experience', i, { [k]: e.target.value })} />
                </div>
              ))}
              <div className={box(flagged(needsReview, `experience.${i}.startDate`) || flagged(needsReview, `experience.${i}.dates`))}>
                <Input label="Start (YYYY-MM)" placeholder="2021-06" value={role.startDate || ''} onChange={(e) => setItem('experience', i, { startDate: e.target.value })} />
              </div>
              <div>
                <Input label="End (YYYY-MM)" placeholder="2023-05" value={role.endDate || ''} disabled={role.current} onChange={(e) => setItem('experience', i, { endDate: e.target.value })} />
                <label className="mt-2 flex items-center gap-2 text-caption text-slate-600">
                  <input type="checkbox" checked={Boolean(role.current)} onChange={(e) => setItem('experience', i, { current: e.target.checked, endDate: e.target.checked ? '' : role.endDate })} /> I work here now
                </label>
              </div>
            </div>
            <Textarea className="mt-3" label="Responsibilities and achievements (one per line)" rows={4} value={lines([...(role.responsibilities || []), ...(role.achievements || [])])} onChange={(e) => setItem('experience', i, { responsibilities: toLines(e.target.value), achievements: [] })} />
            <Input className="mt-3" label="Technologies used (comma separated)" value={csv(role.skillsUsed)} onChange={(e) => setItem('experience', i, { skillsUsed: toCsv(e.target.value) })} />
            <div className="mt-3 text-right"><RemoveButton onClick={() => removeItem('experience', i)} label={`Remove ${role.title || 'role'}`} /></div>
          </div>
        ))}
      </Section>

      <Section title="Education" addLabel="Add education" onAdd={() => set({ education: [...(r.education || []), { institution: '', degree: '', field: '', startDate: '', endDate: '', grade: '', highlights: [] }] })}>
        {(r.education || []).map((ed, i) => (
          <div key={i} className="rounded-md border border-line p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {[['institution', 'Institution'], ['degree', 'Degree'], ['field', 'Specialisation'], ['grade', 'CGPA / percentage'], ['startDate', 'Start (YYYY)'], ['endDate', 'Graduation (YYYY)']].map(([k, label]) => (
                <div key={k} className={box(flagged(needsReview, `education.${i}.${k}`))}>
                  <Input label={<>{label}<Flag show={flagged(needsReview, `education.${i}.${k}`)} /></>} value={ed[k] || ''} onChange={(e) => setItem('education', i, { [k]: e.target.value })} />
                </div>
              ))}
            </div>
            <Input className="mt-3" label="Relevant coursework (comma separated)" value={csv(ed.highlights)} onChange={(e) => setItem('education', i, { highlights: toCsv(e.target.value) })} />
            <div className="mt-3 text-right"><RemoveButton onClick={() => removeItem('education', i)} label="Remove education" /></div>
          </div>
        ))}
      </Section>

      <Section title="Skills">
        <p className="text-caption text-slate-500">LinkedIn only exports your top 3 skills — add any others you genuinely use. Comma separated.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {[['technical', 'Technical skills'], ['tools', 'Tools & technologies'], ['functional', 'Professional skills'], ['soft', 'Soft skills']].map(([k, label]) => (
            <Input key={k} label={label} value={csv(r.skills?.[k])} onChange={(e) => set({ skills: { ...r.skills, [k]: toCsv(e.target.value) } })} />
          ))}
        </div>
      </Section>

      <Section title="Projects" addLabel="Add a project" onAdd={() => set({ projects: [...(r.projects || []), { name: '', role: '', description: '', technologies: [], link: '', startDate: '', endDate: '' }] })}>
        {(r.projects || []).map((pr, i) => (
          <div key={i} className="rounded-md border border-line p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Project name" value={pr.name || ''} onChange={(e) => setItem('projects', i, { name: e.target.value })} />
              <Input label="Your role" value={pr.role || ''} onChange={(e) => setItem('projects', i, { role: e.target.value })} />
              <Input label="Link" value={pr.link || ''} onChange={(e) => setItem('projects', i, { link: e.target.value })} />
              <Input label="Technologies (comma separated)" value={csv(pr.technologies)} onChange={(e) => setItem('projects', i, { technologies: toCsv(e.target.value) })} />
            </div>
            <Textarea className="mt-3" label="What you did and what it achieved" rows={3} value={pr.description || ''} onChange={(e) => setItem('projects', i, { description: e.target.value })} />
            <div className="mt-3 text-right"><RemoveButton onClick={() => removeItem('projects', i)} label="Remove project" /></div>
          </div>
        ))}
      </Section>

      <Section title="Certifications" addLabel="Add a certification" onAdd={() => set({ certifications: [...(r.certifications || []), { name: '', issuer: '', issueDate: '', expiryDate: '', credentialId: '', link: '' }] })}>
        {(r.certifications || []).map((c, i) => (
          <div key={i} className="grid items-end gap-3 sm:grid-cols-[2fr_1.5fr_1fr_auto]">
            <Input label="Certification" value={c.name || ''} onChange={(e) => setItem('certifications', i, { name: e.target.value })} />
            <Input label="Issuer" value={c.issuer || ''} onChange={(e) => setItem('certifications', i, { issuer: e.target.value })} />
            <Input label="Issued (YYYY-MM)" value={c.issueDate || ''} onChange={(e) => setItem('certifications', i, { issueDate: e.target.value })} />
            <div className="pb-2"><RemoveButton onClick={() => removeItem('certifications', i)} label="Remove certification" /></div>
          </div>
        ))}
      </Section>

      <Section title="Languages & awards">
        <Input label="Languages (comma separated, e.g. English (Fluent))" value={(r.languages || []).map((l) => (typeof l === 'string' ? l : [l.name, l.proficiency && `(${l.proficiency})`].filter(Boolean).join(' '))).join(', ')}
          onChange={(e) => set({ languages: toCsv(e.target.value).map((l) => { const m = l.match(/^(.*?)\s*\((.*)\)$/); return m ? { name: m[1], proficiency: m[2] } : { name: l, proficiency: '' }; }) })} />
        <Textarea label="Awards and honours (one per line)" rows={3} value={lines(r.awards)} onChange={(e) => set({ awards: toLines(e.target.value) })} />
      </Section>
    </div>
  );
}
