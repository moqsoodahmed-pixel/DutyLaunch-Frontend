import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mic, MicOff, Send, Flag, FileDown, Trash2, PlayCircle, CheckCircle2 } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { Button, Seo, Select, Textarea, Badge, LoadingBlock, EmptyState } from '../../components/ui/index.js';
import { Panel } from '../../components/studio/StudioSteps.jsx';
import { studioService, INTERVIEW_TYPES, errMsg } from '../../services/studioService.js';
import { careerService } from '../../services/careerService.js';
import { useToast } from '../../context/ToastContext.jsx';

/**
 * Phase 2 — interactive mock interview, built on the candidate's profile,
 * resume and (optionally) their saved Top-10 question set.
 *
 * Voice input uses the browser's own speech recognition when it exists.
 * When it does not, no microphone button is rendered at all. Feedback is
 * AI practice feedback on the written answer only — no voice, video or
 * body-language analysis is performed or claimed.
 */

const SpeechRecognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

function useDictation(onText) {
  const recRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  useEffect(() => () => recRef.current?.abort?.(), []);
  if (!SpeechRecognition) return { supported: false };
  const toggle = () => {
    setVoiceError('');
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = 'en-IN';
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      const text = Array.from(e.results).slice(e.resultIndex).map((r) => r[0].transcript).join(' ');
      onText(text);
    };
    rec.onerror = (e) => setVoiceError(e.error === 'not-allowed' ? 'Microphone permission was denied. You can type your answer instead.' : 'Voice input stopped. You can keep typing.');
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };
  return { supported: true, listening, toggle, voiceError };
}

function Score({ value, label }) {
  if (typeof value !== 'number') return null;
  return (
    <div className="rounded-md bg-paper px-3 py-2 text-center">
      <p className="text-h4 font-extrabold tabular-nums text-ink">{value}</p>
      <p className="text-caption text-slate-500">{label}</p>
    </div>
  );
}

function Feedback({ f }) {
  return (
    <div className="space-y-3 text-small text-slate-700">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="azure">Practice score {f.score ?? '—'}/100</Badge>
        <span className="text-caption text-slate-500">AI practice assessment of your written answer — not an employer evaluation.</span>
      </div>
      {f.scores && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
          {Object.entries({ relevance: 'Relevance', completeness: 'Complete', clarity: 'Clarity', structure: 'Structure', examples: 'Examples', technicalAccuracy: 'Technical', problemSolving: 'Problem solving' }).map(([k, l]) => <Score key={k} value={f.scores[k]} label={l} />)}
        </div>
      )}
      {f.summary && <p>{f.summary}</p>}
      {f.strengths?.length > 0 && <div><strong className="text-ink">What worked</strong><ul className="mt-1 list-disc pl-5">{f.strengths.map((s) => <li key={s}>{s}</li>)}</ul></div>}
      {f.missingPoints?.length > 0 && <div><strong className="text-ink">Missing</strong><ul className="mt-1 list-disc pl-5">{f.missingPoints.map((s) => <li key={s}>{s}</li>)}</ul></div>}
      {f.suggestions?.length > 0 && <div><strong className="text-ink">How to improve</strong><ul className="mt-1 list-disc pl-5">{f.suggestions.map((s) => <li key={s}>{s}</li>)}</ul></div>}
      {f.star && Object.values(f.star).some(Boolean) && (
        <div className="grid gap-2 sm:grid-cols-4">
          {['situation', 'task', 'action', 'result'].map((k) => (
            <div key={k} className="rounded-md border border-line p-2.5"><p className="text-caption font-bold uppercase text-slate-500">{k}</p><p className="mt-1 text-caption">{f.star[k] || <em className="text-danger">Missing</em>}</p></div>
          ))}
        </div>
      )}
      {f.modelAnswer && <div className="rounded-md bg-azure-50 p-3"><strong className="text-ink">Model answer</strong><p className="mt-1 whitespace-pre-line">{f.modelAnswer}</p></div>}
      {f.conceptsToReview?.length > 0 && <p><strong className="text-ink">Concepts to review: </strong>{f.conceptsToReview.join(', ')}</p>}
    </div>
  );
}

