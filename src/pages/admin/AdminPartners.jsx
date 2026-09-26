import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { SearchBar } from '../../components/ui/SearchBar.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useToast } from '../../context/ToastContext.jsx';
import { adminService } from '../../services/adminService.js';
import { TRACKS, programmesIn } from '../../data/programmes.js';
import { formatDate } from '../../utils/format.js';

const STATUS_FILTERS = [
  { value: 'pending', label: 'Pending review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: '', label: 'All' },
];
const STATUS_TONE = { pending: 'amber', approved: 'success', rejected: 'danger' };

/** Programme slugs → their display names, for this partner's track. */
function programmeNames(track, slugs = []) {
  const all = programmesIn(track);
  return slugs.map((s) => all.find((p) => p.slug === s)?.item || s);
}

export default function AdminPartners() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const debouncedQ = useDebounce(q, 350);
  const status = params.has('status') ? params.get('status') : 'pending';
  const page = Number(params.get('page') || 1);
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);

  const { data, meta, loading, error, refetch } = useApi(
    () => adminService.partners({ q: debouncedQ || undefined, status: status || undefined, page }),
    [debouncedQ, status, page]
  );

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v !== undefined ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const setStatus = async (row, next) => {
    let reviewNote;
    if (next === 'rejected') {
      reviewNote = window.prompt(`What should ${row.name} change? (shown to them — optional)`, '');
      if (reviewNote === null) return; // cancelled
    }
    setBusyId(row._id);
    try {
      await adminService.setPartnerStatus(row._id, { status: next, reviewNote: reviewNote || '' });
      toast.success(next === 'approved' ? `${row.name} is now live` : `${row.name} ${next}`);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PanelHeader
        title="Partner institutes"
        description="Colleges and training providers that signed up to partner. Approve a profile to list it on its programme pages."
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar value={q} onChange={setQ} placeholder="Search by institute name" label="Search partners" className="lg:max-w-sm" />
        <Tabs options={STATUS_FILTERS} value={status} onChange={(v) => update({ status: v })} label="Filter by status" />
      </div>

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={data || []}
        rowKey={(row) => row._id}
        empty={{
          title: status === 'pending' ? 'Nothing waiting for review' : 'No partners here yet',
          description: 'Institutes sign up at /register → Institute, then complete their profile.',
        }}
        columns={[
          {
            key: 'name',
            header: 'Institute',
            primary: true,
            render: (row) => (
              <div>
                <p className="font-semibold text-ink">{row.name}</p>
                <p className="text-caption text-slate-500">
                  {row.location} · {row.mode} · {TRACKS[row.track]?.label}
                </p>
                {row.website && (
                  <a href={row.website} target="_blank" rel="noopener noreferrer" className="mt-0.5 inline-flex items-center gap-1 text-caption text-azure hover:underline">
                    {row.website.replace(/^https?:\/\//, '')}
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                )}
              </div>
            ),
          },
          {
            key: 'contact',
            header: 'Submitted by',
            render: (row) => (
              <div className="text-caption">
                <p className="font-medium text-ink">{row.owner?.name}</p>
                <p className="text-slate-500">{row.owner?.email}</p>
                {(row.contactPhone || row.owner?.phone) && <p className="text-slate-500">{row.contactPhone || row.owner?.phone}</p>}
              </div>
            ),
          },
          {
            key: 'programmes',
            header: 'Offers',
            render: (row) => {
              const names = programmeNames(row.track, row.programmes);
              return (
                <p className="max-w-xs text-caption text-slate-600" title={names.join(', ')}>
                  {names.slice(0, 4).join(', ')}
                  {names.length > 4 && ` +${names.length - 4} more`}
                </p>
              );
            },
          },
          { key: 'createdAt', header: 'Submitted', render: (row) => formatDate(row.createdAt) },
          {
            key: 'status',
            header: 'Status',
            render: (row) => <Badge tone={STATUS_TONE[row.status] || 'neutral'}>{row.status}</Badge>,
          },
          {
            key: 'actions',
            header: '',
            render: (row) => (
              <div className="flex flex-wrap justify-end gap-3">
                {row.status !== 'approved' && (
                  <button type="button" disabled={busyId === row._id} onClick={() => setStatus(row, 'approved')} className="text-caption font-semibold text-success hover:underline disabled:opacity-50">
                    Approve
                  </button>
                )}
                {row.status !== 'rejected' && (
                  <button type="button" disabled={busyId === row._id} onClick={() => setStatus(row, 'rejected')} className="text-caption font-semibold text-danger hover:underline disabled:opacity-50">
                    {row.status === 'approved' ? 'Unpublish' : 'Reject'}
                  </button>
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
