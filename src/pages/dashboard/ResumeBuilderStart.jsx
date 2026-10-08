import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FileUp, PencilLine, Upload, UserRound, Check } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { ConsentCheckbox } from '../../components/ui/ConsentCheckbox.jsx';
import { careerService } from '../../services/careerService.js';
import { BUILDER_IMPORT_KEY } from '../../utils/resumeToBuilder.js';
import { cn } from '../../utils/cn.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { draftKey } from '../ResumeWizard.jsx';

const CHOICES = [
  {
    id: 'upload',
    icon: FileUp,
    title: 'Yes, upload from my resume',
    body: 'We read your existing resume and fill in the builder for you. Just review, edit and update it.',
    badge: 'Recommended to save you time',
  },
  {
    id: 'scratch',
    icon: PencilLine,
    title: 'No, start from scratch',
    body: 'We guide you step by step — contact details, work history, education, skills and summary — with ready-made examples to pick from.',
  },
];

/**
 * Resume Builder start (signed-in candidates only).
 *   Upload  → read the resume file → open the builder filled in.
 *   Scratch → open the builder empty; the candidate types every section.
 * Free templates can be used straight away; paid ones unlock after payment
 * inside the builder.
 */
export default function ResumeBuilderStart() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initial = params.get('start') === 'upload' ? 'upload' : params.get('start') === 'scratch' ? 'scratch' : 'upload';
  const [choice, setChoice] = useState(initial);
  const [stage, setStage] = useState('choose'); // 'choose' | 'upload'
  const [file, setFile] = useState(null);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [savedProfile, setSavedProfile] = useState(null);

  // Offer the profile already saved in AI Career Studio, if there is one.
  useEffect(() => {
    let active = true;
    careerService
      .getProfile()
      .then((res) => {
        if (active && res?.exists && res.master?.personal?.name) setSavedProfile(res.master);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const template = params.get('template') || 'dl-elite';
  const { user } = useAuth();
  // The guided wizard: step 2 (fill in), 3 (template) and 4 (download).
  const openEditor = (start) =>
    navigate(`/resume-builder/wizard?start=${start}${start === 'scratch' ? '&fresh=1' : ''}&template=${encodeURIComponent(template)}`);

  const [draft, setDraft] = useState(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey(user?.id || user?._id));
      const d = raw ? JSON.parse(raw) : null;
      if (d?.personal?.firstName) setDraft(d);
    } catch {
      /* ignore */
    }
  }, [user]);

  function handOff(resume) {
    try {
      sessionStorage.setItem(BUILDER_IMPORT_KEY, JSON.stringify(resume));
    } catch {
      /* storage unavailable — the builder simply opens empty */
    }
    openEditor('upload');
  }

  function next() {
    setError('');
    if (choice === 'scratch') return openEditor('scratch');
    return setStage('upload');
  }

  async function readFile() {
    setError('');
    if (!file) return setError('Choose your resume file first.');
    if (!consent) return setError('Please tick the consent box to continue.');
    setBusy('upload');
    try {
      const res = await careerService.parseFile(file, null, { consent, purpose: 'builder' });
      const resume = res?.resume || res;
      if (!resume?.personal && !resume?.experience) throw new Error('We could not read that file. Try a text-based PDF or DOCX.');
      handOff(resume);
    } catch (err) {
      setError(err?.message || 'We could not read that file. Try a text-based PDF or DOCX, or start from scratch.');
    } finally {
      setBusy('');
    }
  }

  return (
    <>
      <PanelHeader
        title="Resume Builder"
        description="Create a professional, ATS-friendly resume. Free templates are included; paid templates unlock after a one-time payment."
      />

      {stage === 'choose' && draft && (
        <div className="mb-5 flex flex-col gap-3 rounded-lg border border-azure-200 bg-azure-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-small text-ink">
            <strong>Continue where you left off</strong> — your resume for {[draft.personal.firstName, draft.personal.surname].filter(Boolean).join(' ')} is saved in this browser.
          </p>
          <Button size="sm" onClick={() => navigate('/resume-builder/wizard')}>
            Continue my resume
          </Button>
        </div>
      )}

      {stage === 'choose' && (
        <div className="rounded-lg border border-line bg-white p-6 sm:p-8">
          <div className="text-center">
            <h2 className="text-h2 font-extrabold text-ink">Are you uploading an existing resume?</h2>
            <p className="mt-2 text-body text-slate-600">Just review, edit and update it with new information.</p>
          </div>

          <div role="radiogroup" aria-label="How do you want to start?" className="mt-8 grid gap-5 md:grid-cols-2">
            {CHOICES.map(({ id, icon: Icon, title, body, badge }) => {
              const selected = choice === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setChoice(id)}
                  onDoubleClick={() => {
                    setChoice(id);
                    if (id === 'scratch') openEditor('scratch');
                    else setStage('upload');
                  }}
                  className={cn(
                    'relative flex flex-col items-center rounded-xl border-2 bg-white px-6 pb-8 pt-10 text-center transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure',
                    selected ? 'border-azure shadow-crystal' : 'border-line hover:border-azure-300'
                  )}
                >
                  {badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-rose-100 px-3 py-1 text-caption font-bold uppercase tracking-wide text-rose-800">
                      {badge}
                    </span>
                  )}
                  {selected && (
                    <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-azure text-white" aria-hidden>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <span className={cn('grid h-14 w-14 place-items-center rounded-2xl', selected ? 'bg-azure-50 text-azure' : 'bg-paper text-slate-600')}>
                    <Icon className="h-7 w-7" aria-hidden />
                  </span>
                  <span className="mt-4 text-h3 font-bold text-ink">{title}</span>
                  <span className="mt-2 max-w-sm text-small text-slate-600">{body}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Button size="lg" onClick={next}>
              Next
            </Button>
          </div>
        </div>
      )}

      {stage === 'upload' && (
        <div className="rounded-lg border border-line bg-white p-6 sm:p-8">
          <h2 className="text-h3 font-bold text-ink">Upload your resume</h2>
          <p className="mt-1 text-small text-slate-600">PDF or DOCX, text-based (not a scanned image), up to 5 MB. We fill in the builder — you review and edit everything.</p>

          <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-paper px-4 py-10 text-center hover:border-azure-300">
            <Upload className="h-7 w-7 text-azure" aria-hidden />
            <span className="mt-2 text-small font-semibold text-ink">{file ? file.name : 'Choose your resume file'}</span>
            <span className="text-caption text-slate-500">PDF or DOCX · max 5 MB</span>
            <input type="file" accept=".pdf,.docx,.doc,.txt" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>

          <div className="mt-4">
            <ConsentCheckbox checked={consent} onChange={(e) => setConsent(e.target.checked)} />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button onClick={readFile} loading={busy === 'upload'}>
              Continue to builder
            </Button>
            <Button variant="quiet" onClick={() => setStage('choose')}>
              Back
            </Button>
          </div>

          {savedProfile && (
            <div className="mt-6 flex flex-col gap-3 rounded-lg bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-azure" aria-hidden />
                <p className="text-small text-slate-700">
                  Or use the profile you already saved in <strong>AI Career Studio</strong>
                  {savedProfile.personal?.name ? ` (${savedProfile.personal.name})` : ''}.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => handOff(savedProfile)}>
                Use my saved profile
              </Button>
            </div>
          )}

          {error && (
            <p role="alert" className="mt-4 text-small font-medium text-danger">
              {error}
            </p>
          )}
        </div>
      )}
    </>
  );
}
