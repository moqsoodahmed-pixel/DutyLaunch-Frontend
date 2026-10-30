import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Landmark,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Settings,
  Building2,
  FileText,
  DollarSign,
  TrendingUp,
  CreditCard,
  ExternalLink,
} from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Input, Select, Textarea } from '../../components/ui/Field.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { adminService } from '../../services/adminService.js';
import { formatDate } from '../../utils/format.js';

const STATUS_FILTERS = [
  { value: '', label: 'All' },
  { value: 'eligible', label: 'Eligible' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'paid', label: 'Paid' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'failed', label: 'Failed' },
];

const STATUS_TONES = {
  pending: 'neutral',
  eligible: 'info',
  processing: 'warning',
  paid: 'success',
  failed: 'danger',
  on_hold: 'warning',
  reversed: 'danger',
};

export default function AdminSettlements() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') || '';
  const page = Number(params.get('page') || 1);
  const toast = useToast();

  const { data, meta, loading, error, refetch } = useApi(
    () => adminService.settlements({ status: status || undefined, page }),
    [status, page]
  );

  const { data: partnersData } = useApi(
    () => adminService.partners({ status: 'approved', limit: 100 }),
    []
  );

  const { data: feeConfigsData, refetch: refetchFees } = useApi(
    () => adminService.feeConfigs(),
    []
  );

  const settlements = useMemo(() => data || [], [data]);
  const approvedPartners = useMemo(() => partnersData || [], [partnersData]);
  const feeConfigs = useMemo(() => feeConfigsData || [], [feeConfigsData]);

  // Modal states
  const [updatingSettlement, setUpdatingSettlement] = useState(null);
  const [newStatus, setNewStatus] = useState('paid');
  const [payoutRef, setPayoutRef] = useState('');
  const [notes, setNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);

  const [generatingOpen, setGeneratingOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [generating, setGenerating] = useState(false);

  const [feeModalOpen, setFeeModalOpen] = useState(false);
  const [newFeeType, setNewFeeType] = useState('percentage');
  const [newFeeValue, setNewFeeValue] = useState(15);
  const [newFeeNotes, setNewFeeNotes] = useState('');
  const [newFeeProvider, setNewFeeProvider] = useState('');
  const [savingFee, setSavingFee] = useState(false);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const openUpdate = (s) => {
    setUpdatingSettlement(s);
    setNewStatus(s.status || 'paid');
    setPayoutRef(s.payoutReference || '');
    setNotes(s.notes || '');
  };

  const handleSaveStatus = async () => {
    if (!updatingSettlement) return;
    setSavingStatus(true);
    try {
      await adminService.updateSettlement(updatingSettlement._id, {
        status: newStatus,
        payoutReference: payoutRef.trim(),
        notes: notes.trim(),
      });
      toast.success(`Settlement batch marked as ${newStatus}`);
      setUpdatingSettlement(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Failed to update settlement status');
    } finally {
      setSavingStatus(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedPartnerId) {
      toast.error('Select a partner institute to generate settlement for');
      return;
    }
    setGenerating(true);
    try {
      await adminService.generateSettlement(selectedPartnerId);
      toast.success('Settlement batch generated successfully');
      setGeneratingOpen(false);
      setSelectedPartnerId('');
      refetch();
    } catch (err) {
      toast.error(err.message || 'No unsettled paid orders found for this partner');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveFee = async (e) => {
    e.preventDefault();
    setSavingFee(true);
    try {
      await adminService.saveFeeConfig({
        provider: newFeeProvider || undefined,
        isDefault: !newFeeProvider,
        feeType: newFeeType,
        feeValue: Number(newFeeValue) || 15,
        notes: newFeeNotes.trim(),
      });
      toast.success('Fee configuration saved');
      setNewFeeNotes('');
      setNewFeeProvider('');
      refetchFees();
    } catch (err) {
      toast.error(err.message || 'Failed to save fee configuration');
    } finally {
      setSavingFee(false);
    }
  };

  const handleDeleteFee = async (id) => {
    if (!window.confirm('Delete this fee override?')) return;
    try {
      await adminService.deleteFeeConfig(id);
      toast.success('Fee override deleted');
      refetchFees();
    } catch (err) {
      toast.error(err.message || 'Failed to delete fee override');
    }
  };

  return (
    <>
      <PanelHeader
        title="Partner Settlements & Payouts"
        description="Reconcile enrolment payments, generate settlement batches, and record bank payouts to partner universities and training providers."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setGeneratingOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Generate Batch
            </Button>
            <Button size="sm" variant="outline" onClick={() => setFeeModalOpen(true)}>
              <Settings className="h-4 w-4 mr-1.5" />
              Fee Config
            </Button>
          </div>
        }
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          options={STATUS_FILTERS}
          value={status}
          onChange={(v) => update({ status: v })}
          label="Filter by settlement status"
        />
      </div>

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={settlements}
        rowKey={(row) => row._id}
        empty={{
          title: 'No settlements found',
          description: 'Settlement batches are created when paid candidate enrolments accumulate for a partner organization.',
        }}
        columns={[
          {
            key: 'partner',
            header: 'Partner Organization',
            primary: true,
            render: (row) => (
              <div className="flex items-start gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-azure-50 text-azure-700 shrink-0 mt-0.5">
                  <Building2 className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-semibold text-ink">
                    {row.partner?.displayName || row.partner?.name || 'Partner Institute'}
                  </p>
                  <p className="text-caption text-slate-500">
                    {row.partner?.orgType === 'university' ? 'University / Higher Ed' : 'EdTech / Training'} ·{' '}
                    {row.partner?.location || 'India'}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: 'batch',
            header: 'Batch ID & Period',
            render: (row) => (
              <div>
                <p className="font-mono text-caption font-semibold text-slate-800">
                  {row.batchId || row._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-caption text-slate-500">
                  {formatDate(row.periodStart || row.createdAt)} – {formatDate(row.periodEnd || row.createdAt)}
                </p>
              </div>
            ),
          },
          {
            key: 'gross',
            header: 'Gross Total',
            render: (row) => (
              <span className="font-medium text-slate-700">
                ₹{Number(row.grossAmount ?? Math.round((row.grossAmountPaise || 0) / 100)).toLocaleString('en-IN')}
              </span>
            ),
          },
          {
            key: 'commission',
            header: 'Platform Fee',
            render: (row) => (
              <span className="text-slate-500 font-medium">
                -₹{Number(row.platformCommission ?? Math.round((row.platformFeePaise || 0) / 100)).toLocaleString('en-IN')}
              </span>
            ),
          },
          {
            key: 'payable',
            header: 'Net Payable',
            render: (row) => (
              <span className="font-bold text-ink">
                ₹{Number(row.netPayable ?? Math.round((row.payableAmountPaise || 0) / 100)).toLocaleString('en-IN')}
              </span>
            ),
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => (
              <Badge tone={STATUS_TONES[row.status] || 'neutral'} className="capitalize">
                {row.status?.replace('_', ' ').toUpperCase()}
              </Badge>
            ),
          },
          {
            key: 'reference',
            header: 'UTR / Bank Ref',
            render: (row) => (
              <span className="font-mono text-caption text-slate-600">
                {row.payoutReference || '—'}
              </span>
            ),
          },
          {
            key: 'actions',
            header: '',
            render: (row) => (
              <div className="flex items-center justify-end">
                <Button size="sm" variant="outline" onClick={() => openUpdate(row)}>
                  Update Status
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Pagination meta={meta} onChange={(next) => update({ page: String(next) })} className="mt-8" />

      {/* Update Settlement Modal */}
      {updatingSettlement && (
        <Modal
          open={Boolean(updatingSettlement)}
          onClose={() => setUpdatingSettlement(null)}
          title={`Update Settlement Batch: ${updatingSettlement.batchId || updatingSettlement._id.slice(-8).toUpperCase()}`}
          size="md"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-line bg-paper p-4 space-y-2 text-small">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Partner:</span>
                <span className="font-bold text-ink">
                  {updatingSettlement.partner?.displayName || updatingSettlement.partner?.name}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Net Payable Amount:</span>
                <span className="font-bold text-ink text-body">
                  ₹{Number(
                    updatingSettlement.netPayable ??
                      Math.round((updatingSettlement.payableAmountPaise || 0) / 100)
                  ).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <Select
              label="Settlement Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={[
                { value: 'eligible', label: 'Eligible (Approved for payout)' },
                { value: 'processing', label: 'Processing (Bank transfer initiated)' },
                { value: 'paid', label: 'Paid (Successfully transferred)' },
                { value: 'on_hold', label: 'On Hold (Verification required)' },
                { value: 'failed', label: 'Failed (Bank transfer returned)' },
              ]}
            />

            <Input
              label="Bank Reference / UTR Number"
              placeholder="e.g. UTR-20261029-998811"
              value={payoutRef}
              onChange={(e) => setPayoutRef(e.target.value)}
              hint="Required when marking as Paid to provide payment proof to partner"
            />

            <Textarea
              label="Settlement Notes / Remarks"
              placeholder="Internal compliance remarks or bank transfer notes..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <Button variant="ghost" onClick={() => setUpdatingSettlement(null)}>
                Cancel
              </Button>
              <Button loading={savingStatus} onClick={handleSaveStatus}>
                Save Status
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Generate Settlement Batch Modal */}
      {generatingOpen && (
        <Modal
          open={generatingOpen}
          onClose={() => setGeneratingOpen(false)}
          title="Generate New Settlement Batch"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-small text-slate-600">
              Select an approved partner organization. DutyLaunch will aggregate all unsettled paid candidate enrolments, compute commission based on active fee configuration, and create an eligible settlement batch.
            </p>

            <Select
              label="Partner Organization"
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              options={[
                { value: '', label: 'Select partner...' },
                ...approvedPartners.map((p) => ({
                  value: p._id,
                  label: `${p.displayName || p.name} (${p.orgType === 'university' ? 'University' : 'EdTech'})`,
                })),
              ]}
            />

            <div className="flex justify-end gap-3 pt-4 border-t border-line">
              <Button variant="ghost" onClick={() => setGeneratingOpen(false)}>
                Cancel
              </Button>
              <Button loading={generating} disabled={!selectedPartnerId} onClick={handleGenerate}>
                Generate Batch
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Fee Configuration Modal */}
      {feeModalOpen && (
        <Modal
          open={feeModalOpen}
          onClose={() => setFeeModalOpen(false)}
          title="Platform Commission & Fee Configuration"
          size="lg"
        >
          <div className="space-y-6">
            <p className="text-small text-slate-600">
              DutyLaunch automatically applies platform commission when candidates purchase courses or enrol in programmes. Specific partner overrides take precedence over the platform default tier.
            </p>

            {/* Existing Fee Rules Table */}
            <div className="overflow-x-auto rounded-xl border border-line bg-paper">
              <table className="w-full text-left text-small">
                <thead>
                  <tr className="border-b border-line bg-slate-50 text-caption font-semibold text-slate-600">
                    <th className="py-2.5 px-3">Scope</th>
                    <th className="py-2.5 px-3">Fee Type</th>
                    <th className="py-2.5 px-3">Value</th>
                    <th className="py-2.5 px-3">Notes</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {feeConfigs.map((fc) => (
                    <tr key={fc._id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-semibold text-ink">
                        {fc.isDefault ? (
                          <Badge tone="success">Platform Default Tier</Badge>
                        ) : (
                          fc.provider?.displayName || fc.provider?.name || 'Partner Override'
                        )}
                      </td>
                      <td className="py-2.5 px-3 capitalize text-slate-700">{fc.feeType}</td>
                      <td className="py-2.5 px-3 font-bold text-ink">
                        {fc.feeType === 'percentage' ? `${fc.feeValue}%` : `₹${fc.feeValue}`}
                      </td>
                      <td className="py-2.5 px-3 text-caption text-slate-500 max-w-xs truncate">
                        {fc.notes || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {!fc.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFee(fc._id)}
                            className="text-caption font-semibold text-rose-600 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add / Override Fee Rule Form */}
            <form onSubmit={handleSaveFee} className="space-y-4 rounded-xl border border-line p-4 bg-slate-50/60">
              <h4 className="text-small font-bold text-ink">Add / Update Fee Tier</h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <Select
                  label="Applies To"
                  value={newFeeProvider}
                  onChange={(e) => setNewFeeProvider(e.target.value)}
                  options={[
                    { value: '', label: 'Platform Default (All Partners)' },
                    ...approvedPartners.map((p) => ({
                      value: p._id,
                      label: p.displayName || p.name,
                    })),
                  ]}
                />
                <Select
                  label="Fee Type"
                  value={newFeeType}
                  onChange={(e) => setNewFeeType(e.target.value)}
                  options={[
                    { value: 'percentage', label: 'Percentage (%)' },
                    { value: 'fixed', label: 'Fixed (₹ INR)' },
                  ]}
                />
                <Input
                  label={`Fee Rate (${newFeeType === 'percentage' ? '%' : '₹'})`}
                  type="number"
                  min="0"
                  max={newFeeType === 'percentage' ? 100 : undefined}
                  value={newFeeValue}
                  onChange={(e) => setNewFeeValue(e.target.value)}
                  required
                />
              </div>

              <Input
                label="Notes / Terms Reference"
                placeholder="e.g. Standard 15% tier or University MOU terms"
                value={newFeeNotes}
                onChange={(e) => setNewFeeNotes(e.target.value)}
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" loading={savingFee}>
                  Save Fee Rule
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </>
  );
}

