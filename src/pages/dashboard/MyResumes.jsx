import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileDown,
  Receipt,
  User,
  ExternalLink,
  ChevronRight,
  MessageSquare,
  ShieldCheck,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { Seo } from '../../components/ui/Seo.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { LoadingBlock, ErrorState, EmptyState } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { resumeOrderService } from '../../services/resumeOrderService.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending Review',
    tone: 'amber',
    desc: 'Your request and documents have been received and are awaiting specialist assignment.',
  },
  assigned: {
    label: 'Assigned',
    tone: 'frost',
    desc: 'A dedicated career specialist has been assigned and is reviewing your career profile.',
  },
  in_progress: {
    label: 'In Progress',
    tone: 'azure',
    desc: 'Our writers are actively drafting, restructuring, and keyword-optimizing your documents.',
  },
  quality_check: {
    label: 'Quality Check & QA',
    tone: 'aurora',
    desc: 'Your draft is undergoing comprehensive ATS evaluation, readability audit, and QA proofreading.',
  },
  completed: {
    label: 'Completed & Delivered',
    tone: 'success',
    desc: 'Your professional Resume and CV are finalized and available for instant download below.',
  },
  rejected: {
    label: 'On Hold / Rejected',
    tone: 'danger',
    desc: 'This order was placed on hold. Please check the notes or reach out to support.',
  },
};

