import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { Badge, StatusBadge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input, Textarea, Select, Checkbox } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { adminService } from '../../services/adminService.js';
import { courseService } from '../../services/contentService.js';
import { formatCurrency } from '../../utils/format.js';

const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const TRACKS = ['professional', 'upskill', 'certification'];
const MODES = ['Online', 'Live online', 'Blended'];

export default function AdminCourses() {
  const [page, setPage] = useState(1);
  const { data, meta, loading, error, refetch } = useApi(() => adminService.courses({ page }), [page]);
  const { data: categories } = useApi(() => courseService.categories(), []);
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
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
      refetch();
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
      refetch();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <PanelHeader
        title="Courses"
        description="Professional programmes, upskilling and certification prep."
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" aria-hidden />
            New course
          </Button>
        }
      />

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={data || []}
        empty={{ title: 'No courses yet', action: <Button size="sm" onClick={openNew}>Add the first one</Button> }}
        columns={[
          { key: 'title', header: 'Title', primary: true, render: (row) => <span className="font-semibold text-ink">{row.title}</span> },
          { key: 'category', header: 'Category', render: (row) => row.category?.name || '—' },
          { key: 'level', header: 'Level', render: (row) => <Badge tone="outline">{row.level}</Badge> },
          { key: 'price', header: 'Price', render: (row) => (row.priceOnRequest ? 'On request' : formatCurrency(row.price, row.currency)) },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          {
            key: 'actions',
            header: '',
            render: (row) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(row)} aria-label="Edit">
                  <Pencil className="h-4 w-4" aria-hidden />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove(row._id)} loading={deletingId === row._id} className="text-danger" aria-label="Delete">
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Pagination meta={meta} onChange={setPage} className="mt-8" />

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
