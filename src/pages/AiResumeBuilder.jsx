import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Download,
  FileUp,
  Loader2,
  ArrowRight,
  Check,
  Maximize2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container } from '../components/ui/Container.jsx';
import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { ResumeShowcase } from '../components/cv/ResumeShowcase.jsx';
import { InfiniteFlowingShowcase, PaidUnlockModal, getTemplatePricing } from '../components/cv/TemplateGallery.jsx';
import { ResumeTemplatePreview } from '../components/cv/ResumeTemplatePreview.jsx';
import { useContentProtection } from '../hooks/useContentProtection.js';
import { Modal } from '../components/ui/Modal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { ErrorState } from '../components/ui/States.jsx';
import { cn } from '../utils/cn.js';
import { seoFor } from '../data/seoPages.js';
import { careerService, printResumeHtml } from '../services/careerService.js';
import { useToast } from '../context/ToastContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Input } from '../components/ui/Field.jsx';
import { ConsentCheckbox } from '../components/ui/ConsentCheckbox.jsx';
import { CONSENT_REQUIRED_MESSAGE } from '../data/legal.js';
import { TEMPLATES } from '../data/resumeTemplates.js';
import {
  AtsChecklist,
  EvidenceQuestions,
  JobMatchPanel,
  KeywordTable,
  ParseReviewNotice,
  ProposalReview,
  RecommendationList,
  ResumeHealthReport,
  SkillGapPanel,
  TemplateGallery,
} from '../components/career/CareerReport.jsx';
import { canonical, organizationSchema } from '../utils/seo.js';
import { contact } from '../data/site.js';

const STEPS = [
  { id: 'upload', label: 'Upload' },
  { id: 'review', label: 'Review' },
  { id: 'analyze', label: 'Analyze' },
  { id: 'optimize', label: 'Optimize' },
  { id: 'export', label: 'Export' },
];

const seo = seoFor('aiResumeBuilder');

