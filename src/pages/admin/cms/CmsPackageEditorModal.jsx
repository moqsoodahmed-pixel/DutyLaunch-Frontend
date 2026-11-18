import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Check,
  Tag,
  Clock,
  Sparkles,
  MapPin,
  Eye,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { formatCurrency } from '../../../utils/format.js';
import { cn } from '../../../utils/cn.js';

const AVAILABLE_SURFACES = [
  '/resume-service',
  '/pricing',
  '/resume-builder',
  '/resume-service (CV Only Tab)',
  '/resume-service (Career Add-ons)',
  'Package Checkout Modal',
  'Package Checkout Modal (Checkbox)',
  'Admin Resume Orders',
];

export function CmsPackageEditorModal({ isOpen, onClose, item, onSave, isSaving }) {
  const isCreate = !item?._id;

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    category: 'bundle',
    experienceBand: 'All Experience Levels',
    price: 399,
    originalPrice: 899,
    hasStrikeThrough: true,
    saveText: 'Save ₹500',
    tagline: '',
    deliveryDays: 'Delivery in 2–3 Days *',
    revisionWindow: '1 month unlimited revisions',
    isPopular: false,
    popularBadgeText: 'Most Popular',
    status: 'published',
    deliverables: [],
    affectsSurfaces: ['/resume-service', '/pricing', 'Package Checkout Modal'],
  });

  const [newDeliverableText, setNewDeliverableText] = useState('');
  const [newSurfaceText, setNewSurfaceText] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        key: item.key || '',
        category: item.category || 'bundle',
        experienceBand: item.experienceBand || 'All Experience Levels',
        price: item.price ?? 399,
        originalPrice: item.originalPrice ?? 899,
        hasStrikeThrough: item.hasStrikeThrough !== false,
        saveText: item.saveText || '',
        tagline: item.tagline || '',
        deliveryDays: item.deliveryDays || 'Delivery in 2–3 Days *',
        revisionWindow: item.revisionWindow || '1 month unlimited revisions',
        isPopular: Boolean(item.isPopular),
        popularBadgeText: item.popularBadgeText || 'Most Popular',
        status: item.status || 'published',
        deliverables: item.deliverables?.length
          ? item.deliverables.map((d, i) => ({ id: d.id || `d_${i}`, label: d.label, included: d.included !== false }))
          : [
              { id: 'd1', label: 'ATS-friendly CV crafted manually by expert writers', included: true },
              { id: 'd2', label: 'Customised cover letter', included: true },
              { id: 'd3', label: 'LinkedIn profile optimisation', included: true },
              { id: 'd4', label: '1 month unlimited revisions', included: true },
              { id: 'd5', label: 'Delivery in 2–3 Days *', included: true },
            ],
        affectsSurfaces: item.affectsSurfaces?.length
          ? [...item.affectsSurfaces]
          : ['/resume-service', '/pricing', 'Package Checkout Modal'],
      });
    } else {
      // Defaults for brand new offering
      setFormData({
        name: '',
        key: '',
        category: 'bundle',
        experienceBand: '3 to 5 years',
        price: 799,
        originalPrice: 1499,
        hasStrikeThrough: true,
        saveText: 'Save ₹700',
        tagline: 'Professional career acceleration package.',
        deliveryDays: 'Delivery in 2–3 Days *',
        revisionWindow: '1 month unlimited revisions',
        isPopular: false,
        popularBadgeText: 'Most Popular',
        status: 'published',
        deliverables: [
          { id: 'd1', label: 'ATS-friendly CV crafted manually by expert writers', included: true },
          { id: 'd2', label: 'Customised cover letter', included: true },
          { id: 'd3', label: 'LinkedIn profile optimisation', included: true },
          { id: 'd4', label: '1 month unlimited revisions', included: true },
          { id: 'd5', label: 'Delivery in 2–3 Days *', included: true },
        ],
        affectsSurfaces: ['/resume-service', '/pricing', 'Package Checkout Modal'],
      });
    }
  }, [item, isOpen]);

  // Automatically recalculate save text when prices change
  function handlePriceChange(field, val) {
    const num = Math.max(0, Number(val) || 0);
    setFormData((prev) => {
      const updated = { ...prev, [field]: num };
      const diff = updated.originalPrice - updated.price;
      if (diff > 0 && !item?.saveText) {
        updated.saveText = `Save ₹${diff.toLocaleString('en-IN')}`;
      }
      return updated;
    });
  }

  // Name change auto-generates slug key for new items
  function handleNameChange(val) {
    setFormData((prev) => {
      const updated = { ...prev, name: val };
      if (isCreate && !prev.key) {
        updated.key = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
      return updated;
    });
  }

  // Deliverables management
  function addDeliverable() {
    if (!newDeliverableText.trim()) return;
    setFormData((prev) => ({
      ...prev,
      deliverables: [
        ...prev.deliverables,
        { id: `d_${Date.now()}`, label: newDeliverableText.trim(), included: true },
      ],
    }));
    setNewDeliverableText('');
  }

  function toggleDeliverable(idx) {
    setFormData((prev) => {
      const next = [...prev.deliverables];
      next[idx] = { ...next[idx], included: !next[idx].included };
      return { ...prev, deliverables: next };
    });
  }

  function updateDeliverableLabel(idx, label) {
    setFormData((prev) => {
      const next = [...prev.deliverables];
      next[idx] = { ...next[idx], label };
      return { ...prev, deliverables: next };
    });
  }

  function removeDeliverable(idx) {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== idx),
    }));
  }

  // Surface management
  function toggleSurface(surf) {
    setFormData((prev) => {
      const exists = prev.affectsSurfaces.includes(surf);
      return {
        ...prev,
        affectsSurfaces: exists
          ? prev.affectsSurfaces.filter((s) => s !== surf)
          : [...prev.affectsSurfaces, surf],
      };
    });
  }

  function addCustomSurface() {
    if (!newSurfaceText.trim()) return;
    const clean = newSurfaceText.trim();
    if (!formData.affectsSurfaces.includes(clean)) {
      setFormData((prev) => ({
        ...prev,
        affectsSurfaces: [...prev.affectsSurfaces, clean],
      }));
    }
    setNewSurfaceText('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formData.name.trim()) return alert('Please enter an offering name.');
    if (formData.price < 0) return alert('Price cannot be negative.');

    onSave(formData);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-5xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-4 sm:px-6 py-3.5 sm:py-4">
          <div className="min-w-0 pr-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-azure-600 bg-azure-50 px-2 py-0.5 rounded-full">
                {isCreate ? 'Create New Offering' : 'Edit Offering & Live Rules'}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-mono">
                key: {formData.key || 'auto-generated'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 truncate">
              {formData.name || (isCreate ? 'New Package or Service' : 'Unnamed Offering')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 sm:p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content: 2-Column Responsive Layout */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100 flex-1 overflow-y-auto">
            {/* Left Column: Form Controls (7 cols) */}
            <div className="lg:col-span-7 p-4 sm:p-6 space-y-5 sm:space-y-6">
              {/* Section 1: Core Offering Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-azure-600" /> 1. Offering Details & Category
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Offering Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g. Mid-Level Professional"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-azure-500 focus:outline-none focus:ring-1 focus:ring-azure-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-azure-500 focus:outline-none focus:ring-1 focus:ring-azure-500"
                    >
                      <option value="bundle">Career Bundle (CV + Letter + LinkedIn)</option>
                      <option value="cv_only">Standalone CV Only</option>
                      <option value="addon">Executive Portfolio & Add-on</option>
                      <option value="subscription">Platform Subscription</option>
                      <option value="service">Specialized Service</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Experience Band Label
                    </label>
                    <input
                      type="text"
                      value={formData.experienceBand}
                      onChange={(e) => setFormData({ ...formData, experienceBand: e.target.value })}
                      placeholder="e.g. 3 to 5 years or All Levels"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-azure-500 focus:outline-none focus:ring-1 focus:ring-azure-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Database / Route Key (Slug)
                    </label>
                    <input
                      type="text"
                      value={formData.key}
                      onChange={(e) => setFormData({ ...formData, key: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                      placeholder="e.g. mid-level-bundle"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono text-slate-800 focus:border-azure-500 focus:outline-none focus:ring-1 focus:ring-azure-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Tagline / Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    placeholder="Turn your achievements and projects into high career impact."
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-azure-500 focus:outline-none focus:ring-1 focus:ring-azure-500"
                  />
                </div>
              </div>

              {/* Section 2: Pricing, Hikes & Strikethroughs */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-emerald-600" /> 2. Pricing, Hikes & Strikethrough Rates
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Selling Price (₹) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-sm text-slate-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        required
                        value={formData.price}
                        onChange={(e) => handlePriceChange('price', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-sm font-bold text-slate-900 focus:border-azure-500 focus:outline-none"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400">Actual amount charged</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Original Price (₹)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-sm text-slate-500">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={formData.originalPrice}
                        onChange={(e) => handlePriceChange('originalPrice', e.target.value)}
                        className="w-full rounded-lg border border-slate-300 pl-7 pr-3 py-2 text-sm text-slate-700 focus:border-azure-500 focus:outline-none"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400">Anchor rate before discount</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Save Badge Label
                    </label>
                    <input
                      type="text"
                      value={formData.saveText}
                      onChange={(e) => setFormData({ ...formData, saveText: e.target.value })}
                      placeholder="e.g. Save ₹700"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-azure-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400">Appears on package card</span>
                  </div>
                </div>

                {/* Strikethrough Toggle */}
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 border border-slate-200/70">
                  <div>
                    <p className="text-xs font-semibold text-slate-900">
                      Show Strike-through Original Price on Website
                    </p>
                    <p className="text-[11px] text-slate-500">
                      When enabled, shows {formatCurrency(formData.originalPrice)} crossed out next to {formatCurrency(formData.price)}.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.hasStrikeThrough}
                      onChange={(e) => setFormData({ ...formData, hasStrikeThrough: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-azure-600"></div>
                  </label>
                </div>

                {/* Turnaround & SLA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Delivery Turnaround SLA (with *)
                    </label>
                    <input
                      type="text"
                      value={formData.deliveryDays}
                      onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                      placeholder="Delivery in 2–3 Days *"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-azure-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Revision Window Guarantee
                    </label>
                    <input
                      type="text"
                      value={formData.revisionWindow}
                      onChange={(e) => setFormData({ ...formData, revisionWindow: e.target.value })}
                      placeholder="1 month unlimited revisions"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-azure-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Popular Badge & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
                    <input
                      type="checkbox"
                      id="isPopular"
                      checked={formData.isPopular}
                      onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                      className="h-4 w-4 rounded border-slate-300 text-azure-600 focus:ring-azure-500"
                    />
                    <label htmlFor="isPopular" className="text-xs font-medium text-slate-700">
                      Mark as "Most Popular" / Highlighted Card
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Publishing Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-azure-500 focus:outline-none"
                    >
                      <option value="published">Published (Live on Website)</option>
                      <option value="draft">Draft (Hidden from candidates)</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Deliverables & Features Manager */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-cyan-600" /> 3. Deliverables & Features Inclusions
                  </h4>
                  <span className="text-xs text-slate-400">
                    {formData.deliverables.length} item{formData.deliverables.length === 1 ? '' : 's'}
                  </span>
                </div>

                {/* Add new feature input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newDeliverableText}
                    onChange={(e) => setNewDeliverableText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDeliverable();
                      }
                    }}
                    placeholder="e.g. Achievement rewriting with measurable outcomes"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-azure-500 focus:outline-none"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={addDeliverable}>
                    <Plus className="mr-1 h-4 w-4" /> Add Feature
                  </Button>
                </div>

                {/* List of current deliverables */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {formData.deliverables.map((deliv, idx) => (
                    <div
                      key={deliv.id || idx}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 text-xs"
                    >
                      <input
                        type="checkbox"
                        checked={deliv.included}
                        onChange={() => toggleDeliverable(idx)}
                        title="Toggle inclusion on website"
                        className="h-4 w-4 rounded border-slate-300 text-azure-600 focus:ring-azure-500"
                      />
                      <input
                        type="text"
                        value={deliv.label}
                        onChange={(e) => updateDeliverableLabel(idx, e.target.value)}
                        className={`flex-1 border-0 bg-transparent py-0.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-azure-500 rounded px-1 ${
                          !deliv.included ? 'line-through text-slate-400' : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => removeDeliverable(idx)}
                        className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Remove deliverable"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  {formData.deliverables.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-2">
                      No deliverables added yet. Add feature points above.
                    </p>
                  )}
                </div>
              </div>

              {/* Section 4: Live Impact Blast Radius */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-azure-600" /> 4. "📍 Affects Live Site at" Surface Tags
                </h4>
                <p className="text-xs text-slate-500">
                  Select the pages and modals where this offering takes effect. Helps admins visualize the blast radius of price changes:
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_SURFACES.map((surf) => {
                    const active = formData.affectsSurfaces.includes(surf);
                    return (
                      <button
                        key={surf}
                        type="button"
                        onClick={() => toggleSurface(surf)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          active
                            ? 'bg-azure-50 border-azure-300 text-azure-700 font-medium'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {active ? '✓ ' : '+ '} {surf}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newSurfaceText}
                    onChange={(e) => setNewSurfaceText(e.target.value)}
                    placeholder="Add custom route (e.g. /landing-promo)"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-900 focus:border-azure-500 focus:outline-none"
                  />
                  <Button type="button" variant="secondary" size="xs" onClick={addCustomSurface}>
                    Add Tag
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Card Preview (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50/70 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-azure-600" /> Live Website Card Preview
                  </span>
                  <Badge tone={formData.status === 'published' ? 'success' : 'neutral'}>
                    {formData.status}
                  </Badge>
                </div>

                {/* Simulated High-Fidelity Website Card */}
                <div
                  className={cn(
                    'rounded-2xl border bg-white p-5 shadow-md transition-all relative overflow-hidden',
                    formData.isPopular ? 'border-azure-500 ring-2 ring-azure-500/20' : 'border-slate-200'
                  )}
                >
                  {formData.isPopular && (
                    <div className="mb-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-azure-600 to-indigo-600 px-3 py-0.5 text-[11px] font-bold text-white shadow-sm">
                        <Sparkles className="h-3 w-3" /> {formData.popularBadgeText || 'Most Popular'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {formData.name || 'Untitled Offering'}
                    </h3>
                    {formData.saveText && (
                      <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                        {formData.saveText}
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {formData.experienceBand || 'All Experience Levels'}
                  </p>

                  {/* Price Block */}
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-900">
                      {formatCurrency(formData.price)}
                    </span>
                    {formData.hasStrikeThrough && formData.originalPrice > formData.price && (
                      <span className="text-sm font-medium text-slate-400 line-through">
                        {formatCurrency(formData.originalPrice)}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">+18% GST</span>
                  </div>

                  {formData.tagline && (
                    <p className="mt-2 text-xs text-slate-600 italic border-l-2 border-azure-400 pl-2">
                      "{formData.tagline}"
                    </p>
                  )}

                  {/* Turnaround Badge */}
                  <div className="mt-3.5 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200/80 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    <Clock className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{formData.deliveryDays || 'Delivery in 2–3 Days *'}</span>
                  </div>

                  {/* Deliverables List */}
                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Included Deliverables:
                    </p>
                    <ul className="space-y-1.5">
                      {formData.deliverables.slice(0, 6).map((deliv, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          {deliv.included ? (
                            <div className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                              <Check className="h-2 w-2" />
                            </div>
                          ) : (
                            <div className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                              <X className="h-2 w-2" />
                            </div>
                          )}
                          <span className={!deliv.included ? 'line-through text-slate-400' : ''}>
                            {deliv.label}
                          </span>
                        </li>
                      ))}
                      {formData.deliverables.length > 6 && (
                        <li className="text-[11px] text-azure-600 font-medium pl-5">
                          + {formData.deliverables.length - 6} more deliverables
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Simulated Action Button */}
                  <div className="mt-5">
                    <button
                      type="button"
                      disabled
                      className="w-full rounded-xl bg-azure-600 py-2.5 text-center text-xs font-bold text-white shadow-sm opacity-90 cursor-default"
                    >
                      Choose {formData.name || 'Package'} →
                    </button>
                    <p className="text-center text-[10px] text-slate-400 mt-1.5">
                      {formData.deliveryDays} • {formData.revisionWindow}
                    </p>
                  </div>
                </div>

                {/* Surface Impact Summary in Preview */}
                <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3.5">
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5">
                    <MapPin className="h-3.5 w-3.5 text-azure-600" /> Active on Live Pages:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {formData.affectsSurfaces.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono rounded bg-slate-100 text-slate-700 px-2 py-0.5"
                      >
                        {s}
                      </span>
                    ))}
                    {formData.affectsSurfaces.length === 0 && (
                      <span className="text-xs text-amber-600 italic">
                        No surfaces tagged. Please tag at least one route.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Guidance */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500">
                💡 <span className="font-semibold text-slate-700">Immediate Propagation:</span> Saving these changes updates the DutyLaunch website and Razorpay checkout modal immediately without restarting servers.
              </div>
            </div>
          </div>

          {/* Modal Footer - Fixed, non-shrinking */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/80 px-4 sm:px-6 py-3.5 sm:py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="text-xs font-semibold text-slate-600 hover:text-slate-800 px-2 py-1"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button type="button" variant="secondary" size="xs" sm:size="sm" onClick={onClose} disabled={isSaving}>
                Close
              </Button>
              <Button type="submit" variant="primary" size="xs" sm:size="sm" disabled={isSaving}>
                {isSaving ? 'Saving Changes...' : isCreate ? 'Publish New Offering' : 'Save & Propagate Changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
