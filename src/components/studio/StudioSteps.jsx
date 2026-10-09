import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileDown, Eye, Copy, RefreshCw, Save, Trash2, ChevronDown, ChevronUp, PlayCircle, Info, CheckCircle2, AlertTriangle, FileText, Sparkles, FileUp, PencilLine, Check } from 'lucide-react';
import { Button, Input, Textarea, Select, Badge, Spinner } from '../ui/index.js';
import { ConsentCheckbox } from '../ui/ConsentCheckbox.jsx';
import { ProfileEditor } from './ProfileEditor.jsx';
import { ResumeHealthReport, JobMatchPanel, KeywordTable, RecommendationList, ProposalReview, ScoreDial } from '../career/CareerReport.jsx';
import { careerService } from '../../services/careerService.js';
import { studioService, COVER_LETTER_TONES, EXPERIENCE_LEVELS, errMsg } from '../../services/studioService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { CoverLetterDesigner } from '../cover/CoverLetterDesigner.jsx';
import { cn } from '../../utils/cn.js';

/* ------------------------------------------------------------------ *
 * Shared bits
 * ------------------------------------------------------------------ */

export function Panel({ title, lead, children, className }) {
  return (
    <div className={cn('rounded-xl border border-line bg-white p-5 shadow-xs sm:p-7', className)}>
      {title && <h2 className="text-h3 font-bold text-ink">{title}</h2>}
      {lead && <p className="mt-1.5 max-w-prose text-small text-slate-600">{lead}</p>}
      <div className={cn(title || lead ? 'mt-5' : '')}>{children}</div>
    </div>
  );
}

function Note({ tone = 'info', children }) {
  const Icon = tone === 'warn' ? AlertTriangle : tone === 'ok' ? CheckCircle2 : Info;
  return (
    <div className={cn('flex gap-2.5 rounded-lg p-3.5 text-small', tone === 'warn' ? 'bg-amber-50 text-amber-800' : tone === 'ok' ? 'bg-success/10 text-ink' : 'bg-azure-50 text-ink')}>
      <Icon className={cn('mt-0.5 h-4 w-4 flex-none', tone === 'warn' ? 'text-amber-600' : tone === 'ok' ? 'text-success' : 'text-azure')} aria-hidden />
      <div>{children}</div>
    </div>
  );
}

function ErrorLine({ error }) {
  if (!error) return null;
  return <p role="alert" className="mt-3 text-small font-medium text-danger">{error}</p>;
}

/** Download / preview buttons for one document. */
function DocButtons({ onDownload, onPreview, docx = true, busy }) {
  return (
    <div className="flex flex-wrap gap-2">
      {onPreview && <Button variant="quiet" size="sm" onClick={onPreview} loading={busy === 'preview'}><Eye className="h-4 w-4" aria-hidden /> Preview</Button>}
      <Button variant="outline" size="sm" onClick={() => onDownload('pdf')} loading={busy === 'pdf'}><FileDown className="h-4 w-4" aria-hidden /> PDF</Button>
      {docx && <Button variant="quiet" size="sm" onClick={() => onDownload('docx')} loading={busy === 'docx'}><FileDown className="h-4 w-4" aria-hidden /> DOCX</Button>}
    </div>
  );
}

function useVersions(refreshKey) {
  const [versions, setVersions] = useState(null);
  useEffect(() => {
    let live = true;
    careerService.listVersions().then((v) => live && setVersions((v || []).filter((x) => x.kind !== 'original'))).catch(() => live && setVersions([]));
    return () => { live = false; };
  }, [refreshKey]);
  return versions;
}

