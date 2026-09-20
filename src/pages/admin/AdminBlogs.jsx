import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Pencil, ExternalLink } from 'lucide-react';
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
import { formatDate } from '../../utils/format.js';

const CATEGORIES = [
  'Career Advice', 'Resume & LinkedIn', 'Interviews', 'Study Abroad',
  'UAE & Gulf Careers', 'Upskilling', 'Documentation',
];

export default function AdminBlogs() {
  const [page, setPage] = useState(1);
  const { data, meta, loading, error, refetch } = useApi(() => adminService.blogs({ page }), [page]);
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const openNew = () => {
    reset({ title: '', excerpt: '', content: '', category: 'Career Advice', tags: '', status: 'draft', isFeatured: false });
    setEditing({});
  };

  const openEdit = (post) => {
    reset({ ...post, tags: (post.tags || []).join(', ') });
    setEditing(post);
  };

  const onSubmit = async (values) => {
    const payload = { ...values, tags: values.tags ? values.tags.split(',').map((t) => t.trim()).filter(Boolean) : [] };
    try {
      if (editing?._id) {
        await adminService.updateBlog(editing._id, payload);
        toast.success('Article updated');
      } else {
        await adminService.createBlog(payload);
        toast.success('Article created');
      }
      setEditing(null);
      refetch();
    } catch (err) {
      err.fieldErrors?.length ? toast.error(err.fieldErrors[0].message) : toast.error(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    setDeletingId(id);
    try {
      await adminService.deleteBlog(id);
      toast.success('Article deleted');
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
        title="Articles"
        description="Blog content shown on /blog."
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" aria-hidden />
            New article
          </Button>
        }
      />

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={data || []}
        empty={{ title: 'No articles yet', action: <Button size="sm" onClick={openNew}>Write the first one</Button> }}
        columns={[
          {
            key: 'title',
            header: 'Title',
            primary: true,
            render: (row) => (
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-ink">{row.title}</span>
                {row.status === 'published' && (
                  <a href={`/blog/${row.slug}`} target="_blank" rel="noreferrer" aria-label="View live" className="text-slate-400 hover:text-azure">
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                )}
              </div>
            ),
          },
          { key: 'category', header: 'Category', render: (row) => <Badge tone="outline">{row.category}</Badge> },
          { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
          { key: 'updatedAt', header: 'Updated', render: (row) => formatDate(row.updatedAt) },
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

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?._id ? 'Edit article' : 'New article'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input label="Title" error={errors.title?.message} {...register('title', { required: 'Enter a title' })} />
          <Textarea label="Excerpt" rows={2} hint="Shown on cards and in search results" error={errors.excerpt?.message} {...register('excerpt', { required: 'Enter an excerpt' })} />
          <Textarea
            label="Content"
            rows={12}
            hint="Light markdown: ## headings, **bold**, - bullet lists, 1. numbered lists"
            error={errors.content?.message}
            {...register('content', { required: 'Enter the article body' })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Category" options={CATEGORIES} {...register('category')} />
            <Input label="Tags" hint="Comma separated" {...register('tags')} />
          </div>
          <div className="flex items-center gap-8">
            <Select
              label="Status"
              options={[{ value: 'draft', label: 'Draft' }, { value: 'published', label: 'Published' }, { value: 'archived', label: 'Archived' }]}
              className="w-40"
              {...register('status')}
            />
            <Checkbox label="Feature on the blog index" {...register('isFeatured')} />
          </div>
          <Button type="submit" fullWidth loading={isSubmitting}>
            Save
          </Button>
        </form>
      </Modal>
    </>
  );
}
