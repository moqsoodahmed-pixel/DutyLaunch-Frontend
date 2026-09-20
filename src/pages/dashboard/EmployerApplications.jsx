import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Select } from '../../components/ui/Field.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { employerService } from '../../services/jobService.js';
import { formatDate } from '../../utils/format.js';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under-review', label: 'Under review' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'interviewing', label: 'Interviewing' },
  { value: 'offered', label: 'Offered' },
  { value: 'rejected', label: 'Rejected' },
];

const NEXT_STATUS = ['under-review', 'shortlisted', 'interviewing', 'offered', 'rejected'];

export default function EmployerApplications() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const page = Number(params.get('page') || 1);
  const toast = useToast();
  const [updatingId, setUpdatingId] = useState(null);

  const { data, meta, loading, error, refetch } = useApi(
    () => employerService.applications({ status: status || undefined, page }),
    [status, page]
  );

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const setStatus = async (applicationId, next) => {
    setUpdatingId(applicationId);
    try {
      await employerService.setStatus(applicationId, { status: next });
      toast.success('Status updated');
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <PanelHeader title="Applicants" description="Everyone who has applied to your job posts." />

      <Tabs options={STATUS_FILTERS} value={status} onChange={(v) => update({ status: v })} label="Filter by status" className="mb-6" />

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={data || []}
        empty={{ title: 'No applications yet', description: 'They will appear here as candidates apply to your posts.' }}
        columns={[
          {
            key: 'candidate',
            header: 'Candidate',
            primary: true,
            render: (row) => (
              <div>
                <p className="font-semibold text-ink">{row.candidate?.name}</p>
                <p className="text-caption text-slate-500">{row.candidate?.profile?.headline}</p>
              </div>
            ),
          },
          { key: 'job', header: 'Role', render: (row) => row.job?.title },
          { key: 'appliedAt', header: 'Applied', render: (row) => formatDate(row.appliedAt) },
          {
            key: 'resume',
            header: 'Resume',
            render: (row) => (
              <Button
                href={employerService.resumeUrl(row._id)}
                target="_blank"
                rel="noreferrer"
                variant="ghost"
                size="sm"
                aria-label="Download resume"
              >
                <Download className="h-4 w-4" aria-hidden />
              </Button>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => (
              <div className="flex items-center gap-2">
                <StatusBadge status={row.status} />
                <select
                  aria-label={`Change status for ${row.candidate?.name}`}
                  disabled={updatingId === row._id}
                  value=""
                  onChange={(e) => e.target.value && setStatus(row._id, e.target.value)}
                  className="rounded border border-line bg-white px-1.5 py-1 text-caption text-slate-500"
                >
                  <option value="">Move to…</option>
                  {NEXT_STATUS.filter((s) => s !== row.status).map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
            ),
          },
        ]}
      />

      <Pagination meta={meta} onChange={(next) => update({ page: String(next) })} className="mt-8" />
    </>
  );
}
