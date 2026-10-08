import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, Plus, Search, Sparkles, Trash2, Pencil, Lock, Download, X, Lightbulb } from 'lucide-react';
import { Button, Input, Select, Textarea, Badge, Spinner } from '../components/ui/index.js';
import { ConsentCheckbox } from '../components/ui/ConsentCheckbox.jsx';
import { Logo } from '../components/layout/Logo.jsx';
import { Seo } from '../components/ui/Seo.jsx';
import { ResumeTemplatePreview } from '../components/cv/ResumeTemplatePreview.jsx';
import { getTemplatePricing, PaymentRequiredModal } from '../components/cv/TemplateGallery.jsx';
import { useContentProtection } from '../hooks/useContentProtection.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { studioService, errMsg } from '../services/studioService.js';
import { careerService } from '../services/careerService.js';
import { TEMPLATES } from '../data/resumeTemplates.js';
import { ROLE_EXAMPLES, POPULAR_TITLES, findRoleExamples, DEGREES, LANGUAGE_LEVELS, CERTIFICATION_PATTERNS, EXTRA_SECTIONS } from '../data/resumeExamples.js';
import { emptyWizard, emptyJob, emptySchool, resumeToWizard, wizardToResume, wizardToBuilder, completeness } from '../utils/wizardResume.js';
import { BUILDER_IMPORT_KEY } from '../utils/resumeToBuilder.js';
import { buildTemplateData } from '../utils/templateData.js';
import { printResumeSheet } from '../utils/printResume.js';
import { cn } from '../utils/cn.js';

/* ------------------------------------------------------------------ *
 * Guided Resume Builder — one simple question per screen:
 *   Heading → Work history → Education → Skills → Summary → Anything else
 *   → Choose template → Download
 * The draft is kept in this browser so nothing is lost on refresh.
 * ------------------------------------------------------------------ */

const STEPS = [
  { id: 'heading', label: 'Heading' },
  { id: 'work', label: 'Work history' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'summary', label: 'Summary' },
  { id: 'extras', label: 'Anything else' },
  { id: 'template', label: 'Choose template' },
  { id: 'download', label: 'Download' },
];

export const draftKey = (userId) => `dl_resume_wizard_${userId || 'guest'}`;

/** "Srinivas Sutar" → { firstName: 'Srinivas', surname: 'Sutar' } */
const splitName = (full = '') => {
  const [firstName = '', ...rest] = String(full).trim().split(/\s+/);
  return { firstName, surname: rest.join(' ') };
};
const sameName = (a, b) => String(a || '').toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim() === String(b || '').toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();

/* Which filling steps already have what they need (used after an upload,
   so we only ask for what the resume file was missing). */
const FILL_STEPS = ['heading', 'work', 'education', 'skills', 'summary'];
export function filledSteps(w) {
  const p = w.personal || {};
  return {
    heading: Boolean(p.firstName?.trim() && (p.email?.trim() || p.phone?.trim())),
    work: Boolean(w.noExperience || (w.experience || []).some((j) => j.title?.trim())),
    education: (w.education || []).some((e) => e.degree?.trim() || e.institution?.trim()),
    skills: (w.skills || []).filter((x) => x?.trim()).length >= 3,
    summary: (w.summary || '').trim().length > 30,
  };
}
function firstMissingStep(w) {
  const f = filledSteps(w);
  return FILL_STEPS.find((id) => !f[id]) || 'template';
}

function previewData(templateId, builderState) {
  const base = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
  return { ...buildTemplateData(base, builderState, { useSamples: false }), id: base.id, layout: base.id, name: base.name };
}

/* ---------- small building blocks ---------- */

function StepTitle({ title, lead, onBack, tips }) {
  return (
    <div className="mb-6">
      {onBack && (
        <button type="button" onClick={onBack} className="mb-3 inline-flex items-center gap-1 text-small font-semibold text-azure hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Go back
        </button>
      )}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-h2 font-extrabold leading-tight text-ink">{title}</h1>
        {tips && (
          <span className="hidden shrink-0 items-center gap-1 text-caption font-semibold text-azure sm:inline-flex" title={tips}>
            <Lightbulb className="h-4 w-4" aria-hidden /> Tip
          </span>
        )}
      </div>
      {lead && <p className="mt-2 text-body text-slate-600">{lead}</p>}
      {tips && <p className="mt-2 rounded-lg bg-azure-50 px-3 py-2 text-caption text-azure-700 sm:hidden">{tips}</p>}
    </div>
  );
}

function NavRow({ onPreview, previewLocked, nextLabel, onNext, nextDisabled, extra }) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-end gap-3">
      {extra}
      {onPreview && (
        <Button
          variant="outline"
          onClick={onPreview}
          title={previewLocked ? 'Add your name and an email or phone number first' : 'See how your resume looks so far'}
          className={previewLocked ? 'opacity-60' : undefined}
        >
          {previewLocked && <Lock className="h-3.5 w-3.5" aria-hidden />}
          Preview
        </Button>
      )}
      <Button size="lg" onClick={onNext} disabled={nextDisabled}>
        {nextLabel}
      </Button>
    </div>
  );
}