function VersionSelect({ versions, value, onChange, allowMaster = true }) {
  if (!versions) return <Spinner />;
  return (
    <Select label="Resume to use" value={value} onChange={(e) => onChange(e.target.value)}>
      {allowMaster && <option value="">My confirmed career profile</option>}
      {versions.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
    </Select>
  );
}

/* ------------------------------------------------------------------ *
 * Step 1 — Import
 * ------------------------------------------------------------------ */

const SOURCE_TEXT = {
  'linkedin-pdf+resume': 'your LinkedIn PDF and CV',
  'linkedin-pdf': 'your LinkedIn PDF',
  manual: 'manual entry',
  resume: 'your CV',
};

function FileDrop({ file, onChange, title, caption }) {
  return (
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-paper px-4 py-6 text-center hover:border-azure-300">
      <Upload className="h-6 w-6 text-azure" aria-hidden />
      <span className="mt-2 text-small font-semibold text-ink">{file ? file.name : title}</span>
      <span className="text-caption text-slate-500">{caption}</span>
      <input type="file" accept=".pdf,.docx,.doc,.txt" className="sr-only" onChange={(e) => onChange(e.target.files?.[0] || null)} />
    </label>
  );
}

export function ImportStep({ studio, onDone, goTo }) {
  const { success } = useToast();
  const [linkedinFile, setLinkedinFile] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [consent, setConsent] = useState(false);
  const [mode, setMode] = useState('replace');
  const [url, setUrl] = useState(studio.profile?.linkedinUrl || '');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [report, setReport] = useState(null);
  const { user } = useAuth();
  const [manual, setManual] = useState({ name: user?.name || '', headline: '' });
  const hasProfile = Boolean(studio.profile);
  // "Are you uploading an existing resume?" — chosen first, like a guided
  // resume builder: upload (LinkedIn PDF and/or CV) or start from scratch.
  const [startChoice, setStartChoice] = useState('upload');
  const [stage, setStage] = useState('choose'); // 'choose' | 'upload' | 'scratch'

  async function upload() {
    setError('');
    if (!linkedinFile && !cvFile) return setError('Choose your LinkedIn profile PDF (and your CV, if you have one).');
    if (!consent) return setError('Please tick the consent box to continue.');
    setBusy('upload');
    try {
      const res = await studioService.importFiles({ linkedinFile, cvFile }, { consent, mode: hasProfile ? mode : 'replace', linkedinUrl: url.trim() || undefined });
      setReport(res.report);
      success(`Imported from ${SOURCE_TEXT[res.report.source] || 'your file'}.`);
      // Stay here so the candidate can read what was (and was not) imported.
      onDone('import');
    } catch (err) {
      setError(errMsg(err, 'That file could not be imported.'));
    } finally {
      setBusy('');
    }
  }

  async function saveUrl() {
    setError('');
    setBusy('url');
    try {
      const res = await studioService.setLinkedInUrl(url);
      success(res.note);
      onDone();
    } catch (err) {
      setError(errMsg(err, 'Could not save that URL.'));
    } finally {
      setBusy('');
    }
  }

  async function startManual() {
    setError('');
    if (!manual.name.trim()) return setError('Enter your name to start a profile manually.');
    if (!consent) return setError('Please tick the consent box to continue.');
    setBusy('manual');
    try {
      await studioService.startManual(
        { personal: { name: manual.name.trim(), headline: manual.headline.trim() } },
        { consent, mode: hasProfile ? 'replace' : undefined }
      );
      success('Profile started. Fill in every section on the review step.');
      onDone('review');
    } catch (err) {
      setError(errMsg(err, 'Could not start a profile.'));
    } finally {
      setBusy('');
    }
  }

  const statusTone = { imported: 'ok', partial: 'warn', 'manual-needed': 'warn' };
  const shown = report || (studio.profile?.importStatus && { status: studio.profile.importStatus, source: studio.profile.importSource });
  const importLabel = linkedinFile && cvFile ? 'Import LinkedIn + CV' : linkedinFile ? 'Import LinkedIn profile' : cvFile ? 'Import CV' : 'Import';

  return (
    <Panel
      title="Import your LinkedIn profile"
      lead="Your profile is built from your LinkedIn PDF. Adding your CV is optional — if you do, it only fills in what LinkedIn is missing, such as extra jobs, achievement bullet points and skills."
    >
      {shown && (
        <div className="mb-5">
          <Note tone={statusTone[shown.status] || 'info'}>
            <strong>
              {shown.status === 'imported' ? 'Imported' : shown.status === 'partial' ? 'Partially imported' : 'Needs manual input'}
            </strong>{' '}
            from {SOURCE_TEXT[shown.source] || 'your CV'}.{' '}
            {report?.note}
            {report?.missing?.length > 0 && <> Not found: {report.missing.join(', ')}.</>}
            {report?.warnings?.length > 0 && <span className="mt-1 block">{report.warnings.join(' ')}</span>}
            {report && (
              <div className="mt-3"><Button size="sm" onClick={() => goTo('review')}>Review my profile →</Button></div>
            )}
          </Note>
        </div>
      )}

      {stage === 'choose' && (
        <div>
          <h3 className="text-center text-h3 font-bold text-ink">Are you uploading an existing resume?</h3>
          <p className="mt-1 text-center text-small text-slate-600">Just review, edit and update it with new information.</p>
          <div role="radiogroup" aria-label="How do you want to start?" className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { id: 'upload', icon: FileUp, title: 'Yes, upload my LinkedIn or resume', body: 'We read your LinkedIn PDF and/or CV and fill in your profile. You review and confirm it.', badge: 'Speed up your resume' },
              { id: 'scratch', icon: PencilLine, title: 'No, start from scratch', body: 'Enter your details yourself — contact, experience, education and skills — on the next step.' },
            ].map(({ id, icon: Icon, title, body, badge }) => {
              const selected = startChoice === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setStartChoice(id)}
                  className={cn(
                    'relative flex flex-col items-center rounded-xl border-2 bg-white px-5 pb-6 pt-8 text-center transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure',
                    selected ? 'border-azure shadow-crystal' : 'border-line hover:border-azure-300'
                  )}
                >
                  {badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-rose-800">{badge}</span>
                  )}
                  {selected && (
                    <span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-azure text-white" aria-hidden><Check className="h-3 w-3" /></span>
                  )}
                  <span className={cn('grid h-12 w-12 place-items-center rounded-2xl', selected ? 'bg-azure-50 text-azure' : 'bg-paper text-slate-600')}><Icon className="h-6 w-6" aria-hidden /></span>
                  <span className="mt-3 text-body font-bold text-ink">{title}</span>
                  <span className="mt-1.5 text-small text-slate-600">{body}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => { setError(''); setStage(startChoice); }}>Next</Button>
          </div>
        </div>
      )}

      {stage === 'scratch' && (
        <div className="max-w-xl space-y-4">
          <div>
            <h3 className="text-small font-bold text-ink">Start from scratch</h3>
            <p className="mt-1 text-caption text-slate-600">Add your name and headline now. On the next step you fill in every section: contact details, summary, experience, education, skills, certifications and projects.</p>
          </div>
          {hasProfile && (
            <Note tone="warn">You already have a profile. Starting from scratch replaces it with an empty one. Your resumes, cover letters and interview sets stay in My resumes.</Note>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Full name" value={manual.name} onChange={(e) => setManual((m) => ({ ...m, name: e.target.value }))} />
            <Input label="Headline" placeholder="e.g. Frontend Developer" value={manual.headline} onChange={(e) => setManual((m) => ({ ...m, headline: e.target.value }))} />
          </div>
          <ConsentCheckbox checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <div className="flex flex-wrap gap-3">
            <Button onClick={startManual} loading={busy === 'manual'}>Start building my profile</Button>
            <Button variant="quiet" onClick={() => setStage('choose')}>Back</Button>
          </div>
        </div>
      )}

      {stage === 'upload' && (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Button size="sm" variant="quiet" className="mb-2" onClick={() => setStage('choose')}>← Back</Button>
            <h3 className="text-small font-bold text-ink">1. LinkedIn profile PDF <span className="font-medium text-azure">(main source)</span></h3>
            <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-caption text-slate-600">
              <li>On LinkedIn, open your profile.</li>
              <li>Click <strong>More</strong> → <strong>Save to PDF</strong>.</li>
              <li>Upload that file here.</li>
            </ol>
          </div>
          <FileDrop file={linkedinFile} onChange={setLinkedinFile} title="Choose your LinkedIn PDF" caption="The PDF from LinkedIn · max 5 MB" />

          <div>
            <h3 className="text-small font-bold text-ink">2. Your CV <span className="font-medium text-slate-500">(optional)</span></h3>
            <p className="mt-1 text-caption text-slate-600">No CV? No problem — your resume is built from your LinkedIn profile. If you add one, it fills in what LinkedIn is missing.</p>
          </div>
          <FileDrop file={cvFile} onChange={setCvFile} title="Choose your CV (optional)" caption="PDF or DOCX · text-based · max 5 MB" />

          {hasProfile && (
            <fieldset className="space-y-1.5 text-small">
              <legend className="font-semibold text-ink">You already have a profile</legend>
              <label className="flex items-center gap-2"><input type="radio" checked={mode === 'merge'} onChange={() => setMode('merge')} /> Add anything new to my profile (nothing I reviewed is overwritten)</label>
              <label className="flex items-center gap-2"><input type="radio" checked={mode === 'replace'} onChange={() => setMode('replace')} /> Replace my profile with these files</label>
            </fieldset>
          )}
          <ConsentCheckbox checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          <Button onClick={upload} loading={busy === 'upload'}>{importLabel}</Button>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="text-small font-bold text-ink">LinkedIn profile URL (optional)</h3>
            <p className="mt-1 text-caption text-slate-600">Saved as a link on your profile. A URL alone does not let us read your LinkedIn data — upload the PDF for that.</p>
            <div className="mt-2 flex gap-2">
              <Input aria-label="LinkedIn profile URL" placeholder="linkedin.com/in/your-name" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
              <Button variant="quiet" onClick={saveUrl} loading={busy === 'url'} disabled={!url.trim()}>Save</Button>
            </div>
          </div>
          <div className="rounded-lg bg-paper p-4 text-caption text-slate-600">
            <strong className="text-ink">Why a PDF and not “Connect LinkedIn”?</strong> Reading a LinkedIn profile directly requires LinkedIn API partner approval. We never scrape LinkedIn or ask for your LinkedIn password. The PDF LinkedIn gives you contains the same profile data.
          </div>
        </div>
      </div>
      )}
      <ErrorLine error={error} />
    </Panel>
  );
}

/* ------------------------------------------------------------------ *
 * Step 2 — Review and confirm
 * ------------------------------------------------------------------ */

export function ReviewStep({ studio, onDone }) {
  const { success } = useToast();
  const [draft, setDraft] = useState(null);
  const [needsReview, setNeedsReview] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    careerService.getProfile().then((p) => {
      if (p?.master) {
        setDraft(p.master);
        setNeedsReview(p.master._needsReview || []);
      }
    }).catch((err) => setError(errMsg(err, 'Could not load your profile.')));
  }, [studio.profile?.importedAt]);

  async function confirm() {
    setError('');
    setBusy(true);
    try {
      await studioService.confirm(draft);
      success('Profile confirmed. It is now the source for every document.');
      onDone('profile-pdf');
    } catch (err) {
      setError(errMsg(err, 'Could not save your profile.'));
    } finally {
      setBusy(false);
    }
  }

  if (!studio.profile) return <Panel title="Review your profile"><Note>Import your profile first.</Note></Panel>;
  if (!draft) return <Panel title="Review your profile"><Spinner /><ErrorLine error={error} /></Panel>;

  return (
    <Panel title="Review and confirm your profile" lead="Check every section. Edit anything that is wrong, add what is missing, and remove what does not belong. Nothing is used for documents until you confirm.">
      {needsReview.length > 0 && (
        <div className="mb-5"><Note tone="warn">{needsReview.length} field{needsReview.length === 1 ? '' : 's'} could not be read confidently and {needsReview.length === 1 ? 'is' : 'are'} highlighted below. We would rather ask than guess.</Note></div>
      )}
      {studio.profile.importAdded?.length > 0 && (
        <div className="mb-5"><Note>Added from your latest file: {studio.profile.importAdded.slice(0, 8).join('; ')}{studio.profile.importAdded.length > 8 ? '…' : ''}</Note></div>
      )}
      <ProfileEditor value={draft} onChange={setDraft} needsReview={needsReview} />
      <div className="sticky bottom-0 -mx-5 mt-6 flex flex-wrap items-center gap-3 border-t border-line bg-white/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:px-7">
        <Button onClick={confirm} loading={busy}><CheckCircle2 className="h-4 w-4" aria-hidden /> Save and confirm profile</Button>
        {studio.profile.confirmedAt && <span className="text-caption text-slate-500">Last confirmed {new Date(studio.profile.confirmedAt).toLocaleString()}</span>}
      </div>
      <ErrorLine error={error} />
    </Panel>
  );
}

