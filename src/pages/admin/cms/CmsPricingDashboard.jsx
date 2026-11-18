import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Tag,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Sparkles,
  MapPin,
  CheckCircle2,
  Clock,
  Layers,
  Settings2,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  HelpCircle,
  AlertCircle,
  Check,
  TrendingUp,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  DollarSign,
  FileText,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { PanelHeader } from '../../../layouts/AppShell.jsx';
import { StatCard } from '../../../components/admin/StatCard.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { LoadingBlock, ErrorState } from '../../../components/ui/States.jsx';
import { useToast } from '../../../context/ToastContext.jsx';
import { formatCurrency } from '../../../utils/format.js';
import { cn } from '../../../utils/cn.js';

import { cmsService } from './cmsService.js';
import { CmsTutorialTour, CMS_TUTORIAL_STORAGE_KEY } from './CmsTutorialTour.jsx';
import { CmsPackageEditorModal } from './CmsPackageEditorModal.jsx';

const CATEGORY_TABS = [
  { id: 'all', label: 'All Offerings', icon: Layers },
  { id: 'bundle', label: 'Career Bundles', icon: Sparkles },
  { id: 'cv_only', label: 'Standalone CVs', icon: FileText },
  { id: 'addon', label: 'Portfolios & Add-ons', icon: ShieldCheck },
  { id: 'subscription', label: 'Subscriptions', icon: TrendingUp },
  { id: 'service', label: 'Specialized Services', icon: Settings2 },
];

