import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileUp } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { FormField, Textarea } from '../ui/Field.jsx';
import { jobService } from '../../services/jobService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const MAX_MB = 5;

export function ApplyModal({ job, open, onClose, onApplied }) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setFile(null);
    setCoverLetter('');
    setError(null);
  };

  const handleFile = (e) => {
    const selected = e.target.files?.[0];
    setError(null);
    if (!selected) return setFile(null);
    if (selected.size > MAX_MB * 1024 * 1024) {
      setFile(null);
      return setError(`That file is ${(selected.size / 1024 / 1024).toFixed(1)} MB. The limit is ${MAX_MB} MB.`);
    }
    return setFile(selected);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Attach your resume as a PDF or Word file');

    setSubmitting(true);
    const form = new FormData();
    form.append('resume', file);
    if (coverLetter.trim()) form.append('coverLetter', coverLetter.trim());

    try {
      await jobService.apply(job._id, form);
      toast.success('Application sent. Track it from your dashboard.');
      reset();
      onApplied?.();
      onClose();
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
    return undefined;
  };

  if (!isAuthenticated) {
    return (
      <Modal open={open} onClose={onClose} title="Sign in to apply" description="Applying is free for candidates.">
        <p className="text-small text-slate-600">
          Create an account or sign in, and your applications will be tracked in one place with their
          current status.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button to={`/login?redirect=/jobs/${job?.slug || job?._id}`} fullWidth data-autofocus>
            Sign in
          </Button>
          <Button to="/register" variant="outline" fullWidth>
            Create an account
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Apply — ${job?.title || ''}`}
      description={job?.company}
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button onClick={submit} loading={submitting} type="button">
            Send application
          </Button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <FormField
          label="Resume"
          required
          hint={`PDF or Word, up to ${MAX_MB} MB. It is shared only with this employer.`}
          error={error}
          htmlFor="resume-file"
        >
          <label
            htmlFor="resume-file"
            className="flex cursor-pointer items-center gap-3 rounded border border-dashed border-line bg-paper px-4 py-4 transition-colors hover:border-azure-400"
          >
            <FileUp className="h-5 w-5 text-slate-400" aria-hidden />
            <span className="text-small text-slate-600">
              {file ? file.name : 'Choose a file'}
            </span>
            <input
              id="resume-file"
              data-autofocus
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFile}
              className="sr-only"
            />
          </label>
        </FormField>

        <Textarea
          label="Cover note"
          rows={5}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Optional. Two or three sentences on why this role, specifically."
          hint="Optional, but applications with one are read more carefully."
        />

        <p className="text-caption text-slate-500">
          By applying you agree to share your resume and profile with this employer. See our{' '}
          <Link to="/privacy-policy" className="underline underline-offset-2">
            privacy policy
          </Link>
          .
        </p>
      </form>
    </Modal>
  );
}