export default function MockInterview() {
  const { success } = useToast();
  const [params, setParams] = useSearchParams();
  const [studio, setStudio] = useState(null);
  const [session, setSession] = useState(null);
  const [setup, setSetup] = useState({ sourceSetId: params.get('set') || '', interviewType: 'mixed', difficulty: 'medium', questionCount: 5, jobTitle: '', company: '', jobDescription: '' });
  const [answer, setAnswer] = useState('');
  const [lastFeedback, setLastFeedback] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const dictation = useDictation((t) => setAnswer((a) => `${a}${a && !a.endsWith(' ') ? ' ' : ''}${t}`));
  const usedVoice = useRef(false);

  const loadStudio = useCallback(() => studioService.get().then(setStudio).catch((e) => setError(errMsg(e, 'Could not load your data.'))), []);
  useEffect(() => { loadStudio(); }, [loadStudio]);

  // Fill in the job title, company AND job description from the saved
  // resume, the same way Cover Letter and the Top-10 Interview Q&A already
  // pull from it — so questions are built from the actual job a resume was
  // tailored for, not just a bare job title.
  //
  // studio.documents.resumes (from studioService.get(), already loaded
  // above) only carries target.jobTitle/company — jobDescription is left
  // out of that summary on purpose, since it can run to thousands of
  // characters and that endpoint loads on every dashboard visit. The full
  // text lives on each resume version's own record, so this fetches that
  // specifically — one extra call, only on this page, only once.
  //
  // Prefers the most recently updated version that actually has a target
  // over the resume's general headline, since a tailored job description is
  // the sharpest possible signal of "the job mentioned in the resume."
  // Never overwrites something already typed in, and never auto-starts the
  // interview itself — that's still a deliberate click either way.
  const jobPrefilled = useRef(false);
  useEffect(() => {
    if (!studio?.profile || jobPrefilled.current) return;
    jobPrefilled.current = true;
    (async () => {
      let targeted = null;
      try {
        const versions = await careerService.listVersions();
        targeted = (versions || [])
          .filter((v) => v.target?.jobTitle || v.target?.jobDescription)
          .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))[0];
      } catch {
        /* fall through to the lighter-weight summary below */
      }
      const jobTitle = targeted?.target?.jobTitle || studio.profile.headline?.trim() || '';
      const company = targeted?.target?.company || '';
      const jobDescription = targeted?.target?.jobDescription || '';
      if (jobTitle || jobDescription) {
        setSetup((s) => ({
          ...s,
          jobTitle: s.jobTitle || jobTitle,
          company: s.company || company,
          jobDescription: s.jobDescription || jobDescription,
        }));
      }
    })();
  }, [studio]);
  useEffect(() => {
    const id = params.get('session');
    if (id && (!session || session.id !== id)) studioService.getMock(id).then(setSession).catch((e) => setError(errMsg(e, 'Mock interview not found.')));
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const openSession = (s) => {
    setSession(s);
    setLastFeedback(null);
    setAnswer('');
    setParams({ session: s.id || s._id });
  };

  async function start() {
    setError('');
    setBusy('start');
    try {
      const body = { interviewType: setup.interviewType, difficulty: setup.difficulty, questionCount: Number(setup.questionCount) };
      if (setup.sourceSetId) body.sourceSetId = setup.sourceSetId;
      else {
        if (!setup.jobTitle.trim() && !setup.jobDescription.trim()) throw new Error('Choose a saved question set, or add a target job title.');
        if (setup.jobTitle.trim()) body.jobTitle = setup.jobTitle.trim();
        if (setup.company.trim()) body.company = setup.company.trim();
        if (setup.jobDescription.trim()) body.jobDescription = setup.jobDescription.trim();
      }
      openSession(await studioService.startMock(body));
    } catch (err) {
      setError(errMsg(err, 'Could not start the interview.'));
    } finally {
      setBusy('');
    }
  }

  async function submit() {
    setError('');
    if (answer.trim().length < 2) return setError('Type (or dictate) your answer first.');
    setBusy('answer');
    try {
      if (dictation.listening) dictation.toggle();
      const res = await studioService.answerMock(session.id, answer.trim(), usedVoice.current ? 'voice' : 'text');
      setLastFeedback({ ...res.feedback, question: session.currentQuestion.question, followUpAdded: res.followUpAdded });
      setSession(res.session);
      setAnswer('');
      usedVoice.current = false;
    } catch (err) {
      setError(errMsg(err, 'Could not evaluate that answer.'));
    } finally {
      setBusy('');
    }
  }

  async function finish() {
    setBusy('finish');
    try {
      setSession(await studioService.finishMock(session.id));
      setLastFeedback(null);
      success('Your interview report is ready.');
      loadStudio();
    } catch (err) {
      setError(errMsg(err, 'Could not build the report.'));
    } finally {
      setBusy('');
    }
  }

  async function remove(id) {
    await studioService.deleteMock(id);
    loadStudio();
  }

  if (!studio) return <><PanelHeader title="Mock interview" /><LoadingBlock label="Loading" /></>;
  if (!studio.profile) {
    return (
      <>
        <PanelHeader title="Mock interview" />
        <EmptyState title="Set up your profile first" description="Mock interviews use your saved resume. Build your resume and save it to your profile first." action={<Button to="/resume-builder">Build my resume</Button>} />
      </>
    );
  }

  const sets = studio.documents.interviewSets;
  const history = studio.documents.mockInterviews;

  /* ---------------- report ---------------- */
  if (session?.status === 'completed') {
    const r = session.report || {};
    return (
      <>
        <Seo title="Mock interview report" noIndex />
        <PanelHeader title="Interview report" description={session.title} actions={<Button variant="quiet" size="sm" onClick={() => { setSession(null); setParams({}); }}>New interview</Button>} />
        <Panel>
          <div className="flex flex-wrap items-center gap-4">
            <div className="rounded-xl bg-azure-50 px-5 py-3 text-center"><p className="text-h2 font-extrabold tabular-nums text-ink">{r.overallScore ?? '—'}</p><p className="text-caption text-slate-600">Average practice score</p></div>
            <p className="max-w-prose flex-1 text-small text-slate-700">{r.summary}</p>
            <Button variant="outline" size="sm" loading={busy === 'pdf'} onClick={async () => { setBusy('pdf'); try { await studioService.mockDocument(session.id, { format: 'pdf', filename: 'Mock_Interview_Report.pdf' }); } catch (e) { setError(errMsg(e, 'Download failed.')); } finally { setBusy(''); } }}><FileDown className="h-4 w-4" aria-hidden /> Report PDF</Button>
          </div>
          <p className="mt-3 text-caption text-slate-500">AI-generated practice feedback on your written answers — not an employer evaluation.</p>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {[['Strengths', r.strengths], ['Areas to improve', r.improvements], ['Topics to revise', r.topicsToRevise]].map(([t, list]) => (
              <div key={t} className="rounded-lg border border-line p-4"><p className="text-small font-bold text-ink">{t}</p><ul className="mt-2 list-disc space-y-1 pl-5 text-small text-slate-700">{(list || []).length ? list.map((x) => <li key={x}>{x}</li>) : <li className="list-none text-slate-400">—</li>}</ul></div>
            ))}
          </div>
          {r.nextSteps?.length > 0 && <div className="mt-5"><p className="text-small font-bold text-ink">Recommended next practice</p><ol className="mt-2 list-decimal space-y-1 pl-5 text-small text-slate-700">{r.nextSteps.map((x) => <li key={x}>{x}</li>)}</ol></div>}
        </Panel>
        <div className="mt-6 space-y-4">
          {session.turns.map((t, i) => (
            <Panel key={t._id || i}>
              <p className="text-caption font-semibold uppercase text-slate-500">Question {i + 1}{t.isFollowUp ? ' · follow-up' : ''} · {t.category}</p>
              <p className="mt-1 text-small font-semibold text-ink">{t.question}</p>
              <p className="mt-3 whitespace-pre-line rounded-md bg-paper p-3 text-small text-slate-700">{t.answer}</p>
              {t.feedback && <div className="mt-4"><Feedback f={t.feedback} /></div>}
            </Panel>
          ))}
        </div>
      </>
    );
  }

  /* ---------------- live interview ---------------- */
  if (session) {
    const q = session.currentQuestion;
    const answered = session.turns.length;
    return (
      <>
        <Seo title="Mock interview" noIndex />
        <PanelHeader title="Mock interview" description={session.title} actions={<Button variant="quiet" size="sm" onClick={finish} loading={busy === 'finish'} disabled={!answered}><Flag className="h-4 w-4" aria-hidden /> Finish & get report</Button>} />
        <div className="mb-4 flex items-center gap-3 text-small text-slate-600">
          <span>Question {Math.min(answered + 1, session.total)} of {session.total}</span>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-azure transition-all" style={{ width: `${(answered / session.total) * 100}%` }} /></div>
        </div>

        {lastFeedback && (
          <Panel className="mb-5" title="Feedback on your last answer" lead={lastFeedback.question}>
            <Feedback f={lastFeedback} />
            {lastFeedback.followUpAdded && <p className="mt-3 text-small font-semibold text-azure">Your interviewer has a follow-up question based on your answer.</p>}
          </Panel>
        )}

        {q ? (
          <Panel>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="outline">{q.category}</Badge>
              {q.difficulty && (
                <Badge tone={q.difficulty === 'hard' ? 'danger' : q.difficulty === 'easy' ? 'success' : 'amber'}>
                  {q.difficulty[0].toUpperCase() + q.difficulty.slice(1)}
                </Badge>
              )}
            </div>
            <p className="mt-3 text-h4 font-bold text-ink">{q.question}</p>
            <Textarea className="mt-5" label="Your answer" rows={8} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Answer as you would in the interview. For behavioural questions, try Situation → Task → Action → Result." />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Button onClick={submit} loading={busy === 'answer'}><Send className="h-4 w-4" aria-hidden /> Submit answer</Button>
              {dictation.supported && (
                <Button variant="quiet" onClick={() => { usedVoice.current = true; dictation.toggle(); }} aria-pressed={dictation.listening}>
                  {dictation.listening ? <><MicOff className="h-4 w-4" aria-hidden /> Stop dictation</> : <><Mic className="h-4 w-4" aria-hidden /> Answer by voice</>}
                </Button>
              )}
              {busy === 'answer' && <span className="text-caption text-slate-500">Evaluating your answer…</span>}
            </div>
            {dictation.supported && <p className="mt-2 text-caption text-slate-500">Voice uses your browser’s speech recognition and asks for microphone permission. Only the transcribed text is evaluated.</p>}
            {dictation.voiceError && <p className="mt-2 text-caption text-amber-700">{dictation.voiceError}</p>}
          </Panel>
        ) : (
          <Panel><div className="flex items-center gap-3"><CheckCircle2 className="h-6 w-6 text-success" aria-hidden /><p className="text-small text-ink">All questions answered.</p><Button onClick={finish} loading={busy === 'finish'}>Get my report</Button></div></Panel>
        )}
        {error && <p role="alert" className="mt-3 text-small font-medium text-danger">{error}</p>}
      </>
    );
  }

  /* ---------------- setup + history ---------------- */
  return (
    <>
      <Seo title="Mock interview" noIndex />
      <PanelHeader title="Mock interview" description="Practise one question at a time and get feedback on each answer. Questions are practice questions based on your profile — not real employer questions." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Panel title="Set up your interview">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Start from" value={setup.sourceSetId} onChange={(e) => setSetup((s) => ({ ...s, sourceSetId: e.target.value }))}>
              <option value="">Generate new questions</option>
              {sets.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </Select>
            <Select label="Interview type" value={setup.interviewType} onChange={(e) => setSetup((s) => ({ ...s, interviewType: e.target.value }))}>{INTERVIEW_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</Select>
            <Select label="Difficulty" value={setup.difficulty} onChange={(e) => setSetup((s) => ({ ...s, difficulty: e.target.value }))}>
              {['easy', 'medium', 'hard', 'mixed'].map((d) => <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>)}
            </Select>
            <Select label="Number of questions" value={setup.questionCount} onChange={(e) => setSetup((s) => ({ ...s, questionCount: e.target.value }))}>{[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n}</option>)}</Select>
          </div>
          {setup.difficulty === 'mixed' && (
            <p className="mt-2 text-caption text-slate-500">A spread of easy, medium and hard questions in one session, instead of all one level.</p>
          )}
          {!setup.sourceSetId && (
            <>
              {jobPrefilled.current && (setup.jobTitle || setup.jobDescription) && (
                <p className="mt-4 rounded-lg bg-azure-50 px-3 py-2 text-caption text-azure-800">
                  {setup.jobDescription
                    ? 'We filled this in from the job your resume was tailored for — questions will be based on your resume and this job. Change anything below.'
                    : 'We filled in the job title from your saved resume — questions will be based on your resume and this job. Change it anytime.'}
                </p>
              )}
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Textarea label="Target job title" rows={1} value={setup.jobTitle} onChange={(e) => setSetup((s) => ({ ...s, jobTitle: e.target.value }))} />
                <Textarea label="Company (optional)" rows={1} value={setup.company} onChange={(e) => setSetup((s) => ({ ...s, company: e.target.value }))} />
              </div>
              <Textarea className="mt-4" label="Job description (recommended)" rows={4} value={setup.jobDescription} onChange={(e) => setSetup((s) => ({ ...s, jobDescription: e.target.value }))} />
            </>
          )}
          {setup.sourceSetId && <p className="mt-3 text-caption text-slate-500">Uses the questions, job and resume from your saved top-10 set. Follow-up questions are added based on your answers.</p>}
          <Button className="mt-5" onClick={start} loading={busy === 'start'}><PlayCircle className="h-4 w-4" aria-hidden /> Start interview</Button>
          {error && <p role="alert" className="mt-3 text-small font-medium text-danger">{error}</p>}
        </Panel>
        <Panel title="Practice history">
          {history.length === 0 ? <p className="text-small text-slate-500">No sessions yet.</p> : (
            <ul className="divide-y divide-line">
              {history.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-3 py-3">
                  <button type="button" className="min-w-0 text-left" onClick={() => studioService.getMock(m.id).then(openSession)}>
                    <p className="truncate text-small font-semibold text-ink hover:text-azure">{m.title}</p>
                    <p className="text-caption text-slate-500">{m.status === 'completed' ? `Practice score ${m.score ?? '—'}` : `In progress · ${m.answered}/${m.questionCount}`} · {new Date(m.updatedAt).toLocaleDateString()}</p>
                  </button>
                  <button type="button" onClick={() => remove(m.id)} aria-label={`Delete ${m.title}`} className="text-slate-400 hover:text-danger"><Trash2 className="h-4 w-4" aria-hidden /></button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}