export default function CmsPricingDashboard() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState({});
  const [config, setConfig] = useState({
    gstPercentage: 18,
    turnaroundDisclaimer: '* Delivery Turnaround Guarantee: Delivery turnaround begins after candidate submits current CV and target career preferences.',
    allowDiscounts: true,
    announcementBanner: { enabled: false, text: '', linkUrl: '', badge: '' },
  });

  // UI States
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showConfigBar, setShowConfigBar] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  // Tutorial Tour State
  const [showTutorial, setShowTutorial] = useState(false);

  // Package Editor Modal State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isSavingItem, setIsSavingItem] = useState(false);

  // Delete Confirmation State
  const [deletingId, setDeletingId] = useState(null);

  // Load CMS Data
  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const res = await cmsService.getAdminPricing();
      const payload = res?.data ?? res;
      if (payload) {
        setItems(payload.items || []);
        setConfig(payload.config || {});
        setStats(payload.stats || {});
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to load CMS pricing data');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();

    // Check if first-time visitor needs tutorial tour
    try {
      const completed = localStorage.getItem(CMS_TUTORIAL_STORAGE_KEY);
      if (!completed) {
        setShowTutorial(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Filter items by category, search query, and status
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (activeTab !== 'all' && item.category !== activeTab) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name?.toLowerCase().includes(query);
        const matchesKey = item.key?.toLowerCase().includes(query);
        const matchesTagline = item.tagline?.toLowerCase().includes(query);
        const matchesDeliverable = item.deliverables?.some((d) => d.label.toLowerCase().includes(query));
        const matchesSurface = item.affectsSurfaces?.some((s) => s.toLowerCase().includes(query));
        return matchesName || matchesKey || matchesTagline || matchesDeliverable || matchesSurface;
      }
      return true;
    });
  }, [items, activeTab, statusFilter, searchQuery]);

  // Handle Save (Create or Update)
  async function handleSaveItem(formData) {
    try {
      setIsSavingItem(true);
      if (editingItem?._id) {
        const res = await cmsService.updateItem(editingItem._id, formData);
        const saved = res?.data ?? res;
        toast.show({
          title: 'Offering Updated',
          message: `Successfully updated "${formData.name}". Changes propagated live!`,
          tone: 'success',
        });
        setItems((prev) => prev.map((item) => (item._id === editingItem._id ? saved : item)));
      } else {
        const res = await cmsService.createItem(formData);
        const created = res?.data ?? res;
        toast.show({
          title: 'Offering Created',
          message: `Successfully created "${formData.name}". Now live in CMS!`,
          tone: 'success',
        });
        setItems((prev) => [created, ...prev]);
      }
      setEditorOpen(false);
      setEditingItem(null);
    } catch (err) {
      toast.show({
        title: 'Error Saving Offering',
        message: err?.response?.data?.message || err.message || 'Could not save offering.',
        tone: 'danger',
      });
    } finally {
      setIsSavingItem(false);
    }
  }

  // Quick toggle item status (published <-> draft)
  async function handleToggleStatus(item) {
    const newStatus = item.status === 'published' ? 'draft' : 'published';
    try {
      await cmsService.updateItem(item._id, { status: newStatus });
      setItems((prev) =>
        prev.map((i) => (i._id === item._id ? { ...i, status: newStatus } : i))
      );
      toast.show({
        title: newStatus === 'published' ? 'Offering Published' : 'Offering Unpublished',
        message: `"${item.name}" is now ${newStatus === 'published' ? 'visible to all candidates' : 'hidden in draft'}.`,
        tone: 'info',
      });
    } catch (err) {
      toast.show({
        title: 'Status Update Failed',
        message: err?.response?.data?.message || err.message,
        tone: 'danger',
      });
    }
  }

  // Handle Delete Offering
  async function handleDeleteItem(id, name) {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This removes it permanently.`)) {
      return;
    }
    try {
      setDeletingId(id);
      await cmsService.deleteItem(id);
      setItems((prev) => prev.filter((i) => i._id !== id));
      toast.show({
        title: 'Offering Removed',
        message: `"${name}" was deleted from the pricing catalog.`,
        tone: 'success',
      });
    } catch (err) {
      toast.show({
        title: 'Delete Failed',
        message: err?.response?.data?.message || err.message,
        tone: 'danger',
      });
    } finally {
      setDeletingId(null);
    }
  }

  // Handle Save Global Config
  async function handleSaveGlobalConfig(e) {
    e.preventDefault();
    try {
      setSavingConfig(true);
      const res = await cmsService.updateGlobalConfig(config);
      const savedConfig = res?.data ?? res;
      setConfig(savedConfig);
      toast.show({
        title: 'Global Settings Updated',
        message: 'GST rate, turnaround SLA disclaimer, and announcement banner saved.',
        tone: 'success',
      });
    } catch (err) {
      toast.show({
        title: 'Failed to Save Settings',
        message: err?.response?.data?.message || err.message,
        tone: 'danger',
      });
    } finally {
      setSavingConfig(false);
    }
  }

  // Reset all to defaults
  async function handleResetDefaults() {
    if (
      !window.confirm(
        'Warning: This will reset all packages, add-ons, pricing, and settings to original DutyLaunch defaults. Continue?'
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      await cmsService.resetDefaults();
      toast.show({
        title: 'Catalog Reset',
        message: 'All offerings reset to official DutyLaunch published standards.',
        tone: 'success',
      });
      await loadData();
    } catch (err) {
      toast.show({
        title: 'Reset Failed',
        message: err?.response?.data?.message || err.message,
        tone: 'danger',
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading && !items.length) {
    return <LoadingBlock label="Loading Pricing & Services CMS Hub..." />;
  }

  if (error && !items.length) {
    return <ErrorState error={error} onRetry={loadData} />;
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-line pb-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-ink tracking-tight">
              Pricing & Offerings CMS
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-azure-200 bg-azure-50/90 px-2.5 py-0.5 text-xs font-semibold text-azure-700 shrink-0 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Dynamic Hub
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-2xl">
            Centrally manage all packages, price hikes, discount strikethroughs, deliverables, and track live surface impact.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Tutorial Tour Trigger Button */}
          <Button
            data-tour="guide-button"
            variant="secondary"
            size="sm"
            onClick={() => setShowTutorial(true)}
            className="border-azure-200 bg-azure-50/70 text-azure-700 hover:bg-azure-100 font-semibold"
            title="Open Interactive CMS Walkthrough"
          >
            <HelpCircle className="mr-1.5 h-4 w-4 text-azure-600" />
            CMS Guide
          </Button>

          {/* Reset Defaults */}
          <Button
            data-tour="reset-button"
            variant="secondary"
            size="sm"
            onClick={handleResetDefaults}
            title="Reset catalog to official DutyLaunch standards"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Reset Defaults
          </Button>

          {/* Create New Offering */}
          <Button
            data-tour="add-button"
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingItem(null);
              setEditorOpen(true);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add New Offering
          </Button>
        </div>
      </div>

      {/* Surface Impact Live Navigation Bar */}
      <div
        data-tour="surfaces-bar"
        className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-slate-900 to-indigo-950 p-3 sm:p-3.5 text-white shadow-sm"
      >
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold tracking-wide truncate sm:whitespace-normal">
            Verified Live Website Surfaces Affected by this CMS:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
          <Link
            to="/resume-service"
            target="_blank"
            className="flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 hover:bg-white/20 transition-colors"
          >
            <span>/resume-service</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
          <Link
            to="/pricing"
            target="_blank"
            className="flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 hover:bg-white/20 transition-colors"
          >
            <span>/pricing</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
          <Link
            to="/resume-builder"
            target="_blank"
            className="flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 hover:bg-white/20 transition-colors"
          >
            <span>/resume-builder</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
          <Link
            to="/admin/resume-orders"
            className="flex items-center gap-1 rounded bg-azure-500/30 px-2.5 py-1 hover:bg-azure-500/50 transition-colors text-azure-200"
          >
            <span>Admin Resume Orders</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Row: 2-col on mobile, 3-col on tablet/laptop, 6-col on large desktop */}
      <div data-tour="kpi-stats" className="mt-5 grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-xs min-w-0 flex flex-col justify-between">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 leading-tight min-h-[1.75rem] flex items-center">
            Total Offerings
          </p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 truncate">{stats.totalItems || items.length}</p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">{stats.publishedItems ?? items.filter(i => i.status === 'published').length} published</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-xs min-w-0 flex flex-col justify-between">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 leading-tight min-h-[1.75rem] flex items-center">
            Career Bundles
          </p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-azure-600 truncate">
            {items.filter((i) => i.category === 'bundle').length}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">CV + Cover + LinkedIn</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-xs min-w-0 flex flex-col justify-between">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 leading-tight min-h-[1.75rem] flex items-center">
            Standalone CVs
          </p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-indigo-600 truncate">
            {items.filter((i) => i.category === 'cv_only').length}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Entry to Executive</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-xs min-w-0 flex flex-col justify-between">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 leading-tight min-h-[1.75rem] flex items-center">
            Portfolios & Add-ons
          </p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-emerald-600 truncate">
            {items.filter((i) => i.category === 'addon').length}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Visual & Web Decks</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-xs min-w-0 flex flex-col justify-between">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 leading-tight min-h-[1.75rem] flex items-center">
            Subscriptions
          </p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-purple-600 truncate">
            {items.filter((i) => i.category === 'subscription').length}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Platform Access Tiers</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-3 sm:p-3.5 shadow-xs min-w-0 flex flex-col justify-between">
          <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-400 leading-tight min-h-[1.75rem] flex items-center">
            Avg Selling Price
          </p>
          <p className="mt-1 text-xl sm:text-2xl font-black text-slate-900 truncate">
            {formatCurrency(stats.averagePrice || 799)}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">Across active catalog</p>
        </div>
      </div>

      {/* Global Platform Settings Accordion / Bar */}
      <div data-tour="global-settings" className="mt-5 rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowConfigBar(!showConfigBar)}
          className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-2 px-4 sm:px-5 py-3 sm:py-3.5 text-left bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Settings2 className="h-4 w-4 text-azure-600 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 truncate sm:whitespace-normal">
              Global Platform Settings (GST Rate, SLA Footnote & Announcement Banner)
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500">
              GST: <strong className="text-slate-800">{config.gstPercentage ?? 18}%</strong>
            </span>
            {showConfigBar ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
          </div>
        </button>

        {showConfigBar && (
          <form onSubmit={handleSaveGlobalConfig} className="p-5 border-t border-slate-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tax Rate (GST %)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={config.gstPercentage ?? 18}
                    onChange={(e) => setConfig({ ...config, gstPercentage: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-azure-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2 text-sm text-slate-400">%</span>
                </div>
                <span className="text-[11px] text-slate-400">Computed on Razorpay tax invoices</span>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Turnaround SLA Footnote Disclaimer (Guaranteed Delivery Policy)
                </label>
                <input
                  type="text"
                  value={config.turnaroundDisclaimer || ''}
                  onChange={(e) => setConfig({ ...config, turnaroundDisclaimer: e.target.value })}
                  placeholder="* Delivery Turnaround Guarantee: Delivery turnaround begins after candidate submits current CV and target career preferences."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-azure-500 focus:outline-none"
                />
                <span className="text-[11px] text-slate-400">Displays wherever delivery days are accompanied by *</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="bannerEnabled"
                  checked={config.announcementBanner?.enabled || false}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      announcementBanner: { ...config.announcementBanner, enabled: e.target.checked },
                    })
                  }
                  className="h-4 w-4 rounded border-slate-300 text-azure-600 focus:ring-azure-500"
                />
                <label htmlFor="bannerEnabled" className="text-xs font-semibold text-slate-700">
                  Enable Site-wide Announcement Banner
                </label>
              </div>

              <div>
                <input
                  type="text"
                  value={config.announcementBanner?.text || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      announcementBanner: { ...config.announcementBanner, text: e.target.value },
                    })
                  }
                  placeholder="Banner announcement message..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-azure-500 focus:outline-none"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={config.announcementBanner?.linkUrl || ''}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      announcementBanner: { ...config.announcementBanner, linkUrl: e.target.value },
                    })
                  }
                  placeholder="Banner link URL (e.g. /resume-service)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-azure-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" size="sm" disabled={savingConfig}>
                {savingConfig ? 'Saving Settings...' : 'Save Global Settings'}
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Category Tabs: Horizontally scrollable on mobile with scrollbar hidden, wrapping on tablet/desktop */}
      <div
        data-tour="category-tabs"
        className="mt-6 flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2.5 border-b border-slate-200 scrollbar-none sm:flex-wrap"
      >
        {CATEGORY_TABS.map((tab) => {
          const TabIcon = tab.icon;
          const count =
            tab.id === 'all' ? items.length : items.filter((i) => i.category === tab.id).length;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 sm:gap-2 shrink-0 rounded-lg px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs font-semibold transition-all',
                isActive
                  ? 'bg-azure-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <TabIcon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div data-tour="search-bar" className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search offerings by name, slug, feature or affected surface..."
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-azure-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div data-tour="status-filter" className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-700 focus:border-azure-500 focus:outline-none"
          >
            <option value="all">All Statuses ({items.length})</option>
            <option value="published">Published Only</option>
            <option value="draft">Drafts Only</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Offerings Grid: 1-col on mobile, 2-col on tablet/laptop, 3-col on large desktop */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {filteredItems.map((item, idx) => (
          <div
            key={item._id || item.key}
            data-tour={idx === 0 ? 'offering-card' : undefined}
            className={cn(
              'flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md relative overflow-hidden',
              item.isPopular ? 'border-azure-300 ring-1 ring-azure-400/30' : 'border-slate-200'
            )}
          >
            {/* Top Bar: Category Pill & Status Badge */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {item.category.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-1.5">
                  <Badge tone={item.status === 'published' ? 'success' : 'neutral'}>
                    {item.status}
                  </Badge>
                  {item.isPopular && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-azure-600 to-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                      <Sparkles className="h-2.5 w-2.5" /> {item.popularBadgeText || 'Popular'}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Experience Band */}
              <div className="flex items-start justify-between gap-2 mt-1">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">{item.experienceBand}</p>
                </div>
                {item.saveText && (
                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold text-emerald-700 whitespace-nowrap">
                    {item.saveText}
                  </span>
                )}
              </div>

              {/* Price & Strikethrough Display */}
              <div data-tour={idx === 0 ? 'card-pricing' : undefined} className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">
                  {formatCurrency(item.price)}
                </span>
                {item.hasStrikeThrough && item.originalPrice > item.price && (
                  <span className="text-sm font-medium text-slate-400 line-through">
                    {formatCurrency(item.originalPrice)}
                  </span>
                )}
                <span className="text-[11px] text-slate-500">+18% GST</span>
              </div>

              {/* Tagline */}
              {item.tagline && (
                <p className="mt-2 text-xs text-slate-600 line-clamp-2 italic">
                  "{item.tagline}"
                </p>
              )}

              {/* SLA Turnaround Badge */}
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                <Clock className="h-3.5 w-3.5 text-emerald-600" />
                <span>{item.deliveryDays || 'Delivery in 2–3 Days *'}</span>
              </div>

              {/* Deliverables Summary */}
              <div data-tour={idx === 0 ? 'card-features' : undefined} className="mt-4 border-t border-slate-100 pt-3 space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Features ({item.deliverables?.length || 0}):
                </p>
                <ul className="space-y-1">
                  {item.deliverables?.slice(0, 4).map((d, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                      <Check className="h-3 w-3 text-emerald-600 mt-0.5 shrink-0" />
                      <span className={!d.included ? 'line-through text-slate-400' : 'truncate'}>
                        {d.label}
                      </span>
                    </li>
                  ))}
                  {(item.deliverables?.length || 0) > 4 && (
                    <li className="text-[11px] font-medium text-azure-600">
                      + {(item.deliverables?.length || 0) - 4} more deliverables
                    </li>
                  )}
                </ul>
              </div>

              {/* IMPACT TRANSPARENCY: "📍 Affects Live Site at" */}
              <div data-tour={idx === 0 ? 'card-impact' : undefined} className="mt-4 rounded-xl border border-azure-100 bg-azure-50/50 p-2.5">
                <p className="text-[11px] font-bold text-azure-900 flex items-center gap-1 mb-1">
                  <MapPin className="h-3 w-3 text-azure-600" /> Affects Live Website at:
                </p>
                <div className="flex flex-wrap gap-1">
                  {item.affectsSurfaces?.map((surf, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[10px] font-medium font-mono rounded bg-white border border-azure-200/70 text-azure-800 px-1.5 py-0.5"
                    >
                      {surf}
                    </span>
                  ))}
                  {(!item.affectsSurfaces || item.affectsSurfaces.length === 0) && (
                    <span className="text-[10px] text-slate-400 italic">No surfaces tagged</span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div data-tour={idx === 0 ? 'card-actions' : undefined} className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
              <Button
                variant="secondary"
                size="xs"
                onClick={() => handleToggleStatus(item)}
                title={item.status === 'published' ? 'Hide from candidates' : 'Publish to live website'}
              >
                {item.status === 'published' ? (
                  <>
                    <EyeOff className="mr-1 h-3 w-3 text-slate-500" /> Draft
                  </>
                ) : (
                  <>
                    <Eye className="mr-1 h-3 w-3 text-emerald-600" /> Publish
                  </>
                )}
              </Button>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => {
                    setEditingItem(item);
                    setEditorOpen(true);
                  }}
                >
                  <Edit3 className="mr-1 h-3 w-3" /> Edit Offering
                </Button>

                <button
                  onClick={() => handleDeleteItem(item._id, item.name)}
                  disabled={deletingId === item._id}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                  title="Delete offering"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-12 text-center">
            <Layers className="mx-auto h-8 w-8 text-slate-400" />
            <h3 className="mt-2 text-sm font-bold text-slate-800">No offerings match your filter</h3>
            <p className="mt-1 text-xs text-slate-500">
              Try adjusting your search terms or category filter, or create a new package.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-4"
              onClick={() => {
                setActiveTab('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Package Editor Modal */}
      <CmsPackageEditorModal
        isOpen={editorOpen}
        onClose={() => {
          setEditorOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        onSave={handleSaveItem}
        isSaving={isSavingItem}
      />

      {/* Interactive Tutorial Tour */}
      <CmsTutorialTour
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </>
  );
}
