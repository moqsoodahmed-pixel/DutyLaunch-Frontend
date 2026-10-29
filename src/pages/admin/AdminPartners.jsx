import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExternalLink, CheckCircle2, XCircle, AlertCircle, Eye, ShieldCheck, FileText, Ban, Building2 } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { SearchBar } from '../../components/ui/SearchBar.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Textarea } from '../../components/ui/Field.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useToast } from '../../context/ToastContext.jsx';
import { adminService } from '../../services/adminService.js';
import { formatDate } from '../../utils/format.js';
import { getMediaUrl } from '../../utils/media.js';

const STATUS_FILTERS = [
  { value: 'pending', label: 'Pending review' },
  { value: 'changes_requested', label: 'Changes requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
  { value: '', label: 'All' },
];

const STATUS_TONE = {
  incomplete: 'neutral',
  pending: 'amber',
  changes_requested: 'amber',
  approved: 'success',
  rejected: 'danger',
  suspended: 'danger',
};

function PartnerLogoCell({ logoUrl, className = 'h-10 w-10' }) {
  const [error, setError] = useState(false);
  return (
    <div className={`${className} rounded-lg bg-slate-100 border border-line flex items-center justify-center shrink-0 overflow-hidden`}>
      {logoUrl && !error ? (
        <img
          src={getMediaUrl(logoUrl)}
          alt=""
          onError={() => setError(true)}
          className="h-full w-full object-contain p-1"
        />
      ) : (
        <Building2 className="h-5 w-5 text-slate-400" />
      )}
    </div>
  );
}

function PendingChangesDiff({ current, pending }) {
  if (!pending) return null;

  const diffs = [];

  const checkField = (key, label, customRender) => {
    if (key in pending && pending[key] !== undefined && pending[key] !== current[key]) {
      diffs.push({
        key,
        label,
        current: current[key],
        proposed: pending[key],
        customRender,
      });
    }
  };

  checkField('displayName', 'Public Display Name');
  checkField('legalName', 'Legal Registered Name');
  checkField('name', 'Name');
  checkField('website', 'Website', (val) =>
    val ? (
      <a href={val} target="_blank" rel="noopener noreferrer" className="text-azure-600 underline">
        {val}
      </a>
    ) : (
      '—'
    )
  );
  checkField('location', 'Location / City');
  checkField('city', 'City');
  checkField('state', 'State');
  checkField('country', 'Country');
  checkField('address', 'Campus Address');
  checkField('mode', 'Primary Mode');
  checkField('about', 'About Description');
  checkField('contactPerson', 'Contact Person');
  checkField('contactEmail', 'Contact Email');
  checkField('contactPhone', 'Contact Phone');

  if (pending.logoUrl !== undefined && pending.logoUrl !== current.logoUrl) {
    diffs.push({
      key: 'logoUrl',
      label: 'Logo',
      current: current.logoUrl,
      proposed: pending.logoUrl,
      customRender: (val) =>
        val ? (
          <img src={getMediaUrl(val)} alt="" className="h-10 w-10 object-contain rounded border border-line bg-white p-0.5" />
        ) : (
          'Removed'
        ),
    });
  }

  if (pending.coverImageUrl !== undefined && pending.coverImageUrl !== current.coverImageUrl) {
    diffs.push({
      key: 'coverImageUrl',
      label: 'Cover Banner',
      current: current.coverImageUrl,
      proposed: pending.coverImageUrl,
      customRender: (val) =>
        val ? (
          <img src={getMediaUrl(val)} alt="" className="h-12 w-28 object-cover rounded border border-line" />
        ) : (
          'Removed'
        ),
    });
  }

  const curVd = current.verificationDetails || {};
  const pendVd = pending.verificationDetails || {};

  if (pendVd.registrationNumber !== undefined && pendVd.registrationNumber !== curVd.registrationNumber) {
    diffs.push({
      key: 'registrationNumber',
      label: 'Registration / License Number',
      current: curVd.registrationNumber,
      proposed: pendVd.registrationNumber,
    });
  }

  if (pendVd.accreditationAffiliation !== undefined && pendVd.accreditationAffiliation !== curVd.accreditationAffiliation) {
    diffs.push({
      key: 'accreditationAffiliation',
      label: 'Accreditation / Affiliation',
      current: curVd.accreditationAffiliation,
      proposed: pendVd.accreditationAffiliation,
    });
  }

  if (pendVd.documentUrl !== undefined && pendVd.documentUrl !== curVd.documentUrl) {
    diffs.push({
      key: 'documentUrl',
      label: 'Verification Document',
      current: curVd.documentUrl,
      proposed: pendVd.documentUrl,
      customRender: (val, item, isProposed) =>
        val ? (
          <a
            href={getMediaUrl(val)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-azure-600 hover:underline"
          >
            <FileText className="h-3.5 w-3.5" />
            {(isProposed ? pendVd.documentName : curVd.documentName) || 'View Document'}
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          'None'
        ),
    });
  }

  if (diffs.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-small text-amber-900">
        <p className="font-semibold">Profile updates submitted awaiting verification review.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-amber-400 bg-amber-50/70 p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
          <h4 className="text-body font-bold text-amber-950">Proposed Profile Updates Awaiting Approval</h4>
        </div>
        <Badge tone="amber">{diffs.length} Field{diffs.length > 1 ? 's' : ''} Changed</Badge>
      </div>
      <p className="text-caption text-amber-800">
        The partner has updated their organization profile. Approving will automatically save and apply these values to the active live profile.
      </p>

      <div className="overflow-x-auto rounded-lg border border-amber-200 bg-white">
        <table className="w-full text-left text-small">
          <thead>
            <tr className="bg-amber-100/60 text-caption font-bold text-amber-900 border-b border-amber-200">
              <th className="p-2.5 w-1/4">Field</th>
              <th className="p-2.5 w-3/8 text-slate-600">Current Value</th>
              <th className="p-2.5 w-3/8 text-emerald-800">Proposed New Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-100">
            {diffs.map((d) => (
              <tr key={d.key} className="hover:bg-amber-50/40">
                <td className="p-2.5 font-semibold text-slate-700">{d.label}</td>
                <td className="p-2.5 text-slate-500">
                  {d.customRender ? d.customRender(d.current, d, false) : (d.current || '—')}
                </td>
                <td className="p-2.5 font-medium text-emerald-900 bg-emerald-50/50">
                  {d.customRender ? d.customRender(d.proposed, d, true) : (d.proposed || '—')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminPartners() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const debouncedQ = useDebounce(q, 350);
  const status = params.has('status') ? params.get('status') : 'pending';
  const page = Number(params.get('page') || 1);
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);

  // Modal inspection state
  const [inspecting, setInspecting] = useState(null);
  const [actionNote, setActionNote] = useState('');
  const [actionType, setActionType] = useState(null); // 'changes_requested' | 'rejected' | 'suspended'

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

  const handleDecision = async (partnerId, nextStatus, note = '') => {
    setBusyId(partnerId);
    try {
      await adminService.setPartnerStatus(partnerId, { status: nextStatus, reviewNote: note });
      toast.success(
        nextStatus === 'approved'
          ? 'Partner organization approved and verified!'
          : `Partner status updated to ${nextStatus.replace('_', ' ')}`
      );
      setInspecting(null);
      setActionType(null);
      setActionNote('');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not update partner status');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <PanelHeader
        title="Partner Organization Verification"
        description="Review university and training provider identity details, registration credentials, and verification documents before approving listing privileges."
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar
          value={q}
          onChange={setQ}
          placeholder="Search by legal or display name"
          label="Search partners"
          className="lg:max-w-sm"
        />
        <Tabs
          options={STATUS_FILTERS}
          value={status}
          onChange={(v) => update({ status: v })}
          label="Filter by verification status"
        />
      </div>

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={data || []}
        rowKey={(row) => row._id}
        empty={{
          title: status === 'pending' ? 'No organizations awaiting verification' : 'No partners found',
          description: 'Universities and training providers register as Partner and submit their profile for review.',
        }}
        columns={[
          {
            key: 'name',
            header: 'Organization',
            primary: true,
            render: (row) => (
              <div className="flex items-start gap-3">
                <PartnerLogoCell logoUrl={row.logoUrl} />
                <div>
                  <p className="font-semibold text-ink">{row.displayName || row.name}</p>
                  {row.legalName && row.legalName !== (row.displayName || row.name) && (
                    <p className="text-caption text-slate-500 font-mono">Legal: {row.legalName}</p>
                  )}
                  <p className="text-caption text-slate-500">
                    {row.city || row.location ? `${row.city || row.location}, ${row.country || ''}` : 'Location pending'}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: 'orgType',
            header: 'Type',
            render: (row) => (
              <Badge tone={row.orgType === 'university' ? 'info' : 'outline'}>
                {row.orgType === 'university' ? 'University / Higher Ed' : 'EdTech / Training'}
              </Badge>
            ),
          },
          {
            key: 'contact',
            header: 'Official Contact',
            render: (row) => (
              <div className="text-caption">
                <p className="font-medium text-ink">{row.contactPerson || row.owner?.name || '—'}</p>
                <p className="text-slate-500">{row.contactEmail || row.owner?.email || '—'}</p>
                {row.phone && <p className="text-slate-500">{row.phone}</p>}
              </div>
            ),
          },
          {
            key: 'verification',
            header: 'Verification Docs',
            render: (row) => {
              const vd = row.verificationDetails;
              return (
                <div className="text-caption space-y-0.5">
                  {vd?.registrationNumber && (
                    <p className="text-slate-600 font-mono text-[11px]">Reg: {vd.registrationNumber}</p>
                  )}
                  {vd?.documentUrl ? (
                    <a
                      href={getMediaUrl(vd.documentUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-azure-600 font-medium hover:underline"
                    >
                      <FileText className="h-3 w-3" />
                      {vd.documentName || 'View Document'}
                    </a>
                  ) : (
                    <span className="text-slate-400">No doc uploaded</span>
                  )}
                </div>
              );
            },
          },
          {
            key: 'status',
            header: 'Status',
            render: (row) => (
              <div className="space-y-1">
                <Badge tone={STATUS_TONE[row.status] || 'neutral'}>
                  {row.status?.replace('_', ' ').toUpperCase()}
                </Badge>
                {row.pendingChanges && (
                  <div>
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900 border border-amber-300">
                      Changes Pending
                    </span>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: 'actions',
            header: '',
            render: (row) => (
              <div className="flex items-center justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setInspecting(row);
                    setActionNote(row.reviewNote || '');
                    setActionType(null);
                  }}
                >
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  {row.pendingChanges ? 'Review Updates' : 'Review'}
                </Button>
                {(row.status !== 'approved' || row.pendingChanges) && (
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={busyId === row._id}
                    onClick={() => handleDecision(row._id, 'approved')}
                  >
                    {row.pendingChanges ? 'Approve Updates' : 'Approve'}
                  </Button>
                )}
              </div>
            ),
          },
        ]}
      />

      <Pagination meta={meta} onChange={(next) => update({ page: String(next) })} className="mt-8" />

      {/* Organization Review Modal */}
      {inspecting && (
        <Modal
          open={Boolean(inspecting)}
          onClose={() => setInspecting(null)}
          title={`Review Organization: ${inspecting.displayName || inspecting.name}`}
          size="lg"
        >
          <div className="space-y-6">
            {/* Campus Cover Banner */}
            {inspecting.coverImageUrl && (
              <div className="relative h-32 w-full rounded-xl overflow-hidden border border-line bg-slate-900">
                <img
                  src={getMediaUrl(inspecting.coverImageUrl)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Header summary */}
            <div className="rounded-xl border border-line bg-paper p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-caption font-semibold text-slate-500 uppercase">Organization Profile</span>
                <Badge tone={STATUS_TONE[inspecting.status] || 'neutral'}>
                  {inspecting.status?.toUpperCase()}
                </Badge>
              </div>

              <div className="flex items-start gap-4">
                <PartnerLogoCell logoUrl={inspecting.logoUrl} className="h-16 w-16" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-body font-bold text-ink">{inspecting.displayName || inspecting.name}</h3>
                  {inspecting.legalName && (
                    <p className="text-small text-slate-600 font-mono mt-0.5">Legal Name: {inspecting.legalName}</p>
                  )}
                  <p className="text-caption text-slate-500 mt-0.5">
                    Type: {inspecting.orgType === 'university' ? 'University / Higher Education Institution' : 'EdTech / Training Provider'}
                  </p>
                  {inspecting.website && (
                    <a
                      href={inspecting.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-small text-azure-600 hover:underline mt-1"
                    >
                      {inspecting.website}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Proposed Profile Updates Awaiting Review (if any) */}
            {inspecting.pendingChanges && (
              <PendingChangesDiff current={inspecting} pending={inspecting.pendingChanges} />
            )}

            {/* Verification Credentials */}
            <div className="rounded-xl border border-line bg-paper p-4 space-y-3">
              <h4 className="text-small font-bold text-ink flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-azure-600" />
                Active Verification Credentials
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-small">
                <div>
                  <span className="text-caption text-slate-500 block">Registration / License Number</span>
                  <span className="font-mono font-medium text-ink">
                    {inspecting.verificationDetails?.registrationNumber || 'Not provided'}
                  </span>
                </div>
                <div>
                  <span className="text-caption text-slate-500 block">Accreditation / Affiliation</span>
                  <span className="text-ink">
                    {inspecting.verificationDetails?.accreditationAffiliation || 'Not provided'}
                  </span>
                </div>
              </div>

              {inspecting.verificationDetails?.documentUrl && (
                <div className="mt-3 pt-3 border-t border-line flex items-center justify-between">
                  <span className="text-caption text-slate-600">Verification Document:</span>
                  <a
                    href={getMediaUrl(inspecting.verificationDetails.documentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-azure-200 bg-azure-50 text-caption font-semibold text-azure-700 hover:bg-azure-100 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    {inspecting.verificationDetails.documentName || 'Download / View Document'}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            {/* About / Description */}
            {inspecting.about && (
              <div className="text-small text-slate-700 bg-slate-50 p-4 rounded-xl border border-line">
                <span className="font-semibold text-slate-800 block mb-1">About the Organization:</span>
                <p className="whitespace-pre-line">{inspecting.about}</p>
              </div>
            )}

            {/* Feedback / Review Note Input (when taking action) */}
            {actionType && (
              <div className="space-y-2 p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                <label className="text-small font-semibold text-ink block">
                  Feedback note to provider ({actionType.replace('_', ' ')})
                </label>
                <Textarea
                  rows={3}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="Explain what needs to be changed or why the verification was rejected..."
                />
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {(inspecting.status !== 'approved' || inspecting.pendingChanges) && (
                  <Button
                    variant="primary"
                    disabled={busyId === inspecting._id}
                    onClick={() => handleDecision(inspecting._id, 'approved')}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    {inspecting.pendingChanges ? 'Approve & Apply Changes' : 'Approve & Verify'}
                  </Button>
                )}

                {actionType ? (
                  <Button
                    variant="danger"
                    disabled={busyId === inspecting._id || !actionNote.trim()}
                    onClick={() => handleDecision(inspecting._id, actionType, actionNote)}
                  >
                    Confirm {actionType.replace('_', ' ')}
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => setActionType('changes_requested')}
                    >
                      <AlertCircle className="h-4 w-4 mr-1.5 text-amber-600" />
                      Request Changes
                    </Button>

                    <Button
                      variant="outline"
                      className="text-danger border-danger/30 hover:bg-danger/10"
                      onClick={() => setActionType('rejected')}
                    >
                      <XCircle className="h-4 w-4 mr-1.5" />
                      Reject
                    </Button>

                    {inspecting.status === 'approved' && (
                      <Button
                        variant="outline"
                        className="text-danger border-danger/30 hover:bg-danger/10"
                        onClick={() => setActionType('suspended')}
                      >
                        <Ban className="h-4 w-4 mr-1.5" />
                        Suspend
                      </Button>
                    )}
                  </>
                )}
              </div>

              <Button variant="ghost" onClick={() => setInspecting(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
