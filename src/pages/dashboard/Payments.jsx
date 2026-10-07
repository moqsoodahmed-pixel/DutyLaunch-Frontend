import { CreditCard } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { LoadingBlock, ErrorState, EmptyState } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { paymentService } from '../../services/paymentService.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

const STATUS = {
  paid: { tone: 'success', label: 'Paid' },
  failed: { tone: 'danger', label: 'Failed' },
  created: { tone: 'amber', label: 'Not completed' },
};

const ITEM_TYPE = { 'cv-package': 'CV bundle', course: 'Course' };

/** Amounts arrive in paise, exactly as charged by Razorpay. */
const rupees = (paise, currency) => formatCurrency(paise / 100, currency || 'INR');

export default function Payments() {
  const { data, loading, error, refetch } = useApi(() => paymentService.mine(), []);
  const payments = data || [];

  return (
    <>
      <PanelHeader
        title="My payments"
        description="Every purchase made with your account. A counsellor contacts you within one working day of a successful payment."
        actions={
          <Button to="/pricing" variant="outline" size="sm">
            View CV bundles
          </Button>
        }
      />

      {loading && <LoadingBlock label="Loading your payments" />}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {!loading && !error && payments.length === 0 && (
        <EmptyState
          icon={CreditCard}
          title="No payments yet"
          description="When you buy a CV bundle or a course, the receipt shows up here."
          action={<Button to="/pricing">See CV bundles</Button>}
        />
      )}

      {payments.length > 0 && (
        <ul className="space-y-3">
          {payments.map((p) => {
            const status = STATUS[p.status] || STATUS.created;
            return (
              <li key={p.id} className="rounded-lg border border-line bg-white p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-caption font-semibold text-slate-500">{ITEM_TYPE[p.itemType] || 'Purchase'}</p>
                    <h2 className="mt-0.5 text-body font-bold text-ink">{p.itemName}</h2>
                    <p className="mt-1 text-caption text-slate-500">
                      {formatDate(p.paidAt || p.createdAt)}
                      {p.razorpayPaymentId && <> · Payment id {p.razorpayPaymentId}</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                    <p className="tabular text-h3 font-extrabold text-ink">{rupees(p.amount, p.currency)}</p>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </div>
                </div>
                {p.gstAmount > 0 && (
                  <p className="mt-3 border-t border-line pt-3 text-caption text-slate-500">
                    {rupees(p.baseAmount, p.currency)} + {p.gstRate}% GST {rupees(p.gstAmount, p.currency)}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
