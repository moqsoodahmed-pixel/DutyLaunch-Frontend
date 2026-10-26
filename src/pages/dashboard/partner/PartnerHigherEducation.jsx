import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import {
  Plus,
  Pencil,
  Trash2,
  FileText,
  Upload,
  ExternalLink,
  ShieldAlert,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';
import { PanelHeader } from '../../../layouts/AppShell.jsx';
import { DataTable } from '../../../components/admin/DataTable.jsx';
import { Modal } from '../../../components/ui/Modal.jsx';
import { Input, Textarea, Select } from '../../../components/ui/Field.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { useApi } from '../../../hooks/useApi.js';
import { useToast } from '../../../context/ToastContext.jsx';
import { educationService, partnerService, uploadService } from '../../../services/contentService.js';
import { formatCurrency } from '../../../utils/format.js';

const LEVELS = ['Undergraduate', 'Postgraduate', 'Diploma', 'Doctorate', 'Certificate'];
const FORMATS = ['Online', 'Offline', 'Hybrid', 'Self-paced'];

const APPROVAL_TONE = {
  approved: 'success',
  pending: 'azure',
  changes_requested: 'amber',
  rejected: 'danger',
  draft: 'neutral',
};

export default function PartnerHigherEducation() {
  const toast = useToast();
  const { data: partnerData, refetch: refetchPartner } = useApi(() => partnerService.mine(), []);
  const { data: programmes, loading, error, refetch } = useApi(() => educationService.mine(), []);

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

  const syllabusInputRef = useRef(null);
  const imageInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const openNew = () => {
    if (!isVerified) {
      toast.error('Your organization must be approved by admin before creating programmes');
      return;
    }
    setSyllabusUrl('');
    setSyllabusName('');
    setImageUrl('');
    reset({
      title: '',
      qualification: '',
      level: 'Undergraduate',
      field: 'Engineering',
      summary: '',
      description: '',
      deliveryFormat: 'Online',
      duration: '4 Years',
      fee: 100000,
      currency: 'INR',
      enrolmentInstructions: '',
    });
    setEditing({});
  };

  const openEdit = (p) => {
    setSyllabusUrl(p.syllabusUrl || '');
    setSyllabusName(p.syllabusName || '');
    setImageUrl(p.image || '');
    reset({
      title: p.title || '',
      qualification: p.qualification || '',
      level: p.level || 'Undergraduate',
      field: p.field || '',
      summary: p.summary || '',
      description: p.description || '',
      deliveryFormat: p.deliveryFormat || 'Online',
      duration: p.duration || '',
      fee: p.fee || 0,
      currency: p.currency || 'INR',
      enrolmentInstructions: p.enrolmentInstructions || '',
    });
    setEditing(p);
  };

  const handleSyllabusUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSyllabusUploading(true);
    try {
      const res = await uploadService.document(file);
      setSyllabusUrl(res.data?.url || '');
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
    setImageUploading(true);
    try {
      const res = await uploadService.image(file);
      setImageUrl(res.data?.url || '');
      toast.success('Cover image uploaded');
    } catch (err) {
      toast.error(err.message || 'Image upload failed');
    } finally {
      setImageUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const onSubmit = async (values, submitForReview = false) => {
    const payload = {
      ...values,
      fee: Number(values.fee) || 0,
      syllabusUrl,
      syllabusName,
      image: imageUrl,
      submitForReview,
    };

    try {
      if (editing?._id) {
        await educationService.update(editing._id, payload);
        toast.success(submitForReview ? 'Programme submitted for review' : 'Programme updated');
      } else {
        await educationService.create(payload);
        toast.success(submitForReview ? 'Programme submitted for review' : 'Programme draft created');
      }
      setEditing(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not save programme');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this education programme?')) return;
    setDeletingId(id);
    try {
      await educationService.delete(id);
      toast.success('Programme deleted');
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
        title="Higher Education Programmes"
        description="Manage your institution's university programmes, qualifications, fees, syllabi and public admission details."
        actions={
          <Button size="sm" onClick={openNew} disabled={!isVerified}>
            <Plus className="h-4 w-4" aria-hidden />
            New Programme
          </Button>
        }
      />

      {!isVerified && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50/80 p-5 text-amber-950">
          <ShieldAlert className="mt-0.5 h-6 w-6 text-amber-600 shrink-0" aria-hidden />
          <div>
            <h3 className="font-bold text-body">Organization Verification Required</h3>
            <p className="mt-1 text-small text-slate-700">
              In accordance with DutyLaunch quality and regulatory standards, your university organization profile must be reviewed and verified by an admin before you can create, submit or publish programme listings.
            </p>
          </div>
        </div>
      )}

      <DataTable
        loading={loading}
        error={error}
        onRetry={refetch}
        rows={programmes || []}
        rowKey={(row) => row._id}
        empty={{
          title: 'No higher education programmes yet',
          description: isVerified
            ? 'Click "New Programme" above to create your first degree or diploma offering.'
            : 'Complete and submit your organization profile for verification first.',
        }}
        columns={[
          {
            key: 'title',
            header: 'Programme & Qualification',
            primary: true,
            render: (row) => (
              <div>
                <p className="font-bold text-ink">{row.title}</p>
                <p className="text-caption text-slate-500">
                  {row.qualification || row.level} · {row.field} · {row.duration}
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
            header: 'Format',
            render: (row) => <Badge tone="outline">{row.deliveryFormat || 'Online'}</Badge>,
          },
          {
            key: 'fee',
            header: 'Fee (Per Year)',
            render: (row) => (row.fee > 0 ? `${formatCurrency(row.fee, row.currency)} / yr` : 'Free / Included'),
          },
          {
            key: 'syllabus',
            header: 'Syllabus',
            render: (row) =>
              row.syllabusUrl ? (
                <a
                  href={row.syllabusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-caption font-semibold text-azure hover:underline"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden />
                  {row.syllabusName || 'View PDF'}
                </a>
              ) : (
                <span className="text-caption text-slate-400">Not uploaded</span>
              ),
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

      {/* Programme Modal */}
      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?._id ? 'Edit Programme' : 'New Education Programme'}
        size="lg"
      >
        <form onSubmit={handleSubmit((vals) => onSubmit(vals, false))} className="space-y-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Programme Name"
              required
              placeholder="e.g. Master of Business Administration"
              error={errors.title?.message}
              {...register('title', { required: 'Enter programme name' })}
            />
            <Input
              label="Qualification / Award"
              placeholder="e.g. MBA (Finance) or B.Tech"
              {...register('qualification')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Education Level" options={LEVELS} {...register('level')} />
            <Input
              label="Field of Study"
              required
              placeholder="e.g. Management, Computer Science"
              error={errors.field?.message}
              {...register('field', { required: 'Enter field of study' })}
            />
            <Select label="Delivery Format" options={FORMATS} {...register('deliveryFormat')} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Programme Duration" placeholder="e.g. 2 Years / 4 Semesters" {...register('duration')} />
            <Input
              label="Programme Fee (INR / Year)"
              type="number"
              min="0"
              placeholder="e.g. 100000"
              hint="Annual tuition fee per year"
              {...register('fee')}
            />
          </div>

          <Textarea
            label="Short Summary"
            rows={2}
            required
            error={errors.summary?.message}
            {...register('summary', { required: 'Enter summary' })}
          />

          <Textarea
            label="Detailed Description & Curriculum"
            rows={5}
            required
            error={errors.description?.message}
            {...register('description', { required: 'Enter description' })}
          />

          <Textarea
            label="Enrolment & Admission Instructions"
            hint="Details shown to candidate upon checkout or application"
            rows={2}
            {...register('enrolmentInstructions')}
          />

          {/* Syllabus & Image Upload */}
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
              <label className="text-small font-bold text-ink block">Programme Cover Image</label>
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
                  {imageUploading ? 'Uploading…' : imageUrl ? 'Replace' : 'Upload Image'}
                </button>
                {imageUrl && (
                  <img src={imageUrl} alt="Preview" className="h-8 w-12 rounded object-cover border" />
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
