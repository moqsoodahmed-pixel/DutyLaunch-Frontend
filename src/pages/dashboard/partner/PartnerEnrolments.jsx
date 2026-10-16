import { useState, useMemo } from 'react';
import { Seo } from '../../../components/ui/Seo.jsx';
import { PanelHeader } from '../../../layouts/AppShell.jsx';
import { useApi } from '../../../hooks/useApi.js';
import { enrolmentService } from '../../../services/contentService.js';
import { LoadingBlock, ErrorState } from '../../../components/ui/States.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { Input, Select } from '../../../components/ui/Field.jsx';
import { Users, GraduationCap, BookOpen, Search, Calendar, Mail } from 'lucide-react';

export default function PartnerEnrolments() {
  const { data, loading, error, refetch } = useApi(() => enrolmentService.partnerEnrolments(), []);
  const enrolments = useMemo(() => (Array.isArray(data) ? data : data?.data || []), [data]);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filtered = useMemo(() => {
    return enrolments.filter((e) => {
      const matchType = typeFilter === 'all' || e.itemType === typeFilter;
      const query = search.toLowerCase().trim();
      if (!query) return matchType;
      const studentName = `${e.user?.firstName || ''} ${e.user?.lastName || ''}`.toLowerCase();
      const email = (e.user?.email || '').toLowerCase();
      const itemTitle = (e.itemTitle || '').toLowerCase();
      return matchType && (studentName.includes(query) || email.includes(query) || itemTitle.includes(query));
    });
  }, [enrolments, search, typeFilter]);

  return (
    <>
      <Seo title="Candidate Enrolments & Orders" description="Track enrolled candidates across your approved programmes and courses" />
      <PanelHeader
        title="Enrolments & Orders"
        description="View candidates who have enrolled in your approved university programmes or courses."
      />

      {loading && <LoadingBlock message="Loading candidate enrolments..." />}
      {error && <ErrorState error={error} onRetry={refetch} />}

      {!loading && !error && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-line bg-paper p-4 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500">
                <Users className="h-5 w-5 text-azure-600" />
                <span className="text-small font-medium">Total Enrolments</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-ink">{enrolments.length}</p>
            </div>
            <div className="rounded-xl border border-line bg-paper p-4 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                <span className="text-small font-medium">Higher Ed Programmes</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-ink">
                {enrolments.filter((e) => e.itemType === 'education_program').length}
              </p>
            </div>
            <div className="rounded-xl border border-line bg-paper p-4 shadow-sm">
              <div className="flex items-center gap-3 text-slate-500">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                <span className="text-small font-medium">Training Courses</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-ink">
                {enrolments.filter((e) => e.itemType === 'course').length}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between rounded-xl border border-line bg-paper p-4 shadow-sm">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search candidate or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4 text-slate-400" />}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="all">All Offerings</option>
                <option value="education_program">University Programmes</option>
                <option value="course">EdTech Courses</option>
              </Select>
            </div>
          </div>

          {/* Enrolments List / Empty State */}
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line bg-paper/50 p-12 text-center">
              <Users className="mx-auto h-12 w-12 text-slate-300" />
              <h3 className="mt-3 text-body font-semibold text-ink">No candidate enrolments found</h3>
              <p className="mt-1 text-small text-slate-500 max-w-md mx-auto">
                {enrolments.length === 0
                  ? 'Once candidates discover and enrol in your approved programmes or courses, their details, payment status, and delivery format will appear here.'
                  : 'No enrolments matched your search criteria.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-line bg-paper shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-line bg-slate-50/60 text-caption font-semibold text-slate-600">
                    <th className="py-3.5 px-4">Candidate</th>
                    <th className="py-3.5 px-4">Offering</th>
                    <th className="py-3.5 px-4">Delivery Format</th>
                    <th className="py-3.5 px-4">Fee / Order</th>
                    <th className="py-3.5 px-4">Enrolled On</th>
                    <th className="py-3.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line text-small">
                  {filtered.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-ink">
                          {item.user ? `${item.user.firstName || ''} ${item.user.lastName || ''}`.trim() || 'Candidate' : 'Candidate'}
                        </div>
                        {item.user?.email && (
                          <div className="flex items-center gap-1 text-caption text-slate-500 mt-0.5">
                            <Mail className="h-3 w-3" />
                            {item.user.email}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-ink max-w-xs truncate">{item.itemTitle || 'Untitled'}</div>
                        <span className="text-caption text-slate-500 capitalize">
                          {item.itemType === 'education_program' ? 'University Programme' : 'Course'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge tone="neutral">{item.deliveryFormat || 'Online'}</Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        {item.payment ? (
                          <div>
                            <span className="font-semibold text-ink">
                              ₹{Number(item.payment.amount || 0).toLocaleString('en-IN')}
                            </span>
                            <div className="text-caption text-slate-500 uppercase">{item.payment.status}</div>
                          </div>
                        ) : (
                          <Badge tone="success">Free</Badge>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <div className="flex items-center gap-1.5 text-caption">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {new Date(item.enrolledAt || item.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge tone={item.status === 'active' ? 'success' : 'neutral'}>
                          {item.status || 'Active'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </>
  );
}
