import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Upload,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Plus,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Calendar,
  X,
  FileCheck2,
} from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { Seo } from '../../components/ui/Seo.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { LoadingBlock, ErrorState, EmptyState } from '../../components/ui/States.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { resumeOrderService } from '../../services/resumeOrderService.js';
import { formatCurrency, formatDate } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

const TABS = [
  { id: 'all', label: 'All Requests' },
  { id: 'pending', label: 'Pending' },
  { id: 'assigned', label: 'Assigned' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'quality_check', label: 'Quality Check' },
  { id: 'completed', label: 'Completed' },
  { id: 'rejected', label: 'Rejected / On Hold' },
];

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'quality_check', label: 'Quality Check' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

export default function AdminResumeOrders() {
  const toast = useToast();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    assigned: 0,
    in_progress: 0,
    quality_check: 0,
    completed: 0,
    rejected: 0,
  });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Selected Order for Management Drawer/Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Modal actions state
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [assigningStaff, setAssigningStaff] = useState(false);

  const [internalNoteText, setInternalNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const [completedResumeFile, setCompletedResumeFile] = useState(null);
  const [completedCvFile, setCompletedCvFile] = useState(null);
  const [completedNote, setCompletedNote] = useState('');
  const [uploadingCompleted, setUploadingCompleted] = useState(false);

  const [customerUpdateText, setCustomerUpdateText] = useState('');
  const [updateType, setUpdateType] = useState('status'); // 'status' | 'info_required'
  const [sendingUpdate, setSendingUpdate] = useState(false);

  // File replacement modal
  const [replaceTargetType, setReplaceTargetType] = useState('');
  const [replacementFile, setReplacementFile] = useState(null);
  const [replacementNote, setReplacementNote] = useState('');
  const [replacingFile, setReplacingFile] = useState(false);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const res = await resumeOrderService.adminList({
        status: activeTab,
        q: searchQuery.trim() || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 20,
      });
      setOrders(res.data || []);
      if (res.meta) setPagination(res.meta);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      setError(err.message || 'Could not load orders.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [activeTab, sortBy, sortOrder, page]);

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  }

  async function openOrderDetail(order) {
    setLoadingDetail(true);
    try {
      const res = await resumeOrderService.adminGet(order._id);
      setSelectedOrder(res.data);
      setNewStatus(res.data.status);
      setStaffName(res.data.assignedStaff?.name || '');
      setStaffEmail(res.data.assignedStaff?.email || '');
    } catch (err) {
      toast.error('Failed to load order details.');
    } finally {
      setLoadingDetail(false);
    }
  }

  async function handleStatusChange(e) {
    e.preventDefault();
    if (!newStatus || !selectedOrder) return;
    setUpdatingStatus(true);
    try {
      const res = await resumeOrderService.adminUpdateStatus(selectedOrder._id, {
        status: newStatus,
        note: statusNote.trim() || undefined,
      });
      toast.success(`Status updated to ${newStatus}`);
      setSelectedOrder(res.data);
      setStatusNote('');
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Could not update status.');
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleAssignStaff(e) {
    e.preventDefault();
    if (!staffName.trim() || !selectedOrder) return;
    setAssigningStaff(true);
    try {
      const res = await resumeOrderService.adminAssignStaff(selectedOrder._id, {
        staffName: staffName.trim(),
        staffEmail: staffEmail.trim() || undefined,
      });
      toast.success(`Staff assigned: ${staffName}`);
      setSelectedOrder(res.data);
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Could not assign staff.');
    } finally {
      setAssigningStaff(false);
    }
  }

  async function handleAddInternalNote(e) {
    e.preventDefault();
    if (!internalNoteText.trim() || !selectedOrder) return;
    setAddingNote(true);
    try {
      const res = await resumeOrderService.adminAddNote(selectedOrder._id, internalNoteText.trim());
      toast.success('Internal note added.');
      setSelectedOrder((prev) => ({ ...prev, internalNotes: res.data }));
      setInternalNoteText('');
    } catch (err) {
      toast.error(err.message || 'Could not add note.');
    } finally {
      setAddingNote(false);
    }
  }

  async function handleUploadCompletedFiles(e) {
    e.preventDefault();
    if (!completedResumeFile && !completedCvFile) {
      toast.error('Attach at least one completed file (Resume or CV).');
      return;
    }
    setUploadingCompleted(true);
    try {
      const formData = new FormData();
      if (completedResumeFile) formData.append('completedResume', completedResumeFile);
      if (completedCvFile) formData.append('completedCv', completedCvFile);
      formData.append('note', completedNote.trim() || 'Completed resume uploaded by admin');
      formData.append('markCompleted', 'true');

      const res = await resumeOrderService.adminUploadCompleted(selectedOrder._id, formData);
      toast.success('Completed files delivered successfully! Status marked as Completed.');
      setSelectedOrder(res.data);
      setCompletedResumeFile(null);
      setCompletedCvFile(null);
      setCompletedNote('');
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Could not upload completed files.');
    } finally {
      setUploadingCompleted(false);
    }
  }

  async function handleReplaceFile(e) {
    e.preventDefault();
    if (!replacementFile || !replaceTargetType || !selectedOrder) return;
    setReplacingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', replacementFile);
      formData.append('fileType', replaceTargetType);
      formData.append('note', replacementNote.trim() || 'File replaced by admin');

      const res = await resumeOrderService.adminReplaceFile(selectedOrder._id, formData);
      toast.success('File replaced and version archived.');
      setSelectedOrder(res.data);
      setReplaceTargetType('');
      setReplacementFile(null);
      setReplacementNote('');
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Could not replace file.');
    } finally {
      setReplacingFile(false);
    }
  }

  async function handleSendCustomerUpdate(e) {
    e.preventDefault();
    if (!customerUpdateText.trim() || !selectedOrder) return;
    setSendingUpdate(true);
    try {
      const res = await resumeOrderService.adminSendUpdate(selectedOrder._id, {
        message: customerUpdateText.trim(),
        type: updateType,
      });
      toast.success('Customer update notification and email sent.');
      setSelectedOrder(res.data);
      setCustomerUpdateText('');
    } catch (err) {
      toast.error(err.message || 'Could not send update.');
    } finally {
      setSendingUpdate(false);
    }
  }

  return (
    <>
      <Seo title="Resume Build Management — DutyLaunch Admin" noIndex />

      <PanelHeader
        title="Resume Build Management"
        description="Review incoming customer resume and CV requests, assign career writers, update build milestones, and deliver completed files."
        actions={
          <Button variant="outline" size="sm" onClick={fetchOrders} className="inline-flex items-center gap-1.5">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
        }
      />

      {/* Top Stats Overview */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 mb-8">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Requests</p>
          <p className="mt-1 text-h2 font-black text-ink">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Pending</p>
          <p className="mt-1 text-h2 font-black text-amber-900">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-sky-200/80 bg-sky-50/50 p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-sky-700">Assigned</p>
          <p className="mt-1 text-h2 font-black text-sky-900">{stats.assigned}</p>
        </div>
        <div className="rounded-xl border border-blue-200/80 bg-blue-50/50 p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-blue-700">In Progress</p>
          <p className="mt-1 text-h2 font-black text-blue-900">{stats.in_progress}</p>
        </div>
        <div className="rounded-xl border border-purple-200/80 bg-purple-50/50 p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Quality Check</p>
          <p className="mt-1 text-h2 font-black text-purple-900">{stats.quality_check}</p>
        </div>
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Completed</p>
          <p className="mt-1 text-h2 font-black text-emerald-900">{stats.completed}</p>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2 sm:border-0 sm:pb-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(1);
              }}
              className={cn(
                'rounded-lg px-3.5 py-1.5 text-small font-semibold transition-colors',
                activeTab === tab.id
                  ? 'bg-azure text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-ink'
              )}
            >
              {tab.label}
              {tab.id !== 'all' && stats[tab.id] !== undefined && (
                <span
                  className={cn(
                    'ml-1.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                    activeTab === tab.id ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                  )}
                >
                  {stats[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Order #, name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 rounded-lg border border-slate-300 pl-9 pr-3 py-1.5 text-small text-ink focus:border-azure focus:outline-none focus:ring-1 focus:ring-azure sm:w-64"
            />
          </div>
          <Button type="submit" size="sm" variant="outline">
            Search
          </Button>
        </form>
      </div>

      {/* Main Orders Table */}
      {loading && <LoadingBlock label="Loading requests..." />}
      {error && <ErrorState error={error} onRetry={fetchOrders} />}

      {!loading && !error && orders.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No Resume Requests Found"
          description={
            activeTab !== 'all'
              ? `There are currently no orders in status "${activeTab}".`
              : 'No resume build requests have been submitted yet.'
          }
        />
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-xs">
            <table className="w-full text-left border-collapse text-small">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-caption font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Order #</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Package & Price</th>
                  <th className="py-3.5 px-4">Purchase Date</th>
                  <th className="py-3.5 px-4">Target Delivery</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Staff</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => {
                  const tone =
                    o.status === 'completed'
                      ? 'success'
                      : o.status === 'in_progress'
                      ? 'azure'
                      : o.status === 'quality_check'
                      ? 'aurora'
                      : o.status === 'assigned'
                      ? 'frost'
                      : o.status === 'rejected'
                      ? 'danger'
                      : 'amber';

                  return (
                    <tr key={o._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-ink">
                        {o.orderNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-ink">{o.user?.name || 'Customer'}</div>
                        <div className="text-caption text-slate-500">{o.user?.email || 'No email'}</div>
                        {o.user?.phone && (
                          <div className="text-caption text-slate-400">{o.user.phone}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-ink">{o.packageName}</div>
                        <div className="text-caption font-semibold text-emerald-700">
                          {formatCurrency(o.price, o.currency)} • Paid
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDate(o.purchaseDate || o.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {o.expectedDeliveryDate ? formatDate(o.expectedDeliveryDate) : '24-48 hrs'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge tone={tone}>{o.status.replace('_', ' ').toUpperCase()}</Badge>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {o.assignedStaff?.name ? (
                          <span className="inline-flex items-center gap-1 font-medium text-slate-800">
                            <UserCheck className="h-3.5 w-3.5 text-azure" />
                            {o.assignedStaff.name}
                          </span>
                        ) : (
                          <span className="text-caption text-slate-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => openOrderDetail(o)}
                          className="inline-flex items-center gap-1"
                        >
                          Manage <ChevronRight className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <span className="text-caption text-slate-500">
                Showing page {pagination.page} of {pagination.pages} ({pagination.total} total orders)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="xs"
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed Order Management Modal */}
      {selectedOrder && (
        <Modal
          isOpen={Boolean(selectedOrder)}
          onClose={() => setSelectedOrder(null)}
          title={`Manage Resume Build Order — ${selectedOrder.orderNumber}`}
          className="max-w-4xl"
        >
          <div className="space-y-8 max-h-[80vh] overflow-y-auto pr-1 text-slate-800">
            {/* Top Bar: Customer & Package Summary */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-5 grid gap-4 sm:grid-cols-3">
              <div>
                <span className="text-caption font-bold text-slate-400 uppercase">Customer Details</span>
                <p className="mt-1 font-bold text-ink">{selectedOrder.user?.name}</p>
                <p className="text-small text-slate-600 flex items-center gap-1 mt-0.5">
                  <Mail className="h-3.5 w-3.5" /> {selectedOrder.user?.email}
                </p>
                {selectedOrder.user?.phone && (
                  <p className="text-small text-slate-600 flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" /> {selectedOrder.user.phone}
                  </p>
                )}
              </div>

              <div>
                <span className="text-caption font-bold text-slate-400 uppercase">Package & Payment</span>
                <p className="mt-1 font-bold text-ink">{selectedOrder.packageName}</p>
                <p className="text-small text-slate-600">{selectedOrder.experienceBand}</p>
                <p className="text-small font-bold text-emerald-700 mt-1">
                  {formatCurrency(selectedOrder.price, selectedOrder.currency)} • Payment Verified
                </p>
              </div>

              <div>
                <span className="text-caption font-bold text-slate-400 uppercase">Current Milestone</span>
                <div className="mt-1">
                  <Badge tone={selectedOrder.status === 'completed' ? 'success' : 'azure'}>
                    {selectedOrder.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <p className="mt-1 text-caption text-slate-500">
                  Target: {selectedOrder.expectedDeliveryDate ? formatDate(selectedOrder.expectedDeliveryDate) : '24-48 hrs'}
                </p>
              </div>
            </div>

            {/* Customer Provided Instructions & Role */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h4 className="text-small font-bold text-ink mb-2">Customer Requirements & Instructions</h4>
              <div className="grid gap-4 sm:grid-cols-2 text-small">
                <div>
                  <span className="text-caption font-semibold text-slate-400">Target Role:</span>
                  <p className="font-medium text-slate-700">{selectedOrder.targetRole || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-caption font-semibold text-slate-400">Target Industry / Region:</span>
                  <p className="font-medium text-slate-700">{selectedOrder.targetIndustry || 'Not specified'}</p>
                </div>
              </div>
              {selectedOrder.userInstructions && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-caption font-semibold text-slate-400">Candidate Instructions:</span>
                  <p className="mt-1 text-small italic text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    "{selectedOrder.userInstructions}"
                  </p>
                </div>
              )}
            </div>

            {/* Uploaded Documents & Secure Download Buttons */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Original Files */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h4 className="text-small font-bold text-ink mb-3 flex items-center justify-between">
                  <span>Customer Uploaded Files</span>
                </h4>
                <div className="space-y-3">
                  {selectedOrder.originalResume?.filename ? (
                    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="truncate max-w-[200px]">
                        <span className="block truncate text-small font-bold text-slate-800">
                          {selectedOrder.originalResume.originalname || 'Original Resume'}
                        </span>
                        <span className="text-[11px] text-slate-400">PDF/Word Document</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={resumeOrderService.getFileDownloadUrl(selectedOrder._id, 'original-resume')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-azure/10 px-2.5 py-1 text-caption font-bold text-azure hover:bg-azure/20"
                        >
                          <Download className="h-3 w-3" /> Download
                        </a>
                        <button
                          type="button"
                          onClick={() => setReplaceTargetType('original_resume')}
                          className="text-[11px] text-slate-500 hover:text-slate-700 underline"
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-caption text-slate-400 italic">No original resume uploaded.</p>
                  )}

                  {selectedOrder.originalCv?.filename ? (
                    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3">
                      <div className="truncate max-w-[200px]">
                        <span className="block truncate text-small font-bold text-slate-800">
                          {selectedOrder.originalCv.originalname || 'Original CV'}
                        </span>
                        <span className="text-[11px] text-slate-400">PDF/Word Document</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={resumeOrderService.getFileDownloadUrl(selectedOrder._id, 'original-cv')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-azure/10 px-2.5 py-1 text-caption font-bold text-azure hover:bg-azure/20"
                        >
                          <Download className="h-3 w-3" /> Download
                        </a>
                        <button
                          type="button"
                          onClick={() => setReplaceTargetType('original_cv')}
                          className="text-[11px] text-slate-500 hover:text-slate-700 underline"
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Completed Files Upload & Delivery */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 p-5">
                <h4 className="text-small font-bold text-ink mb-3">Completed Finished Deliverables</h4>
                <div className="space-y-3">
                  {selectedOrder.completedResume?.filename ? (
                    <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white p-3">
                      <div className="truncate max-w-[200px]">
                        <span className="block truncate text-small font-bold text-ink">
                          {selectedOrder.completedResume.originalname || 'Final Resume'}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold">Ready for Candidate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={resumeOrderService.getFileDownloadUrl(selectedOrder._id, 'completed-resume')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-caption font-bold text-white shadow-xs hover:bg-emerald-700"
                        >
                          <Download className="h-3 w-3" /> Download
                        </a>
                        <button
                          type="button"
                          onClick={() => setReplaceTargetType('completed_resume')}
                          className="text-[11px] text-slate-500 hover:text-slate-700 underline"
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {selectedOrder.completedCv?.filename ? (
                    <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white p-3">
                      <div className="truncate max-w-[200px]">
                        <span className="block truncate text-small font-bold text-ink">
                          {selectedOrder.completedCv.originalname || 'Final CV'}
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold">Ready for Candidate</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={resumeOrderService.getFileDownloadUrl(selectedOrder._id, 'completed-cv')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-caption font-bold text-white shadow-xs hover:bg-emerald-700"
                        >
                          <Download className="h-3 w-3" /> Download
                        </a>
                        <button
                          type="button"
                          onClick={() => setReplaceTargetType('completed_cv')}
                          className="text-[11px] text-slate-500 hover:text-slate-700 underline"
                        >
                          Replace
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Upload Form for final deliverables */}
                  <form onSubmit={handleUploadCompletedFiles} className="pt-2 border-t border-emerald-100 space-y-2">
                    <p className="text-caption font-bold text-emerald-900">Upload Final Completed Files:</p>
                    <div className="grid gap-2 sm:grid-cols-2 text-caption">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Final Resume (PDF/Word)</label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setCompletedResumeFile(e.target.files?.[0] || null)}
                          className="w-full text-[11px] mt-1"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Final CV (PDF/Word)</label>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setCompletedCvFile(e.target.files?.[0] || null)}
                          className="w-full text-[11px] mt-1"
                        />
                      </div>
                    </div>
                    <Button size="xs" type="submit" loading={uploadingCompleted} className="w-full mt-2">
                      Upload & Deliver Completed Files
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            {/* Admin Actions: Status & Staff Assignment */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Change Status */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h4 className="text-small font-bold text-ink mb-3">Change Request Status</h4>
                <form onSubmit={handleStatusChange} className="space-y-3">
                  <div>
                    <label className="block text-caption font-semibold text-slate-500 mb-1">New Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-small text-ink focus:border-azure focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-slate-500 mb-1">Note (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Quality check completed, passed ATS audit"
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-small text-ink focus:border-azure focus:outline-none"
                    />
                  </div>
                  <Button size="sm" type="submit" loading={updatingStatus} className="w-full">
                    Update Status & Notify Candidate
                  </Button>
                </form>
              </div>

              {/* Assign Staff */}
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h4 className="text-small font-bold text-ink mb-3">Assign Career Specialist</h4>
                <form onSubmit={handleAssignStaff} className="space-y-3">
                  <div>
                    <label className="block text-caption font-semibold text-slate-500 mb-1">Specialist Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Priya Sharma / Lead Resume Writer"
                      value={staffName}
                      onChange={(e) => setStaffName(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-small text-ink focus:border-azure focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-caption font-semibold text-slate-500 mb-1">Staff Email</label>
                    <input
                      type="email"
                      placeholder="priya@dutylaunch.com"
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-small text-ink focus:border-azure focus:outline-none"
                    />
                  </div>
                  <Button size="sm" type="submit" loading={assigningStaff} className="w-full">
                    Save Assignment & Notify
                  </Button>
                </form>
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h4 className="text-small font-bold text-ink mb-3">Internal Notes (Visible Only to Admins)</h4>
              <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
                {(selectedOrder.internalNotes || []).map((n, idx) => (
                  <div key={idx} className="rounded-lg bg-slate-50 p-3 text-small border border-slate-100">
                    <p className="text-slate-800">{n.note}</p>
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{n.createdByName || 'Admin'}</span>
                      <span>•</span>
                      <span>{formatDate(n.createdAt)}</span>
                    </div>
                  </div>
                ))}
                {(!selectedOrder.internalNotes || selectedOrder.internalNotes.length === 0) && (
                  <p className="text-caption text-slate-400 italic">No internal notes added yet.</p>
                )}
              </div>

              <form onSubmit={handleAddInternalNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add an internal note for team..."
                  value={internalNoteText}
                  onChange={(e) => setInternalNoteText(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-small text-ink focus:border-azure focus:outline-none"
                />
                <Button size="sm" type="submit" loading={addingNote}>
                  Add Note
                </Button>
              </form>
            </div>

            {/* Send Candidate Update */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h4 className="text-small font-bold text-ink mb-2">Send Candidate Update / Request Information</h4>
              <form onSubmit={handleSendCustomerUpdate} className="space-y-3">
                <div className="flex gap-4 text-small">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="updateType"
                      value="status"
                      checked={updateType === 'status'}
                      onChange={() => setUpdateType('status')}
                    />
                    General Progress Update
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="updateType"
                      value="info_required"
                      checked={updateType === 'info_required'}
                      onChange={() => setUpdateType('info_required')}
                    />
                    Action Required: Request Details from Candidate
                  </label>
                </div>
                <textarea
                  rows={3}
                  placeholder="Enter message to email and notify customer directly..."
                  value={customerUpdateText}
                  onChange={(e) => setCustomerUpdateText(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-small text-ink focus:border-azure focus:outline-none"
                />
                <Button size="sm" type="submit" loading={sendingUpdate} className="inline-flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Send Update
                </Button>
              </form>
            </div>

            {/* Activity Timeline */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h4 className="text-small font-bold text-ink mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-400" /> Activity Timeline & Audit Trail
              </h4>
              <div className="relative pl-6 space-y-4 before:absolute before:bottom-2 before:top-2 before:left-2 before:w-0.5 before:bg-slate-200">
                {(selectedOrder.timeline || []).map((evt, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-azure ring-2 ring-azure/20" />
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-small font-bold text-ink">{evt.title}</span>
                      <span className="text-caption text-slate-400">{formatDate(evt.timestamp)}</span>
                      {evt.performedByName && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          by {evt.performedByName} ({evt.performedByRole || 'admin'})
                        </span>
                      )}
                    </div>
                    {evt.description && (
                      <p className="mt-0.5 text-caption text-slate-600 leading-relaxed">{evt.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Replace File Modal */}
      {replaceTargetType && (
        <Modal
          isOpen={Boolean(replaceTargetType)}
          onClose={() => setReplaceTargetType('')}
          title={`Replace File — ${replaceTargetType.replace('_', ' ').toUpperCase()}`}
        >
          <form onSubmit={handleReplaceFile} className="space-y-4 text-slate-800">
            <p className="text-small text-slate-600">
              The existing file will be archived in the order's version history. The new file will become the active
              downloadable file.
            </p>
            <div>
              <label className="block text-small font-bold text-ink mb-1">Select New File (PDF, DOC, DOCX)</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setReplacementFile(e.target.files?.[0] || null)}
                className="block w-full text-small text-slate-600"
              />
            </div>
            <div>
              <label className="block text-small font-bold text-ink mb-1">Reason for Replacement (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Corrected typo in contact info, updated formatting"
                value={replacementNote}
                onChange={(e) => setReplacementNote(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-small text-ink"
              />
            </div>
            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="quiet" onClick={() => setReplaceTargetType('')}>
                Cancel
              </Button>
              <Button type="submit" loading={replacingFile}>
                Upload Replacement
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}

