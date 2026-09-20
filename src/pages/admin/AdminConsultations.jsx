import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Select, Textarea } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { adminService } from '../../services/adminService.js';
import { formatDate } from '../../utils/format.js';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
];

export default function AdminConsultations() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const page = Number(params.get('page') || 1);
  const toast = useToast();
  const [active, setActive] = useState(null);
  const [note, setNote] = useState('');
  const [nextStatus, setNextStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const { data, meta, loading, error, refetch } = useApi(
    () => adminService.consultations({ status: status || undefined, page }),
    [status, page]
  );

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const open = (row) => {
    setActive(row);
    setNextStatus(row.status);
    setNote(row.internalNote || '');
  };

  const save = async () => {
    setSaving(true);
    try {
      await adminService.updateConsultation(active._id, { status: nextStatus, internalNote: note });
      toast.success('Request updated');
      setActive(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <PanelHeader title="Consultation requests" description="Free-consultation form submissions from every service page." />

      <Tabs options={STATUS_FILTERS} value={status} onChange={(v) => update({ status: v })} label="Filter by status" className="mb-6" />

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={data || []}
        empty={{ title: 'No requests yet' }}
        columns={[
          {
            key: 'name',
            header: 'Name',
            primary: true,
            render: (row) => (
              <button type="button" onClick={() => open(row)} className="text-left font-semibold text-ink hover:underline">
                {row.name}
              </button>
            ),
          },
          { key: 'service', header: 'Service' },
          { key: 'experience', header: 'Experience' },
          { key: 'createdAt', header: 'Received', render: (row) => formatDate(row.createdAt) },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        ]}
      />

      <Pagination meta={meta} onChange={(next) => update({ page: String(next) })} className="mt-8" />

      <Modal open={Boolean(active)} onClose={() => setActive(null)} title={active?.name} size="md">
        {active && (
          <div className="space-y-5">
            <dl className="grid grid-cols-2 gap-3 text-small">
              <div>
                <dt className="text-caption font-semibold text-slate-500">Service</dt>
                <dd className="text-ink">{active.service}</dd>
              </div>
              <div>
                <dt className="text-caption font-semibold text-slate-500">Experience</dt>
                <dd className="text-ink">{active.experience}</dd>
              </div>
              <div>
                <dt className="text-caption font-semibold text-slate-500">Email</dt>
                <dd>
                  <a href={`mailto:${active.email}`} className="inline-flex items-center gap-1.5 text-azure hover:underline">
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                    {active.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-caption font-semibold text-slate-500">Phone</dt>
                <dd>
                  <a href={`tel:${active.phone}`} className="inline-flex items-center gap-1.5 text-azure hover:underline">
                    <Phone className="h-3.5 w-3.5" aria-hidden />
                    {active.phone}
                  </a>
                </dd>
              </div>
            </dl>
            {active.message && (
              <div>
                <p className="text-caption font-semibold text-slate-500">Message</p>
                <p className="mt-1 text-small text-slate-700">{active.message}</p>
              </div>
            )}
            <Select label="Status" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} options={STATUS_FILTERS.filter((s) => s.value)} />
            <Textarea label="Internal note" rows={3} value={note} onChange={(e) => setNote(e.target.value)} hint="Not visible to the candidate." />
            <Button fullWidth loading={saving} onClick={save}>
              Save
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
