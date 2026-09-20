import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { DataTable } from '../../components/admin/DataTable.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Modal } from '../../components/ui/Modal.jsx';
import { Input, Textarea, Checkbox } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useToast } from '../../context/ToastContext.jsx';
import { adminService } from '../../services/adminService.js';

/**
 * The only place real client quotes enter the site. Nothing here is
 * pre-populated — an admin must add a genuine, consented quote for it to
 * appear on TestimonialStrip.
 */
export default function AdminTestimonials() {
  const { data, loading, error, refetch } = useApi(() => adminService.testimonials(), []);
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
    reset({ name: '', role: '', location: '', service: '', quote: '', consentOnFile: false, isPublished: false });
    setEditing({});
  };

  const openEdit = (item) => {
    reset(item);
    setEditing(item);
  };

  const onSubmit = async (values) => {
    if (values.isPublished && !values.consentOnFile) {
      toast.error('Confirm consent is on file before publishing a testimonial.');
      return;
    }
    try {
      if (editing?._id) {
        await adminService.updateTestimonial(editing._id, values);
        toast.success('Testimonial updated');
      } else {
        await adminService.createTestimonial(values);
        toast.success('Testimonial added');
      }
      setEditing(null);
      refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    setDeletingId(id);
    try {
      await adminService.deleteTestimonial(id);
      toast.success('Testimonial deleted');
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
        title="Testimonials"
        description="Only add a quote once you have explicit consent from the client to publish it."
        actions={
          <Button size="sm" onClick={openNew}>
            <Plus className="h-4 w-4" aria-hidden />
            Add testimonial
          </Button>
        }
      />

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={data || []}
        empty={{
          title: 'No testimonials yet',
          description: 'The homepage will show nothing here until a real, consented quote is added — that is intentional.',
        }}
        columns={[
          { key: 'name', header: 'Client', primary: true, render: (row) => <span className="font-semibold text-ink">{row.name}</span> },
          {
            key: 'quote',
            header: 'Quote',
            render: (row) => (
              <span className="block max-w-xs truncate text-slate-600" title={row.quote}>
                {row.quote}
              </span>
            ),
          },
          { key: 'consentOnFile', header: 'Consent', render: (row) => <Badge tone={row.consentOnFile ? 'success' : 'danger'}>{row.consentOnFile ? 'On file' : 'Missing'}</Badge> },
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

      <Modal open={Boolean(editing)} onClose={() => setEditing(null)} title={editing?._id ? 'Edit testimonial' : 'Add testimonial'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Client name" error={errors.name?.message} {...register('name', { required: 'Enter a name' })} />
            <Input label="Role" hint="Optional" {...register('role')} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Location" hint="Optional" {...register('location')} />
            <Input label="Service used" hint="Optional" {...register('service')} />
          </div>
          <Textarea label="Quote" rows={4} error={errors.quote?.message} {...register('quote', { required: 'Enter the quote' })} />
          <Checkbox label="I confirm written consent to publish this quote is on file" {...register('consentOnFile')} />
          <Checkbox label="Published on the site" {...register('isPublished')} />
          <Button type="submit" fullWidth loading={isSubmitting}>
            Save
          </Button>
        </form>
      </Modal>
    </>
  );
}
