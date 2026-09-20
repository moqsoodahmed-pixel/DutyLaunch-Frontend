import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { jobService } from '../../services/jobService.js';
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

const WITHDRAWABLE = ['submitted', 'under-review', 'shortlisted', 'interviewing'];

export default function Applications() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const page = Number(params.get('page') || 1);
  const toast = useToast();
  const [withdrawing, setWithdrawing] = useState(null);

  const { data, meta, loading, error, refetch } = useApi(
    () => jobService.myApplications({ status: status || undefined, page }),
    [status, page]
  );

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const withdraw = async (id) => {
    setWithdrawing(id);
    try {
      await jobService.withdraw(id);
      toast.success('Application withdrawn');
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setWithdrawing(null);
    }
  };

  return (
    <>
      <PanelHeader title="Your applications" description="Every role you have applied to, and where it stands." />

      <Tabs options={STATUS_FILTERS} value={status} onChange={(v) => update({ status: v })} label="Filter by status" className="mb-6" />

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={data || []}
        rowKey={(row) => row._id}
        empty={{
          title: 'No applications here',
          description: 'Try a different filter, or start applying.',
          action: (
            <Link to="/jobs" className="text-small font-semibold text-azure hover:underline">
              Browse jobs
            </Link>
          ),
        }}
        columns={[
          {
            key: 'job',
            header: 'Role',
            primary: true,
            render: (row) => (
              <Link to={`/jobs/${row.job?.slug || row.job?._id}`} className="font-semibold text-ink hover:underline">
                {row.job?.title || 'Listing removed'}
              </Link>
            ),
          },
          { key: 'company', header: 'Company', render: (row) => row.job?.company || '—' },
          { key: 'appliedAt', header: 'Applied', render: (row) => formatDate(row.appliedAt) },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          {
            key: 'actions',
            header: '',
            hideOnMobile: false,
            render: (row) =>
              WITHDRAWABLE.includes(row.status) ? (
                <Button
                  variant="link"
                  size="sm"
                  loading={withdrawing === row._id}
                  onClick={() => withdraw(row._id)}
                  className="text-danger"
                >
                  Withdraw
                </Button>
              ) : (
                <span className="text-caption text-slate-400">—</span>
              ),
          },
        ]}
      />

      <Pagination meta={meta} onChange={(next) => update({ page: String(next) })} className="mt-8" />
    </>
  );
}