export default function AiResumeBuilder() {
  const { success, error: toastError } = useToast();
  const { isAuthenticated } = useAuth();
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState('');

  const [searchParams] = useSearchParams();
  const paramTemplate = searchParams.get('template');

  const [step, setStep] = useState('upload');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState(null);

  const [parsed, setParsed] = useState(null);
  const [resume, setResume] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [analysis, setAnalysis] = useState(null);

  const [proposals, setProposals] = useState([]);
  const [engineNote, setEngineNote] = useState('');
  const [decisions, setDecisions] = useState({});

  const [templates, setTemplates] = useState([]);
  const [templateId, setTemplateId] = useState(paramTemplate || '');
  const [blockingIssues, setBlockingIssues] = useState([]);
  const [previewModal, setPreviewModal] = useState(null);
  const [unlockTarget, setUnlockTarget] = useState(null);
  const { isUnlocked, isWindowBlurred } = useContentProtection();

  useEffect(() => {
    if (paramTemplate) {
      setTemplateId(paramTemplate);
    }
  }, [paramTemplate]);

  const fileInput = useRef(null);
  const reportRef = useRef(null);
  const uploadSectionRef = useRef(null);

  useEffect(() => {
    careerService.getTemplates().then(setTemplates).catch(() => setTemplates([]));
  }, []);

  const scrollToReport = useCallback(() => {
    window.requestAnimationFrame(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }, []);

  const [dragOver, setDragOver] = useState(false);

  const loadDemoResume = () => {
    const demo = TEMPLATES[0];
    setParsed({
      needsReview: [],
      reviewNote: 'Loaded verified ATS profile (Universal Operations & Strategy Director).',
      fileName: 'Aarav_Kapoor_ATS_Profile.pdf',
    });
    setResume(demo);
    setStep('review');
    success('Loaded demo verified ATS resume (Aarav N. Kapoor).');
  };

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* ---------- upload ---------- */

  async function handleFile(file) {
    if (!file) return;
    setError(null);
    setBusy('upload');
    try {
      const result = await careerService.parseFile(file, undefined, { consent });
      setParsed(result);
      setResume(result.resume);
      setStep('review');
    } catch (err) {
      setError(err?.message || 'We could not read that file. If it is a scan, try a text-based PDF or a Word file.');
    } finally {
      setBusy('');
    }
  }

  /* ---------- review corrections ---------- */

  async function saveCorrections(corrected) {
    setResume(corrected);
    if (analysis) setAnalysis(null);
    if (!isAuthenticated) {
      success('Corrections applied. Run the analysis again to use them.');
      return;
    }
    setBusy('save');
    try {
      await careerService.updateProfile({ resume: corrected });
      success('Corrections saved to your career profile.');
    } catch (err) {
      toastError(err?.message || 'Corrections applied here, but could not be saved to your profile.');
    } finally {
      setBusy('');
    }
  }

  /* ---------- analysis ---------- */

  async function runAnalysis() {
    if (!resume) return;
    setError(null);
    setBusy('analyze');
    try {
      const result = await careerService.analyze({ resume, jobDescription: jobDescription.trim() || undefined });
      setAnalysis(result);
      setTemplateId((current) => current || result.suggestedTemplate);
      setStep('analyze');
      scrollToReport();
    } catch (err) {
      setError(err?.message || 'Something went wrong running the analysis.');
    } finally {
      setBusy('');
    }
  }

  /* ---------- evidence ---------- */

  const [answerBusy, setAnswerBusy] = useState('');

  async function handleAnswer(question, answers) {
    setAnswerBusy(question.id);
    try {
      const result = await careerService.submitEvidenceAnswer({ question, answers });
      success(result.suggestedBullet ? `Suggested line: ${result.suggestedBullet.bullet}` : result.note);
    } catch (err) {
      toastError(err?.message || 'Could not save that answer.');
    } finally {
      setAnswerBusy('');
    }
  }

  /* ---------- optimisation ---------- */

  async function runOptimize() {
    setError(null);
    setBusy('optimize');
    try {
      const result = await careerService.optimize({ resume, jobDescription: jobDescription.trim() || undefined });
      setProposals(result.proposals || []);
      setEngineNote(result.engineNote || '');
      setDecisions({});
      setStep('optimize');
    } catch (err) {
      setError(err?.message || 'Could not generate suggestions right now.');
    } finally {
      setBusy('');
    }
  }

  const decisionList = useMemo(
    () => Object.entries(decisions).map(([id, decision]) => ({ id, ...decision })),
    [decisions]
  );

  async function applyDecisions() {
    setBusy('apply');
    try {
      const result = await careerService.applyOptimization({
        resume,
        jobDescription: jobDescription.trim() || undefined,
        proposals,
        decisions: decisionList,
      });
      setResume(result.resume);
      setAnalysis((prev) => ({ ...prev, health: result.health, match: result.match }));
      setBlockingIssues(result.qualityControl?.blockingIssues || []);
      setProposals([]);
      setDecisions({});
      setStep('export');
      success('Your changes are in. Nothing you rejected was applied.');
      scrollToReport();
    } catch (err) {
      setError(err?.message || 'Could not apply those changes.');
    } finally {
      setBusy('');
    }
  }

  /* ---------- export ---------- */

  async function handleExport(acknowledge = false) {
    const target = TEMPLATES.find((t) => t.id === templateId);
    const pricing = getTemplatePricing(target);
    if (pricing.isPremium && !isUnlocked(templateId)) {
      setUnlockTarget(target);
      toastError(`Payment is required to export using ${target?.name || 'this paid template'}.`);
      return;
    }
    setBusy('export');
    setError(null);
    try {
      const result = await careerService.exportResume({
        resume,
        jobDescription: jobDescription.trim() || undefined,
        templateId,
        acknowledgeIssues: acknowledge,
      });
      setBlockingIssues([]);
      const opened = printResumeHtml(result.html, result.fileName);
      if (!opened) {
        toastError('Allow pop-ups for this site to download your resume.');
      }
    } catch (err) {
      const message = err?.message || 'Could not prepare the download.';
      setError(message);
      setBlockingIssues((prev) => (prev.length ? prev : [{ id: 'unknown', label: message }]));
    } finally {
      setBusy('');
    }
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <>
      <Seo
        title={seo.title}
        description={seo.description}
        schema={[
          organizationSchema(contact),
          {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'DutyLaunch AI Resume Builder',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            url: canonical(seo.path),
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
          },
        ]}
      />

      {/* ── FULL VIEWPORT DARK GLACIER BACKGROUND CANVAS ──
          Deep midnight glacier abyss with electric cyan, icy blue, and sapphire ambient glows.
          Extends seamlessly underneath the sticky navbar via negative top margin.
      */}
      <div className="relative min-h-screen overflow-hidden -mt-[76px] lg:-mt-[84px] pt-[76px] lg:pt-[84px] bg-gradient-to-b from-[#050C18] via-[#08152B] to-[#040914] text-slate-100">
        {/* ── EXCLUSIVE DUAL GLACIER GLOWS: RIGHT-UPSIDE & LEFT-SIDE BOTTOM ── */}
        {/* 1. Right Upside Glow */}
        <div
          className="pointer-events-none absolute -top-20 -right-20 h-[720px] w-[720px] rounded-full opacity-65 blur-[130px]"
          style={{
            background:
              'radial-gradient(circle at 65% 35%, rgba(56, 189, 248, 0.55) 0%, rgba(79, 193, 230, 0.4) 35%, rgba(99, 102, 241, 0.25) 60%, transparent 75%)',
          }}
          aria-hidden="true"
        />

        {/* 2. Left Side Bottom Glow */}
        <div
          className="pointer-events-none absolute top-[360px] sm:top-[330px] -left-28 h-[680px] w-[680px] rounded-full opacity-60 blur-[130px]"
          style={{
            background:
              'radial-gradient(circle at 35% 65%, rgba(6, 182, 212, 0.55) 0%, rgba(56, 189, 248, 0.38) 35%, rgba(43, 114, 212, 0.22) 60%, transparent 75%)',
          }}
          aria-hidden="true"
        />

        {/* Ambient Dark Glacial Grid Mesh */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.25] [mask-image:radial-gradient(ellipse_85%_75%_at_50%_25%,#000_70%,transparent_100%)]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(56, 189, 248, 0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.12) 1px, transparent 1px)',
            backgroundSize: '3.5rem 3.5rem',
          }}
          aria-hidden="true"
        />

        {/* ── HERO SECTION — overflow-visible-y so the resume fan's bottom
            can peek below the section boundary into the next dark band,
            the "peek-out" effect that defines this hero's visual identity. */}
        <section className="relative z-10 overflow-visible py-6 sm:py-8 lg:py-10">
          <Container>
            <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-6">
              {/* Left Column — 5 of 12 columns: gives right side more room
                  so the resume fan has space to breathe at reference scale */}
              <div className="flex flex-col justify-center lg:col-span-5">
                {/* Large Bold Typography */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.12]">
                  Build a Resume That{' '}
                  <span className="block bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(56,189,248,0.4)]">
                    Gets You Hired Faster
                  </span>
                </h1>

                {/* Description */}
                <p className="mt-3.5 max-w-prose text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                  Beat the ATS and land 3x more interviews with our AI-powered resume builder. Upload your existing CV or generate an ATS-verified, role-targeted resume in seconds.
                </p>

                {/* Primary & Secondary CTA Buttons */}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => {
                      scrollToUpload();
                      if (consent && fileInput.current) {
                        fileInput.current.click();
                      }
                    }}
                    className="group relative dl-glass-btn inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-azure via-cyan-600 to-purple-600 px-6 py-3.5 text-body font-bold text-white shadow-[0_12px_36px_-6px_rgba(43,114,212,0.6),0_0_24px_rgba(56,189,248,0.4)] transition-all duration-[250ms] hover:-translate-y-0.5 hover:scale-[1.02] hover:brightness-105 hover:shadow-[0_16px_45px_-6px_rgba(43,114,212,0.7),0_0_32px_rgba(169,140,234,0.6)] active:scale-95 cursor-pointer"
                  >
                    Analyze My Resume Free
                    <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                  </button>

                  <Link
                    to="/cv-builder"
                    className="dl-glass-btn inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-sky-600 border border-sky-300/40 px-6 py-3.5 text-body font-bold text-white shadow-[0_10px_30px_-6px_rgba(14,165,233,0.5),0_0_20px_rgba(56,189,248,0.35)] transition-all duration-[250ms] hover:-translate-y-0.5 hover:scale-[1.02] hover:brightness-110 hover:shadow-[0_14px_38px_-6px_rgba(14,165,233,0.65),0_0_28px_rgba(56,189,248,0.5)] active:scale-95"
                  >
                    Create Resume From Scratch
                  </Link>
                </div>
              </div>

              {/* Right Column — 7 of 12 columns: wider space for the
                  reference-sized resume fan. overflow-visible lets cards
                  spill below the section edge. items-start + pt aligns
                  the fan's visual centre with the text column. */}
              <div className="flex w-full items-start justify-center overflow-visible pt-4 lg:col-span-7">
                <ResumeShowcase />
              </div>
            </div>
          </Container>
        </section>

        {/* ── FEATURED RESUME TEMPLATES CAROUSEL (PAUSE-ON-HOVER VERIFIED) ── */}
        <section className="relative z-10 mt-6 sm:mt-8 py-6 border-t border-cyan-500/20 bg-[#060E1C]/75 backdrop-blur-md">
          <Container>
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-end mb-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  Flagship ATS Templates
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Choose a Template Engineered for Your Industry
                </h2>
              </div>
              <Link
                to="/cv-templates"
                className="inline-flex items-center gap-1 text-small font-bold text-cyan-400 hover:text-cyan-300 hover:underline"
              >
                Explore All Templates →
              </Link>
            </div>

            <InfiniteFlowingShowcase
              templates={TEMPLATES}
              selected={templateId}
              onSelect={(id) => {
                const target = TEMPLATES.find((t) => t.id === id);
                const pricing = getTemplatePricing(target);
                if (pricing.isPremium && !isUnlocked(id)) {
                  setUnlockTarget(target);
                  return;
                }
                setTemplateId(id);
                success(`Template set to ${id.toUpperCase()}`);
              }}
              onOpen={(tpl) => setPreviewModal(tpl)}
              tone="dark"
            />
          </Container>
        </section>

        {/* ── PROGRESS RAIL — mobile responsive horizontal track ── */}
        <div className="border-y border-cyan-500/20 bg-[#060D1A]/90 backdrop-blur-xl sticky top-[70px] z-30 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <Container className="py-2.5 overflow-x-auto no-scrollbar">
            <ol className="flex items-center gap-x-3 sm:gap-x-4 text-small min-w-max">
              {STEPS.map((s, i) => (
                <li key={s.id} className="flex items-center gap-2">
                  <span
                    className={[
                      'grid h-6 w-6 place-content-center rounded-full text-caption font-bold shadow-xs',
                      i < stepIndex
                        ? 'bg-emerald-500 text-white'
                        : i === stepIndex
                          ? 'bg-gradient-to-r from-azure to-purple-600 text-white shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                          : 'bg-slate-800/80 border border-white/10 text-slate-400',
                    ].join(' ')}
                  >
                    {i < stepIndex ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  <span className={i === stepIndex ? 'font-bold text-white' : 'text-slate-400'}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && <span className="text-slate-600">›</span>}
                </li>
              ))}
            </ol>
          </Container>
        </div>

        {/* ── STEP 1: UPLOAD & TARGET JOB ── */}
        <section ref={uploadSectionRef} id="upload" className="relative z-10 py-10">
          <Container>
            <SectionHeader
              tone="dark"
              label="Step 1"
              title="Start with the CV you already have"
              lead="PDF or Word. We read it the way a parser would, then show you exactly what we extracted before anything else happens."
            />

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {/* Upload Area Card with Continuous Travelling Edge Glow */}
              <div className="group relative overflow-hidden rounded-2xl p-[1.5px] shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_20px_rgba(56,189,248,0.2)]">
                <div
                  className="pointer-events-none absolute -inset-[200%] animate-edge-orbit opacity-45 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, #4FC1E6 295deg, #7DD3EF 325deg, #A98CEA 345deg, #FDF3E2 355deg, rgba(255,255,255,1) 358deg, transparent 360deg)',
                  }}
                  aria-hidden="true"
                />
                <div className="relative flex h-full flex-col rounded-[14.5px] border border-cyan-500/25 bg-[#0B1528]/90 p-6 backdrop-blur-xl">
                  <input
                    ref={fileInput}
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    className="sr-only"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />

                  {/* Modern Drag-and-Drop Area */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      if (!consent) {
                        setConsentError(CONSENT_REQUIRED_MESSAGE);
                        return;
                      }
                      const file = e.dataTransfer?.files?.[0];
                      if (file) handleFile(file);
                    }}
                    onClick={() => {
                      if (!consent) return setConsentError(CONSENT_REQUIRED_MESSAGE);
                      return fileInput.current?.click();
                    }}
                    className={cn(
                      'group/drop relative flex w-full flex-1 flex-col items-center justify-center gap-3.5 rounded-xl border-2 border-dashed p-8 sm:p-10 text-center transition-all duration-300 cursor-pointer overflow-hidden',
                      dragOver
                        ? 'border-cyan-400 bg-cyan-950/50 shadow-[0_0_28px_rgba(56,189,248,0.35)] scale-[1.01]'
                        : 'border-cyan-500/35 bg-cyan-950/20 hover:border-cyan-400 hover:bg-cyan-950/35 hover:shadow-[0_0_24px_rgba(56,189,248,0.2)]'
                    )}
                  >
                    {busy === 'upload' ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-10 w-10 animate-spin text-cyan-400" aria-hidden />
                        <span className="text-body font-bold text-white">Reading & parsing your CV…</span>
                        <div className="h-1.5 w-48 overflow-hidden rounded-full bg-cyan-950">
                          <div className="h-full w-full bg-gradient-to-r from-cyan-400 to-azure animate-pulse" />
                        </div>
                        <span className="text-caption text-slate-400">Extracting work experience, education and skills</span>
                      </div>
                    ) : (
                      <>
                        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 shadow-crystal transition-transform duration-300 group-hover/drop:scale-110">
                          <FileUp className="h-8 w-8 text-cyan-300" aria-hidden />
                        </div>
                        <div>
                          <p className="text-body font-bold text-white">
                            {dragOver ? 'Drop your resume file here' : 'Choose a file or drag & drop here'}
                          </p>
                          <p className="mt-1 text-small text-slate-400">PDF, DOC, DOCX or TXT (Max 10MB)</p>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                          <span className="rounded-full bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                            ATS-Verified Parser
                          </span>
                          <span className="rounded-full bg-cyan-950/80 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                            Privacy Protected
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-caption px-1">
                    <span className="text-slate-400">Don&apos;t have a file ready?</span>
                    <button
                      type="button"
                      onClick={loadDemoResume}
                      className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                    >
                      Load verified ATS sample profile →
                    </button>
                  </div>

                  <ConsentCheckbox
                    className="mt-4 text-slate-300"
                    checked={consent}
                    onChange={(e) => {
                      setConsent(e.target.checked);
                      if (e.target.checked) setConsentError('');
                    }}
                    error={consentError}
                  />

                  {parsed && (
                    <p className="mt-4 rounded-lg bg-cyan-950/40 border border-cyan-500/30 p-2.5 text-small text-slate-300">
                      Read <span className="font-semibold text-white">{resume?._source?.fileName || parsed.fileName}</span> —{' '}
                      {resume?.experience?.length || 0} roles, {resume?.education?.length || 0} qualifications.
                    </p>
                  )}
                </div>
              </div>

              {/* Target Job Description Card with Continuous Travelling Edge Glow */}
              <div className="group relative overflow-hidden rounded-2xl p-[1.5px] shadow-[0_16px_40px_rgba(0,0,0,0.5)] transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.6),0_0_20px_rgba(56,189,248,0.2)]">
                <div
                  className="pointer-events-none absolute -inset-[200%] animate-edge-orbit opacity-45 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, #4FC1E6 295deg, #7DD3EF 325deg, #A98CEA 345deg, #FDF3E2 355deg, rgba(255,255,255,1) 358deg, transparent 360deg)',
                  }}
                  aria-hidden="true"
                />
                <div className="relative flex h-full flex-col rounded-[14.5px] border border-cyan-500/25 bg-[#0B1528]/90 p-6 backdrop-blur-xl">
                  <label className="block flex-1">
                    <span className="mb-1.5 block font-bold text-white">Target job description</span>
                    <span className="mb-3 block text-small text-slate-400">
                      Optional, but unlocks targeted ATS keyword matching and role relevance scores.
                    </span>
                    <textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      rows={7}
                      placeholder="Paste the target job description or requirements here…"
                      className="w-full rounded-lg border border-cyan-500/25 bg-[#060D1A]/90 px-3.5 py-3 text-small text-white placeholder:text-slate-500 outline-none transition-all focus:border-cyan-400 focus:bg-[#081224] focus:ring-2 focus:ring-cyan-500/20"
                    />
                  </label>

                  <Button
                    className="mt-4 shadow-crystal"
                    fullWidth
                    variant="premium"
                    loading={busy === 'analyze'}
                    disabled={!resume}
                    onClick={runAnalysis}
                  >
                    Analyze my resume
                  </Button>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-6">
                <ErrorState error={{ message: error }} />
              </div>
            )}
          </Container>
        </section>

        {/* ── STEP 2: REVIEW EXTRACTED DATA ── */}
        {parsed && (
          <section id="review" className="relative z-10 py-10 border-t border-cyan-500/20">
            <Container>
              <div className="rounded-2xl border border-cyan-500/25 bg-[#0B1528]/90 p-6 sm:p-8 shadow-crystal backdrop-blur-xl">
                <SectionHeader
                  tone="dark"
                  label="Step 2"
                  title="Check what we read"
                  lead="We write nothing we are unsure of. Where a field was unreadable we left it empty rather than guessing. Click Edit to correct anything before you rely on the analysis."
                />
                <div className="mt-6 space-y-5">
                  <ParseReviewNotice needsReview={parsed.needsReview} note={parsed.reviewNote} />
                  <ExtractedSummary resume={resume} onSave={saveCorrections} saving={busy === 'save'} />
                </div>
              </div>
            </Container>
          </section>
        )}

        <div ref={reportRef} />

        {/* ── STEP 3: RESUME HEALTH REPORT ── */}
        {analysis && (
          <section id="report" className="relative z-10 py-10 border-t border-white/70">
            <Container className="space-y-10">
              <div className="rounded-2xl border border-white/80 bg-white/90 p-6 sm:p-8 shadow-crystal backdrop-blur-xl space-y-8">
                <SectionHeader
                  label="Step 3"
                  title="Your Resume Health"
                  lead="Every number below can be opened up to show how it was reached."
                />

                <ResumeHealthReport health={analysis.health} />

                {analysis.match && <JobMatchPanel match={analysis.match} disclaimer={analysis.match.disclaimer} />}
                {analysis.keywords && <KeywordTable keywordResult={analysis.keywords} />}
                {analysis.skillGap && <SkillGapPanel skillGap={analysis.skillGap} />}

                <AtsChecklist checklist={analysis.health.checklist} />

                <div>
                  <h3 className="mb-4 text-h3 font-bold">What to do next</h3>
                  <RecommendationList recommendations={analysis.recommendations} />
                </div>

                {analysis.questions?.length > 0 && (
                  <div id="evidence">
                    <SectionHeader
                      label="Step 4"
                      title="Questions only you can answer"
                      lead="These turn work you have already done into claims your resume can actually make."
                    />
                    <div className="mt-6">
                      <EvidenceQuestions questions={analysis.questions} onAnswer={handleAnswer} busyId={answerBusy} />
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-line bg-gradient-to-r from-frost-50 via-white to-aurora-100/30 p-6 shadow-xs">
                  <h3 className="text-h3 font-bold text-ink">Ready to improve the wording?</h3>
                  <p className="mt-2 max-w-prose text-small text-slate-600">
                    We will suggest stronger phrasing for your existing bullets. Every suggestion shows the original next
                    to it and explains itself, and nothing changes until you accept it.
                  </p>
                  <Button className="mt-4 shadow-crystal" variant="premium" loading={busy === 'optimize'} onClick={runOptimize}>
                    Suggest improvements
                  </Button>
                </div>
              </div>
            </Container>
          </section>
        )}

        {/* ── STEP 4: OPTIMIZE PROPOSALS ── */}
        {proposals.length > 0 && (
          <section id="optimize" className="relative z-10 py-10 border-t border-white/70">
            <Container>
              <div className="rounded-2xl border border-white/80 bg-white/90 p-6 sm:p-8 shadow-crystal backdrop-blur-xl">
                <SectionHeader
                  label="Step 4"
                  title="Accept, edit or reject each change"
                  lead="This is your resume. Nothing here is applied until you say so."
                />
                <div className="mt-6">
                  <ProposalReview
                    proposals={proposals}
                    decisions={decisions}
                    engineNote={engineNote}
                    onDecide={(id, decision) => setDecisions((prev) => ({ ...prev, [id]: decision }))}
                  />
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Button loading={busy === 'apply'} disabled={!decisionList.length} variant="premium" className="shadow-crystal" onClick={applyDecisions}>
                    Apply {decisionList.filter((d) => d.action !== 'reject').length} change
                    {decisionList.filter((d) => d.action !== 'reject').length === 1 ? '' : 's'}
                  </Button>
                  <span className="text-small text-slate-600">
                    {decisionList.length} of {proposals.length} reviewed
                  </span>
                </div>
              </div>
            </Container>
          </section>
        )}

        {/* ── STEP 5: EXPORT TO PDF ── */}
        {analysis && (
          <section id="export" className="relative z-10 py-10 border-t border-white/70">
            <Container>
              <div className="rounded-2xl border border-white/80 bg-white/90 p-6 sm:p-8 shadow-crystal backdrop-blur-xl">
                <SectionHeader
                  label="Step 5"
                  title="Choose a template and export"
                  lead="Every template is single-column, text-based and free of the graphics that break parsers. They differ in typography and spacing, not in what a parser can read."
                />

                <div className="mt-8">
                  <TemplateGallery
                    templates={templates}
                    selectedId={templateId}
                    suggestedId={analysis.suggestedTemplate}
                    onSelect={(id) => {
                      const target = TEMPLATES.find((t) => t.id === id);
                      const pricing = getTemplatePricing(target);
                      if (pricing.isPremium && !isUnlocked(id)) {
                        setUnlockTarget(target);
                        return;
                      }
                      setTemplateId(id);
                    }}
                  />
                </div>

                {blockingIssues.length > 0 && (
                  <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6">
                    <h3 className="font-semibold text-amber-900">Before you export</h3>
                    <ul className="mt-3 space-y-2">
                      {blockingIssues.map((issue) => (
                        <li key={issue.id} className="text-small text-slate-700">• {issue.label}</li>
                      ))}
                    </ul>
                    <p className="mt-3 text-small text-slate-600">
                      These are claims we could not trace back to your original CV or to something you confirmed. Fix them,
                      or confirm that they are accurate and you are happy to stand behind them.
                    </p>
                    <Button className="mt-4" variant="quiet" loading={busy === 'export'} onClick={() => handleExport(true)}>
                      These are accurate — export anyway
                    </Button>
                  </div>
                )}

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <Button size="lg" variant="premium" className="shadow-crystal" loading={busy === 'export'} onClick={() => handleExport(false)}>
                    <Download className="mr-2 h-4 w-4" aria-hidden />
                    Download as PDF
                  </Button>
                  <Badge tone="outline">Opens your browser&apos;s print dialogue — choose &ldquo;Save as PDF&rdquo;</Badge>
                </div>

                <p className="mt-6 max-w-prose text-small text-slate-600">
                  Want a targeted version for a different role?{' '}
                  <Link to="/register" className="text-azure hover:underline font-semibold">
                    Create an account
                  </Link>{' '}
                  and your master profile is saved, so the next version takes a paste of a job description rather than a
                  rebuild.
                </p>
              </div>
            </Container>
          </section>
        )}
      </div>

      {/* Full Screen Template Preview Modal with Paid Blur & Unlock */}
      <Modal
        open={Boolean(previewModal)}
        onClose={() => setPreviewModal(null)}
        title={previewModal ? `${previewModal.name} (${previewModal.personName}) — ${previewModal.industry || previewModal.tagline}` : ''}
        description={previewModal ? previewModal.description : ''}
        size="lg"
      >
        {previewModal && (() => {
          const previewPricing = getTemplatePricing(previewModal);
          const isPreviewLocked = previewPricing.isPremium && !isUnlocked(previewModal.id);

          return (
            <div
              data-resume-protect="true"
              onContextMenu={(e) => e.preventDefault()}
              className="space-y-4 dl-protected-preview select-none"
            >
              <div className="relative overflow-hidden rounded-xl border border-glacier-300 bg-white shadow-crystal" style={{ aspectRatio: '210 / 297' }}>
                <div className={cn("h-full w-full", isPreviewLocked && "filter blur-[12px] brightness-95 pointer-events-none")}>
                  <ResumeTemplatePreview template={previewModal} crop={false} />
                </div>

                {isPreviewLocked && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-slate-950/50 backdrop-blur-xs">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white shadow-xl mb-3">
                      <Lock className="h-7 w-7" />
                    </div>
                    <span className="rounded-full bg-amber-500/25 border border-amber-400/40 px-3 py-1 text-caption font-bold uppercase tracking-wider text-amber-300">
                      Paid Executive Template
                    </span>
                    <h3 className="mt-2 text-lg font-extrabold text-white">{previewModal.role}</h3>
                    <p className="mt-1 text-small text-slate-300 max-w-sm">
                      This is a paid flagship ATS template. Unlock access to preview unblurred, customize, and export.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        const target = previewModal;
                        setPreviewModal(null);
                        setUnlockTarget(target);
                      }}
                      className="mt-4 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-6 py-2.5 text-body font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      Pay & Unlock This Template
                    </button>
                  </div>
                )}

                {isWindowBlurred && (
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 p-4 text-center backdrop-blur-md">
                    <ShieldCheck className="h-8 w-8 text-cyan-400 mb-1" />
                    <p className="text-small font-bold text-white">Content Protected</p>
                    <p className="text-caption text-slate-400">Return to window to view</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {isPreviewLocked ? (
                  <Button
                    variant="premium"
                    fullWidth
                    onClick={() => {
                      const target = previewModal;
                      setPreviewModal(null);
                      setUnlockTarget(target);
                    }}
                  >
                    Pay to Access & Use {previewModal.name}
                  </Button>
                ) : (
                  <Button
                    variant="premium"
                    fullWidth
                    onClick={() => {
                      setTemplateId(previewModal.id);
                      setPreviewModal(null);
                      success(`Selected ${previewModal.name}`);
                      scrollToUpload();
                    }}
                  >
                    Use {previewModal.name} in AI Builder
                  </Button>
                )}
                <Button variant="outline" fullWidth onClick={() => setPreviewModal(null)}>
                  Close Preview
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <PaidUnlockModal
        tpl={unlockTarget}
        open={Boolean(unlockTarget)}
        onClose={() => setUnlockTarget(null)}
        onUnlockSuccess={(unlockedTpl) => {
          success(`Unlocked ${unlockedTpl.name}! Template ready to use.`);
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Extracted-data summary
 * ------------------------------------------------------------------ */

const CONTACT_FIELDS = [
  ['name', 'Name'],
  ['email', 'Email'],
  ['phone', 'Phone'],
  ['location', 'Location'],
  ['linkedin', 'LinkedIn'],
];

function ExtractedSummary({ resume, onSave, saving }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(resume);

  useEffect(() => {
    if (!editing) setDraft(resume);
  }, [resume, editing]);

  if (!resume) return null;

  const setPersonal = (key, value) => setDraft((d) => ({ ...d, personal: { ...(d.personal || {}), [key]: value } }));
  const setRole = (index, key, value) =>
    setDraft((d) => ({
      ...d,
      experience: (d.experience || []).map((r, i) => (i === index ? { ...r, [key]: value } : r)),
    }));

  const view = editing ? draft : resume;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-end gap-3">
        {editing ? (
          <>
            <Button variant="quiet" size="sm" onClick={() => { setDraft(resume); setEditing(false); }}>
              Cancel
            </Button>
            <Button size="sm" loading={saving} onClick={async () => { await onSave?.(draft); setEditing(false); }}>
              Save corrections
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit what we read
          </Button>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-6 shadow-xs">
          <h3 className="mb-4 font-semibold text-ink">Contact details</h3>
          {editing ? (
            <div className="space-y-3">
              {CONTACT_FIELDS.map(([key, label]) => (
                <Input key={key} label={label} value={view.personal?.[key] || ''} onChange={(e) => setPersonal(key, e.target.value)} />
              ))}
            </div>
          ) : (
            <dl className="space-y-2.5">
              {CONTACT_FIELDS.map(([key, label]) => {
                const value = view.personal?.[key];
                return (
                  <div key={key} className="flex gap-4 text-small">
                    <dt className="w-24 shrink-0 text-slate-500">{label}</dt>
                    <dd className={value ? 'text-ink font-medium' : 'text-danger'}>{value || 'Not found — please add'}</dd>
                  </div>
                );
              })}
            </dl>
          )}
        </div>

        <div className="rounded-xl border border-line bg-white p-6 shadow-xs">
          <h3 className="mb-4 font-semibold text-ink">Experience we read</h3>
          {view.experience?.length ? (
            <ul className="space-y-4">
              {view.experience.map((role, i) => (
                <li key={role.id || i} className="text-small">
                  {editing ? (
                    <div className="grid gap-3 rounded-md border border-line p-3 sm:grid-cols-2">
                      <Input label="Job title" value={role.title || ''} onChange={(e) => setRole(i, 'title', e.target.value)} />
                      <Input label="Company" value={role.company || ''} onChange={(e) => setRole(i, 'company', e.target.value)} />
                      <Input label="Start" placeholder="e.g. 2021-04" value={role.startDate || ''} onChange={(e) => setRole(i, 'startDate', e.target.value)} />
                      <Input
                        label="End"
                        placeholder="e.g. 2024-02"
                        hint={role.current ? 'Marked as your current role' : undefined}
                        value={role.current ? 'Present' : role.endDate || ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          const current = /^present$/i.test(v.trim());
                          setDraft((d) => ({
                            ...d,
                            experience: d.experience.map((r, j) => (j === i ? { ...r, current, endDate: current ? '' : v } : r)),
                          }));
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <p className="font-medium text-ink">
                        {role.title || <span className="text-danger">Title not found</span>}
                        {role.company ? ` · ${role.company}` : ''}
                      </p>
                      <p className="text-slate-600">
                        {role.startDate || '?'} – {role.current ? 'Present' : role.endDate || '?'}
                        {' · '}
                        {(role.responsibilities?.length || 0) + (role.achievements?.length || 0)} bullets
                      </p>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-small text-slate-600">
              No work history was found. If you are a student or a fresher that is expected — your projects, internships
              and coursework are what we will score instead.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}