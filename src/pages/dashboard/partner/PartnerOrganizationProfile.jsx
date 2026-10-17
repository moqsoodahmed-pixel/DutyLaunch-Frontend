import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Building2,
  GraduationCap,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  ShieldCheck,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { PanelHeader } from '../../../layouts/AppShell.jsx';
import { Input, Select, Textarea } from '../../../components/ui/Field.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { LoadingBlock, ErrorState } from '../../../components/ui/States.jsx';
import { useApi } from '../../../hooks/useApi.js';
import { useToast } from '../../../context/ToastContext.jsx';
import { partnerService, uploadService } from '../../../services/contentService.js';
import { getMediaUrl } from '../../../utils/media.js';
import { cn } from '../../../utils/cn.js';

const STUDY_MODES = ['Online', 'Distance', 'Regular', 'Classroom', 'Hybrid'];

export default function PartnerOrganizationProfile() {
  const toast = useToast();
  const { data, loading, error, refetch } = useApi(() => partnerService.mine(), []);
  const profile = data?._id ? data : data?.data?._id ? data.data : data?.partner || null;
  const isVerified = (profile?.status || '').toLowerCase() === 'approved';

  // Automatically refresh when window gains focus (e.g. after approval in admin tab)
  useEffect(() => {
    const handleFocus = () => {
      refetch();
    };
    window.addEventListener('focus', handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refetch();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refetch]);

  const [orgType, setOrgType] = useState('university');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverError, setCoverError] = useState(false);
  const [docUploading, setDocUploading] = useState(false);
  const [docUrl, setDocUrl] = useState('');
  const [docName, setDocName] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: {
      name: '',
      legalName: '',
      displayName: '',
      location: '',
      address: '',
      city: '',
      state: '',
      country: 'India',
      mode: 'Online',
      about: '',
      website: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      registrationNumber: '',
      accreditationAffiliation: '',
    },
  });

  useEffect(() => {
    if (profile) {
      setOrgType(profile.orgType || 'university');
      setLogoUrl(profile.logoUrl || '');
      setCoverImageUrl(profile.coverImageUrl || '');
      setDocUrl(profile.verificationDetails?.documentUrl || '');
      setDocName(profile.verificationDetails?.documentName || '');

      reset({
        name: profile.name || '',
        legalName: profile.legalName || profile.name || '',
        displayName: profile.displayName || profile.name || '',
        location: profile.location || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || 'India',
        mode: profile.mode || 'Online',
        about: profile.about || '',
        website: profile.website || '',
        contactPerson: profile.contactPerson || '',
        contactEmail: profile.contactEmail || '',
        contactPhone: profile.contactPhone || '',
        registrationNumber: profile.verificationDetails?.registrationNumber || '',
        accreditationAffiliation: profile.verificationDetails?.accreditationAffiliation || '',
      });
    }
  }, [profile, reset]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoUploading(true);
    setLogoError(false);
    try {
      const res = await uploadService.image(file);
      setLogoUrl(res.data?.url || '');
      toast.success('Logo uploaded');
    } catch (err) {
      toast.error(err.message || 'Logo upload failed');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    setCoverError(false);
    try {
      const res = await uploadService.image(file);
      setCoverImageUrl(res.data?.url || '');
      toast.success('Cover image uploaded');
    } catch (err) {
      toast.error(err.message || 'Cover image upload failed');
    } finally {
      setCoverUploading(false);
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocUploading(true);
    try {
      const res = await uploadService.document(file);
      setDocUrl(res.data?.url || '');
      setDocName(res.data?.originalname || file.name);
      toast.success('Verification document uploaded');
    } catch (err) {
      toast.error(err.message || 'Document upload failed');
    } finally {
      setDocUploading(false);
    }
  };

  const onSubmit = async (values, submitForReview = false) => {
    try {
      const payload = {
        ...values,
        orgType,
        track: orgType === 'university' ? 'education' : 'courses',
        logoUrl,
        coverImageUrl,
        verificationDetails: {
          registrationNumber: values.registrationNumber || '',
          accreditationAffiliation: values.accreditationAffiliation || '',
          documentUrl: docUrl,
          documentName: docName,
        },
        status: submitForReview ? 'pending' : (profile?.status || 'incomplete'),
      };

      await partnerService.saveMine(payload);

      if (submitForReview) {
        toast.success('Organization submitted for admin verification!');
      } else {
        toast.success('Organization profile saved successfully');
      }
      refetch();
    } catch (err) {
      err.fieldErrors?.forEach((f) => setError(f.field, { message: f.message }));
      toast.error(err.message || 'Failed to save organization profile');
    }
  };

  if (loading) return <LoadingBlock label="Loading organization profile..." />;
  if (error) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <div className="space-y-8">
      <PanelHeader
        title="Organization Profile & Verification"
        description="Provide verified institution information and official documentation to list your programmes and courses on DutyLaunch."
      />

      {/* Review Feedback Banner if rejected or changes requested */}
      {profile?.reviewNote && ['changes_requested', 'rejected'].includes(profile?.status) && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-small text-amber-900 shadow-xs">
          <p className="flex items-center gap-2 font-bold">
            <AlertTriangle className="h-5 w-5 text-amber-600" aria-hidden />
            Reviewer Feedback / Requested Changes
          </p>
          <p className="mt-1 text-slate-800">{profile.reviewNote}</p>
          <p className="mt-2 text-caption text-slate-600">
            Please make the required adjustments below and click "Submit for Verification" to re-evaluate your profile.
          </p>
        </div>
      )}

      {/* Verification Status Summary & Verified Banner */}
      {isVerified && (
        <div className="rounded-2xl border border-emerald-400 bg-emerald-50/70 p-5 sm:p-6 text-emerald-950 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-emerald-600 text-white shadow-xs">
                <CheckCircle2 className="h-6 w-6" aria-hidden />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-body font-bold text-emerald-950">Verified Partner Organization</h3>
                  <Badge tone="success" className="font-semibold">Verified</Badge>
                </div>
                <p className="mt-1 text-small text-emerald-800 leading-relaxed">
                  Your credentials and verification documents have been officially evaluated and approved by DutyLaunch. Your institution holds full verified status across the platform.
                </p>
              </div>
            </div>
            {profile?._id && (
              <Button
                to={`/universities/${profile._id}`}
                target="_blank"
                variant="outline"
                size="sm"
                className="shrink-0 border-emerald-600 text-emerald-900 hover:bg-emerald-100 bg-white shadow-xs"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                View Public Profile
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-4">
        <div className="flex items-center gap-2.5">
          <span className="text-small font-semibold text-ink">Verification Status:</span>
          <Badge
            tone={
              isVerified
                ? 'success'
                : profile?.status === 'pending'
                ? 'azure'
                : profile?.status === 'changes_requested'
                ? 'amber'
                : profile?.status === 'rejected'
                ? 'danger'
                : 'neutral'
            }
            className="capitalize font-semibold"
          >
            {isVerified ? 'Verified' : (profile?.status || 'Incomplete')}
          </Badge>
        </div>
        {profile?.reviewedAt && (
          <span className="text-caption text-slate-500">
            Last evaluated: {new Date(profile.reviewedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit((vals) => onSubmit(vals, false))} className="space-y-8" noValidate>
        {/* Step 1: Organization Type */}
        <section className="tile p-5 sm:p-6">
          <h2 className="text-h3 font-bold text-ink">1. Organization Type</h2>
          <p className="mt-1 text-small text-slate-600">
            Select the category that best represents your legal entity. This configures your marketplace tools.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setOrgType('university')}
              className={cn(
                'flex flex-col items-start rounded-xl border p-5 text-left transition-all',
                orgType === 'university'
                  ? 'border-azure-500 bg-azure-50/70 shadow-xs ring-2 ring-azure-500/20'
                  : 'border-line bg-white hover:border-azure-300'
              )}
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-white shadow-xs">
                <GraduationCap className="h-6 w-6 text-azure" aria-hidden />
              </span>
              <p className="mt-3 text-body font-bold text-ink">
                University / Higher Education Institution
              </p>
              <p className="mt-1 text-caption text-slate-600">
                For universities, colleges, and accredited academic institutions offering undergraduate, postgraduate, and diploma degrees.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setOrgType('edtech')}
              className={cn(
                'flex flex-col items-start rounded-xl border p-5 text-left transition-all',
                orgType === 'edtech'
                  ? 'border-azure-500 bg-azure-50/70 shadow-xs ring-2 ring-azure-500/20'
                  : 'border-line bg-white hover:border-azure-300'
              )}
            >
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-white shadow-xs">
                <Building2 className="h-6 w-6 text-azure" aria-hidden />
              </span>
              <p className="mt-3 text-body font-bold text-ink">EdTech / Training Company</p>
              <p className="mt-1 text-caption text-slate-600">
                For professional training providers, institutes, and EdTech companies offering online courses, classroom bootcamps, or certification tracks.
              </p>
            </button>
          </div>
        </section>

        {/* Step 2: Legal & Identity Details */}
        <section className="tile space-y-5 p-5 sm:p-6">
          <h2 className="text-h3 font-bold text-ink">2. Legal & Public Identity</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              label="Legal / Registered Organization Name"
              required
              error={errors.legalName?.message}
              {...register('legalName', { required: 'Enter legal registered name' })}
            />
            <Input
              label="Public Display Name"
              required
              hint="Name shown on public cards and catalogue"
              error={errors.name?.message}
              {...register('name', { required: 'Enter public display name' })}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Input
              label="Official Website"
              placeholder="https://"
              type="url"
              error={errors.website?.message}
              {...register('website')}
            />
            <Input
              label="City"
              required
              error={errors.location?.message}
              {...register('location', { required: 'Enter city or headquarters' })}
            />
            <Select
              label="Primary Delivery Mode"
              options={STUDY_MODES}
              {...register('mode')}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Input label="State / Province" {...register('state')} />
            <Input label="Country" {...register('country')} />
            <Input label="Headquarters / Campus Address" {...register('address')} />
          </div>

          <Textarea
            label="About the Organization"
            hint="Public description shown on your profile and programme listings"
            rows={4}
            error={errors.about?.message}
            {...register('about', { required: 'Please provide an overview of your organization' })}
          />

          {/* Logo & Cover Image Uploads */}
          <div className="grid gap-6 sm:grid-cols-2 pt-2">
            <div className="rounded-xl border border-line bg-paper p-4">
              <label className="text-small font-bold text-ink block">Organization Logo</label>
              <p className="text-caption text-slate-500 mb-3">Square aspect ratio (PNG/JPG/WebP)</p>
              <div className="flex flex-wrap items-center gap-4">
                {logoUrl && !logoError ? (
                  <img
                    src={getMediaUrl(logoUrl)}
                    alt=""
                    onError={() => setLogoError(true)}
                    className="h-16 w-16 rounded-xl border border-line object-cover bg-white"
                  />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-xl border border-dashed border-slate-300 bg-white">
                    <Building2 className="h-6 w-6 text-slate-400" aria-hidden />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-small font-semibold text-slate-700 shadow-xs hover:bg-slate-50">
                      <Upload className="h-4 w-4" aria-hidden />
                      {logoUploading ? 'Uploading…' : 'Choose Logo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={logoUploading}
                      className="sr-only"
                    />
                  </label>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setLogoUrl('');
                        setLogoError(false);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-caption font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-line bg-paper p-4">
              <label className="text-small font-bold text-ink block">
                {orgType === 'university' ? 'Campus Cover Image' : 'Brand Cover Banner'}
              </label>
              <p className="text-caption text-slate-500 mb-3">Wide aspect ratio (16:9 or 5:4)</p>
              <div className="flex flex-wrap items-center gap-4">
                {coverImageUrl && !coverError ? (
                  <img
                    src={getMediaUrl(coverImageUrl)}
                    alt=""
                    onError={() => setCoverError(true)}
                    className="h-16 w-28 rounded-xl border border-line object-cover bg-white"
                  />
                ) : (
                  <div className="grid h-16 w-28 place-items-center rounded-xl border border-dashed border-slate-300 bg-white">
                    <FileText className="h-6 w-6 text-slate-400" aria-hidden />
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-small font-semibold text-slate-700 shadow-xs hover:bg-slate-50">
                      <Upload className="h-4 w-4" aria-hidden />
                      {coverUploading ? 'Uploading…' : 'Choose Banner'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      disabled={coverUploading}
                      className="sr-only"
                    />
                  </label>
                  {coverImageUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setCoverImageUrl('');
                        setCoverError(false);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-caption font-semibold text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 3: Official Contact & Verification Support */}
        <section className="tile space-y-5 p-5 sm:p-6">
          <h2 className="text-h3 font-bold text-ink">3. Official Contact & Verification</h2>
          <p className="mt-1 text-small text-slate-600">
            Used by DutyLaunch compliance officers for administrative coordination and payout notifications.
          </p>

          <div className="grid gap-5 sm:grid-cols-3">
            <Input
              label="Contact Person Name"
              required
              error={errors.contactPerson?.message}
              {...register('contactPerson', { required: 'Enter official contact person' })}
            />
            <Input
              label="Official Contact Email"
              type="email"
              required
              error={errors.contactEmail?.message}
              {...register('contactEmail', { required: 'Enter official email' })}
            />
            <Input
              label="Official Phone Number"
              type="tel"
              {...register('contactPhone')}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 pt-2">
            <Input
              label={orgType === 'university' ? 'University / UGC Registration No.' : 'Company Registration / CIN'}
              placeholder="e.g. UGC-2018-9941 or CIN-U72900KA2021PTC"
              {...register('registrationNumber')}
            />
            <Input
              label={orgType === 'university' ? 'Affiliation / Recognition' : 'Accreditation / Certifications'}
              placeholder="e.g. State University Act, AICTE, ISO 9001"
              {...register('accreditationAffiliation')}
            />
          </div>

          {/* Verification Document Upload */}
          <div className="rounded-xl border border-azure-200 bg-azure-50/50 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-6 w-6 text-azure shrink-0 mt-0.5" aria-hidden />
              <div className="flex-1">
                <p className="text-body font-bold text-ink">Verification Certificate / Registration Document</p>
                <p className="text-caption text-slate-600 mt-0.5">
                  Upload official certificate of incorporation, university gazette notification, or accreditation certificate (PDF or Word, max 10MB).
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-small font-semibold text-ink shadow-xs hover:bg-slate-50">
                      <Upload className="h-4 w-4" aria-hidden />
                      {docUploading ? 'Uploading…' : docUrl ? 'Replace Document' : 'Upload Verification Doc'}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleDocUpload}
                      disabled={docUploading}
                      className="sr-only"
                    />
                  </label>
                  {docUrl && (
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-caption font-semibold text-azure hover:underline"
                    >
                      <FileText className="h-4 w-4" aria-hidden />
                      <span>{docName || 'View Uploaded Document'}</span>
                      <ExternalLink className="h-3 w-3" aria-hidden />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" size="lg" loading={isSubmitting} disabled={isSubmitting}>
              {isVerified ? 'Save Profile Changes' : 'Save Profile'}
            </Button>
            {!isVerified && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                loading={isSubmitting}
                disabled={isSubmitting}
                onClick={handleSubmit((vals) => onSubmit(vals, true))}
                className="border-azure-500 text-azure-700 hover:bg-azure-50"
              >
                Submit for Verification
              </Button>
            )}
            {isVerified && profile?._id && (
              <Button
                to={`/universities/${profile._id}`}
                target="_blank"
                variant="outline"
                size="lg"
                className="border-line text-ink hover:bg-slate-50"
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                View Public Profile
              </Button>
            )}
          </div>

          <p className="text-caption text-slate-500">
            {isVerified
              ? 'Your organization is verified. Changing name, legal identity or registration details will initiate a re-evaluation review.'
              : 'Our compliance team reviews credentials within 1-2 business days.'}
          </p>
        </div>
      </form>
    </div>
  );
}
