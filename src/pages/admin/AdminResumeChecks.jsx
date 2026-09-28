import { useSearchParams } from 'react-router-dom';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { useApi } from '../../hooks/useApi.js';
import { adminService } from '../../services/adminService.js';
import { formatDate } from '../../utils/format.js';

const SCORE_BAND = (score) => {
  if (score >= 85) return { label: 'Strong',     tone: 'success' };
  if (score >= 70) return { label: 'Good',       tone: 'azure'   };
  if (score >= 50) return { label: 'Needs work', tone: 'amber'   };
  return                  { label: 'Weak',        tone: 'danger'  };
};

const USER_FILTERS = [
  { value: '',      label: 'All'         },
  { value: 'true',  label: 'Signed in'   },
  { value: 'false', label: 'Anonymous'   },
];

export default function AdminResumeChecks() {
  const [params, setParams] = useSearchParams();
  const hasUser = params.get('hasUser') || '';
  const page    = Number(params.get('page') || 1);

  const { data, meta, loading, error, refetch } = useApi(
    () => adminService.resumeChecks({ hasUser: hasUser || undefined, page }),
    [hasUser, page]
  );

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  return (
    <>
      <PanelHeader
        title="Resume Checks"
        description="Every ATS compatibility check run on the platform, newest first."
      />

      <Tabs
        options={USER_FILTERS}
        value={hasUser}
        onChange={(v) => update({ hasUser: v })}
        label="Filter by user"
        className="mb-6"
      />

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={data || []}
        empty={{ title: 'No resume checks yet', body: 'They appear here as soon as a signed-in user uploads a resume.' }}
        columns={[
          {
            key: 'user',
            header: 'Candidate',
            primary: true,
            render: (row) =>
              row.user ? (
                <div>
                  <p className="font-semibold text-ink">{row.user.name}</p>
                  <p className="text-caption text-slate-500">{row.user.email}</p>
                </div>
              ) : (
                <p className="text-caption italic text-slate-400">Anonymous</p>
              ),
          },
          {
            key: 'fileName',
            header: 'File',
            render: (row) => (
              <span className="truncate text-small text-ink" title={row.fileName}>
                {row.fileName}
              </span>
            ),
          },
          {
            key: 'score',
            header: 'Score',
            render: (row) => {
              const band = SCORE_BAND(row.score);
              return (
                <div className="flex items-center gap-2">
                  <span className="text-small font-bold text-ink">{row.score}</span>
                  <Badge tone={band.tone}>{band.label}</Badge>
                </div>
              );
            },
          },
          {
            key: 'categories',
            header: 'Category breakdown',
            render: (row) => {
              const cats = row.categoryScores || {};
              return (
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-caption text-slate-500">
                  {Object.entries(cats).map(([k, v]) => (
                    <span key={k}>
                      <span className="capitalize">{k}</span>:{' '}
                      <span className="font-semibold text-ink">{v}</span>
                    </span>
                  ))}
                </div>
              );
            },
          },
          {
            key: 'createdAt',
            header: 'Checked',
            render: (row) => formatDate(row.createdAt),
          },
        ]}
      />

      <Pagination meta={meta} onChange={(next) => update({ page: String(next) })} className="mt-8" />
    </>
  );
}