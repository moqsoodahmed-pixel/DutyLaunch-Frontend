import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Select } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { adminService } from '../../services/adminService.js';
import { formatDate } from '../../utils/format.js';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
];

export default function AdminMessages() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const page = Number(params.get('page') || 1);
  const toast = useToast();
  const [active, setActive] = useState(null);
  const [saving, setSaving] = useState(false);

  const { data, meta, loading, error, refetch } = useApi(
    () => adminService.messages({ status: status || undefined, page }),
    [status, page]
  );

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const open = async (row) => {
    setActive(row);
    if (row.status === 'new') {
      try {
        await adminService.updateMessage(row._id, { status: 'read' });
        refetch();
      } catch {
        /* non-critical */
      }
    }
  };

  const setStatus = async (value) => {
    setSaving(true);
    try {
      await adminService.updateMessage(active._id, { status: value });
      toast.success('Status updated');
      setActive((a) => ({ ...a, status: value }));
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PanelHeader title="Contact messages" description="General enquiries sent through the contact page." />

      <Tabs options={STATUS_FILTERS} value={status} onChange={(v) => update({ status: v })} label="Filter by status" className="mb-6" />

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={data || []}
        empty={{ title: 'No messages yet' }}
        columns={[
          {
            key: 'subject',
            header: 'Subject',
            primary: true,
            render: (row) => (
              <button type="button" onClick={() => open(row)} className="text-left font-semibold text-ink hover:underline">
                {row.subject}
              </button>
            ),
          },
          { key: 'name', header: 'From', render: (row) => `${row.name} · ${row.email}` },
          { key: 'createdAt', header: 'Received', render: (row) => formatDate(row.createdAt) },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        ]}
      />

      <Pagination meta={meta} onChange={(next) => update({ page: String(next) })} className="mt-8" />

      <Modal open={Boolean(active)} onClose={() => setActive(null)} title={active?.subject} size="md">
        {active && (
          <div className="space-y-5">
            <p className="text-caption text-slate-500">
              From {active.name} ·{' '}
              <a href={`mailto:${active.email}`} className="inline-flex items-center gap-1 text-azure hover:underline">
                <Mail className="h-3 w-3" aria-hidden />
                {active.email}
              </a>{' '}
              · {formatDate(active.createdAt)}
            </p>
            <p className="whitespace-pre-line text-small text-slate-700">{active.message}</p>
            <Select label="Status" value={active.status} onChange={(e) => setStatus(e.target.value)} disabled={saving} options={STATUS_FILTERS.filter((s) => s.value)} />
            <Button href={`mailto:${active.email}?subject=Re: ${encodeURIComponent(active.subject)}`} fullWidth variant="outline">
              Reply by email
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
