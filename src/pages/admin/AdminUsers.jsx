import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { SearchBar } from '../../components/ui/SearchBar.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { adminService } from '../../services/adminService.js';
import { formatDate } from '../../utils/format.js';

const ROLE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'user', label: 'Candidates' },
  { value: 'employer', label: 'Employers' },
  { value: 'admin', label: 'Admins' },
];

export default function AdminUsers() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const debouncedQ = useDebounce(q, 350);
  const role = params.get('role') || '';
  const page = Number(params.get('page') || 1);
  const { user: me } = useAuth();
  const toast = useToast();
  const [updatingId, setUpdatingId] = useState(null);

  const { data, meta, loading, error, refetch } = useApi(
    () => adminService.users({ q: debouncedQ || undefined, role: role || undefined, page }),
    [debouncedQ, role, page]
  );

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!('page' in patch)) next.delete('page');
    setParams(next, { replace: true });
  };

  const toggleActive = async (row) => {
    setUpdatingId(row.id);
    try {
      await adminService.updateUser(row.id, { isActive: !row.isActive });
      toast.success(row.isActive ? 'Account deactivated' : 'Account reactivated');
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <PanelHeader title="Users" description="Everyone registered on the platform." />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar value={q} onChange={setQ} placeholder="Search by name or email" label="Search users" className="lg:max-w-sm" />
        <Tabs options={ROLE_FILTERS} value={role} onChange={(v) => update({ role: v })} label="Filter by role" />
      </div>

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={data || []}
        rowKey={(row) => row.id}
        empty={{ title: 'No users match', description: 'Try a different search or filter.' }}
        columns={[
          {
            key: 'name',
            header: 'Name',
            primary: true,
            render: (row) => (
              <div>
                <p className="font-semibold text-ink">{row.name}</p>
                <p className="text-caption text-slate-500">{row.email}</p>
              </div>
            ),
          },
          { key: 'role', header: 'Role', render: (row) => <Badge tone={row.role === 'admin' ? 'ink' : 'outline'}>{row.role}</Badge> },
          { key: 'createdAt', header: 'Joined', render: (row) => formatDate(row.createdAt) },
          {
            key: 'status',
            header: 'Status',
            render: (row) => <Badge tone={row.isActive === false ? 'danger' : 'success'}>{row.isActive === false ? 'Deactivated' : 'Active'}</Badge>,
          },
          {
            key: 'actions',
            header: '',
            render: (row) =>
              row.id === me?.id ? (
                <span className="text-caption text-slate-400">You</span>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleActive(row)}
                  disabled={updatingId === row.id}
                  className="text-caption font-medium text-azure hover:underline disabled:opacity-50"
                >
                  {row.isActive === false ? 'Reactivate' : 'Deactivate'}
                </button>
              ),
          },
        ]}
      />

      <Pagination meta={meta} onChange={(next) => update({ page: String(next) })} className="mt-8" />
    </>
  );
}
