import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input, Textarea, Select, Checkbox } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { adminService } from '../../services/adminService.js';

const CATEGORIES = [
  'General', 'Career Services', 'Pricing & Payments', 'Education',
  'UAE & Global Mobility', 'Documentation', 'Jobs & Applications',
];

export default function AdminFaqs() {
  const { data, loading, error, refetch } = useApi(() => adminService.faqs(), []);
  const toast = useToast();
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...} = edit
  const [deletingId, setDeletingId] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const openNew = () => {
    reset({ question: '', answer: '', category: 'General', order: 0, isPublished: true });
    setEditing({});
  };

  const openEdit = (faq) => {
    reset(faq);
    setEditing(faq);
  };

  const onSubmit = async (values) => {
    try {
      if (editing?._id) {
        await adminService.updateFaq(editing._id, values);
        toast.success('FAQ updated');
      } else {
        await adminService.createFaq(values);
        toast.success('FAQ created');
      }
      setEditing(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    setDeletingId(id);
    try {
      await adminService.deleteFaq(id);
      toast.success('FAQ deleted');
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
        title="FAQs"
        description="Shown on the public FAQ page, grouped by category."
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" aria-hidden />
            New FAQ
          </Button>
        }
      />

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={data || []}
        empty={{ title: 'No FAQs yet', action: <Button size="sm" onClick={openNew}>Add the first one</Button> }}
        columns={[
          { key: 'question', header: 'Question', primary: true, render: (row) => <span className="font-semibold text-ink">{row.question}</span> },
          { key: 'category', header: 'Category', render: (row) => <Badge tone="outline">{row.category}</Badge> },
          { key: 'isPublished', header: 'Status', render: (row) => <Badge tone={row.isPublished ? 'success' : 'neutral'}>{row.isPublished ? 'Published' : 'Hidden'}</Badge> },
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

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?._id ? 'Edit FAQ' : 'New FAQ'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input label="Question" error={errors.question?.message} {...register('question', { required: 'Enter a question' })} />
          <Textarea label="Answer" rows={5} error={errors.answer?.message} {...register('answer', { required: 'Enter an answer' })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Category" options={CATEGORIES} {...register('category')} />
            <Input label="Order" type="number" {...register('order')} />
          </div>
          <Checkbox label="Published" {...register('isPublished')} />
          <Button type="submit" fullWidth loading={isSubmitting}>
            Save
          </Button>
        </form>
      </Modal>
    </>
  );
}