/* ------------------------------------------------------------------ *
 * Step 3 — Profile PDF
 * ------------------------------------------------------------------ */

export function ProfilePdfStep({ studio, onDone, goTo }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  useEffect(() => () => previewUrl && URL.revokeObjectURL(previewUrl), [previewUrl]);

  const name = (studio.profile?.name || 'Candidate').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
  async function run(kind) {
    setError('');
    setBusy(kind);
    try {
      if (kind === 'preview') setPreviewUrl(await studioService.profileDocument({ mode: 'preview' }));
      else {
        await studioService.profileDocument({ format: kind, filename: `${name}_LinkedIn_Profile.${kind}` });
        onDone();
      }
    } catch (err) {
      setError(errMsg(err, 'Could not generate your profile document.'));
    } finally {
      setBusy('');
    }
  }

  if (!studio.profile?.confirmedAt) {
    return <Panel title="Download your LinkedIn profile as PDF"><Note tone="warn">Confirm your profile on the review step first — the PDF only contains information you have confirmed.</Note><Button className="mt-4" variant="quiet" onClick={() => goTo('review')}>Go to review</Button></Panel>;
  }
  return (
    <Panel title="Download your LinkedIn profile as PDF" lead="A clean, multi-page profile document in LinkedIn’s section order, built from your confirmed information. It is a DutyLaunch document — not an official LinkedIn export, and it says so on every page.">
      <div className="flex flex-wrap items-center gap-3">
        <DocButtons busy={busy} onPreview={() => run('preview')} onDownload={run} />
        <Button variant="link" onClick={() => goTo('review')}>Edit profile</Button>
      </div>
      {previewUrl && <iframe title="Profile PDF preview" src={previewUrl} className="mt-5 h-[70vh] w-full rounded-lg border border-line" />}
      <ErrorLine error={error} />
    </Panel>
  );
}

/* ------------------------------------------------------------------ *
 * Step 4 — Generate resume
 * ------------------------------------------------------------------ */

