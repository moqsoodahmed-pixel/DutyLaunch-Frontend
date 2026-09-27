import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, FileUp, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button.jsx';
import { Textarea } from '../ui/Field.jsx';
import { Spinner } from '../ui/States.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { careerService } from '../../services/careerService.js';
import { ConsentCheckbox } from '../ui/ConsentCheckbox.jsx';
import { CONSENT_REQUIRED_MESSAGE } from '../../data/legal.js';

/**
 * Where a career tool gets the candidate's resume from.
 *
 * The LinkedIn, cover letter and interview endpoints all work from the
 * same resume JSON (spec §24–§26), so the three pages share this:
 *
 *  - Signed in with a saved profile: the server reads the master profile,
 *    so nothing is sent and the tool sees the candidate's confirmed facts.
 *  - Otherwise: the candidate uploads or pastes a CV, it is parsed, and
 *    the parsed JSON is sent inline with each request. For a signed-in
 *    user the parse also saves it as their master profile (server side).
 */
export function useResumeSource() {
  const { isAuthenticated, initialising } = useAuth();
  const [state, setState] = useState({ status: 'loading', resume: null, mode: null, error: '' });

  useEffect(() => {
    if (initialising) return;
    let cancelled = false;
    if (!isAuthenticated) {
      setState({ status: 'empty', resume: null, mode: null, error: '' });
      return undefined;
    }
    careerService
      .getProfile()
      .then((data) => {
        if (cancelled) return;
        if (data?.exists && data.master) setState({ status: 'ready', resume: data.master, mode: 'saved', error: '' });
        else setState({ status: 'empty', resume: null, mode: null, error: '' });
      })
      .catch(() => !cancelled && setState({ status: 'empty', resume: null, mode: null, error: '' }));
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, initialising]);

  const parse = useCallback(
    async ({ file, text, consent }) => {
      setState((s) => ({ ...s, status: 'parsing', error: '' }));
      try {
        const result = file
          ? await careerService.parseFile(file, undefined, { consent })
          : await careerService.parseText(text, { consent });
        // Signed in: the parse endpoint has just saved this as the master.
        setState({ status: 'ready', resume: result.resume, mode: isAuthenticated ? 'saved' : 'inline', error: '' });
      } catch (err) {
        setState({
          status: 'empty',
          resume: null,
          mode: null,
          error: err?.message || err?.message || 'We could not read that CV.',
        });
      }
    },
    [isAuthenticated]
  );

  const reset = useCallback(() => setState({ status: 'empty', resume: null, mode: null, error: '' }), []);

  /** The fields every career-tool request needs. */
  const requestOpts = state.mode === 'inline' ? { resume: state.resume } : {};

  return { ...state, parse, reset, requestOpts, ready: state.status === 'ready' };
}

/** The UI for `useResumeSource`. */
export function ResumeSourceCard({ source, className = '' }) {
  const { isAuthenticated } = useAuth();
  const fileInput = useRef(null);
  const [pasting, setPasting] = useState(false);
  const [text, setText] = useState('');
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState('');
  /** Runs `fn` only once the DPDP consent box is ticked. */
  const withConsent = (fn) => () => {
    if (!consent) return setConsentError(CONSENT_REQUIRED_MESSAGE);
    return fn();
  };

  if (source.status === 'loading') {
    return (
      <div className={`tile flex items-center gap-3 p-5 text-small text-slate-600 ${className}`}>
        <Spinner /> Checking for your saved profile…
      </div>
    );
  }

  if (source.status === 'ready') {
    const name = source.resume?.personal?.name;
    const role = source.resume?.experience?.[0]?.title;
    return (
      <div className={`tile flex flex-wrap items-center justify-between gap-3 p-5 ${className}`}>
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
          <div>
            <p className="text-small font-semibold text-ink">
              {source.mode === 'saved' ? 'Using your saved career profile' : 'Using the CV you just added'}
            </p>
            <p className="text-small text-slate-600">{[name, role].filter(Boolean).join(' · ') || 'Resume loaded'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={source.reset}
          className="inline-flex items-center gap-1.5 text-small font-semibold text-azure-600 hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden />
          Use a different CV
        </button>
      </div>
    );
  }

  const busy = source.status === 'parsing';

  return (
    <div className={`tile p-5 ${className}`}>
      <p className="text-small font-semibold text-ink">Step 1 — Add your CV</p>
      <p className="mt-1 text-small text-slate-600">
        Everything this tool writes comes from your own CV, so it needs one to work from. PDF, DOCX or TXT.
      </p>

      <input
        ref={fileInput}
        type="file"
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) source.parse({ file, consent });
          e.target.value = '';
        }}
      />

      <ConsentCheckbox
        className="mt-4"
        checked={consent}
        onChange={(e) => {
          setConsent(e.target.checked);
          if (e.target.checked) setConsentError('');
        }}
        error={consentError}
      />

      {!pasting ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <Button type="button" loading={busy} onClick={withConsent(() => fileInput.current?.click())}>
            <FileUp className="h-4 w-4" aria-hidden />
            Upload CV
          </Button>
          <Button type="button" variant="outline" disabled={busy} onClick={withConsent(() => setPasting(true))}>
            Paste text instead
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <Textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste your full CV text…" />
          <div className="flex flex-wrap gap-3">
            <Button type="button" loading={busy} disabled={text.trim().length < 80} onClick={withConsent(() => source.parse({ text, consent }))}>
              Use this text
            </Button>
            <Button type="button" variant="quiet" onClick={() => setPasting(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {source.error && (
        <p className="mt-3 text-small text-danger" role="alert">
          {source.error}
        </p>
      )}

      {!isAuthenticated && (
        <p className="mt-3 text-caption text-slate-500">
          Nothing is stored unless you{' '}
          <Link to="/register" className="font-semibold text-azure hover:underline">
            create an account
          </Link>
          , which saves your profile for every tool.
        </p>
      )}
    </div>
  );
}

/** Pulls a readable message out of an API error. */
export function apiErrorMessage(err, fallback) {
  return err?.message || err?.message || fallback;
}
