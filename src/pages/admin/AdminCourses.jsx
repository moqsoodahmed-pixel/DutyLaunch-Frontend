import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Pencil, CheckCircle2, XCircle, AlertCircle, Eye, FileText, GraduationCap, BookOpen } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input, Textarea, Select, Checkbox } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { Tabs } from '../../components/ui/Tabs.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { adminService } from '../../services/adminService.js';
import { courseService } from '../../services/contentService.js';
import { formatCurrency } from '../../utils/format.js';
import { getMediaUrl } from '../../utils/media.js';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const TRACKS = ['professional', 'upskill', 'certification'];
const MODES = ['Online', 'Live online', 'Blended'];

const APPROVAL_TONES = {
  draft: 'neutral',
  pending: 'amber',
  changes_requested: 'amber',
  approved: 'success',
  rejected: 'danger',
};

export default function AdminCourses() {
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'programmes'
  const [coursePage, setCoursePage] = useState(1);
  const [progPage, setProgPage] = useState(1);

  const { data: coursesData, meta: courseMeta, loading: courseLoading, error: courseError, refetch: refetchCourses } = useApi(
    () => adminService.courses({ page: coursePage }),
    [coursePage]
  );

  const { data: progData, meta: progMeta, loading: progLoading, error: progError, refetch: refetchProgrammes } = useApi(
    () => adminService.programmes({ page: progPage }),
    [progPage]
  );

  const { data: categories } = useApi(() => courseService.categories(), []);
  const toast = useToast();

  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [moderatingItem, setModeratingItem] = useState(null); // { type: 'course'|'programme', item: {...} }
  const [feedbackNote, setFeedbackNote] = useState('');
  const [busyAction, setBusyAction] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const categoryOptions = (categories || []).map((c) => ({ value: c._id, label: c.name }));

  const openNew = () => {
    reset({ title: '', summary: '', description: '', track: 'professional', level: 'Beginner', mode: 'Live online', priceOnRequest: true, status: 'draft' });
    setEditing({});
  };

  const openEdit = (course) => {
    reset({ ...course, category: course.category?._id || course.category });
    setEditing(course);
  };

  const onSubmit = async (values) => {
    const payload = { ...values, price: values.priceOnRequest ? undefined : Number(values.price) || 0 };
    try {
      if (editing?._id) {
        await adminService.updateCourse(editing._id, payload);
        toast.success('Course updated');
      } else {
        await adminService.createCourse(payload);
        toast.success('Course created');
      }
      setEditing(null);
      refetchCourses();
    } catch (err) {
      err.fieldErrors?.length ? toast.error(err.fieldErrors[0].message) : toast.error(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    setDeletingId(id);
    try {
      await adminService.deleteCourse(id);
      toast.success('Course deleted');
      refetchCourses();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleModerate = async (type, id, approvalStatus, feedback = '') => {
    setBusyAction(true);
    try {
      if (type === 'programme') {
        await adminService.moderateProgramme(id, { approvalStatus, adminFeedback: feedback });
        toast.success(`Higher Ed programme ${approvalStatus}`);
        refetchProgrammes();
      } else {
        await adminService.moderateCourse(id, { approvalStatus, adminFeedback: feedback });
        toast.success(`Course ${approvalStatus}`);
        refetchCourses();
      }
      setModeratingItem(null);
      setFeedbackNote('');
    } catch (err) {
      toast.error(err.message || 'Moderation action failed');
    } finally {
      setBusyAction(false);
    }
  };

  return (
    <>
      <PanelHeader
        title="Courses & Higher Education Listing Moderation"
        description="Review, approve, and manage courses and university programmes submitted by verified partners."
        actions={
          activeTab === 'courses' ? (
            <Button size="sm" onClick={openNew}>
              <Plus className="h-4 w-4 mr-1" aria-hidden />
              New course
            </Button>
          ) : null
        }
      />

      <div className="mb-6">
        <Tabs
          options={[
            { value: 'courses', label: 'Training Courses' },
            { value: 'programmes', label: 'Higher Education Programmes' },
          ]}
          value={activeTab}
          onChange={setActiveTab}
          label="Select listings type"
        />
      </div>

      {activeTab === 'courses' ? (
        <>
          <DataTable
            loading={courseLoading}
            error={courseError}
            onRetry={refetchCourses}
            rows={coursesData || []}
            empty={{ title: 'No courses yet', action: <Button size="sm" onClick={openNew}>Add the first one</Button> }}
            columns={[
              {
                key: 'title',
                header: 'Title',
                primary: true,
                render: (row) => (
                  <div>
                    <span className="font-semibold text-ink">{row.title}</span>
                    {row.institution && (
                      <p className="text-caption text-slate-500">
                        By: {row.institution.displayName || row.institution.name}
                      </p>
                    )}
                  </div>
                ),
              },
              { key: 'category', header: 'Category', render: (row) => row.category?.name || 'N/A' },
              { key: 'deliveryFormat', header: 'Format', render: (row) => <Badge tone="outline">{row.deliveryFormat || row.mode || 'Online'}</Badge> },
              {
                key: 'price',
                header: 'Price',
                render: (row) => (row.isFree ? <Badge tone="success">Free</Badge> : row.priceOnRequest ? 'On request' : formatCurrency(row.price, row.currency)),
              },
              {
                key: 'approvalStatus',
                header: 'Moderation',
                render: (row) => (
                  <Badge tone={APPROVAL_TONES[row.approvalStatus] || 'neutral'}>
                    {(row.approvalStatus || 'approved').toUpperCase()}
                  </Badge>
                ),
              },
              { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
              {
                key: 'actions',
                header: '',
                render: (row) => (
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setModeratingItem({ type: 'course', item: row });
                        setFeedbackNote(row.adminFeedback || '');
                      }}
                      title="Moderate"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(row)} aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => remove(row._id)} loading={deletingId === row._id} className="text-danger" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
          />
          <Pagination meta={courseMeta} onChange={setCoursePage} className="mt-8" />
        </>
      ) : (
        <>
          <DataTable
            loading={progLoading}
            error={progError}
            onRetry={refetchProgrammes}
            rows={progData || []}
            empty={{ title: 'No higher education programmes submitted yet' }}
            columns={[
              {
                key: 'title',
                header: 'Programme & University',
                primary: true,
                render: (row) => (
                  <div>
                    <span className="font-semibold text-ink">{row.title}</span>
                    <p className="text-caption text-azure-700 font-medium">
                      {row.institution?.displayName || row.institution?.name || 'Independent / Unassigned'}
                    </p>
                  </div>
                ),
              },
              { key: 'qualification', header: 'Qualification', render: (row) => row.qualification || row.level || '—' },
              { key: 'deliveryFormat', header: 'Format', render: (row) => <Badge tone="neutral">{row.deliveryFormat || 'Online'}</Badge> },
              {
                key: 'fee',
                header: 'Fee',
                render: (row) => (row.fee > 0 ? `₹${Number(row.fee).toLocaleString('en-IN')}` : 'Free'),
              },
              {
                key: 'syllabus',
                header: 'Syllabus',
                render: (row) =>
                  row.syllabusUrl ? (
                    <a
                      href={getMediaUrl(row.syllabusUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-caption text-red-600 font-medium hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      View
                    </a>
                  ) : (
                    <span className="text-caption text-slate-400">None</span>
                  ),
              },
              {
                key: 'approvalStatus',
                header: 'Moderation',
                render: (row) => (
                  <Badge tone={APPROVAL_TONES[row.approvalStatus] || 'neutral'}>
                    {(row.approvalStatus || 'approved').toUpperCase()}
                  </Badge>
                ),
              },
              {
                key: 'actions',
                header: '',
                render: (row) => (
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setModeratingItem({ type: 'programme', item: row });
                        setFeedbackNote(row.adminFeedback || '');
                      }}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      Review
                    </Button>
                  </div>
                ),
              },
            ]}
          />
          <Pagination meta={progMeta} onChange={setProgPage} className="mt-8" />
        </>
      )}

      {/* Moderation Modal for Course or Programme */}
      {moderatingItem && (
        <Modal
          open={Boolean(moderatingItem)}
          onClose={() => setModeratingItem(null)}
          title={`Moderate Listing: ${moderatingItem.item.title}`}
          size="lg"
        >
          <div className="space-y-5">
            <div className="rounded-xl border border-line bg-paper p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-caption font-semibold text-slate-500 uppercase">
                  {moderatingItem.type === 'programme' ? 'University Programme' : 'Training Course'}
                </span>
                <Badge tone={APPROVAL_TONES[moderatingItem.item.approvalStatus] || 'neutral'}>
                  {moderatingItem.item.approvalStatus?.toUpperCase()}
                </Badge>
              </div>
              <h3 className="text-body font-bold text-ink">{moderatingItem.item.title}</h3>
              {moderatingItem.item.institution && (
                <p className="text-small text-slate-600">
                  Institution: {moderatingItem.item.institution.displayName || moderatingItem.item.institution.name}
                </p>
              )}
              <p className="text-caption text-slate-500 whitespace-pre-line">
                {moderatingItem.item.summary || moderatingItem.item.description}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-small font-semibold text-ink block">
                Review Feedback (shown to provider if changes requested or rejected)
              </label>
              <Textarea
                rows={3}
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="Enter feedback or explanation..."
              />
            </div>

            <div className="pt-4 border-t border-line flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="primary"
                  disabled={busyAction}
                  onClick={() =>
                    handleModerate(moderatingItem.type, moderatingItem.item._id, 'approved', feedbackNote)
                  }
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Approve & Publish
                </Button>

                <Button
                  variant="outline"
                  disabled={busyAction}
                  onClick={() =>
                    handleModerate(moderatingItem.type, moderatingItem.item._id, 'changes_requested', feedbackNote)
                  }
                >
                  <AlertCircle className="h-4 w-4 mr-1.5 text-amber-600" />
                  Request Changes
                </Button>

                <Button
                  variant="outline"
                  className="text-danger border-danger/30 hover:bg-danger/10"
                  disabled={busyAction}
                  onClick={() =>
                    handleModerate(moderatingItem.type, moderatingItem.item._id, 'rejected', feedbackNote)
                  }
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Reject
                </Button>
              </div>

              <Button variant="ghost" onClick={() => setModeratingItem(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit / New Course Modal */}
      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?._id ? 'Edit course' : 'New course'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input label="Title" error={errors.title?.message} {...register('title', { required: 'Enter a title' })} />
          <Textarea label="Summary" rows={2} error={errors.summary?.message} {...register('summary', { required: 'Enter a short summary' })} />
          <Textarea label="Description" rows={6} error={errors.description?.message} {...register('description', { required: 'Enter a description' })} />

          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Category" placeholder="None" options={categoryOptions} {...register('category')} />
            <Select label="Track" options={TRACKS.map((t) => ({ value: t, label: t }))} {...register('track')} />
            <Select label="Level" options={LEVELS} {...register('level')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Mode" options={MODES} {...register('mode')} />
            <Input label="Duration" hint="e.g. 8 weeks" {...register('duration')} />
            <Select label="Status" options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' }]} {...register('status')} />
          </div>

          <div className="grid items-end gap-4 sm:grid-cols-2">
            <Input label="Price" type="number" min="0" {...register('price')} />
            <Checkbox label="Price on request instead" {...register('priceOnRequest')} />
          </div>

          <Button type="submit" fullWidth loading={isSubmitting}>
            Save
          </Button>
        </form>
      </Modal>
    </>
  );
}
