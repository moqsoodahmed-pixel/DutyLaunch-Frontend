import { useMemo } from 'react';
import { Seo } from '../../../components/ui/Seo.jsx';
import { PanelHeader } from '../../../layouts/AppShell.jsx';
import { useApi } from '../../../hooks/useApi.js';
import { settlementService } from '../../../services/contentService.js';
import { LoadingBlock, ErrorState } from '../../../components/ui/States.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Landmark, ArrowUpRight, Clock, CheckCircle2, AlertCircle, Info, ShieldCheck } from 'lucide-react';

const STATUS_TONES = {
  pending: 'neutral',
  eligible: 'info',
  processing: 'warning',
  paid: 'success',
  failed: 'danger',
  on_hold: 'warning',
  reversed: 'danger',
};

export default function PartnerSettlements() {
  const { data, loading, error, refetch } = useApi(() => settlementService.mine(), []);

  const summary = data?.summary || {
    grossCollected: 0,
    platformCommission: 0,
    settledAmount: 0,
    netPayableBalance: 0,
  };

  const settlements = useMemo(() => data?.settlements || [], [data]);

  return (
    <>
      <Seo title="Payments & Settlements" description="Track earnings, DutyLaunch platform fees and provider payouts" />
      <PanelHeader
        title="Payments & Settlements"
        description="DutyLaunch collects course and programme enrolment fees and settles provider payouts according to your platform terms."
      />

      {loading && <LoadingBlock message="Loading financial records..." />}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-line bg-paper p-5 shadow-sm">
              <span className="text-caption font-semibold text-slate-500 uppercase tracking-wider">Gross Collections</span>
              <p className="mt-2 text-2xl font-bold text-ink">
                ₹{Number(summary.grossCollected || 0).toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-caption text-slate-500">Total fees paid by enrolled candidates</p>
            </div>

            <div className="rounded-xl border border-line bg-paper p-5 shadow-sm">
              <span className="text-caption font-semibold text-slate-500 uppercase tracking-wider">Platform Commission</span>
              <p className="mt-2 text-2xl font-bold text-slate-700">
                ₹{Number(summary.platformCommission || 0).toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-caption text-slate-500">DutyLaunch service & marketplace fees</p>
            </div>

            <div className="rounded-xl border border-line bg-paper p-5 shadow-sm">
              <span className="text-caption font-semibold text-slate-500 uppercase tracking-wider">Total Settled</span>
              <p className="mt-2 text-2xl font-bold text-emerald-700">
                ₹{Number(summary.settledAmount || 0).toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-caption text-slate-500">Payouts transferred to your bank</p>
            </div>

            <div className="rounded-xl border border-azure-200 bg-azure-50/40 p-5 shadow-sm">
              <span className="text-caption font-semibold text-azure-700 uppercase tracking-wider">Payable Balance</span>
              <p className="mt-2 text-2xl font-bold text-azure-900">
                ₹{Number(summary.netPayableBalance || 0).toLocaleString('en-IN')}
              </p>
              <p className="mt-1 text-caption text-azure-600">Pending or eligible for next payout cycle</p>
            </div>
          </div>

          {/* Operational Reconciliation Notice */}
          <div className="flex items-start gap-3 rounded-xl border border-line bg-paper p-4 text-small text-slate-600 shadow-sm">
            <Info className="h-5 w-5 text-azure-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-ink">DutyLaunch Settlement & Payout Policy</p>
              <p className="text-caption text-slate-600 leading-relaxed">
                Candidate payments are securely collected via the DutyLaunch gateway. Payouts are reconciled and processed in settlement batches directly to the verified organization bank account. Platform commission rates follow your offering-specific agreement or DutyLaunch default tier.
              </p>
            </div>
          </div>

          {/* Settlements Table */}
          <div className="rounded-xl border border-line bg-paper shadow-sm overflow-hidden">
            <div className="border-b border-line px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-slate-500" />
                <h3 className="font-semibold text-ink text-body">Settlement History</h3>
              </div>
              <span className="text-caption text-slate-500">
                {settlements.length} {settlements.length === 1 ? 'batch' : 'batches'}
              </span>
            </div>

            {settlements.length === 0 ? (
              <div className="p-12 text-center">
                <Landmark className="mx-auto h-12 w-12 text-slate-300" />
                <h4 className="mt-3 text-body font-semibold text-ink">No settlements yet</h4>
                <p className="mt-1 text-small text-slate-500 max-w-sm mx-auto">
                  When candidates enrol in your paid courses or programmes, your earnings accumulate and settlement batches will be initiated here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-line bg-slate-50/60 text-caption font-semibold text-slate-600">
                      <th className="py-3 px-4">Batch / Reference</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4 text-right">Gross</th>
                      <th className="py-3 px-4 text-right">Commission</th>
                      <th className="py-3 px-4 text-right">Net Payable</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">UTR / Bank Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line text-small">
                    {settlements.map((s) => (
                      <tr key={s._id} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-mono text-caption text-slate-700">
                          {s.batchId || s._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="py-3.5 px-4 text-caption text-slate-500">
                          {new Date(s.periodStart || s.createdAt).toLocaleDateString()} –{' '}
                          {new Date(s.periodEnd || s.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right font-medium text-slate-700">
                          ₹{Number(s.grossAmount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-500">
                          -₹{Number(s.platformCommission || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-ink">
                          ₹{Number(s.netPayable || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge tone={STATUS_TONES[s.status] || 'neutral'}>
                            {s.status?.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-caption text-slate-600">
                          {s.payoutReference || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
