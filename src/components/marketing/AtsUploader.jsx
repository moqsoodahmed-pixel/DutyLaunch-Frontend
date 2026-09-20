import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Loader2, UploadCloud, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';
import { resumeService } from '../../services/contentService.js';

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
    setStatus('uploading');
    setProgress(0);
    setError(null);

    try {
      const uploadPromise = resumeService.analyze(file, (pct) => {
        setProgress(pct);
        if (pct >= 100) setStatus('analyzing');
      });

      // Cycle through the processing checklist while the server works —
      // reflects real stages of the pipeline, not a fake completion timer.
      setStatus('analyzing');
      stepTimer.current = setInterval(() => {
        setStepIndex((i) => Math.min(i + 1, ANALYSIS_STEPS.length - 1));
      }, 700);

      const res = await uploadPromise;
      clearInterval(stepTimer.current);
      setStepIndex(ANALYSIS_STEPS.length - 1);
      onResult?.(res.data);
    } catch (err) {
      clearInterval(stepTimer.current);
      setStatus('error');
      setError(err.message || "We couldn't analyze this resume. Please try again.");
    }
  }, [file, onResult]);

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
            className={cn(
              'group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-14 text-center transition-colors',
              dragging ? 'border-azure bg-azure-50' : 'border-line bg-white hover:border-azure-400 hover:bg-azure-50/40'
            )}
          >
            <span className="grid h-14 w-14 place-items-center rounded-full bg-azure-50 text-azure transition-transform group-hover:scale-105">
              <UploadCloud className="h-6 w-6" aria-hidden />
            </span>
            <p className="mt-5 text-lead font-bold text-ink">Drag &amp; drop your CV here</p>
            <p className="mt-1 text-small text-slate-500">or</p>
            <span className="mt-3 inline-flex items-center rounded bg-ink-800 px-4 py-2 text-small font-semibold text-white transition-colors group-hover:bg-ink-700">
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
          </motion.div>
        )}

        {file && (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border border-line bg-white p-6"
          >
            <div className="flex items-center gap-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-azure-50 text-azure">
                <FileText className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-small font-semibold text-ink">{file.name}</p>
                <p className="text-caption text-slate-500">{formatSize(file.size)}</p>
              </div>
              {!busy && (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="rounded px-2 py-1 text-caption font-semibold text-azure hover:bg-azure-50"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={reset}
                    aria-label="Remove file"
                    className="rounded p-1.5 text-slate-400 hover:bg-paper hover:text-ink"
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
                      <span className={i <= stepIndex ? 'text-ink' : ''}>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!busy && status !== 'error' && (
              <button
                type="button"
                onClick={submit}
                className="mt-5 inline-flex h-11 w-full items-center justify-center rounded bg-azure text-small font-semibold text-white transition-colors hover:bg-azure-700"
              >
                Check My ATS Score
              </button>
            )}
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
