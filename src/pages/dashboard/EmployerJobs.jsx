import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PlusCircle, Trash2, Eye, Users } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { employerService } from '../../services/jobService.js';
import { formatDate } from '../../utils/format.js';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending review' },
  { value: 'published', label: 'Published' },
  { value: 'closed', label: 'Closed' },
];

export default function EmployerJobs() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const page = Number(params.get('page') || 1);
  const toast = useToast();
  const [deletingId, setDeletingId] = useState(null);

  const { data, meta, loading, error, refetch } = useApi(
    () => employerService.listJobs({ status: status || undefined, page }),
    [status, page]
  );

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const remove = async (id) => {
    if (!window.confirm('Remove this job post? Applications for it will also be removed.')) return;
    setDeletingId(id);
    try {
      await employerService.deleteJob(id);
      toast.success('Job post removed');
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <PanelHeader
        title="Your job posts"
        description="New and edited posts enter moderation before they go live."
        actions={
          <Button to="/employer/jobs/new" size="sm">
            <PlusCircle className="h-4 w-4" aria-hidden />
            Post a job
          </Button>
        }
      />

      <Tabs options={STATUS_FILTERS} value={status} onChange={(v) => update({ status: v })} label="Filter by status" className="mb-6" />

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={data || []}
        empty={{
          title: 'No job posts yet',
          description: 'Post your first role to start receiving applications.',
          action: (
            <Link to="/employer/jobs/new" className="text-small font-semibold text-azure hover:underline">
              Post a job
            </Link>
          ),
        }}
        columns={[
          {
            key: 'title',
            header: 'Role',
            primary: true,
            render: (row) => <span className="font-semibold text-ink">{row.title}</span>,
          },
          { key: 'location', header: 'Location' },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'createdAt', header: 'Posted', render: (row) => formatDate(row.createdAt) },
          {
            key: 'actions',
            header: '',
            render: (row) => (
              <div className="flex items-center justify-end gap-1">
                <Button to={`/employer/applications?job=${row._id}`} variant="ghost" size="sm" aria-label="View applicants">
                  <Users className="h-4 w-4" aria-hidden />
                </Button>
                <Button to={`/employer/jobs/${row._id}/edit`} variant="ghost" size="sm" aria-label="Edit">
                  <Eye className="h-4 w-4" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(row._id)}
                  loading={deletingId === row._id}
                  aria-label="Delete"
                  className="text-danger hover:bg-danger/5"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Pagination meta={meta} onChange={(next) => update({ page: String(next) })} className="mt-8" />
    </>
  );
}
