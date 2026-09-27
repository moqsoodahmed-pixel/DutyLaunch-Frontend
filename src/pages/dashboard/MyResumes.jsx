import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileStack, RotateCcw, Trash2 } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Checkbox, Input, Textarea } from '../../components/ui/Field.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { EmptyState, ErrorState, LoadingBlock } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { careerService, printResumeHtml } from '../../services/careerService.js';
import { formatDate } from '../../utils/format.js';

/**
 * My resumes (spec §17, §42, §43, §39).
 *
 * The master profile is the complete verified history. Targeted versions
 * are derived from it and never change it. The original upload is the
 * integrity baseline, so it can be neither edited nor deleted.
 */
const KIND_LABEL = { original: 'Original upload', optimized: 'AI optimized', targeted: 'Targeted', manual: 'Edited' };

const errMsg = (err, fallback) => err?.message || err?.message || fallback;

export default function MyResumes() {
  const toast = useToast();
  const { data: profile, loading, error, refetch } = useApi(() => careerService.getProfile(), []);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ label: '', jobTitle: '', company: '', jobDescription: '' });
  const [busyId, setBusyId] = useState('');
  const [blocked, setBlocked] = useState(null); // { version, issues }
  const [confirmDelete, setConfirmDelete] = useState(false);

  const versions = [...(profile?.versions || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  async function createVersion(e) {
    e.preventDefault();
    setBusyId('create');
    try {
      const res = await careerService.createVersion({
        label: form.label.trim() || undefined,
        jobDescription: form.jobDescription.trim() || undefined,
        jobHints: { jobTitle: form.jobTitle.trim() || undefined, company: form.company.trim() || undefined },
        kind: 'targeted',
      });
      toast.success(res?.note || 'Targeted version created.');
      setCreating(false);
      setForm({ label: '', jobTitle: '', company: '', jobDescription: '' });
      refetch();
    } catch (err) {
      toast.error(errMsg(err, 'Could not create that version.'));
    } finally {
      setBusyId('');
    }
  }

  async function download(version, acknowledgeIssues = false) {
    setBusyId(`dl-${version.id}`);
    try {
      const result = await careerService.exportResume({
        versionId: version.id,
        templateId: version.templateId,
        jobDescription: version.target?.jobDescription || undefined,
        acknowledgeIssues,
      });
      setBlocked(null);
      if (!printResumeHtml(result.html, result.fileName)) toast.error('Allow pop-ups for this site to download your resume.');
    } catch (err) {
      const issues = (err?.fieldErrors || []).filter((e) => e.field === 'integrity');
      // Export refusal means an unverified claim is still in the document.
      if (issues.length) {
        setBlocked({ version, issues, message: errMsg(err, '') });
      } else {
        toast.error(errMsg(err, 'Could not prepare the download.'));
      }
    } finally {
      setBusyId('');
    }
  }

  async function restore(version) {
    setBusyId(`rs-${version.id}`);
    try {
      const res = await careerService.restoreVersion(version.id);
      toast.success(res?.message || `Restored “${version.label}” into your master profile.`);
      refetch();
    } catch (err) {
      toast.error(errMsg(err, 'Could not restore that version.'));
    } finally {
      setBusyId('');
    }
  }

  async function remove(version) {
    if (!window.confirm(`Delete “${version.label}”? Your master profile is not affected.`)) return;
    setBusyId(`rm-${version.id}`);
    try {
      await careerService.deleteVersion(version.id);
      toast.success('Version deleted.');
      refetch();
    } catch (err) {
      toast.error(errMsg(err, 'Could not delete that version.'));
    } finally {
      setBusyId('');
    }
  }

  async function setConsent(key, value) {
    try {
      await careerService.updateProfile({ consent: { [key]: value } });
      refetch();
    } catch (err) {
      toast.error(errMsg(err, 'Could not update your preference.'));
    }
  }

  async function deleteProfile() {
    setBusyId('delete-profile');
    try {
      await careerService.deleteProfile();
      toast.success('Your career profile and every resume version have been deleted.');
      setConfirmDelete(false);
      refetch();
    } catch (err) {
      toast.error(errMsg(err, 'Could not delete your profile.'));
    } finally {
      setBusyId('');
    }
  }

  if (loading) return <LoadingBlock label="Loading your resumes" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  if (!profile?.exists || !profile.master) {
    return (
      <>
        <PanelHeader title="My resumes" description="Your master career profile and every version made from it." />
        <EmptyState
          icon={FileStack}
          title="No career profile yet"
          description="Upload your CV once. It becomes your master profile, and every targeted resume is built from it without changing it."
          action={<Button to="/ai-resume-builder">Upload my CV</Button>}
        />
      </>
    );
  }

  const master = profile.master;
  const consent = profile.consent || {};

  return (
    <>
      <PanelHeader
        title="My resumes"
        description="Your master career profile and every version made from it."
        actions={<Button onClick={() => setCreating(true)}>New targeted version</Button>}
      />

      <section className="rounded-lg border border-line bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Master profile</p>
            <p className="mt-2 text-h3 font-bold text-ink">{master.personal?.name || 'Your profile'}</p>
            <p className="text-small text-slate-600">
              {master.experience?.length || 0} roles · {master.education?.length || 0} qualifications
              {profile.lastAnalyzedAt ? ` · last analysed ${formatDate(profile.lastAnalyzedAt)}` : ''}
            </p>
          </div>
          <Button to="/ai-resume-builder" variant="outline" size="sm">
            Analyse &amp; optimise
          </Button>
        </div>
        <p className="mt-3 max-w-prose text-caption text-slate-500">
          This is your complete verified history. Targeted versions shorten less relevant roles for a specific job, but
          nothing is ever deleted from here.
        </p>
      </section>

      <h2 className="mb-3 mt-8 text-body font-bold text-ink">Versions</h2>
      {versions.length === 0 ? (
        <EmptyState icon={FileStack} title="No versions yet" description="Create a targeted version for a job you are applying to." />
      ) : (
        <ul className="space-y-3">
          {versions.map((v) => (
            <li key={v.id} className="flex flex-col gap-4 rounded-lg border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-ink">{v.label}</p>
                  <Badge tone={v.kind === 'original' ? 'neutral' : 'azure'}>{KIND_LABEL[v.kind] || v.kind}</Badge>
                </div>
                <p className="mt-1 text-small text-slate-600">
                  {[v.target?.jobTitle, v.target?.company].filter(Boolean).join(' · ') || 'General'}
                  {' · '}
                  {formatDate(v.createdAt)}
                </p>
                <p className="mt-1 text-caption text-slate-500">
                  {typeof v.health?.score === 'number' && `Resume Health ${v.health.score}/100`}
                  {typeof v.match?.overall === 'number' && ` · Job match ${v.match.overall}%`}
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Button size="sm" loading={busyId === `dl-${v.id}`} onClick={() => download(v)}>
                  <Download className="h-4 w-4" aria-hidden />
                  PDF
                </Button>
                {v.kind !== 'original' && (
                  <>
                    <Button size="sm" variant="quiet" loading={busyId === `rs-${v.id}`} onClick={() => restore(v)} title="Copy this version into your master profile">
                      <RotateCcw className="h-4 w-4" aria-hidden />
                      Restore
                    </Button>
                    <Button size="sm" variant="quiet" loading={busyId === `rm-${v.id}`} onClick={() => remove(v)} aria-label={`Delete ${v.label}`}>
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-10 rounded-lg border border-line bg-white p-5">
        <h2 className="text-body font-bold text-ink">Privacy &amp; data</h2>
        <p className="mt-1 text-small text-slate-600">
          You control how your CV data is used. See the{' '}
          <Link to="/privacy-policy" className="font-medium text-azure hover:underline">
            privacy policy
          </Link>{' '}
          for details.
        </p>
        <div className="mt-4 space-y-3">
          <Checkbox
            label="Allow AI processing of my CV to generate rewrites, cover letters, LinkedIn and interview content"
            checked={Boolean(consent.aiProcessing)}
            onChange={(e) => setConsent('aiProcessing', e.target.checked)}
          />
          <Checkbox
            label="Allow anonymised product analytics"
            checked={Boolean(consent.analytics)}
            onChange={(e) => setConsent('analytics', e.target.checked)}
          />
          <Checkbox
            label="Allow my anonymised data to be used to improve DutyLaunch's models"
            checked={Boolean(consent.modelTraining)}
            onChange={(e) => setConsent('modelTraining', e.target.checked)}
          />
        </div>
        <div className="mt-6 border-t border-line pt-4">
          <Button variant="quiet" size="sm" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete my career profile
          </Button>
        </div>
      </section>

      <Modal open={creating} onClose={() => setCreating(false)} title="New targeted version" description="Built from your master profile. The master itself is not changed." size="lg">
        <form className="space-y-4" onSubmit={createVersion}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Target role" value={form.jobTitle} onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))} placeholder="e.g. Key Account Manager" />
            <Input label="Company" hint="Optional" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))} />
          </div>
          <Input label="Version name" hint="Optional — defaults to role and company" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
          <Textarea
            label="Job description"
            hint="Recommended — this decides which experience is emphasised"
            rows={7}
            value={form.jobDescription}
            onChange={(e) => setForm((f) => ({ ...f, jobDescription: e.target.value }))}
          />
          <div className="flex justify-end gap-3">
            <Button type="button" variant="quiet" onClick={() => setCreating(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={busyId === 'create'} disabled={!form.jobTitle.trim() && !form.jobDescription.trim()}>
              Create version
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(blocked)} onClose={() => setBlocked(null)} title="Before you export" description="These claims could not be traced back to your original CV or to something you confirmed.">
        {blocked && (
          <div className="space-y-4">
            {blocked.issues.length > 0 ? (
              <ul className="list-disc space-y-1.5 pl-5 text-small text-slate-700">
                {blocked.issues.map((issue, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <li key={i}>{issue.label || issue.message || String(issue)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-small text-slate-700">{blocked.message}</p>
            )}
            <p className="text-small text-slate-600">Fix them in the AI Resume Builder, or confirm they are accurate and you stand behind them.</p>
            <div className="flex justify-end gap-3">
              <Button variant="quiet" onClick={() => setBlocked(null)}>
                Go back
              </Button>
              <Button loading={busyId === `dl-${blocked.version.id}`} onClick={() => download(blocked.version, true)}>
                These are accurate — export
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete your career profile?" description="This removes your master profile and every resume version. It cannot be undone.">
        <div className="flex justify-end gap-3">
          <Button variant="quiet" onClick={() => setConfirmDelete(false)}>
            Keep it
          </Button>
          <Button loading={busyId === 'delete-profile'} onClick={deleteProfile}>
            Delete everything
          </Button>
        </div>
      </Modal>
    </>
  );
}