/** Left panel of example lines with + / ✓, like guided resume builders. */
function ExamplesPanel({ query, setQuery, items, picked, onToggle, loading, onMoreAi, aiNote, emptyText }) {
  const [draft, setDraft] = useState(query);
  useEffect(() => setDraft(query), [query]);
  return (
    <div className="rounded-xl border border-line bg-azure-50/40 p-4">
      <label className="text-caption font-bold text-ink" htmlFor="ex-search">
        Search by job title for pre-written examples
      </label>
      <form
        className="mt-1.5 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(draft.trim());
        }}
      >
        <div className="relative flex-1">
          <input
            id="ex-search"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Web Developer"
            className="h-11 w-full rounded-lg border border-line bg-white px-3 pr-8 text-small text-ink focus:border-azure focus:outline-none"
          />
          {draft && (
            <button type="button" aria-label="Clear" onClick={() => setDraft('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button type="submit" aria-label="Search" className="grid h-11 w-11 place-items-center rounded-full bg-azure-700 text-white hover:bg-azure">
          <Search className="h-5 w-5" />
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <span className="text-caption font-semibold text-slate-500">Popular:</span>
        {POPULAR_TITLES.slice(0, 6).map((t) => (
          <button key={t} type="button" onClick={() => setQuery(t)} className="text-caption font-semibold text-azure hover:underline">
            {t}
          </button>
        ))}
      </div>

      <ul className="mt-3 max-h-[26rem] space-y-2 overflow-y-auto pr-1">
        {items.length === 0 && !loading && <li className="rounded-lg bg-white p-3 text-small text-slate-500">{emptyText}</li>}
        {items.map((text, i) => {
          const on = picked(text);
          return (
            <li key={`${i}-${text.slice(0, 24)}`}>
              <button
                type="button"
                onClick={() => onToggle(text)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border bg-white p-3 text-left text-small transition-colors',
                  on ? 'border-azure-200 text-slate-500' : 'border-line text-ink hover:border-azure-300'
                )}
              >
                <span className={cn('mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full', on ? 'bg-azure-100 text-azure' : 'bg-azure-700 text-white')} aria-hidden>
                  {on ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                </span>
                <span>
                  {i < 2 && !on && (
                    <span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wide text-rose-700">★ Recommended</span>
                  )}
                  {text}
                </span>
              </button>
            </li>
          );
        })}
        {loading && (
          <li className="flex items-center gap-2 p-3 text-small text-slate-500">
            <Spinner className="h-4 w-4" /> Getting more ideas…
          </li>
        )}
      </ul>
      {onMoreAi && (
        <button type="button" onClick={onMoreAi} disabled={loading} className="mt-3 inline-flex items-center gap-1.5 text-small font-semibold text-azure hover:underline disabled:opacity-50">
          <Sparkles className="h-4 w-4" aria-hidden /> More ideas with AI
        </button>
      )}
      {aiNote && <p className="mt-2 text-caption text-slate-500">{aiNote}</p>}
    </div>
  );
}

/** Editable list of short lines (bullets, skills, interests…). */
function LineList({ items, onChange, placeholder, addLabel = 'Add one more', multiline = false }) {
  const update = (i, v) => onChange(items.map((x, j) => (j === i ? v : x)));
  const remove = (i) => onChange(items.filter((_, j) => j !== i));
  return (
    <div className="space-y-2">
      {items.map((v, i) => (
        <div key={i} className="flex items-start gap-2">
          {multiline ? (
            <textarea
              value={v}
              rows={2}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              aria-label={`${placeholder} ${i + 1}`}
              className="min-h-[3rem] flex-1 rounded-lg border border-line bg-white px-3 py-2 text-small leading-relaxed text-ink focus:border-azure focus:outline-none"
            />
          ) : (
            <input
              value={v}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              aria-label={`${placeholder} ${i + 1}`}
              className="h-11 flex-1 rounded-lg border border-line bg-white px-3 text-small text-ink focus:border-azure focus:outline-none"
            />
          )}
          <button type="button" onClick={() => remove(i)} aria-label="Remove" className="mt-2.5 text-slate-400 hover:text-danger">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])} className="inline-flex items-center gap-1 text-small font-semibold text-azure hover:underline">
        <Plus className="h-4 w-4" aria-hidden /> {addLabel}
      </button>
    </div>
  );
}

function MiniPreview({ templateId, builderState, onChange }) {
  return (
    <div className="hidden xl:block">
      <div className="sticky top-6 w-64">
        <div className="overflow-hidden rounded-lg border border-line bg-white shadow-crystal">
          <ResumeTemplatePreview template={previewData(templateId, builderState)} />
        </div>
        {onChange && (
          <button type="button" onClick={onChange} className="mt-2 w-full text-center text-small font-semibold text-azure hover:underline">
            Change template
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- the wizard ---------- */

export default function ResumeWizard() {
  const { user } = useAuth();
  const toast = useToast();
  const [params] = useSearchParams();
  const key = draftKey(user?.id || user?._id);

  // Opened right after "Upload my resume"? (read before the draft below
  // consumes the hand-off). Then we only ask for what the file was missing.
  const [fromUpload] = useState(() => {
    try {
      return Boolean(sessionStorage.getItem(BUILDER_IMPORT_KEY));
    } catch {
      return false;
    }
  });

  const [w, setW] = useState(() => {
    try {
      const imported = sessionStorage.getItem(BUILDER_IMPORT_KEY);
      if (imported) {
        sessionStorage.removeItem(BUILDER_IMPORT_KEY);
        return { ...resumeToWizard(JSON.parse(imported)), templateId: params.get('template') || 'dl-elite' };
      }
      if (params.get('start') === 'scratch' && params.get('fresh') === '1') return emptyWizard();
      const saved = localStorage.getItem(key);
      if (saved) return { ...emptyWizard(), ...JSON.parse(saved) };
    } catch {
      /* fall through */
    }
    return emptyWizard();
  });
  const [step, setStep] = useState(() => (fromUpload ? firstMissingStep(w) : 'heading'));
  // After an upload every filling step is reachable, up to Choose template.
  const [maxStep, setMaxStep] = useState(() => (fromUpload ? STEPS.findIndex((x) => x.id === 'template') : 0));
  const [showErrors, setShowErrors] = useState(() => fromUpload && !filledSteps(w).heading);
  const [uploadBannerOpen, setUploadBannerOpen] = useState(fromUpload);
  // The resume saved in the database loads by default (all steps done), and
  // the name is locked to the account: one account = one person's resume.
  const [profileLoading, setProfileLoading] = useState(true);
  const [loadedFromProfile, setLoadedFromProfile] = useState(false);
  const [lockedName, setLockedName] = useState('');
  const [nameReplaced, setNameReplaced] = useState(false);
  const prefilled = fromUpload || loadedFromProfile;
  const topRef = useRef(null);

  // "fresh=1" means "start empty" — only for the visit that asked for it.
  // Remove it from the address straight away, otherwise reloading the page
  // would wipe everything typed since.
  useEffect(() => {
    if (params.get('fresh') !== '1') return;
    const url = new URL(window.location.href);
    url.searchParams.delete('fresh');
    window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the draft in this browser.
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(w));
    } catch {
      /* storage full or disabled */
    }
  }, [w, key]);

  const set = (patch) => setW((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  const setPersonal = (k) => (e) => set((s) => ({ personal: { ...s.personal, [k]: e.target.value } }));
  const setExtras = (patch) => set((s) => ({ extras: { ...s.extras, ...patch } }));

  const builderState = useMemo(() => wizardToBuilder(w), [w]);
  const percent = completeness(w);
  const filled = filledSteps(w);
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  // Required for the Heading step to count as "done" — declared up here
  // (not down by the Heading screen's own JSX) because Preview, below,
  // needs to check it before the person has necessarily reached that step.
  const headingValid = Boolean(w.personal.firstName.trim() && (w.personal.email.trim() || w.personal.phone.trim()));

  // Where "Preview" was opened from, so its Back button returns there
  // instead of falling through to the generic previous-step logic (see
  // handlePreview below for why this exists).
  const [previewOrigin, setPreviewOrigin] = useState(null);

  const go = (id) => {
    const i = STEPS.findIndex((s) => s.id === id);
    setStep(id);
    setMaxStep((m) => Math.max(m, i));
    setShowErrors(false);
    setPreviewOrigin(null); // any real, unlocking navigation cancels "peek" mode
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const next = () => go(STEPS[Math.min(stepIndex + 1, STEPS.length - 1)].id);
  const back = () => go(STEPS[Math.max(stepIndex - 1, 0)].id);

  // India's DPDP Act 2023 means the consent box below must never be
  // pre-ticked and must always be a real, explicit choice (see
  // ConsentCheckbox.jsx) — so none of this skips or auto-checks consent.
  // What it DOES remove is busywork once consent is given: ticking the box
  // saves immediately (no separate button press needed), and from then on
  // further edits on this page quietly keep that saved copy up to date —
  // the same data, under the same consent, instead of going stale the
  // moment the person goes back to fix a typo. That saved copy is exactly
  // what the Cover Letter and Interview Prep tools read from, which is why
  // this is what makes resume data show up there automatically.
  // Consent is asked ONCE, on the first step, and remembered with this
  // draft — so every step after that saves to the database as you go.
  const [consent, setConsent] = useState(() => Boolean(w.saveConsent));
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [overflowsPage, setOverflowsPage] = useState(false);
  const lastSavedRef = useRef(null);
  async function saveProfile(opts = {}) {
    const { silent = false } = opts;
    // consentGiven: the box was ticked in this same click (state not updated yet).
    const hasConsent = opts.consentGiven ?? consent;
    if (!hasConsent) return silent ? undefined : toast.error('Please tick the consent box first.');
    const resume = wizardToResume(w);
    if (!resume.personal.name) return silent ? undefined : toast.error('Add your name on the Heading step first.');
    setSaving(true);
    try {
      // First save creates/replaces the profile; after that one request
      // keeps it in sync.
      if (saved) {
        await studioService.confirm(resume);
      } else {
        await studioService.startManual(resume, { consent: hasConsent, mode: 'replace' });
        await studioService.confirm();
      }
      lastSavedRef.current = JSON.stringify(w);
      setSaved(true);
      if (!lockedName) setLockedName(resume.personal.name);
      setLastSavedAt(new Date());
      if (!silent) toast.success('Saved to your profile.');
    } catch (err) {
      if (!silent) toast.error(errMsg(err, 'Could not save your profile. Try again.'));
    } finally {
      setSaving(false);
    }
    return undefined;
  }

  // Tick the box → save right away, instead of needing a second click.
  const handleConsentChange = (e) => {
    const checked = e.target.checked;
    setConsent(checked);
    set({ saveConsent: checked });
    if (checked) saveProfile({ consentGiven: true, silent: !w.personal.firstName.trim() });
  };

  // After the first save, keep it fresh: if the person goes back and
  // changes something, resync quietly a couple of seconds after they stop
  // typing (debounced, so it doesn't fire on every keystroke).
  // On open: load the saved resume from the database (unless this visit is
  // a fresh upload, which only takes the locked name from the account).
  useEffect(() => {
    let active = true;
    careerService
      .getProfile()
      .then((res) => {
        if (!active) return;
        const master = res?.exists ? res.master : null;
        const locked = (res?.identityName || master?.personal?.name || '').trim();
        if (locked) setLockedName(locked);
        if (fromUpload) {
          if (locked) {
            setW((prev) => {
              const uploaded = [prev.personal.firstName, prev.personal.surname].filter(Boolean).join(' ');
              if (uploaded && !sameName(uploaded, locked)) setNameReplaced(true);
              return { ...prev, personal: { ...prev.personal, ...splitName(locked) } };
            });
          }
          return;
        }
        if (master?.personal?.name) {
          setW((prev) => {
            const loaded = { ...emptyWizard(), ...resumeToWizard(master), templateId: prev.templateId || 'dl-elite', saveConsent: true };
            lastSavedRef.current = JSON.stringify(loaded);
            return loaded;
          });
          setConsent(true);
          setSaved(true);
          setLoadedFromProfile(true);
          setUploadBannerOpen(true);
          setMaxStep(STEPS.length - 1);
          setStep('download');
        } else if (locked) {
          setW((prev) => ({ ...prev, personal: { ...prev.personal, ...splitName(locked) } }));
        }
      })
      .catch(() => {})
      .finally(() => active && setProfileLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once consent is given: save (debounced) whenever anything changes, on
  // every step — including the first save after a page reload.
  useEffect(() => {
    if (!consent) return undefined;
    const snapshot = JSON.stringify(w);
    if (snapshot === lastSavedRef.current) return undefined;
    const t = setTimeout(() => saveProfile({ silent: true }), 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [w, saved, consent]);

  // "Preview" lets you peek at the template at any time, but it must never
  // unlock steps you haven't reached yet — that was the old bug: clicking
  // Preview jumped straight to the template step and, because `go()` always
  // pushes maxStep forward, every step in between lit up as "done" in the
  // sidebar even though the person never filled them in. So Preview:
  //   1. requires the Heading step (name + a way to contact you) first —
  //      without that there's nothing to show anyway, and
  //   2. only *looks* at the template screen; it deliberately does NOT call
  //      go()/bump maxStep, so the sidebar stays locked exactly where the
  //      person actually left off, and remembers previewOrigin so its Back
  //      button returns to the exact step the person previewed from.
  const previewReady = Boolean(headingValid);
  const handlePreview = () => {
    if (!previewReady) {
      setShowErrors(true);
      toast.error('Add your name and an email or phone number first — then you can preview your resume.');
      return;
    }
    setPreviewOrigin(step);
    setStep('template');
    setShowErrors(false);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const leavePreview = () => {
    if (previewOrigin) {
      const origin = previewOrigin;
      setPreviewOrigin(null);
      setStep(origin);
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      back();
    }
  };

  /* ----- example suggestions (built-in + AI) ----- */
  const profession = w.personal.profession || w.experience[0]?.title || '';
  const [exQuery, setExQuery] = useState(profession);
  const [aiItems, setAiItems] = useState({});
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState('');

  useEffect(() => setAiNote(''), [step, exQuery]);

  const role = findRoleExamples(exQuery) || (exQuery ? null : ROLE_EXAMPLES.find((r) => r.title === 'Fresher / Student'));
  const examples = (kind) => {
    const builtIn = role ? role[kind] || [] : [];
    const ai = aiItems[`${kind}:${exQuery.toLowerCase()}`] || [];
    return [...new Set([...builtIn, ...ai])];
  };

  async function moreWithAi(kind) {
    setAiLoading(true);
    setAiNote('');
    try {
      const res = await studioService.suggestions({
        kind,
        jobTitle: exQuery || profession,
        details:
          kind === 'summary'
            ? {
                name: [w.personal.firstName, w.personal.surname].join(' ').trim(),
                profession: w.personal.profession,
                jobs: w.experience.map((j) => [j.title, j.company].filter(Boolean).join(' at ')).filter(Boolean),
                education: w.education.map((e) => [e.degree, e.field, e.institution].filter(Boolean).join(', ')).filter(Boolean),
                skills: w.skills,
              }
            : undefined,
      });
      const k = `${kind === 'summary' ? 'summaries' : kind}:${exQuery.toLowerCase()}`;
      setAiItems((m) => ({ ...m, [k]: [...(m[k] || []), ...(res.items || [])] }));
      if (kind === 'summary') setAiNote('Personalised from what you entered — pick one and edit it.');
    } catch (err) {
      setAiNote(errMsg(err, 'AI ideas are busy right now. Use the examples or write your own.'));
    } finally {
      setAiLoading(false);
    }
  }

  /* ----- template gating ----- */
  const { isUnlocked } = useContentProtection({ enabled: false });
  const [lockedTpl, setLockedTpl] = useState(null);
  const isLocked = (id) => getTemplatePricing({ id }).isPremium && !isUnlocked(id);
  const chooseTemplate = (id) => {
    if (isLocked(id)) return setLockedTpl(TEMPLATES.find((t) => t.id === id) || null);
    return set({ templateId: id });
  };

  /* ================= screens ================= */

  // --- 1. Heading --- (headingValid is declared earlier, near previewReady)
  const [showLinks, setShowLinks] = useState({ linkedin: Boolean(w.personal.linkedin), website: Boolean(w.personal.website) });
  const heading = (
    <>
      <StepTitle title="What's the best way for employers to contact you?" lead="We suggest including an email and phone number." />
      <div className={cn('mb-5 rounded-xl border p-4', consent ? 'border-emerald-200 bg-emerald-50' : 'border-azure-200 bg-azure-50')}>
        <p className="flex items-center gap-2 text-small font-bold text-ink">
          <Lightbulb className="h-4 w-4 shrink-0 text-azure" aria-hidden /> Save to my DutyLaunch account
        </p>
        <p className="mt-1 text-caption text-slate-600">
          Tick once and everything you enter is saved to your account as you go — and used to write your Cover letter and Interview prep automatically.
        </p>
        <div className="mt-3">
          <ConsentCheckbox checked={consent} onChange={handleConsentChange} />
        </div>
        {consent && (
          <p className="mt-2 text-caption font-semibold text-emerald-800" aria-live="polite">
            {saving ? 'Saving…' : saved ? `✓ Saved to your account${lastSavedAt ? ` at ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}` : w.personal.firstName.trim() ? 'Will save in a moment…' : 'Add your first name to start saving.'}
          </p>
        )}
      </div>
      <p className="mb-4 text-caption text-slate-500">
        <span className="text-danger">*</span> indicates a required field
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="First name" required value={w.personal.firstName} onChange={setPersonal('firstName')} placeholder="e.g. Srinivas" disabled={Boolean(lockedName)} hint={lockedName ? '🔒 Locked to your account' : undefined} error={showErrors && !w.personal.firstName.trim() ? 'Enter your first name' : undefined} />
        <Input label="Surname" value={w.personal.surname} onChange={setPersonal('surname')} placeholder="e.g. Sutar" disabled={Boolean(lockedName)} hint={lockedName ? '🔒 Locked to your account' : undefined} />
        {lockedName && (
          <p className="-mt-2 text-caption text-slate-500 sm:col-span-2">
            Your name is fixed to your DutyLaunch account — each account builds one person's resume. Everything else (profession, contact details, jobs, skills, summary) can be changed for each job you apply to. Need your name corrected? Contact support.
          </p>
        )}
        <Input className="sm:col-span-2" label="Profession" value={w.personal.profession} onChange={setPersonal('profession')} placeholder="e.g. Web Developer" hint="The job you have or want. It appears under your name." />
        <Input label="City" value={w.personal.city} onChange={setPersonal('city')} placeholder="e.g. Bengaluru" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Country" value={w.personal.country} onChange={setPersonal('country')} />
          <Input label="PIN code" value={w.personal.pinCode} onChange={setPersonal('pinCode')} inputMode="numeric" placeholder="560068" />
        </div>
        <Input label="Phone" type="tel" value={w.personal.phone} onChange={setPersonal('phone')} placeholder="+91 98765 43210" />
        <Input label="Email" required type="email" value={w.personal.email} onChange={setPersonal('email')} placeholder="you@gmail.com" error={showErrors && !w.personal.email.trim() && !w.personal.phone.trim() ? 'Add an email or phone number' : undefined} />
        {showLinks.linkedin && <Input label="LinkedIn" value={w.personal.linkedin} onChange={setPersonal('linkedin')} placeholder="linkedin.com/in/your-name" />}
        {showLinks.website && <Input label="Website / portfolio" value={w.personal.website} onChange={setPersonal('website')} placeholder="your-site.com" />}
      </div>
      <div className="mt-5">
        <p className="text-small font-semibold text-ink">Add more to your resume (optional)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {!showLinks.linkedin && (
            <button type="button" onClick={() => setShowLinks((s) => ({ ...s, linkedin: true }))} className="rounded-full border border-azure-200 px-3 py-1.5 text-small font-semibold text-azure hover:bg-azure-50">
              LinkedIn +
            </button>
          )}
          {!showLinks.website && (
            <button type="button" onClick={() => setShowLinks((s) => ({ ...s, website: true }))} className="rounded-full border border-azure-200 px-3 py-1.5 text-small font-semibold text-azure hover:bg-azure-50">
              Website +
            </button>
          )}
        </div>
      </div>
      <NavRow
        onPreview={handlePreview} previewLocked={!previewReady}
        nextLabel="Next: Work history"
        onNext={() => {
          if (!headingValid) return setShowErrors(true);
          if (!exQuery && w.personal.profession) setExQuery(w.personal.profession);
          return next();
        }}
      />
    </>
  );

  // --- 2. Work history ---
  const [editingJob, setEditingJob] = useState(null); // job id or null
  const job = w.experience.find((j) => j.id === editingJob);
  const updateJob = (patch) => set((s) => ({ experience: s.experience.map((j) => (j.id === editingJob ? { ...j, ...patch } : j)) }));
  const startNewJob = () => {
    const j = emptyJob();
    set((s) => ({ experience: [...s.experience, j], noExperience: false }));
    setEditingJob(j.id);
  };
  useEffect(() => {
    if (step === 'work' && !w.noExperience && w.experience.length === 0 && !editingJob) startNewJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);
  useEffect(() => {
    if (job?.title && step === 'work') setExQuery(job.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingJob]);

  const work = job ? (
    <>
      <StepTitle
        title={job.title ? `What did you do as ${/^[aeiou]/i.test(job.title) ? 'an' : 'a'} ${job.title}?` : 'Tell us about this job'}
        lead="Fill in the details, then choose from pre-written examples below or write your own."
        onBack={() => (w.experience.length > 1 || job.title ? setEditingJob(null) : back())}
        tips="Start each point with an action word (Built, Led, Improved). Add numbers where you can — e.g. “served 40 customers a day”."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Job title" value={job.title} onChange={(e) => updateJob({ title: e.target.value })} onBlur={() => job.title && setExQuery(job.title)} placeholder="e.g. Web Developer" />
        <Input label="Employer" value={job.company} onChange={(e) => updateJob({ company: e.target.value })} placeholder="e.g. Infosys" />
        <Input label="Location" value={job.location} onChange={(e) => updateJob({ location: e.target.value })} placeholder="e.g. Bengaluru, India (or Remote)" />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Start date" value={job.startDate} onChange={(e) => updateJob({ startDate: e.target.value })} placeholder="Jan 2023" />
          <Input label="End date" value={job.current ? 'Present' : job.endDate} disabled={job.current} onChange={(e) => updateJob({ endDate: e.target.value })} placeholder="Mar 2025" />
        </div>
        <label className="flex items-center gap-2 text-small text-ink sm:col-start-2">
          <input type="checkbox" checked={job.current} onChange={(e) => updateJob({ current: e.target.checked })} /> I currently work here
        </label>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ExamplesPanel
          query={exQuery}
          setQuery={setExQuery}
          items={examples('bullets')}
          picked={(t) => job.bullets.includes(t)}
          onToggle={(t) => updateJob({ bullets: job.bullets.includes(t) ? job.bullets.filter((b) => b !== t) : [...job.bullets, t] })}
          loading={aiLoading}
          onMoreAi={() => moreWithAi('bullets')}
          aiNote={aiNote}
          emptyText="Type your job title above and press search to see examples — or write your own on the right."
        />
        <div>
          <p className="text-small font-bold text-ink">
            {job.title || 'Job'}
            {job.company ? ` | ${job.company}` : ''}
          </p>
          <p className="mb-2 text-caption text-slate-500">What you did — one point per line. Click an example to add it, then edit the [brackets].</p>
          <LineList items={job.bullets} onChange={(bullets) => updateJob({ bullets })} placeholder="Describe a task or achievement" addLabel="Add a point" multiline />
        </div>
      </div>
      <NavRow
        onPreview={handlePreview} previewLocked={!previewReady}
        nextLabel="Save this job"
        onNext={() => {
          if (!job.title.trim()) return toast.error('Add a job title first.');
          setEditingJob(null);
          return undefined;
        }}
      />
    </>
  ) : (
    <>
      <StepTitle title="Work history summary" lead="Check your jobs. Add another one, or continue." onBack={back} />
      {w.noExperience ? (
        <div className="rounded-xl border border-line bg-paper p-5 text-small text-slate-700">
          You chose <strong>no work experience yet</strong>. That's fine — your education, skills and projects will lead your resume.
          <button type="button" className="ml-2 font-semibold text-azure hover:underline" onClick={() => { set({ noExperience: false }); startNewJob(); }}>
            Add a job instead
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {w.experience.map((j, i) => (
            <li key={j.id} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white p-4">
              <div>
                <p className="font-bold text-ink">
                  {i + 1}. {j.title || 'Untitled job'}
                  {j.company ? `, ${j.company}` : ''}
                </p>
                <p className="text-caption text-slate-500">
                  {[j.location, [j.startDate, j.current ? 'Present' : j.endDate].filter(Boolean).join(' – ')].filter(Boolean).join(' · ')}
                </p>
                <p className="mt-1 text-caption text-slate-600">{j.bullets.filter(Boolean).length} point(s)</p>
              </div>
              <div className="flex gap-2">
                <button type="button" aria-label="Edit job" onClick={() => setEditingJob(j.id)} className="rounded-lg border border-line p-2 text-slate-600 hover:text-azure">
                  <Pencil className="h-4 w-4" />
                </button>
                <button type="button" aria-label="Delete job" onClick={() => set((s) => ({ experience: s.experience.filter((x) => x.id !== j.id) }))} className="rounded-lg border border-line p-2 text-slate-600 hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!w.noExperience && (
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" onClick={startNewJob}>
            <Plus className="h-4 w-4" aria-hidden /> Add another position
          </Button>
          {w.experience.length === 0 && (
            <Button variant="quiet" onClick={() => set({ noExperience: true })}>
              I don't have work experience yet
            </Button>
          )}
        </div>
      )}
      <NavRow onPreview={handlePreview} previewLocked={!previewReady} nextLabel="Next: Education" onNext={next} />
    </>
  );

  // fresher shortcut while editing the very first, empty job
  const freshersHint = job && w.experience.length === 1 && !job.title && !job.company && (
    <button
      type="button"
      onClick={() => {
        set({ experience: [], noExperience: true });
        setEditingJob(null);
        go('education');
      }}
      className="mb-5 w-full rounded-xl border border-dashed border-azure-300 bg-azure-50/50 p-3 text-left text-small text-azure-700 hover:bg-azure-50"
    >
      <strong>No work experience yet?</strong> That's okay — skip this step and we'll focus on your education and skills →
    </button>
  );

  // --- 3. Education ---
  const [editingSchool, setEditingSchool] = useState(null);
  const school = w.education.find((e) => e.id === editingSchool);
  const updateSchool = (patch) => set((s) => ({ education: s.education.map((e) => (e.id === editingSchool ? { ...e, ...patch } : e)) }));
  const startNewSchool = () => {
    const e = emptySchool();
    set((s) => ({ education: [...s.education, e] }));
    setEditingSchool(e.id);
  };
  useEffect(() => {
    if (step === 'education' && w.education.length === 0 && !editingSchool) startNewSchool();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const education = school ? (
    <>
      <StepTitle title="Tell us about your education" lead="Enter your highest qualification first. Add 10th / 12th too if you are a fresher." onBack={() => (w.education.length > 1 ? setEditingSchool(null) : back())} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input className="sm:col-span-2" label="School / college / university" value={school.institution} onChange={(e) => updateSchool({ institution: e.target.value })} placeholder="e.g. S-VYASA University" />
        <Input label="Location" value={school.location} onChange={(e) => updateSchool({ location: e.target.value })} placeholder="e.g. Bengaluru" />
        <Select label="Qualification" placeholder="Select…" options={DEGREES} value={school.degree} onChange={(e) => updateSchool({ degree: e.target.value })} />
        <Input label="Field of study" value={school.field} onChange={(e) => updateSchool({ field: e.target.value })} placeholder="e.g. Computer Applications" />
        <Input label="Graduation year" value={school.current ? 'Currently studying' : school.endDate} disabled={school.current} onChange={(e) => updateSchool({ endDate: e.target.value })} placeholder="2025" />
        <Input label="Marks / grade (optional)" value={school.grade} onChange={(e) => updateSchool({ grade: e.target.value })} placeholder="e.g. 8.4 CGPA or 82%" />
        <label className="flex items-center gap-2 self-end pb-3 text-small text-ink">
          <input type="checkbox" checked={school.current} onChange={(e) => updateSchool({ current: e.target.checked })} /> I'm still studying here
        </label>
      </div>
      <NavRow
        onPreview={handlePreview} previewLocked={!previewReady}
        nextLabel="Save education"
        onNext={() => {
          if (!school.institution.trim() && !school.degree) return toast.error('Add the school or qualification.');
          setEditingSchool(null);
          return undefined;
        }}
      />
    </>
  ) : (
    <>
      <StepTitle title="Education summary" lead="Check your education. Add another, or continue." onBack={back} />
      <ul className="space-y-3">
        {w.education.map((e) => (
          <li key={e.id} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white p-4">
            <div>
              <p className="font-bold text-ink">{[e.degree, e.field].filter(Boolean).join(' in ') || 'Qualification'}</p>
              <p className="text-caption text-slate-500">{[e.institution, e.location, e.current ? 'Currently studying' : e.endDate, e.grade].filter(Boolean).join(' · ')}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" aria-label="Edit" onClick={() => setEditingSchool(e.id)} className="rounded-lg border border-line p-2 text-slate-600 hover:text-azure">
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Delete" onClick={() => set((s) => ({ education: s.education.filter((x) => x.id !== e.id) }))} className="rounded-lg border border-line p-2 text-slate-600 hover:text-danger">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <Button className="mt-4" variant="outline" onClick={startNewSchool}>
        <Plus className="h-4 w-4" aria-hidden /> Add more education
      </Button>
      <NavRow onPreview={handlePreview} previewLocked={!previewReady} nextLabel="Next: Skills" onNext={next} />
    </>
  );

  // --- 4. Skills ---
  const [newSkill, setNewSkill] = useState('');
  const toggleSkill = (t) => set((s) => ({ skills: s.skills.includes(t) ? s.skills.filter((x) => x !== t) : [...s.skills, t] }));
  const skills = (
    <>
      <StepTitle title="What skills would you like to highlight?" lead="Choose from pre-written examples or write your own. 6–10 skills is ideal." onBack={back} tips="Add skills from the job posting you are applying for — recruiters and ATS software look for them." />
      <div className="grid gap-5 lg:grid-cols-2">
        <ExamplesPanel
          query={exQuery}
          setQuery={setExQuery}
          items={examples('skills')}
          picked={(t) => w.skills.includes(t)}
          onToggle={toggleSkill}
          loading={aiLoading}
          onMoreAi={() => moreWithAi('skills')}
          aiNote={aiNote}
          emptyText="Search your job title to see suggested skills."
        />
        <div>
          <p className="text-small font-bold text-ink">Your skills ({w.skills.length})</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {w.skills.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-azure-50 px-3 py-1.5 text-small font-semibold text-azure-700">
                {s}
                <button type="button" aria-label={`Remove ${s}`} onClick={() => toggleSkill(s)} className="text-azure-400 hover:text-danger">
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
            {w.skills.length === 0 && <p className="text-small text-slate-500">No skills yet — click the + next to an example, or type one below.</p>}
          </div>
          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const v = newSkill.trim();
              if (v && !w.skills.includes(v)) set((s) => ({ skills: [...s.skills, v] }));
              setNewSkill('');
            }}
          >
            <input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Type a skill, e.g. MS Excel" aria-label="New skill" className="h-11 flex-1 rounded-lg border border-line bg-white px-3 text-small focus:border-azure focus:outline-none" />
            <Button type="submit" variant="outline">
              Add
            </Button>
          </form>
        </div>
      </div>
      <NavRow onPreview={handlePreview} previewLocked={!previewReady} nextLabel="Next: Summary" onNext={next} />
    </>
  );

  // --- 5. Summary ---
  const summary = (
    <>
      <StepTitle title="Briefly tell us about your background" lead="Choose a pre-written example, let AI write one from your details, or write your own." onBack={back} tips="2–4 sentences: who you are, your strongest skills, and the job you want." />
      <div className="grid gap-5 lg:grid-cols-2">
        <ExamplesPanel
          query={exQuery}
          setQuery={setExQuery}
          items={examples('summaries')}
          picked={(t) => w.summary.trim() === t}
          onToggle={(t) => set({ summary: w.summary.trim() === t ? '' : t })}
          loading={aiLoading}
          aiNote={aiNote}
          emptyText="Search your job title to see example summaries."
        />
        <div>
          <div className="rounded-xl border border-azure-200 bg-gradient-to-br from-azure-50 to-white p-4">
            <p className="flex items-center gap-1.5 text-small font-bold text-ink">
              <Sparkles className="h-4 w-4 text-azure" aria-hidden /> Write my summary with AI
            </p>
            <p className="mt-1 text-caption text-slate-600">Uses the job, education and skills you entered. Pick one and edit it.</p>
            <Button className="mt-3" size="sm" onClick={() => moreWithAi('summary')} loading={aiLoading}>
              Generate summaries
            </Button>
          </div>
          <Textarea className="mt-4" label="Your summary" rows={8} value={w.summary} onChange={(e) => set({ summary: e.target.value })} placeholder="e.g. Web developer skilled in React and Node.js who builds fast, responsive websites…" />
        </div>
      </div>
      <NavRow onPreview={handlePreview} previewLocked={!previewReady} nextLabel="Next: Anything else" onNext={next} />
    </>
  );

  // --- 6. Extras ---
  const x = w.extras;
  const toggleExtra = (k) => setExtras({ on: { ...x.on, [k]: !x.on[k] } });
  const extras = (
    <>
      <StepTitle title="Do you have anything else to add?" lead="These sections are optional. Tick what you want, then fill it in below." onBack={back} />
      <div className="grid gap-2 sm:grid-cols-2">
        {EXTRA_SECTIONS.map((sec) => (
          <label key={sec.id} className={cn('flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-small font-semibold', x.on[sec.id] ? 'border-azure bg-azure-50 text-azure-700' : 'border-line text-ink hover:border-azure-300')}>
            <input type="checkbox" checked={Boolean(x.on[sec.id])} onChange={() => toggleExtra(sec.id)} />
            {sec.label}
          </label>
        ))}
      </div>

      <div className="mt-6 space-y-6">
        {x.on.websites && (
          <section>
            <h2 className="text-body font-bold text-ink">Websites, portfolios, profiles</h2>
            <LineList items={x.websites} onChange={(websites) => setExtras({ websites })} placeholder="e.g. github.com/your-name" addLabel="Add a link" />
          </section>
        )}
        {x.on.certifications && (
          <section>
            <h2 className="text-body font-bold text-ink">What certifications do you have?</h2>
            <p className="mt-1 text-caption text-slate-500">Click a pattern to start, then replace the [brackets].</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {CERTIFICATION_PATTERNS.map((p) => (
                <button key={p} type="button" onClick={() => setExtras({ certifications: [...x.certifications, { id: Math.random().toString(36).slice(2), name: p, issuer: '', year: '' }] })} className="inline-flex items-center gap-1 rounded-full border border-azure-200 px-3 py-1 text-caption font-semibold text-azure hover:bg-azure-50">
                  <Plus className="h-3.5 w-3.5" aria-hidden /> {p}
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {x.certifications.map((c, i) => (
                <div key={c.id} className="grid items-start gap-2 sm:grid-cols-[1fr_12rem_6rem_auto]">
                  <input aria-label="Certification name" value={c.name} onChange={(e) => setExtras({ certifications: x.certifications.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)) })} placeholder="Certification name" className="h-11 rounded-lg border border-line px-3 text-small focus:border-azure focus:outline-none" />
                  <input aria-label="Issued by" value={c.issuer} onChange={(e) => setExtras({ certifications: x.certifications.map((y, j) => (j === i ? { ...y, issuer: e.target.value } : y)) })} placeholder="Issued by" className="h-11 rounded-lg border border-line px-3 text-small focus:border-azure focus:outline-none" />
                  <input aria-label="Year" value={c.year} onChange={(e) => setExtras({ certifications: x.certifications.map((y, j) => (j === i ? { ...y, year: e.target.value } : y)) })} placeholder="Year" className="h-11 rounded-lg border border-line px-3 text-small focus:border-azure focus:outline-none" />
                  <button type="button" aria-label="Remove" onClick={() => setExtras({ certifications: x.certifications.filter((_, j) => j !== i) })} className="mt-3 text-slate-400 hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setExtras({ certifications: [...x.certifications, { id: Math.random().toString(36).slice(2), name: '', issuer: '', year: '' }] })} className="inline-flex items-center gap-1 text-small font-semibold text-azure hover:underline">
                <Plus className="h-4 w-4" aria-hidden /> Add one more
              </button>
            </div>
          </section>
        )}
        {x.on.languages && (
          <section>
            <h2 className="text-body font-bold text-ink">Languages</h2>
            <div className="mt-2 space-y-2">
              {x.languages.map((l, i) => (
                <div key={l.id} className="flex items-center gap-2">
                  <input aria-label="Language" value={l.name} onChange={(e) => setExtras({ languages: x.languages.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)) })} placeholder="e.g. Kannada" className="h-11 flex-1 rounded-lg border border-line px-3 text-small focus:border-azure focus:outline-none" />
                  <select aria-label="Level" value={l.level} onChange={(e) => setExtras({ languages: x.languages.map((y, j) => (j === i ? { ...y, level: e.target.value } : y)) })} className="h-11 rounded-lg border border-line bg-white px-3 text-small">
                    <option value="">Level…</option>
                    {LANGUAGE_LEVELS.map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                  <button type="button" aria-label="Remove" onClick={() => setExtras({ languages: x.languages.filter((_, j) => j !== i) })} className="text-slate-400 hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => setExtras({ languages: [...x.languages, { id: Math.random().toString(36).slice(2), name: '', level: '' }] })} className="inline-flex items-center gap-1 text-small font-semibold text-azure hover:underline">
                <Plus className="h-4 w-4" aria-hidden /> Add a language
              </button>
            </div>
          </section>
        )}
        {x.on.projects && (
          <section>
            <h2 className="text-body font-bold text-ink">Projects</h2>
            <div className="mt-2 space-y-3">
              {x.projects.map((pr, i) => (
                <div key={pr.id} className="space-y-2 rounded-lg border border-line p-3">
                  <div className="flex gap-2">
                    <input aria-label="Project name" value={pr.name} onChange={(e) => setExtras({ projects: x.projects.map((y, j) => (j === i ? { ...y, name: e.target.value } : y)) })} placeholder="Project name" className="h-11 flex-1 rounded-lg border border-line px-3 text-small focus:border-azure focus:outline-none" />
                    <button type="button" aria-label="Remove" onClick={() => setExtras({ projects: x.projects.filter((_, j) => j !== i) })} className="text-slate-400 hover:text-danger">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <textarea aria-label="What it does" rows={2} value={pr.description} onChange={(e) => setExtras({ projects: x.projects.map((y, j) => (j === i ? { ...y, description: e.target.value } : y)) })} placeholder="What it does and the tools you used" className="w-full rounded-lg border border-line px-3 py-2 text-small focus:border-azure focus:outline-none" />
                  <input aria-label="Link" value={pr.link} onChange={(e) => setExtras({ projects: x.projects.map((y, j) => (j === i ? { ...y, link: e.target.value } : y)) })} placeholder="Link (optional)" className="h-11 w-full rounded-lg border border-line px-3 text-small focus:border-azure focus:outline-none" />
                </div>
              ))}
              <button type="button" onClick={() => setExtras({ projects: [...x.projects, { id: Math.random().toString(36).slice(2), name: '', description: '', link: '' }] })} className="inline-flex items-center gap-1 text-small font-semibold text-azure hover:underline">
                <Plus className="h-4 w-4" aria-hidden /> Add a project
              </button>
            </div>
          </section>
        )}
        {[
          ['software', 'Software', 'e.g. MS Excel, Tally, Photoshop'],
          ['accomplishments', 'Accomplishments', 'e.g. Won first prize in state-level hackathon, 2024'],
          ['affiliations', 'Affiliations', 'e.g. Member, Computer Society of India'],
          ['interests', 'Interests / hobbies', 'e.g. Cricket, photography'],
        ].map(([k, label, ph]) =>
          x.on[k] ? (
            <section key={k}>
              <h2 className="text-body font-bold text-ink">{label}</h2>
              <div className="mt-2">
                <LineList items={x[k]} onChange={(v) => setExtras({ [k]: v })} placeholder={ph} />
              </div>
            </section>
          ) : null
        )}
        {x.on.additional && <Textarea label="Additional information" rows={4} value={x.additional} onChange={(e) => setExtras({ additional: e.target.value })} placeholder="e.g. Willing to relocate · Two-wheeler licence" />}
      </div>
      <NavRow onPreview={handlePreview} previewLocked={!previewReady} nextLabel="Next: Choose template" onNext={next} />
    </>
  );

  // --- 7. Template ---
  const template = (
    <>
      <StepTitle title="Choose a template" lead="Your details are already filled in. Free templates are ready to use; paid templates unlock after a one-time payment." onBack={leavePreview} />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((tpl) => {
          const paid = getTemplatePricing(tpl).isPremium;
          const unlocked = !paid || isUnlocked(tpl.id);
          const selected = w.templateId === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => chooseTemplate(tpl.id)}
              className={cn('group rounded-xl border-2 bg-white p-2 text-left transition-all', selected ? 'border-azure shadow-crystal' : 'border-line hover:border-azure-300')}
            >
              <div className="relative overflow-hidden rounded-lg border border-line">
                <ResumeTemplatePreview template={previewData(tpl.id, builderState)} />
                {!unlocked && (
                  <span className="absolute inset-0 grid place-items-center bg-white/40">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-caption font-bold text-white shadow">
                      <Lock className="h-3.5 w-3.5" aria-hidden /> Unlock
                    </span>
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between px-1">
                <span className="text-small font-bold text-ink">{tpl.name}</span>
                {!paid ? <Badge tone="success">Free</Badge> : unlocked ? <Badge tone="azure">Unlocked</Badge> : <Badge tone="amber">Paid</Badge>}
              </div>
              {selected && <p className="px-1 text-caption font-semibold text-azure">✓ Selected</p>}
            </button>
          );
        })}
      </div>
      <NavRow nextLabel="Next: Download" onNext={() => (isLocked(w.templateId) ? chooseTemplate(w.templateId) : next())} />
    </>
  );

  // --- 8. Download ---
  const fullName = [w.personal.firstName, w.personal.surname].filter(Boolean).join(' ');
  const placeholders = (() => {
    const found = new Set();
    const scan = (v) => {
      if (typeof v === 'string') (v.match(/\[[^\][]{2,40}\]/g) || []).forEach((m) => found.add(m));
      else if (Array.isArray(v)) v.forEach(scan);
      else if (v && typeof v === 'object') Object.values(v).forEach(scan);
    };
    scan(wizardToResume(w));
    return [...found];
  })();
  const download = (
    <>
      <StepTitle title="Your resume is ready!" lead="Check it once more, then download it as a PDF." onBack={back} />
      {placeholders.length > 0 && (
        <div role="alert" className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-small text-amber-900">
          <strong>Replace the [brackets] before downloading.</strong> Your resume still has example text to fill in: {placeholders.slice(0, 4).join(', ')}
          {placeholders.length > 4 ? '…' : ''}. Go back to the step and replace them with your real details.
        </div>
      )}
      {overflowsPage && (
        <div role="alert" className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-small text-amber-900">
          <strong>Your resume is longer than one printed page.</strong> Everything below is still here and the preview now scrolls so you can check it, but it will print onto a second page. For a one-page resume, trim a section (shorter bullet points, fewer entries) on an earlier step.
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="max-h-[80vh] overflow-y-auto rounded-xl border border-line bg-white shadow-crystal">
          <ResumeTemplatePreview template={previewData(w.templateId, builderState)} crop={false} allowOverflow onOverflow={(px) => setOverflowsPage(px > 4)} />
        </div>
        <div className="space-y-4">
          <Button
            size="lg"
            fullWidth
            onClick={() => {
              if (isLocked(w.templateId)) return chooseTemplate(w.templateId);
              printResumeSheet(fullName || 'DutyLaunch_Resume');
              return undefined;
            }}
          >
            <Download className="h-5 w-5" aria-hidden /> Download PDF
          </Button>
          <p className="text-caption text-slate-500">In the print window, choose <strong>Save as PDF</strong> as the destination.</p>
          <Button variant="outline" fullWidth onClick={() => go('template')}>
            Change template
          </Button>

          <div className="rounded-xl border border-line bg-paper p-4">
            <p className="text-small font-bold text-ink">Use this resume for your cover letter and interview prep</p>
            {saved ? (
              <div className="mt-2 space-y-2 text-small">
                <p className="text-success">✓ Saved to your profile{saving ? ' · updating…' : ''}. Any changes you make here keep it up to date automatically.</p>
                <Link to="/cover-letter" className="block font-semibold text-azure hover:underline">Write a cover letter →</Link>
                <Link to="/interview-prep" className="block font-semibold text-azure hover:underline">Prepare for interviews →</Link>
              </div>
            ) : (
              <>
                <p className="mt-1 text-caption text-slate-600">Tick the box below to save this resume — it then fills in automatically for Cover letter, Interview prep and job applications, and stays in sync as you keep editing.</p>
                <div className="mt-3">
                  <ConsentCheckbox checked={consent} onChange={handleConsentChange} />
                </div>
                {saving && <p className="mt-2 text-caption text-slate-500">Saving…</p>}
                <Button className="mt-3" size="sm" variant="outline" onClick={() => saveProfile()} loading={saving} disabled={!consent}>
                  Save to my profile
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const screens = { heading, work, education, skills, summary, extras, template, download };

  if (profileLoading && !fromUpload) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper" role="status" aria-live="polite">
        <div className="flex items-center gap-3 text-small font-semibold text-slate-600">
          <Spinner className="h-5 w-5" /> Loading your saved resume…
        </div>
      </div>
    );
  }
  const showMini = ['heading', 'extras'].includes(step);

  return (
    <div className="flex min-h-screen bg-paper">
      <Seo title="Resume Builder · DutyLaunch" noIndex />
      {/* Left stepper */}
      <aside className="hidden w-64 shrink-0 flex-col bg-azure-700 px-5 py-6 text-white lg:flex">
        <Logo tone="light" height={30} />
        <ol className="mt-10 space-y-1">
          {STEPS.map((s, i) => {
            // After an upload: a filling step is ticked when its data is
            // there; optional steps (Anything else…) only once passed.
            const done = prefilled
              ? FILL_STEPS.includes(s.id)
                ? filled[s.id] && s.id !== step
                : i < stepIndex
              : i < stepIndex || (i <= maxStep && i !== stepIndex && i < maxStep);
            const active = s.id === step;
            const reachable = i <= maxStep;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => go(s.id)}
                  className={cn('flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-small', active ? 'font-bold text-white' : reachable ? 'text-azure-100 hover:bg-white/10' : 'text-azure-200/60')}
                >
                  <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full border text-[11px] font-bold', done ? 'border-white bg-white text-azure-700' : active ? 'border-white bg-white text-azure-700' : 'border-azure-200/60')}>
                    {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                  </span>
                  {s.label}
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-8">
          <p className="text-caption font-semibold text-azure-100">Resume completeness</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20">
              <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${percent}%` }} />
            </div>
            <span className="text-caption font-bold">{percent}%</span>
          </div>
          <p className="mt-3 text-caption text-azure-100" aria-live="polite">
            {!consent ? 'Not saved to your account yet' : saving ? 'Saving…' : saved ? '✓ Saved to your account' : 'Saving soon…'}
          </p>
        </div>
        <div className="mt-auto space-y-2 pt-8 text-caption">
          <Link to="/resume-builder" className="block text-azure-100 hover:text-white">← Back to dashboard</Link>
          <button
            type="button"
            className="block text-azure-200 hover:text-white"
            onClick={() => {
              if (window.confirm(lockedName ? 'Start over? Everything except your name will be cleared.' : 'Start over? Everything you entered will be cleared.')) {
                setW(() => {
                  const fresh = emptyWizard();
                  return lockedName ? { ...fresh, personal: { ...fresh.personal, ...splitName(lockedName) }, saveConsent: Boolean(consent) } : fresh;
                });
                setEditingJob(null);
                setEditingSchool(null);
                setMaxStep(0);
                setStep('heading');
              }
            }}
          >
            Start over
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        {/* mobile progress */}
        <div className="flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
          <Link to="/resume-builder" className="text-small font-semibold text-azure">← Exit</Link>
          <span className="text-small font-bold text-ink">
            Step {stepIndex + 1} of {STEPS.length}: {STEPS[stepIndex].label}
          </span>
        </div>
        <div ref={topRef} className="mx-auto flex max-w-6xl gap-8 px-4 py-8 sm:px-8">
          <div className="min-w-0 flex-1">
            {step === 'work' && freshersHint}
            {nameReplaced && (
              <p role="alert" className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-small text-amber-900">
                The uploaded resume has a different name. Your account's resumes always use <strong>{lockedName}</strong>, so that name is kept — everything else was filled in from the file.
              </p>
            )}
            {loadedFromProfile && uploadBannerOpen && (
              <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div>
                  <p className="text-small font-bold text-emerald-900">Your saved resume is loaded — all steps are done.</p>
                  <p className="mt-0.5 text-caption text-emerald-800">
                    Open any step to tailor it for a new job role (profession, summary, skills, jobs…). Changes save automatically. Your name stays fixed to your account.
                  </p>
                </div>
                <button type="button" aria-label="Hide this message" onClick={() => setUploadBannerOpen(false)} className="text-emerald-700 hover:text-emerald-900">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {!loadedFromProfile && uploadBannerOpen && FILL_STEPS.concat('extras', 'template').includes(step) && (
              <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-small font-bold text-emerald-900">
                      {FILL_STEPS.every((id) => filled[id])
                        ? 'We filled in everything from your resume. Just pick a template!'
                        : 'We filled in your resume from your file. Only fill in what is missing.'}
                    </p>
                    <p className="mt-0.5 text-caption text-emerald-800">You can still open any step to check or change it.</p>
                  </div>
                  <button type="button" aria-label="Hide this message" onClick={() => setUploadBannerOpen(false)} className="text-emerald-700 hover:text-emerald-900">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {FILL_STEPS.map((id) => {
                    const label = STEPS.find((x) => x.id === id)?.label;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => go(id)}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-3 py-1 text-caption font-semibold',
                          filled[id] ? 'bg-white text-emerald-800 hover:bg-emerald-100' : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        )}
                      >
                        {filled[id] ? <Check className="h-3.5 w-3.5" aria-hidden /> : <span aria-hidden>•</span>}
                        {label}
                        {!filled[id] && ' — missing'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {screens[step]}
          </div>
          {showMini && <MiniPreview templateId={w.templateId} builderState={builderState} onChange={handlePreview} />}
        </div>
      </main>

      <PaymentRequiredModal
        tpl={lockedTpl}
        open={Boolean(lockedTpl)}
        onClose={() => setLockedTpl(null)}
        onUnlockSuccess={(tpl) => {
          setLockedTpl(null);
          set({ templateId: tpl.id });
        }}
      />
    </div>
  );
}