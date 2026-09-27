import { useMemo, useState } from 'react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Checkbox, Input, Textarea } from '../../components/ui/Field.jsx';
import { ErrorState, LoadingBlock } from '../../components/ui/States.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { adminService } from '../../services/adminService.js';
import { formatDate } from '../../utils/format.js';
import { cn } from '../../utils/cn.js';

/**
 * Scoring weights (spec §37).
 *
 * Every Resume Health and Job Match score is a weighted average, so each
 * set must add up to 100%. Changes apply to every score from the next
 * request on — the page says so, and saving is separate from activating.
 */
const LABELS = {
  atsStructure: 'ATS structure',
  keywordAlignment: 'Keyword alignment',
  experienceRelevance: 'Experience relevance',
  achievementStrength: 'Achievement strength',
  skillsCoverage: 'Skills coverage',
  readability: 'Readability',
  completeness: 'Completeness',
  skills: 'Skills',
  keywords: 'Keywords',
  experience: 'Experience',
  seniority: 'Seniority',
  education: 'Education',
  location: 'Location',
};

const toPercent = (weights) => Object.fromEntries(Object.entries(weights).map(([k, v]) => [k, Math.round(v * 100)]));
const getPath = (obj, key) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);

/** Builds { health: { weightsWithJd: {...} }, ... } from { 'health.weightsWithJd': {k: pct} }. */
function toOverride(percentSets) {
  const out = {};
  Object.entries(percentSets).forEach(([key, set]) => {
    const parts = key.split('.');
    let node = out;
    parts.slice(0, -1).forEach((p) => {
      node[p] = node[p] || {};
      node = node[p];
    });
    node[parts[parts.length - 1]] = Object.fromEntries(Object.entries(set).map(([k, v]) => [k, Number(v) / 100]));
  });
  return out;
}

export default function AdminScoring() {
  const toast = useToast();
  const { data, loading, error, refetch } = useApi(() => adminService.scoring(), []);
  const [editing, setEditing] = useState(null); // { id|null, name, notes, active, sets }
  const [saving, setSaving] = useState(false);

  const sums = useMemo(
    () =>
      editing
        ? Object.fromEntries(Object.entries(editing.sets).map(([k, set]) => [k, Object.values(set).reduce((a, b) => a + (Number(b) || 0), 0)]))
        : {},
    [editing]
  );
  const valid = editing && editing.name.trim().length >= 2 && Object.values(sums).every((s) => s === 100);

  if (loading) return <LoadingBlock label="Loading scoring weights" />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  const { defaults, sets, configs = [], activeId } = data;

  function startFrom(config) {
    setEditing({
      id: config?._id || null,
      name: config ? config.name : '',
      notes: config?.notes || '',
      // Keep an active config active when it is edited.
      active: Boolean(config?.active),
      sets: Object.fromEntries(sets.map(({ key }) => [key, toPercent(getPath(config?.config, key) || defaults[key])])),
    });
  }

  async function save() {
    setSaving(true);
    try {
      const payload = { name: editing.name.trim(), notes: editing.notes, active: editing.active, config: toOverride(editing.sets) };
      if (editing.id) await adminService.updateScoring(editing.id, payload);
      else await adminService.createScoring(payload);
      toast.success(editing.active ? 'Saved and activated. New scores use these weights.' : 'Saved. Activate it when you are ready.');
      setEditing(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function run(action, message) {
    try {
      await action();
      toast.success(message);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <>
      <PanelHeader
        title="Scoring weights"
        description="How much each factor counts towards Resume Health and Job Match. Changes apply to every new score as soon as a configuration is active."
        actions={!editing && <Button onClick={() => startFrom(null)}>New configuration</Button>}
      />

      {editing ? (
        <div className="space-y-6">
          <div className="grid gap-4 rounded-lg border border-line bg-white p-5 sm:grid-cols-2">
            <Input label="Name" value={editing.name} onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))} placeholder="e.g. Skills-heavy match, Q4" />
            <Textarea label="Notes" hint="Why this change — shown to other admins" rows={2} value={editing.notes} onChange={(e) => setEditing((s) => ({ ...s, notes: e.target.value }))} />
          </div>

          {sets.map(({ key, label }) => (
            <section key={key} className="rounded-lg border border-line bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-body font-bold text-ink">{label}</h2>
                <span className={cn('tabular text-small font-bold', sums[key] === 100 ? 'text-success' : 'text-danger')}>
                  Total {sums[key]}%{sums[key] !== 100 && ' — must be 100%'}
                </span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(editing.sets[key]).map(([k, v]) => (
                  <Input
                    key={k}
                    label={LABELS[k] || k}
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    hint={`Default ${Math.round(defaults[key][k] * 100)}%`}
                    value={v}
                    onChange={(e) =>
                      setEditing((s) => ({ ...s, sets: { ...s.sets, [key]: { ...s.sets[key], [k]: e.target.value === '' ? '' : Number(e.target.value) } } }))
                    }
                  />
                ))}
              </div>
            </section>
          ))}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-white p-5">
            <Checkbox label="Activate immediately (affects every new score)" checked={editing.active} onChange={(e) => setEditing((s) => ({ ...s, active: e.target.checked }))} />
            <div className="flex gap-3">
              <Button variant="quiet" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button loading={saving} disabled={!valid} onClick={save}>
                Save configuration
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-white p-5">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-semibold text-ink">Built-in defaults</p>
                {!activeId && <Badge tone="success">Active</Badge>}
              </div>
              <p className="text-small text-slate-600">The weights shipped with the engine. Used whenever no configuration is active.</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="quiet" onClick={() => startFrom(null)}>
                Copy &amp; edit
              </Button>
              {activeId && (
                <Button size="sm" variant="outline" onClick={() => run(() => adminService.useDefaultScoring(), 'Default weights are now in use.')}>
                  Use defaults
                </Button>
              )}
            </div>
          </div>

          {configs.map((c) => (
            <div key={c._id} className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-line bg-white p-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-ink">{c.name}</p>
                  {c.active && <Badge tone="success">Active</Badge>}
                </div>
                <p className="text-small text-slate-600">
                  Updated {formatDate(c.updatedAt)}
                  {c.updatedBy?.name ? ` by ${c.updatedBy.name}` : ''}
                </p>
                {c.notes && <p className="mt-1 text-caption text-slate-500">{c.notes}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="quiet" onClick={() => startFrom(c)}>
                  Edit
                </Button>
                {!c.active && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => run(() => adminService.activateScoring(c._id), `“${c.name}” is now active.`)}>
                      Activate
                    </Button>
                    <Button
                      size="sm"
                      variant="quiet"
                      onClick={() => window.confirm(`Delete “${c.name}”?`) && run(() => adminService.deleteScoring(c._id), 'Configuration deleted.')}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