export function ResumeStep({ studio, onDone, goTo }) {
  const { success } = useToast();
  const [form, setForm] = useState({ jobTitle: '', company: '', industry: '', level: 'mid', jobDescription: '', label: '' });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Target job description: written by AI from the confirmed LinkedIn
  // profile when the step opens; the user can edit it, rewrite it, or
  // replace it with a real posting.
  const [jdSource, setJdSource] = useState(''); // 'ai' | 'user' | ''
  const [jdBusy, setJdBusy] = useState(false);
  const [jdError, setJdError] = useState('');
  const autoFilled = useRef(false);
  const profileReady = Boolean(studio.profile?.confirmedAt);

  async function writeJobDescription() {
    setJdError('');
    setJdBusy(true);
    try {
      const res = await studioService.suggestJobDescription({
        jobTitle: form.jobTitle.trim(),
        company: form.company.trim(),
        industry: form.industry.trim(),
        experienceLevel: form.level,
      });
      setForm((f) => ({ ...f, jobTitle: f.jobTitle.trim() ? f.jobTitle : res.jobTitle || '', jobDescription: res.description }));
      setJdSource('ai');
    } catch (err) {
      setJdError(errMsg(err, 'The AI could not write a job description. Paste the job posting instead.'));
    } finally {
      setJdBusy(false);
    }
  }

  useEffect(() => {
    if (!profileReady || autoFilled.current || form.jobDescription.trim()) return;
    autoFilled.current = true;
    writeJobDescription();
    // Runs once when the step opens with a confirmed profile.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileReady]);

  const jdHint =
    jdSource === 'ai'
      ? 'Written by AI from your profile and the details above. For an exact Job Match score, paste the real job posting instead.'
      : 'Paste the full posting, or let AI write one from your profile. Without a description you still get a Resume Health score, but not a Job Match score.';

  async function generate() {
    setError('');
    if (!form.jobTitle.trim()) return setError('Add the target job title.');
    setBusy('create');
    try {
      const res = await careerService.createVersion({
        jobDescription: form.jobDescription.trim() || undefined,
        jobHints: { jobTitle: form.jobTitle.trim(), company: form.company.trim() || undefined, industry: form.industry.trim() || undefined, seniority: form.level },
        label: form.label.trim() || [form.jobTitle.trim(), form.company.trim()].filter(Boolean).join(' — '),
      });
      setCreated(res);
      success(res.note || 'Resume version created.');
      onDone();
    } catch (err) {
      setError(errMsg(err, 'Could not generate the resume.'));
    } finally {
      setBusy('');
    }
  }

  async function download(format) {
    setBusy(format);
    try {
      await studioService.resumeDocument(created.version._id, { format, filename: `${(created.version.label || 'Resume').replace(/[^\w-]+/g, '_')}.${format}` });
      onDone();
    } catch (err) {
      setError(errMsg(err, 'Download failed.'));
    } finally {
      setBusy('');
    }
  }

  if (!studio.profile?.confirmedAt) return <Panel title="Generate your professional resume"><Note tone="warn">Confirm your profile first.</Note><Button className="mt-4" variant="quiet" onClick={() => goTo('review')}>Go to review</Button></Panel>;

  return (
    <Panel title="Generate your professional resume" lead="A job-targeted version built from your confirmed profile. Your master profile is never changed — each job gets its own version.">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Target job title" required value={form.jobTitle} onChange={set('jobTitle')} placeholder="e.g. Frontend Developer" />
        <Input label="Target company (optional)" value={form.company} onChange={set('company')} />
        <Input label="Industry (optional)" value={form.industry} onChange={set('industry')} placeholder="e.g. Fintech" />
        <Select label="Experience level" value={form.level} onChange={set('level')}>
          {EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </Select>
      </div>
      <Textarea
        className="mt-4"
        label="Target job description"
        rows={9}
        value={form.jobDescription}
        onChange={(e) => {
          setForm((f) => ({ ...f, jobDescription: e.target.value }));
          setJdSource('user');
        }}
        disabled={jdBusy}
        placeholder={jdBusy ? 'Writing a job description from your profile…' : 'Paste the job posting here'}
        hint={jdHint}
      />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Button size="sm" variant="quiet" onClick={writeJobDescription} loading={jdBusy} disabled={jdBusy}>
          <Sparkles className="h-4 w-4" aria-hidden />
          {jdBusy ? 'Writing…' : form.jobDescription.trim() ? 'Rewrite with AI' : 'Write with AI'}
        </Button>
        {jdSource === 'ai' && !jdBusy && <Badge tone="azure">AI-written</Badge>}
      </div>
      <ErrorLine error={jdError} />
      <Input className="mt-4" label="Name this version (optional)" value={form.label} onChange={set('label')} placeholder="e.g. MERN Stack — Acme" />
      <Button className="mt-5" onClick={generate} loading={busy === 'create'} disabled={jdBusy}>Generate my resume</Button>
      <ErrorLine error={error} />

      {created && (
        <div className="mt-6 rounded-lg border border-line bg-paper p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-small font-bold text-ink">{created.version.label}</p>
              <p className="mt-1 text-caption text-slate-600">{created.note}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="azure">Resume Health {created.version.health?.score ?? '—'}</Badge>
                {created.version.match?.overall != null && <Badge tone="success">Job Match {created.version.match.overall}%</Badge>}
              </div>
            </div>
            <DocButtons busy={busy} onDownload={download} />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button size="sm" onClick={() => goTo('ats')}>Check ATS score & improve</Button>
            <Button as={Link} to="/my-resumes" size="sm" variant="quiet">Edit sections & template in My resumes</Button>
          </div>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ *
 * Step 5 — ATS analysis and improvement
 * ------------------------------------------------------------------ */

export function AtsStep({ onDone, refreshKey }) {
  const { success } = useToast();
  const versions = useVersions(refreshKey);
  const [versionId, setVersionId] = useState('');
  const [jd, setJd] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [before, setBefore] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [engineNote, setEngineNote] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (versions?.length && !versionId) setVersionId(versions[0].id);
  }, [versions, versionId]);
  const version = versions?.find((v) => v.id === versionId);
  useEffect(() => { setJd(version?.target?.jobDescription || ''); setAnalysis(null); setProposals([]); setBefore(null); }, [versionId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function analyse() {
    setError('');
    setBusy('analyse');
    try {
      setAnalysis(await careerService.analyze({ versionId, jobDescription: jd.trim() || undefined }));
      onDone();
    } catch (err) {
      setError(errMsg(err, 'Analysis failed.'));
    } finally {
      setBusy('');
    }
  }

  async function improve() {
    setError('');
    setBusy('optimize');
    try {
      const res = await careerService.optimize({ versionId, jobDescription: jd.trim() || undefined });
      setProposals(res.proposals || []);
      setEngineNote(res.engineNote || '');
      setDecisions({});
      if (!res.proposals?.length) success('No changes to suggest — your bullets already read well for this job.');
    } catch (err) {
      setError(errMsg(err, 'Could not generate improvements.'));
    } finally {
      setBusy('');
    }
  }

  const decisionList = useMemo(() => Object.entries(decisions).map(([id, d]) => ({ id, ...d })), [decisions]);

  async function apply() {
    setBusy('apply');
    try {
      const res = await careerService.applyOptimization({ versionId, jobDescription: jd.trim() || undefined, proposals, decisions: decisionList });
      setBefore({ health: analysis?.health?.score, match: analysis?.match?.overall });
      await careerService.updateVersion(versionId, { resume: res.resume });
      setAnalysis(await careerService.analyze({ versionId, jobDescription: jd.trim() || undefined }));
      setProposals([]);
      setDecisions({});
      success('Changes applied to this version and re-scored. Nothing you rejected was applied.');
      onDone();
    } catch (err) {
      setError(errMsg(err, 'Could not apply those changes.'));
    } finally {
      setBusy('');
    }
  }

  if (versions && !versions.length) return <Panel title="Check Resume Health and Job Match"><Note>Generate a resume first — the analysis runs on a saved version.</Note></Panel>;

  return (
    <Panel title="Check Resume Health and Job Match" lead="Scores come from DutyLaunch’s deterministic scoring engine — the same rules every time, never from an AI model. They estimate resume quality and fit with this job description; they are not scores from any employer’s ATS and do not guarantee an interview.">
      <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
        <VersionSelect versions={versions} value={versionId} onChange={setVersionId} allowMaster={false} />
        <Textarea label="Job description" rows={4} value={jd} onChange={(e) => setJd(e.target.value)} hint="Required for a Job Match score." />
      </div>
      <Button className="mt-4" onClick={analyse} loading={busy === 'analyse'} disabled={!versionId}>Run analysis</Button>
      <ErrorLine error={error} />

      {before && analysis && (
        <div className="mt-6"><Note tone="ok">
          <strong>Before → after (recalculated):</strong> Resume Health {before.health ?? '—'} → {analysis.health?.score ?? '—'}
          {before.match != null && <> · Job Match {before.match}% → {analysis.match?.overall ?? '—'}%</>}
        </Note></div>
      )}

      {analysis && (
        <div className="mt-6 space-y-8">
          <ResumeHealthReport health={analysis.health} />
          {analysis.match ? <JobMatchPanel match={analysis.match} disclaimer={analysis.match.disclaimer} /> : <Note>Add a job description to get a Job Match score.</Note>}
          {analysis.keywords && <KeywordTable keywordResult={analysis.keywords} />}
          <div>
            <h3 className="mb-3 text-h4 font-bold text-ink">Recommendations</h3>
            <RecommendationList recommendations={analysis.recommendations} />
          </div>
          <div className="rounded-lg border border-line bg-paper p-5">
            <h3 className="text-small font-bold text-ink">Improve my resume</h3>
            <p className="mt-1 text-caption text-slate-600">We suggest stronger wording for your existing lines. Each suggestion shows the original and why; nothing changes until you accept it. Your master profile is not touched.</p>
            <Button className="mt-3" onClick={improve} loading={busy === 'optimize'}>Suggest improvements</Button>
          </div>
          {proposals.length > 0 && (
            <div>
              <ProposalReview proposals={proposals} decisions={decisions} engineNote={engineNote} onDecide={(id, d) => setDecisions((p) => ({ ...p, [id]: d }))} />
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <Button onClick={apply} loading={busy === 'apply'} disabled={!decisionList.length}>Apply accepted changes and re-score</Button>
                <span className="text-small text-slate-600">{decisionList.length} of {proposals.length} reviewed</span>
              </div>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ *
 * Step 6 — Cover letter
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * The resume saved in the Resume Builder (career profile). Cover letter
 * and Interview prep are written ONLY from it — never from an older
 * uploaded resume version.
 * ------------------------------------------------------------------ */
function useSavedProfile(refreshKey) {
  const [profile, setProfile] = useState(null); // null = loading, false = none
  useEffect(() => {
    let active = true;
    careerService
      .getProfile()
      .then((res) => active && setProfile(res?.exists && res.master ? res.master : false))
      .catch(() => active && setProfile(false));
    return () => {
      active = false;
    };
  }, [refreshKey]);
  return profile;
}

/** Cover letter tone that suits an experience level. */
const TONE_FOR_LEVEL = { fresher: 'entry-level', entry: 'entry-level', mid: 'professional', senior: 'experienced', lead: 'experienced' };

/** Rough experience level from the saved resume's job dates (null = unknown). */
function guessExperienceLevel(profile) {
  const jobs = profile?.experience || [];
  if (!jobs.length) return 'fresher';
  const now = new Date().getFullYear();
  let months = 0;
  let dated = 0;
  jobs.forEach((j) => {
    const start = Number(String(j.startDate || '').match(/(19|20)\d{2}/)?.[0]);
    const endText = String(j.endDate || '');
    const end = j.current || /present|current|now/i.test(endText) ? now : Number(endText.match(/(19|20)\d{2}/)?.[0]);
    if (start && end && end >= start) {
      months += Math.max(6, (end - start) * 12);
      dated += 1;
    }
  });
  // Jobs without readable dates: we can't tell — let the AI judge instead.
  if (!dated) return null;
  const years = months / 12;
  if (years < 3) return 'entry';
  if (years < 8) return 'mid';
  return 'senior';
}

function SavedResumeSource({ profile, label = 'Using your saved resume' }) {
  if (profile === null) return <Spinner />;
  if (profile === false) {
    return (
      <div className="mb-5">
        <Note tone="warn">
          Build your resume first: open <strong>Resume builder</strong>, fill it in and tick “Save to my DutyLaunch account”. This is written from that saved resume.
        </Note>
      </div>
    );
  }
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper p-4">
      <div>
        <p className="text-caption font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="text-small font-bold text-ink">
          {profile.personal?.name || 'Your resume'}
          {profile.personal?.headline ? ` · ${profile.personal.headline}` : ''}
        </p>
        <p className="text-caption text-slate-600">
          {(profile.experience || []).length} job(s) · {(profile.education || []).length} education · {Object.values(profile.skills || {}).flat().length} skills
        </p>
      </div>
      <a href="/resume-builder/wizard" className="text-small font-semibold text-azure hover:underline">Edit in Resume Builder →</a>
    </div>
  );
}

export function CoverLetterStep({ onDone, refreshKey }) {
  const { success } = useToast();
  const profile = useSavedProfile(refreshKey);
  const [form, setForm] = useState({ versionId: '', jobTitle: '', company: '', jobDescription: '', tone: 'professional' });
  const [letter, setLetter] = useState(null);
  const [content, setContent] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [justFetched, setJustFetched] = useState(false);
  // Two sections: write/edit the letter, then choose its design and download.
  const [view, setView] = useState('write');
  const panelTop = useRef(null);
  const openView = (v) => {
    setView(v);
    panelTop.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const autoRanFor = useRef(null); // which versionId we already auto-generated for, so it only ever fires once
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Prepare everything from the saved resume, once:
  //   job title ← the profession on the resume
  //   tone      ← the experience on the resume (job dates)
  // …then let "Generate everything with AI" fill what is still missing and
  // write the job description and the letter.
  const prefilled = useRef(false);
  useEffect(() => {
    if (!profile || prefilled.current) return;
    prefilled.current = true;
    const headline = profile.personal?.headline?.trim();
    const level = guessExperienceLevel(profile);
    setForm((f) => ({ ...f, jobTitle: f.jobTitle || headline || '', tone: level ? TONE_FOR_LEVEL[level] : f.tone }));
    setJustFetched(true);
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (key, fn, msg) => {
    setError('');
    setBusy(key);
    try {
      const r = await fn();
      if (msg) success(msg);
      return r;
    } catch (err) {
      setError(errMsg(err, 'That did not work.'));
      return null;
    } finally {
      setBusy('');
    }
  };

  const canGenerate = Boolean(form.jobTitle.trim() || form.jobDescription.trim());

  const generate = () => act('create', async () => {
    const res = await studioService.createCoverLetter({ ...form, versionId: undefined, jobDescription: form.jobDescription.trim() || undefined });
    setLetter(res.coverLetter);
    setContent(res.coverLetter.content);
    // With only a job title, the AI wrote a typical job description from the
    // saved resume first — show it, so it can be checked or replaced.
    if (res.jobDescriptionSource === 'ai' && res.coverLetter.jobDescription) {
      setForm((f) => ({ ...f, jobDescription: res.coverLetter.jobDescription }));
      setNote('No job description was given, so AI wrote a typical one for this role from your saved resume. Paste the real job posting above and generate again for a closer match.');
    } else {
      setNote(res.engineNote || '');
    }
    onDone();
  }, 'Cover letter drafted.');

  // "Generate everything with AI": job title from the resume (or chosen by
  // AI when the resume has none), tone from the resume's experience (or the
  // level the AI reads from the resume), a job description written by AI
  // from the whole resume — then the letter.
  const [aiPhase, setAiPhase] = useState('');
  const generateEverything = () => act('ai-all', async () => {
    try {
      setAiPhase('Reading your resume and writing the job description…');
      const titleFromResume = form.jobTitle.trim() || profile?.personal?.headline?.trim() || '';
      const jd = await studioService.suggestJobDescription({ jobTitle: titleFromResume || undefined, company: form.company.trim() || undefined });
      const levelFromResume = guessExperienceLevel(profile);
      const next = {
        ...form,
        jobTitle: titleFromResume || jd.jobTitle || '',
        tone: levelFromResume ? TONE_FOR_LEVEL[levelFromResume] : TONE_FOR_LEVEL[jd.experienceLevel] || form.tone,
        jobDescription: jd.description || form.jobDescription,
      };
      setForm(next);
      setAiPhase('Writing your cover letter…');
      const res = await studioService.createCoverLetter({ ...next, versionId: undefined });
      setLetter(res.coverLetter);
      setContent(res.coverLetter.content);
      setNote(
        res.engineNote ||
          `Prepared from your saved resume: the job title${titleFromResume ? ' and tone come from your resume' : ' and tone were chosen by AI from your resume'}, and AI wrote the job description from your whole resume. Change anything — or paste a real job posting — and click “Generate a new letter”.`
      );
      onDone();
    } finally {
      setAiPhase('');
    }
  }, 'Cover letter drafted.');

  // On first open, prepare everything straight away — at most once, and
  // never over a letter the person is already editing.
  useEffect(() => {
    if (!justFetched || letter || busy || autoRanFor.current === 'profile') return;
    autoRanFor.current = 'profile';
    setJustFetched(false);
    generateEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justFetched, letter, busy]);

  const save = () => act('save', async () => { setLetter(await studioService.updateCoverLetter(letter._id, { content })); }, 'Cover letter saved.');
  const regen = (i) => act(`p${i}`, async () => {
    if (content !== letter.content) setLetter(await studioService.updateCoverLetter(letter._id, { content }));
    const updated = await studioService.regenerateParagraph(letter._id, i, form.tone);
    setLetter(updated);
    setContent(updated.content);
  }, 'Paragraph rewritten.');
  const duplicate = () => act('dup', async () => { const c = await studioService.duplicateCoverLetter(letter._id); setLetter(c); setContent(c.content); onDone(); }, 'Saved as a new version.');
  const download = (format) => act(format, async () => {
    if (content !== letter.content) setLetter(await studioService.updateCoverLetter(letter._id, { content }));
    await studioService.coverLetterDocument(letter._id, { format, filename: `Cover_Letter_${(letter.company || 'Application').replace(/[^\w-]+/g, '_')}.${format}` });
    onDone();
  });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      success('Copied to clipboard.');
    } catch {
      setError('Your browser blocked clipboard access — select the text and copy it instead.');
    }
  };

  const paragraphs = content.split(/\n{2,}/);

  return (
    <Panel
      title={view === 'design' ? 'Choose a design' : 'Generate your cover letter'}
      lead={view === 'design' ? 'Your letter is already filled in. Pick a template, then download it as a PDF.' : 'Tailored to one job, using only your verified experience. It never invents facts about the company or you.'}
    >
      <div ref={panelTop} role="tablist" aria-label="Cover letter sections" className="-mt-1 mb-6 grid gap-2 sm:grid-cols-2">
        {[
          { id: 'write', label: 'Write & edit', note: 'Job details and your letter' },
          { id: 'design', label: 'Choose design & download', note: letter ? '12 templates · PDF' : 'Generate a letter first' },
        ].map((t, i) => {
          const on = view === t.id;
          const locked = t.id === 'design' && !letter;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              disabled={locked}
              onClick={() => openView(t.id)}
              className={cn(
                'flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-colors',
                on ? 'border-azure bg-azure-50' : 'border-line bg-white hover:border-azure-300',
                locked && 'cursor-not-allowed opacity-50 hover:border-line'
              )}
            >
              <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-full text-small font-bold', on ? 'bg-azure text-white' : 'bg-paper text-slate-600')}>{i + 1}</span>
              <span>
                <span className="block text-small font-bold text-ink">{t.label}</span>
                <span className="block text-caption text-slate-500">{t.note}</span>
              </span>
            </button>
          );
        })}
      </div>

      {view === 'write' && (
      <>
      <SavedResumeSource profile={profile} label="Writing from your saved resume" />
      {profile && (
        <div className="mb-5 rounded-xl border border-azure-200 bg-gradient-to-br from-azure-50 to-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-xl">
              <p className="flex items-center gap-1.5 text-small font-bold text-ink">
                <Sparkles className="h-4 w-4 text-azure" aria-hidden /> Generate everything with AI
              </p>
              <p className="mt-1 text-caption text-slate-600">
                Job title and tone come from your saved resume (AI fills them if missing), AI writes the job description from your whole resume — then your letter.
              </p>
            </div>
            <Button onClick={generateEverything} loading={busy === 'ai-all'} disabled={Boolean(busy)}>
              <Sparkles className="h-4 w-4" aria-hidden /> Generate everything with AI
            </Button>
          </div>
          {aiPhase && (
            <p className="mt-3 text-caption font-semibold text-azure-700" aria-live="polite">
              {aiPhase}
            </p>
          )}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Tone" value={form.tone} onChange={set('tone')}>{COVER_LETTER_TONES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</Select>
        <Input label="Job title" value={form.jobTitle} onChange={set('jobTitle')} />
        <Input label="Company name" value={form.company} onChange={set('company')} />
      </div>
      <Textarea
        className="mt-4"
        label="Job description (optional)"
        rows={5}
        value={form.jobDescription}
        onChange={set('jobDescription')}
        hint="Paste the job posting for the best match. Leave it empty and AI writes a typical one for this job title from your resume."
      />
      {busy === 'create' && !letter ? (
        <Note tone="info">We found the job details from your resume and are writing your letter now — no need to click anything.</Note>
      ) : (
        <>
          <Button className="mt-4" onClick={generate} loading={busy === 'create'} disabled={!canGenerate || !profile}>
            {letter ? 'Generate a new letter' : 'Generate cover letter'}
          </Button>
          {!canGenerate && <p className="mt-2 text-caption text-slate-500">Add the job title you are applying for (or paste the job description) first.</p>}
        </>
      )}
      <ErrorLine error={error} />

      {letter && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            {note && <div className="mb-3"><Note tone="warn">{note}</Note></div>}
            <Textarea label="Your letter (editable)" rows={18} value={content} onChange={(e) => setContent(e.target.value)} />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={save} loading={busy === 'save'} disabled={content === letter.content}><Save className="h-4 w-4" aria-hidden /> Save</Button>
              <Button size="sm" variant="quiet" onClick={copy}><Copy className="h-4 w-4" aria-hidden /> Copy</Button>
              <Button size="sm" variant="quiet" onClick={duplicate} loading={busy === 'dup'}>Save as new version</Button>
              <DocButtons busy={busy} onDownload={download} />
            </div>
          </div>
          <div>
            <p className="text-small font-bold text-ink">Rewrite one paragraph</p>
            <p className="text-caption text-slate-500">The rest of the letter stays exactly as it is.</p>
            <ul className="mt-3 space-y-3">
              {paragraphs.map((p, i) => (
                <li key={i} className="rounded-md border border-line p-3 text-small text-slate-700">
                  <p className="line-clamp-3">{p}</p>
                  <Button size="sm" variant="link" className="mt-1" onClick={() => regen(i)} loading={busy === `p${i}`}><RefreshCw className="h-3.5 w-3.5" aria-hidden /> Rewrite</Button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {letter && (
        <div className="mt-8 flex justify-end border-t border-line pt-5">
          <Button size="lg" onClick={() => openView('design')}>Next: Choose a design →</Button>
        </div>
      )}
      </>
      )}

      {view === 'design' && letter && (
        <>
          <CoverLetterDesigner content={content} company={form.company || letter.company} jobTitle={form.jobTitle || letter.jobTitle} />
          <div className="mt-6 border-t border-line pt-5">
            <Button variant="outline" onClick={() => openView('write')}>← Back to editing</Button>
          </div>
        </>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ *
 * Step 7 — Top 10 interview Q&A
 * ------------------------------------------------------------------ */

export function InterviewStep({ onDone, refreshKey, existingSetId }) {
  const { success } = useToast();
  // Questions and answers come ONLY from the resume saved in the Resume Builder.
  const profile = useSavedProfile(refreshKey);
  const [form, setForm] = useState({ versionId: '', jobTitle: '', company: '', jobDescription: '', experienceLevel: 'mid' });
  const [readyToAuto, setReadyToAuto] = useState(false);
  const autoRan = useRef(false);
  const [set, setSet] = useState(null);
  const [open, setOpen] = useState({});
  const [edits, setEdits] = useState({});
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notes, setNotes] = useState({});
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Fill the job title (profession) and experience level from the saved
  // resume, then build the top 10 straight away — once.
  // Only the first time the saved resume arrives — it is fetched again after
  // each generation, and must not overwrite what the AI or the user chose.
  const prefilled = useRef(false);
  useEffect(() => {
    if (!profile || prefilled.current) return;
    prefilled.current = true;
    const headline = profile.personal?.headline?.trim();
    setForm((f) => ({ ...f, jobTitle: f.jobTitle || headline || '', experienceLevel: guessExperienceLevel(profile) || f.experienceLevel }));
    if (!existingSetId) setReadyToAuto(true);
  }, [profile]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (existingSetId && !set) studioService.getInterviewSet(existingSetId).then(setSet).catch(() => {});
  }, [existingSetId]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (key, fn, msg) => {
    setError('');
    setBusy(key);
    try {
      await fn();
      if (msg) success(msg);
    } catch (err) {
      setError(errMsg(err, 'That did not work.'));
    } finally {
      setBusy('');
    }
  };

  const applySet = (res, aiNote = '') => {
    setSet(res.set);
    setEdits({});
    // With only a job title, the AI wrote a typical job description from the
    // saved resume first — show it, so it can be checked or replaced.
    if (res.jobDescriptionSource === 'ai' && res.set?.jobDescription) {
      setForm((f) => ({ ...f, jobDescription: res.set.jobDescription }));
    }
    setNotes({
      note: res.note,
      engine: res.engineNote,
      jd: aiNote || (res.jobDescriptionSource === 'ai' ? 'No job description was given, so AI wrote a typical one for this role from your saved resume. Paste the real job posting above and generate again for questions closer to that job.' : ''),
    });
    onDone();
  };

  const generate = () => act('create', async () => {
    applySet(await studioService.createInterviewSet({ ...form, versionId: undefined, jobDescription: form.jobDescription.trim() || undefined }));
  }, 'Your top 10 questions are ready.');

  // "Generate everything with AI": the AI reads the saved resume and picks
  // the job role, the experience level and a job description, fills them in,
  // then builds the ten questions from all of it.
  const [aiPhase, setAiPhase] = useState('');
  const generateEverything = () => act('ai-all', async () => {
    try {
      setAiPhase('Reading your resume and choosing the job role, level and description…');
      const jd = await studioService.suggestJobDescription({ company: form.company.trim() || undefined });
      const next = {
        ...form,
        versionId: undefined,
        jobTitle: jd.jobTitle || form.jobTitle,
        experienceLevel: jd.experienceLevel || form.experienceLevel,
        jobDescription: jd.description || form.jobDescription,
      };
      setForm((f) => ({ ...f, jobTitle: next.jobTitle, experienceLevel: next.experienceLevel, jobDescription: next.jobDescription }));
      setAiPhase('Writing your ten questions and sample answers…');
      applySet(
        await studioService.createInterviewSet(next),
        'The job role, experience level and job description were chosen by AI from your saved resume. Change any of them (or paste a real job posting) and click “Generate a new set” to tailor the questions.'
      );
    } finally {
      setAiPhase('');
    }
  }, 'Your top 10 questions are ready.');

  useEffect(() => {
    if (!readyToAuto || autoRan.current || set || busy) return;
    autoRan.current = true;
    generateEverything();
  }, [readyToAuto]); // eslint-disable-line react-hooks/exhaustive-deps
  const saveEdits = () => act('save', async () => {
    const questions = Object.entries(edits).map(([number, sampleAnswer]) => ({ number: Number(number), sampleAnswer }));
    setSet(await studioService.updateInterviewSet(set._id, { questions }));
    setEdits({});
  }, 'Question set saved.');
  const regen = (n) => act(`r${n}`, async () => setSet(await studioService.regenerateQuestion(set._id, n)), `Question ${n} regenerated.`);
  const download = () => act('pdf', async () => {
    if (Object.keys(edits).length) setSet(await studioService.updateInterviewSet(set._id, { questions: Object.entries(edits).map(([number, sampleAnswer]) => ({ number: Number(number), sampleAnswer })) }));
    await studioService.interviewDocument(set._id, { format: 'pdf', filename: `Interview_Preparation_${(set.jobTitle || 'Role').replace(/[^\w-]+/g, '_')}.pdf` });
    onDone();
  });

  const allOpen = set && set.questions.every((q) => open[q.number]);

  return (
    <Panel title="Your top 10 interview questions & answers" lead="Ten practice questions built from your profile, resume and the job — with personalised sample answers. They are not real or leaked questions from any employer.">
      <SavedResumeSource profile={profile} label="Questions built from your saved resume" />
      {profile && (
        <div className="mb-5 rounded-xl border border-azure-200 bg-gradient-to-br from-azure-50 to-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="max-w-xl">
              <p className="flex items-center gap-1.5 text-small font-bold text-ink">
                <Sparkles className="h-4 w-4 text-azure" aria-hidden /> Generate everything with AI
              </p>
              <p className="mt-1 text-caption text-slate-600">
                AI reads your saved resume, picks the job role, your experience level and a job description, fills them in below — then builds your ten questions and answers.
              </p>
            </div>
            <Button onClick={generateEverything} loading={busy === 'ai-all'} disabled={Boolean(busy)}>
              <Sparkles className="h-4 w-4" aria-hidden /> Generate everything with AI
            </Button>
          </div>
          {aiPhase && (
            <p className="mt-3 text-caption font-semibold text-azure-700" aria-live="polite">
              {aiPhase}
            </p>
          )}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Experience level" value={form.experienceLevel} onChange={upd('experienceLevel')}>{EXPERIENCE_LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}</Select>
        <Input label="Job title" value={form.jobTitle} onChange={upd('jobTitle')} />
        <Input label="Company (optional)" value={form.company} onChange={upd('company')} />
      </div>
      <Textarea
        className="mt-4"
        label="Job description (optional)"
        rows={4}
        value={form.jobDescription}
        onChange={upd('jobDescription')}
        hint="Paste the job posting for questions closest to that job. Leave it empty and AI writes a typical one for this job title from your resume."
      />
      <Button className="mt-4" variant={set ? 'primary' : 'outline'} onClick={generate} loading={busy === 'create'} disabled={!profile || Boolean(busy) || (!form.jobTitle.trim() && !form.jobDescription.trim())}>{set ? 'Generate a new set' : 'Generate with these details'}</Button>
      {notes.jd && <div className="mt-3"><Note tone="info">{notes.jd}</Note></div>}
      {busy === 'create' && <p className="mt-2 text-caption text-slate-500">Tailoring ten questions to your experience can take up to a minute.</p>}
      <ErrorLine error={error} />

      {set && (
        <div className="mt-6">
          {notes.engine && <div className="mb-3"><Note tone="warn">{notes.engine}</Note></div>}
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="quiet" onClick={() => setOpen(allOpen ? {} : Object.fromEntries(set.questions.map((q) => [q.number, true])))}>{allOpen ? 'Collapse all' : 'Expand all answers'}</Button>
            <Button size="sm" onClick={saveEdits} loading={busy === 'save'} disabled={!Object.keys(edits).length}><Save className="h-4 w-4" aria-hidden /> Save question set</Button>
            <Button size="sm" variant="outline" onClick={download} loading={busy === 'pdf'}><FileDown className="h-4 w-4" aria-hidden /> Interview prep PDF</Button>
            <Button as={Link} to={`/mock-interview?set=${set._id}`} size="sm" variant="secondary"><PlayCircle className="h-4 w-4" aria-hidden /> Start mock interview</Button>
          </div>
          <ol className="space-y-3">
            {set.questions.map((q) => (
              <li key={q.number} className="rounded-lg border border-line">
                <button type="button" className="flex w-full items-start gap-3 p-4 text-left" aria-expanded={Boolean(open[q.number])} onClick={() => setOpen((o) => ({ ...o, [q.number]: !o[q.number] }))}>
                  <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-azure-50 text-caption font-bold text-azure">{q.number}</span>
                  <span className="flex-1">
                    <span className="block text-small font-semibold text-ink">{q.question}</span>
                    <span className="mt-1 flex flex-wrap gap-1.5"><Badge tone="outline">{q.category}</Badge><Badge tone="neutral">{q.difficulty}</Badge>{q.edited && <Badge tone="success">edited</Badge>}</span>
                  </span>
                  {open[q.number] ? <ChevronUp className="h-5 w-5 text-slate-400" aria-hidden /> : <ChevronDown className="h-5 w-5 text-slate-400" aria-hidden />}
                </button>
                {open[q.number] && (
                  <div className="space-y-3 border-t border-line px-4 pb-4 pt-3 text-small text-slate-700">
                    {q.whyRelevant && <p><strong className="text-ink">Why it is asked: </strong>{q.whyRelevant}</p>}
                    {q.interviewerExpects && <p><strong className="text-ink">What the interviewer expects: </strong>{q.interviewerExpects}</p>}
                    <Textarea label="Sample answer (edit to make it yours)" rows={6} value={edits[q.number] ?? q.sampleAnswer ?? ''} onChange={(e) => setEdits((x) => ({ ...x, [q.number]: e.target.value }))} />
                    {q.placeholders?.length > 0 && <Note tone="warn">Replace or confirm before using: {q.placeholders.join('; ')}</Note>}
                    {q.keyPoints?.length > 0 && <div><strong className="text-ink">Points to remember</strong><ul className="mt-1 list-disc pl-5">{q.keyPoints.map((k) => <li key={k}>{k}</li>)}</ul></div>}
                    {q.followUp && <p><strong className="text-ink">Possible follow-up: </strong>{q.followUp}</p>}
                    <Button size="sm" variant="link" onClick={() => regen(q.number)} loading={busy === `r${q.number}`}><RefreshCw className="h-3.5 w-3.5" aria-hidden /> Regenerate this question</Button>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}
    </Panel>
  );
}

/* ------------------------------------------------------------------ *
 * Step 8 — Documents
 * ------------------------------------------------------------------ */

export function DocumentsStep({ studio, onDone }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const d = studio.documents;
  const run = async (key, fn) => {
    setError('');
    setBusy(key);
    try {
      await fn();
      onDone();
    } catch (err) {
      setError(errMsg(err, 'Download failed.'));
    } finally {
      setBusy('');
    }
  };
  const Row = ({ icon: Icon = FileText, title, meta, children }) => (
    <li className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="h-5 w-5 flex-none text-azure" aria-hidden />
        <div className="min-w-0"><p className="truncate text-small font-semibold text-ink">{title}</p>{meta && <p className="text-caption text-slate-500">{meta}</p>}</div>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </li>
  );
  const date = (v) => (v ? new Date(v).toLocaleDateString() : '');

  return (
    <Panel title="Your career documents" lead="Everything you have created, saved to your account.">
      <ul>
        {studio.profile?.confirmedAt && (
          <Row title="LinkedIn profile PDF" meta="From your confirmed profile">
            <Button size="sm" variant="outline" loading={busy === 'profile'} onClick={() => run('profile', () => studioService.profileDocument({ format: 'pdf', filename: 'LinkedIn_Profile.pdf' }))}>PDF</Button>
          </Row>
        )}
        {d.resumes.map((v) => (
          <Row key={v.id} title={v.label} meta={`Resume · Health ${v.health ?? '—'}${v.match != null ? ` · Match ${v.match}%` : ''} · ${date(v.updatedAt)}`}>
            {['pdf', 'docx'].map((f) => <Button key={f} size="sm" variant="quiet" loading={busy === `${v.id}${f}`} onClick={() => run(`${v.id}${f}`, () => studioService.resumeDocument(v.id, { format: f, filename: `${v.label.replace(/[^\w-]+/g, '_')}.${f}` }))}>{f.toUpperCase()}</Button>)}
          </Row>
        ))}
        {d.coverLetters.map((l) => (
          <Row key={l.id} title={l.title || 'Cover letter'} meta={`Cover letter · ${l.tone} · ${date(l.updatedAt)}`}>
            {['pdf', 'docx'].map((f) => <Button key={f} size="sm" variant="quiet" loading={busy === `${l.id}${f}`} onClick={() => run(`${l.id}${f}`, () => studioService.coverLetterDocument(l.id, { format: f, filename: `Cover_Letter.${f}` }))}>{f.toUpperCase()}</Button>)}
          </Row>
        ))}
        {d.interviewSets.map((s) => (
          <Row key={s.id} title={s.title} meta={`${s.questionCount} questions · ${date(s.updatedAt)}`}>
            <Button size="sm" variant="quiet" loading={busy === s.id} onClick={() => run(s.id, () => studioService.interviewDocument(s.id, { format: 'pdf', filename: 'Interview_Preparation.pdf' }))}>PDF</Button>
            <Button as={Link} to={`/mock-interview?set=${s.id}`} size="sm" variant="link">Practise</Button>
          </Row>
        ))}
        {d.mockInterviews.filter((m) => m.status === 'completed').map((m) => (
          <Row key={m.id} title={m.title} meta={`Mock interview · practice score ${m.score ?? '—'} · ${date(m.completedAt)}`}>
            <Button as={Link} to={`/mock-interview?session=${m.id}`} size="sm" variant="link">View report</Button>
          </Row>
        ))}
      </ul>
      {!d.resumes.length && !d.coverLetters.length && !d.interviewSets.length && !studio.profile?.confirmedAt && <Note>Nothing yet — complete the steps above and your documents will appear here.</Note>}
      <ErrorLine error={error} />
    </Panel>
  );
}

export { ScoreDial };