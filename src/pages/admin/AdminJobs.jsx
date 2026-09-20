import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { adminService } from '../../services/adminService.js';
import { formatDate } from '../../utils/format.js';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending review' },
  { value: 'published', label: 'Published' },
  { value: 'closed', label: 'Closed' },
];

export default function AdminJobs() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const page = Number(params.get('page') || 1);
  const toast = useToast();
  const [updatingId, setUpdatingId] = useState(null);

  const { data, meta, loading, error, refetch } = useApi(
    () => adminService.jobs({ status: status || undefined, page }),
    [status, page]
  );

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const moderate = async (id, nextStatus) => {
    setUpdatingId(id);
    try {
      await adminService.moderateJob(id, nextStatus);
      toast.success(`Job ${nextStatus}`);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <PanelHeader title="Jobs" description="All job posts across every employer, including demo records." />

      <Tabs options={STATUS_FILTERS} value={status} onChange={(v) => update({ status: v })} label="Filter by status" className="mb-6" />

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={data || []}
        empty={{ title: 'No jobs match', description: 'Try a different filter.' }}
        columns={[
          {
            key: 'title',
            header: 'Role',
            primary: true,
            render: (row) => (
              <Link to={`/jobs/${row.slug || row._id}`} target="_blank" rel="noreferrer" className="font-semibold text-ink hover:underline">
                {row.title}
              </Link>
            ),
          },
          { key: 'company', header: 'Company' },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'createdAt', header: 'Posted', render: (row) => formatDate(row.createdAt) },
          {
            key: 'actions',
            header: '',
            render: (row) => (
              <div className="flex justify-end gap-1.5">
                {row.status === 'pending' && (
                  <>
                    <Button size="sm" onClick={() => moderate(row._id, 'published')} loading={updatingId === row._id}>
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => moderate(row._id, 'closed')} loading={updatingId === row._id}>
                      Reject
                    </Button>
                  </>
                )}
                {row.status === 'published' && (
                  <Button size="sm" variant="outline" onClick={() => moderate(row._id, 'closed')} loading={updatingId === row._id}>
                    Close
                  </Button>
                )}
                {row.status === 'closed' && (
                  <Button size="sm" variant="outline" onClick={() => moderate(row._id, 'published')} loading={updatingId === row._id}>
                    Reopen
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      <Pagination meta={meta} onChange={(next) => update({ page: String(next) })} className="mt-8" />
    </>
  );
}