export default function MyResumes() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useApi(() => resumeOrderService.myOrders(), []);
  const orders = data || [];

  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState(null);

  return (
    <>
      <Seo
        title="My Resume Orders — DutyLaunch"
        description="Track your handcrafted resume and CV orders, view real-time progress, and download completed documents."
      />

      <PanelHeader
        title="My Resume Orders"
        description="Track the real-time status of your bespoke resume and CV orders handcrafted by executive career specialists."
        actions={
          <Button to="/resume-builder" size="sm">
            Order New Resume Package
          </Button>
        }
      />

      {loading && <LoadingBlock label="Loading your resume orders..." />}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {!loading && !error && orders.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No Resume Orders Yet"
          description="You haven't ordered a handcrafted resume package yet. Choose an experience-based tier and have certified career specialists craft your next CV."
          action={
            <Button to="/resume-builder">
              Explore Resume Packages
            </Button>
          }
        />
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-8 pb-12">
          {/* Transparency Callout */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 p-4 text-small text-amber-900 shadow-sm backdrop-blur-sm">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <strong>Notice:</strong> This ATS Score is generated using DutyLaunch's internal evaluation system. It
                is intended only as a reference based on our internal scoring methodology. It is NOT a universal ATS
                score.
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const hasCompleted = Boolean(order.completedResume?.filename || order.completedCv?.filename);

              return (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                >
                  {/* Top Bar: Order ID, Package & Status */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-mono text-small font-extrabold text-ink">
                        {order.orderNumber}
                      </span>
                      <Badge tone={cfg.tone}>{cfg.label}</Badge>
                      <span className="text-caption text-slate-400">•</span>
                      <span className="text-caption text-slate-500">
                        Purchased {formatDate(order.purchaseDate || order.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="quiet"
                        size="xs"
                        onClick={() => setActiveInvoiceOrder(order)}
                        className="inline-flex items-center gap-1.5"
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        Invoice & Receipt
                      </Button>
                    </div>
                  </div>

                  <div className="p-6 sm:p-8 space-y-6">
                    {/* Header Details */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Package
                        </span>
                        <p className="mt-1 font-bold text-ink">{order.packageName}</p>
                        <p className="text-caption text-slate-500">{order.experienceBand}</p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Price Paid
                        </span>
                        <p className="mt-1 font-bold text-ink">
                          {formatCurrency(order.price, order.currency)}
                        </p>
                        <p className="text-caption text-emerald-600 font-semibold">Payment Confirmed</p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Turnaround SLA
                        </span>
                        <p className="mt-1 font-bold text-ink">Within a day</p>
                        <p className="text-caption text-slate-500">
                          {order.expectedDeliveryDate
                            ? `Expected: ${formatDate(order.expectedDeliveryDate)}`
                            : 'Within 2 business days'}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Completed Date
                        </span>
                        <p className="mt-1 font-bold text-ink">
                          {order.completionDate ? formatDate(order.completionDate) : 'In Progress'}
                        </p>
                        <p className="text-caption text-slate-500">
                          {hasCompleted ? 'Verified for download' : 'Active review'}
                        </p>
                      </div>
                    </div>

                    {/* Turnaround Status Notice */}
                    <div className="rounded-xl border border-azure/20 bg-frost-50/40 p-4 flex items-start gap-3">
                      <Clock className="h-5 w-5 shrink-0 text-azure mt-0.5" />
                      <div>
                        <h4 className="text-small font-bold text-ink">Live Status: {cfg.label}</h4>
                        <p className="mt-0.5 text-small text-slate-600 leading-relaxed">
                          {order.turnaroundNotice || cfg.desc}
                        </p>
                      </div>
                    </div>

                    {/* Customer Instructions */}
                    {(order.userInstructions || order.targetRole || order.targetIndustry) && (
                      <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                        <h4 className="text-small font-bold text-slate-700">Target Role & Instructions:</h4>
                        <div className="mt-2 text-small text-slate-600 space-y-1">
                          {order.targetRole && (
                            <p>
                              <strong>Target Role:</strong> {order.targetRole}
                            </p>
                          )}
                          {order.targetIndustry && (
                            <p>
                              <strong>Target Industry / Region:</strong> {order.targetIndustry}
                            </p>
                          )}
                          {order.userInstructions && (
                            <p className="italic">"{order.userInstructions}"</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Download Sections */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Original Uploaded Files */}
                      <div className="rounded-xl border border-slate-200 p-5 bg-white">
                        <h4 className="text-small font-bold text-ink flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-400" />
                          Original Files Submitted
                        </h4>
                        <div className="mt-3 space-y-2">
                          {order.originalResume?.filename ? (
                            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                              <span className="truncate text-small font-medium text-slate-700 max-w-[200px]">
                                {order.originalResume.originalname || 'Original Resume'}
                              </span>
                              <a
                                href={resumeOrderService.getFileDownloadUrl(order._id, 'original-resume')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-caption font-bold text-azure hover:underline"
                              >
                                <Download className="h-3.5 w-3.5" /> Download
                              </a>
                            </div>
                          ) : null}

                          {order.originalCv?.filename ? (
                            <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                              <span className="truncate text-small font-medium text-slate-700 max-w-[200px]">
                                {order.originalCv.originalname || 'Original CV'}
                              </span>
                              <a
                                href={resumeOrderService.getFileDownloadUrl(order._id, 'original-cv')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-caption font-bold text-azure hover:underline"
                              >
                                <Download className="h-3.5 w-3.5" /> Download
                              </a>
                            </div>
                          ) : null}

                          {!order.originalResume?.filename && !order.originalCv?.filename && (
                            <p className="text-caption text-slate-400">No original files recorded.</p>
                          )}
                        </div>
                      </div>

                      {/* Completed Files */}
                      <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-5">
                        <h4 className="text-small font-bold text-ink flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Finished Files (Verified & Ready to Apply)
                        </h4>
                        <div className="mt-3 space-y-2">
                          {order.completedResume?.filename ? (
                            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white p-3 shadow-xs">
                              <div>
                                <span className="block truncate text-small font-bold text-ink max-w-[220px]">
                                  {order.completedResume.originalname || 'Completed Professional Resume'}
                                </span>
                                <span className="text-[11px] text-emerald-700 font-semibold">
                                  Ready to apply • ATS-checked
                                </span>
                              </div>
                              <a
                                href={resumeOrderService.getFileDownloadUrl(order._id, 'completed-resume')}
                                download
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-caption font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                              >
                                <Download className="h-3.5 w-3.5" /> Download
                              </a>
                            </div>
                          ) : null}

                          {order.completedCv?.filename ? (
                            <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white p-3 shadow-xs">
                              <div>
                                <span className="block truncate text-small font-bold text-ink max-w-[220px]">
                                  {order.completedCv.originalname || 'Completed Professional CV'}
                                </span>
                                <span className="text-[11px] text-emerald-700 font-semibold">
                                  Ready to apply • ATS-checked
                                </span>
                              </div>
                              <a
                                href={resumeOrderService.getFileDownloadUrl(order._id, 'completed-cv')}
                                download
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-caption font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                              >
                                <Download className="h-3.5 w-3.5" /> Download
                              </a>
                            </div>
                          ) : null}

                          {!order.completedResume?.filename && !order.completedCv?.filename && (
                            <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-center">
                              <p className="text-small font-medium text-slate-600">
                                Files are being crafted by our team
                              </p>
                              <p className="mt-1 text-caption text-slate-400">
                                You will receive an email and notification as soon as your completed files are ready
                                for download.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="border-t border-slate-100 pt-6">
                      <h4 className="text-small font-bold text-slate-700 mb-4 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        Activity Timeline
                      </h4>

                      <div className="relative pl-6 space-y-4 before:absolute before:bottom-2 before:top-2 before:left-2 before:w-0.5 before:bg-slate-200">
                        {(order.timeline || [])
                          .filter((t) => t.isCustomerVisible !== false)
                          .map((event, idx) => (
                            <div key={idx} className="relative">
                              <span className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-azure ring-2 ring-azure/20" />
                              <div className="flex flex-wrap items-baseline gap-2">
                                <span className="text-small font-bold text-ink">{event.title}</span>
                                <span className="text-caption text-slate-400">
                                  {formatDate(event.timestamp)}
                                </span>
                              </div>
                              {event.description && (
                                <p className="mt-0.5 text-caption text-slate-600 leading-relaxed">
                                  {event.description}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {activeInvoiceOrder && (
        <Modal
          isOpen={Boolean(activeInvoiceOrder)}
          onClose={() => setActiveInvoiceOrder(null)}
          title={`Tax Invoice & Receipt — ${activeInvoiceOrder.orderNumber}`}
        >
          <div className="space-y-6 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-h3 font-extrabold text-ink">DutyLaunch</h3>
                <p className="text-caption text-slate-500">Official Tax Receipt</p>
              </div>
              <Badge tone="success">Payment Verified</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-small">
              <div>
                <p className="text-caption text-slate-400">Order Number</p>
                <p className="font-mono font-bold text-ink">{activeInvoiceOrder.orderNumber}</p>
              </div>
              <div>
                <p className="text-caption text-slate-400">Date of Purchase</p>
                <p className="font-medium text-ink">
                  {formatDate(activeInvoiceOrder.purchaseDate || activeInvoiceOrder.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-caption text-slate-400">Candidate Name</p>
                <p className="font-medium text-ink">{activeInvoiceOrder.user?.name || user?.name}</p>
              </div>
              <div>
                <p className="text-caption text-slate-400">Email</p>
                <p className="font-medium text-ink">{activeInvoiceOrder.user?.email || user?.email}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between font-bold text-ink mb-2">
                <span>Description</span>
                <span>Amount</span>
              </div>
              <div className="flex items-center justify-between text-small text-slate-700 py-1 border-t border-slate-200">
                <span>
                  {activeInvoiceOrder.packageName} ({activeInvoiceOrder.experienceBand})
                </span>
                <span>{formatCurrency(activeInvoiceOrder.price, activeInvoiceOrder.currency)}</span>
              </div>
              <div className="flex items-center justify-between text-caption text-slate-500 py-1">
                <span>18% GST (Included or Added at Checkout)</span>
                <span>Paid</span>
              </div>
              <div className="flex items-center justify-between font-extrabold text-ink pt-2 border-t border-slate-200 mt-2">
                <span>Total Amount Paid</span>
                <span>{formatCurrency(activeInvoiceOrder.price, activeInvoiceOrder.currency)}</span>
              </div>
            </div>

            <div className="text-caption text-slate-400 leading-relaxed">
              This digital invoice serves as official confirmation of your purchase of bespoke resume drafting services
              from DutyLaunch. All services are backed by 1 month of unlimited revisions.
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setActiveInvoiceOrder(null)}>Close Receipt</Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
