import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Loader2, UploadCloud, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { careerService } from '../../services/careerService.js';
import { ConsentCheckbox } from '../ui/ConsentCheckbox.jsx';
import { CONSENT_REQUIRED_MESSAGE } from '../../data/legal.js';

const ACCEPTED_EXT = ['.pdf', '.doc', '.docx'];
const ACCEPTED_MIME = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_BYTES = 10 * 1024 * 1024;

const ANALYSIS_STEPS = [
  'Reading resume',
  'Checking structure',
  'Analyzing skills',
  'Evaluating keywords',
  'Generating recommendations',
];

function validate(file) {
  const ext = `.${file.name.split('.').pop()?.toLowerCase()}`;
  if (!ACCEPTED_EXT.includes(ext) || (file.type && !ACCEPTED_MIME.includes(file.type))) {
    return 'Please upload a PDF, DOC, or DOCX file.';
  }
  if (file.size > MAX_BYTES) {
    return 'Your resume must be under 10 MB.';
  }
  return null;
}

function formatSize(bytes) {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Premium drag-and-drop CV uploader that drives the DutyLaunch ATS
 * Compatibility Score. Reflects real upload progress and real backend
 * processing state — nothing here is faked.
 */
export function AtsUploader({ onResult }) {
  const [file, setFile] = useState(null);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('idle'); // idle | uploading | analyzing | error
  const [error, setError] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const inputRef = useRef(null);
  const stepTimer = useRef(null);

  const reset = useCallback(() => {
    setFile(null);
    setProgress(0);
    setStatus('idle');
    setError(null);
    setStepIndex(0);
    clearInterval(stepTimer.current);
  }, []);

  const pickFile = useCallback(
    (candidate) => {
      const problem = validate(candidate);
      if (problem) {
        setError(problem);
        setFile(null);
        setStatus('error');
        return;
      }
      setError(null);
      setFile(candidate);
      setStatus('idle');
    },
    []
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files?.[0];
      if (dropped) pickFile(dropped);
    },
    [pickFile]
  );

  const submit = useCallback(async () => {
    if (!file) return;
    if (!consent) {
      setConsentError(CONSENT_REQUIRED_MESSAGE);
      return;
    }
    setStatus('uploading');
    setProgress(0);
    setError(null);

    try {
      /* Two calls, because they are two genuinely different steps and
         the candidate needs the result of the first: parsing produces
         the Resume JSON and tells us which fields could not be read
         confidently, and analysis scores it. Merging them would hide
         the review step the whole product depends on. */
      const parsed = await careerService.parseFile(
        file,
        (pct) => {
          setProgress(pct);
          if (pct >= 100) setStatus('analyzing');
        },
        { consent }
      );

      setStatus('analyzing');
      stepTimer.current = setInterval(() => {
        setStepIndex((i) => Math.min(i + 1, ANALYSIS_STEPS.length - 1));
      }, 700);

      const analysis = await careerService.analyze({ resume: parsed.resume });

      clearInterval(stepTimer.current);
      setStepIndex(ANALYSIS_STEPS.length - 1);
      onResult?.({ ...analysis, needsReview: parsed.needsReview, reviewNote: parsed.reviewNote });
    } catch (err) {
      clearInterval(stepTimer.current);
      setStatus('error');
      setError(
        err?.response?.data?.message ||
          err.message ||
          "We couldn't read this resume. If it is a scan, try a text-based PDF or a Word file."
      );
    }
  }, [file, onResult, consent]);

  const busy = status === 'uploading' || status === 'analyzing';

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {!file && (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="button"
            tabIndex={0}
            aria-label="Upload your CV — drag and drop or browse files"
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className="group relative overflow-hidden rounded-2xl p-[1.5px] shadow-crystal transition-all duration-300 hover:shadow-crystal-lg cursor-pointer"
          >
            {/* Dynamic Continuous Travelling Edge Light */}
            <div
              className={cn(
                'pointer-events-none absolute -inset-[200%] animate-edge-orbit transition-opacity duration-500',
                dragging ? 'opacity-100' : 'opacity-40 group-hover:opacity-100'
              )}
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, #4FC1E6 295deg, #7DD3EF 325deg, #A98CEA 345deg, #FDF3E2 355deg, rgba(255,255,255,1) 358deg, transparent 360deg)',
              }}
              aria-hidden="true"
            />
            <div
              className={cn(
                'relative flex flex-col items-center justify-center rounded-[14.5px] border-2 border-dashed px-6 py-14 text-center backdrop-blur-xl transition-all duration-300',
                dragging ? 'border-azure bg-azure-50/70' : 'border-frost-300/80 bg-white/95 group-hover:border-azure group-hover:bg-azure-50/30'
              )}
            >
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-tr from-glacier-100 to-white text-azure shadow-crystal transition-transform duration-300 group-hover:scale-110">
                <UploadCloud className="h-7 w-7 text-azure" aria-hidden />
              </span>
              <p className="mt-5 text-lead font-bold text-ink">Drag &amp; drop your CV here</p>
              <p className="mt-1 text-small text-slate-500">or</p>
              <span className="mt-3 inline-flex items-center rounded-full bg-gradient-to-r from-azure to-frost-600 px-5 py-2 text-small font-semibold text-white shadow-crystal transition-transform duration-200 group-hover:scale-105">
                Browse files
              </span>
              <p className="mt-5 text-caption text-slate-400">Supported: PDF, DOC, DOCX &middot; Maximum size 10 MB</p>
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && pickFile(e.target.files[0])}
              />
            </div>
          </motion.div>
        )}

        {file && (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="group relative overflow-hidden rounded-2xl p-[1.5px] shadow-crystal"
          >
            {/* Dynamic Continuous Travelling Edge Light */}
            <div
              className="pointer-events-none absolute -inset-[200%] animate-edge-orbit opacity-75"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, #4FC1E6 295deg, #7DD3EF 325deg, #A98CEA 345deg, #FDF3E2 355deg, rgba(255,255,255,1) 358deg, transparent 360deg)',
              }}
              aria-hidden="true"
            />
            <div className="relative rounded-[14.5px] border border-white/80 bg-white/95 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-tr from-glacier-100 to-white text-azure shadow-crystal">
                  <FileText className="h-6 w-6 text-azure" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-small font-bold text-ink">{file.name}</p>
                  <p className="text-caption text-slate-500">{formatSize(file.size)}</p>
                </div>
                {!busy && (
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="rounded-full bg-azure-50 px-3 py-1 text-caption font-semibold text-azure transition-colors hover:bg-azure-100"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={reset}
                      aria-label="Remove file"
                      className="rounded-full p-1.5 text-slate-400 hover:bg-paper hover:text-ink transition-colors"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="sr-only"
                  onChange={(e) => e.target.files?.[0] && pickFile(e.target.files[0])}
                />
              </div>

              {status === 'uploading' && (
                <div className="mt-5">
                  <div className="h-1.5 overflow-hidden rounded-full bg-paper">
                    <motion.div
                      className="h-full rounded-full bg-azure"
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: 'easeOut' }}
                    />
                  </div>
                  <p className="mt-2 text-caption text-slate-500">Uploading… {progress}%</p>
                </div>
              )}

              {status === 'analyzing' && (
                <div className="mt-5 space-y-2 border-t border-line pt-4">
                  <p className="flex items-center gap-2 text-small font-semibold text-ink">
                    <Loader2 className="h-4 w-4 animate-spin text-azure" aria-hidden />
                    Analyzing your resume…
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {ANALYSIS_STEPS.map((step, i) => (
                      <li key={step} className="flex items-center gap-2 text-caption text-slate-500">
                        <span
                          className={cn(
                            'inline-block h-1.5 w-1.5 rounded-full',
                            i < stepIndex ? 'bg-success' : i === stepIndex ? 'bg-azure animate-pulse' : 'bg-slate-300'
                          )}
                        />
                        <span className={i <= stepIndex ? 'text-ink font-medium' : ''}>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!busy && status !== 'error' && (
                <ConsentCheckbox
                  className="mt-5"
                  checked={consent}
                  onChange={(e) => {
                    setConsent(e.target.checked);
                    if (e.target.checked) setConsentError('');
                  }}
                  error={consentError}
                />
              )}

              {!busy && status !== 'error' && (
                <button
                  type="button"
                  onClick={submit}
                  className="group relative mt-5 flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-[#1A3665] via-[#1D5DB8] to-[#2B72D4] px-6 text-body font-bold text-white shadow-crystal transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_20px_50px_-15px_rgba(29,93,184,0.45)] active:scale-[0.99]"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                  Check My ATS Score
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p role="alert" className="mt-3 text-small font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
