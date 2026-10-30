import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Upload,
  ShieldAlert,
  BookOpen,
} from 'lucide-react';
import { PanelHeader } from '../../../layouts/AppShell.jsx';
import { DataTable } from '../../../components/admin/DataTable.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Input, Textarea, Select, Checkbox } from '../../../components/ui/Field.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { useApi } from '../../../hooks/useApi.js';
import { useToast } from '../../../context/ToastContext.jsx';
import { courseService, partnerService, uploadService } from '../../../services/contentService.js';
import { getMediaUrl } from '../../../utils/media.js';
import { formatCurrency } from '../../../utils/format.js';

const TRACKS = ['professional', 'upskill', 'certification'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const FORMATS = ['Online', 'Offline', 'Hybrid', 'Self-paced'];

const APPROVAL_TONE = {
  approved: 'success',
  pending: 'azure',
  changes_requested: 'amber',
  rejected: 'danger',
  draft: 'neutral',
};

export default function PartnerCourses() {
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: partnerData, refetch: refetchPartner } = useApi(() => partnerService.mine(), []);
  const { data: courses, loading, error, refetch } = useApi(() => courseService.mine(), []);
  const { data: categories } = useApi(() => courseService.categories(), []);

  const partner = partnerData?._id ? partnerData : partnerData?.data?._id ? partnerData.data : null;
  const isVerified = (partner?.status || '').toLowerCase() === 'approved';

  useEffect(() => {
    const onFocus = () => refetchPartner();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refetchPartner]);

  const [editing, setEditing] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [syllabusUploading, setSyllabusUploading] = useState(false);
  const [syllabusUrl, setSyllabusUrl] = useState('');
  const [syllabusName, setSyllabusName] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const syllabusInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm();

  const isFree = watch('isFree', false);
  const selectedFormat = watch('deliveryFormat', 'Online');

  const categoryOptions = (categories || []).map((c) => ({ value: c._id, label: c.name }));

  const openNew = () => {
    if (!isVerified) {
      toast.error('Your organization must be approved by admin before creating courses');
      return;
    }
    clearErrors();
    setSyllabusUrl('');
    setSyllabusName('');
    setImageUrl('');
    setImagePreview('');
    reset({
      title: '',
      category: categories?.[0]?._id || '',
      track: 'professional',
      level: 'Beginner',
      deliveryFormat: 'Online',
      location: '',
      duration: '8 Weeks',
      isFree: false,
      price: 2999,
      currency: 'INR',
      summary: '',
      description: '',
      learningAccess: '',
      enrolmentConditions: '',
      startDate: '',
      endDate: '',
    });
    setEditing({});
  };

  useEffect(() => {
    if (searchParams.get('action') === 'new' && isVerified && !loading) {
      openNew();
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.delete('action');
          return next;
        },
        { replace: true }
      );
    }
  }, [searchParams, isVerified, loading]);

  const openEdit = (c) => {
    clearErrors();
    setSyllabusUrl(c.syllabusUrl || '');
    setSyllabusName(c.syllabusName || '');
    setImageUrl(c.thumbnail || '');
    setImagePreview(c.thumbnail ? getMediaUrl(c.thumbnail) : '');
    reset({
      title: c.title || '',
      category: c.category?._id || c.category || '',
      track: c.track || 'professional',
      level: c.level || 'Beginner',
      deliveryFormat: c.deliveryFormat || 'Online',
      location: c.location || '',
      duration: c.duration || '',
      isFree: Boolean(c.isFree),
      price: c.price || 0,
      currency: c.currency || 'INR',
      summary: c.summary || '',
      description: c.description || '',
      learningAccess: c.learningAccess || '',
      enrolmentConditions: c.enrolmentConditions || '',
      startDate: c.startDate ? c.startDate.slice(0, 10) : '',
      endDate: c.endDate ? c.endDate.slice(0, 10) : '',
    });
    setEditing(c);
  };

  const handleSyllabusUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSyllabusUploading(true);
    try {
      const res = await uploadService.document(file);
      setSyllabusUrl(res.data?.url || res.url || '');
      setSyllabusName(res.data?.originalname || file.name);
      toast.success('Syllabus uploaded');
    } catch (err) {
      toast.error(err.message || 'Syllabus upload failed');
    } finally {
      setSyllabusUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediate local preview so thumbnail is instantly visible
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setImageUploading(true);
    try {
      const res = await uploadService.image(file);
      const serverUrl = res.data?.url || res.url || '';
      setImageUrl(serverUrl);
      toast.success('Thumbnail uploaded');
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setImageUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const onSubmit = async (values, submitForReview = false) => {
    clearErrors();
    if (values.startDate && values.endDate) {
      if (new Date(values.endDate) < new Date(values.startDate)) {
        toast.error('End date cannot be earlier than start date');
        return;
      }
    }

    const payload = {
      ...values,
      startDate: values.startDate ? values.startDate : undefined,
      endDate: values.endDate ? values.endDate : undefined,
      price: values.isFree ? 0 : Number(values.price) || 0,
      priceOnRequest: false,
      syllabusUrl,
      syllabusName,
      thumbnail: imageUrl,
      submitForReview,
    };

    try {
      if (editing?._id) {
        await courseService.update(editing._id, payload);
        toast.success(submitForReview ? 'Course submitted for review' : 'Course updated');
      } else {
        await courseService.create(payload);
        toast.success(submitForReview ? 'Course submitted for review' : 'Course draft created');
      }
      setEditing(null);
      refetch();
    } catch (err) {
      if (err.fieldErrors?.length) {
        err.fieldErrors.forEach((f) => {
          if (f.field) setError(f.field, { message: f.message });
        });
        const summary = err.fieldErrors.map((f) => f.message).join(' · ');
        toast.error(summary || err.message);
      } else {
        toast.error(err.message || 'Could not save course');
      }
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    setDeletingId(id);
    try {
      await courseService.delete(id);
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
        title="Courses & Professional Training"
        description="Manage online, offline, hybrid or self-paced courses, schedules, fees and candidate access instructions."
        actions={
          <Button size="sm" onClick={openNew} disabled={!isVerified}>
            <Plus className="h-4 w-4" aria-hidden />
            New Course
          </Button>
        }
      />

      {!isVerified && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 p-5 text-amber-950">
          <ShieldAlert className="mt-0.5 h-6 w-6 text-amber-600 shrink-0" aria-hidden />
          <div>
            <h3 className="font-bold text-body">Organization Verification Required</h3>
            <p className="mt-1 text-small text-slate-700">
              In accordance with DutyLaunch quality standards, your training provider organization profile must be verified before you can create, submit or publish courses.
            </p>
          </div>
        </div>
      )}

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={courses || []}
        rowKey={(row) => row._id}
        empty={{
          title: 'No courses added yet',
          description: isVerified
            ? 'Click "New Course" above to create your first training programme.'
            : 'Complete and submit your organization profile for verification first.',
        }}
        columns={[
          {
            key: 'title',
            header: 'Course Title',
            primary: true,
            render: (row) => (
              <div>
                <p className="font-bold text-ink">{row.title}</p>
                <p className="text-caption text-slate-500">
                  {row.category?.name || 'General'} · {row.level} · {row.duration}
                </p>
                {row.adminFeedback && (
                  <p className="mt-1 rounded bg-amber-50 px-2 py-0.5 text-caption font-medium text-amber-900 border border-amber-200 inline-block">
                    Note: {row.adminFeedback}
                  </p>
                )}
              </div>
            ),
          },
          {
            key: 'format',
            header: 'Delivery Format',
            render: (row) => (
              <div>
                <Badge tone="outline">{row.deliveryFormat || row.mode || 'Online'}</Badge>
                {row.location && (
                  <p className="mt-0.5 text-caption text-slate-500 truncate max-w-[10rem]">
                    {row.location}
                  </p>
                )}
              </div>
            ),
          },
          {
            key: 'pricing',
            header: 'Fee',
            render: (row) => (row.isFree || row.price === 0 ? <Badge tone="success">Free</Badge> : formatCurrency(row.price, row.currency)),
          },
          {
            key: 'approvalStatus',
            header: 'Review Status',
            render: (row) => (
              <Badge tone={APPROVAL_TONE[row.approvalStatus] || 'neutral'} className="capitalize">
                {row.approvalStatus || 'draft'}
              </Badge>
            ),
          },
          {
            key: 'status',
            header: 'Marketplace',
            render: (row) => (
              <span
                className={`text-caption font-semibold capitalize ${
                  row.status === 'published' ? 'text-emerald-600' : 'text-slate-500'
                }`}
              >
                {row.status}
              </span>
            ),
          },
          {
            key: 'actions',
            header: '',
            render: (row) => (
              <div className="flex justify-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => openEdit(row)} aria-label="Edit">
                  <Pencil className="h-4 w-4" aria-hidden />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(row._id)}
                  loading={deletingId === row._id}
                  className="text-danger"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* Course Modal */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?._id ? 'Edit Course' : 'New Course Offering'}
        size="lg"
      >
        <form onSubmit={handleSubmit((vals) => onSubmit(vals, false))} className="space-y-5" noValidate>
          <Input
            label="Course Name / Title"
            required
            placeholder="e.g. Certified Data Science & Machine Learning"
            error={errors.title?.message}
            {...register('title', { required: 'Enter course title' })}
          />

          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Category" options={categoryOptions} {...register('category')} />
            <Select label="Track" options={TRACKS.map((t) => ({ value: t, label: t }))} {...register('track')} />
            <Select label="Level" options={LEVELS} {...register('level')} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Delivery Format" options={FORMATS} {...register('deliveryFormat')} />
            <Input label="Duration" placeholder="e.g. 10 Weeks / 60 Hours" {...register('duration')} />
          </div>

          {['Offline', 'Hybrid'].includes(selectedFormat) && (
            <Input
              label="Location / Campus Venue"
              placeholder="e.g. Dubai Internet City Campus, Block 3"
              {...register('location')}
            />
          )}

          {/* Schedule Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Start Date (Optional for self-paced)"
              type="date"
              {...register('startDate')}
            />
            <Input
              label="End Date (Optional for self-paced)"
              type="date"
              {...register('endDate')}
            />
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-line bg-paper p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-small font-bold text-ink">Course Pricing</p>
                <p className="text-caption text-slate-500">Offer as a free course or paid offering</p>
              </div>
              <Checkbox label="This course is 100% Free" {...register('isFree')} />
            </div>

            {!isFree && (
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Input label="Price (INR)" type="number" min="1" {...register('price')} />
                <Input label="Currency" defaultValue="INR" disabled {...register('currency')} />
              </div>
            )}
          </div>

          <Textarea
            label="Short Summary"
            rows={2}
            required
            error={errors.summary?.message}
            {...register('summary', { required: 'Enter summary' })}
          />

          <Textarea
            label="Detailed Curriculum & Description"
            rows={5}
            required
            error={errors.description?.message}
            {...register('description', { required: 'Enter description' })}
          />

          <Textarea
            label="Learning Access Method & Next Steps"
            hint="Instructions shown to candidate upon enrolment (e.g. portal login link, meeting coordinates)"
            rows={2}
            {...register('learningAccess')}
          />

          {/* Syllabus & Thumbnail Upload */}
          <div className="grid gap-4 sm:grid-cols-2 rounded-xl border border-line bg-paper p-4">
            <div>
              <label className="text-small font-bold text-ink block">Syllabus / Brochure (PDF/Word)</label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  ref={syllabusInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleSyllabusUpload}
                  disabled={syllabusUploading}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => syllabusInputRef.current?.click()}
                  disabled={syllabusUploading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-small font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <Upload className="h-4 w-4" aria-hidden />
                  {syllabusUploading ? 'Uploading…' : syllabusUrl ? 'Replace' : 'Upload Syllabus'}
                </button>
                {syllabusUrl && (
                  <span className="text-caption font-semibold text-azure truncate max-w-[12rem]">
                    {syllabusName || 'Uploaded'}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="text-small font-bold text-ink block">Course Thumbnail</label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageUploading}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  disabled={imageUploading}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-small font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors disabled:opacity-60 cursor-pointer"
                >
                  <Upload className="h-4 w-4" aria-hidden />
                  {imageUploading ? 'Uploading…' : imagePreview || imageUrl ? 'Replace' : 'Upload Image'}
                </button>
                {(imagePreview || imageUrl) && (
                  <div className="flex items-center gap-2">
                    <img
                      src={imagePreview || getMediaUrl(imageUrl)}
                      alt="Thumbnail preview"
                      className="h-9 w-14 rounded object-cover border border-line shadow-xs bg-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setImagePreview('');
                      }}
                      className="text-caption font-semibold text-slate-400 hover:text-danger"
                      title="Remove thumbnail"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-line">
            <Button type="submit" variant="outline" loading={isSubmitting} disabled={isSubmitting}>
              Save Draft
            </Button>
            <Button
              type="button"
              loading={isSubmitting}
              disabled={isSubmitting}
              onClick={handleSubmit((vals) => onSubmit(vals, true))}
            >
              Submit for Admin Review
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
