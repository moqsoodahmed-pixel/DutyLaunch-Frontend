import { useEffect, useState, useRef } from 'react';
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
  Lock,
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
  const isApprovedOrg = Boolean(profile?.isApproved || (profile?.status || '').toLowerCase() === 'approved');
  const isVerified = (profile?.status || '').toLowerCase() === 'approved';

  const initializedRef = useRef(false);

  const [orgType, setOrgType] = useState('university');
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState('');
  const [logoError, setLogoError] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
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
    if (profile && !initializedRef.current) {
      initializedRef.current = true;
      const pending = profile.pendingChanges || {};
      const activeData = {
        ...profile,
        ...pending,
        verificationDetails: {
          ...(profile.verificationDetails || {}),
          ...(pending.verificationDetails || {}),
        },
      };

      setOrgType(profile.orgType || 'university');
      setLogoUrl(activeData.logoUrl || '');
      setLogoPreview(activeData.logoUrl ? getMediaUrl(activeData.logoUrl) : '');
      setCoverImageUrl(activeData.coverImageUrl || '');
      setCoverPreview(activeData.coverImageUrl ? getMediaUrl(activeData.coverImageUrl) : '');
      setDocUrl(activeData.verificationDetails?.documentUrl || '');
      setDocName(activeData.verificationDetails?.documentName || '');

      reset({
        name: activeData.name || '',
        legalName: activeData.legalName || activeData.name || '',
        displayName: activeData.displayName || activeData.name || '',
        location: activeData.location || '',
        address: activeData.address || '',
        city: activeData.city || '',
        state: activeData.state || '',
        country: activeData.country || 'India',
        mode: activeData.mode || 'Online',
        about: activeData.about || '',
        website: activeData.website || '',
        contactPerson: activeData.contactPerson || '',
        contactEmail: activeData.contactEmail || '',
        contactPhone: activeData.contactPhone || '',
        registrationNumber: activeData.verificationDetails?.registrationNumber || '',
        accreditationAffiliation: activeData.verificationDetails?.accreditationAffiliation || '',
      });
    }
  }, [profile, reset]);

  const handleLogoUpload = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    // Immediate local preview so the user sees their chosen photo right away
    const localUrl = URL.createObjectURL(file);
    setLogoPreview(localUrl);
    setLogoError(false);
    setLogoUploading(true);

    try {
      const res = await uploadService.image(file);
      const serverUrl = res.data?.url || res.url || '';
      if (!serverUrl) throw new Error('No URL returned from server');
      setLogoUrl(serverUrl);
      if (profile?._id) {
        try {
          await partnerService.saveMine({ logoUrl: serverUrl });
        } catch {
          // Will be persisted upon clicking save
        }
      }
      toast.success('Logo uploaded successfully');
    } catch (err) {
      toast.error(err.message || 'Logo upload failed');
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    setLogoUrl('');
    setLogoPreview('');
    setLogoError(false);
    if (profile?._id) {
      try {
        await partnerService.saveMine({ logoUrl: '' });
      } catch {
        // Will be persisted upon clicking save
      }
    }
    toast.success('Logo removed');
  };

  const handleCoverUpload = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;

    // Immediate local preview so the user sees their chosen banner right away
    const localUrl = URL.createObjectURL(file);
    setCoverPreview(localUrl);
    setCoverError(false);
    setCoverUploading(true);

    try {
      const res = await uploadService.image(file);
      const serverUrl = res.data?.url || res.url || '';
      if (!serverUrl) throw new Error('No URL returned from server');
      setCoverImageUrl(serverUrl);
      if (profile?._id) {
        try {
          await partnerService.saveMine({ coverImageUrl: serverUrl });
        } catch {
          // Will be persisted upon clicking save
        }
      }
      toast.success('Cover banner uploaded successfully');
    } catch (err) {
      toast.error(err.message || 'Cover banner upload failed');
    } finally {
      setCoverUploading(false);
    }
  };

  const handleRemoveCover = async () => {
    setCoverImageUrl('');
    setCoverPreview('');
    setCoverError(false);
    if (profile?._id) {
      try {
        await partnerService.saveMine({ coverImageUrl: '' });
      } catch {
        // Will be persisted upon clicking save
      }
    }
    toast.success('Cover banner removed');
  };

  const handleDocUpload = async (e) => {
    const file = e.target?.files?.[0];
    if (!file) return;
    setDocUploading(true);
    try {
      const res = await uploadService.document(file);
      const url = res.data?.url || '';
      const name = res.data?.originalname || file.name;
      setDocUrl(url);
      setDocName(name);
      if (profile?._id) {
        try {
          await partnerService.saveMine({
            verificationDetails: {
              ...(profile?.verificationDetails || {}),
              documentUrl: url,
              documentName: name,
            },
          });
        } catch {
          // Will be persisted upon clicking save
        }
      }
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
        name: values.name || values.displayName || values.legalName,
        displayName: values.name || values.displayName,
        legalName: values.legalName || values.name,
        orgType: isApprovedOrg ? (profile?.orgType || orgType) : orgType,
        track: 'both',
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

      const res = await partnerService.saveMine(payload);

      if (isApprovedOrg) {
        toast.success(
          res?.message ||
            'Profile changes submitted for admin review! Once approved, they will automatically be applied.'
        );
      } else if (submitForReview) {
        toast.success('Organization submitted for admin verification!');
      } else {
        toast.success('Organization profile saved successfully');
      }
      initializedRef.current = false;
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

      {/* Pending Changes Under Review Banner */}
      {profile?.pendingChanges && (
        <div className="rounded-2xl border border-sky-300 bg-sky-50/90 p-5 sm:p-6 text-sky-950 shadow-sm">
          <div className="flex items-start gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-600 text-white shadow-xs">
              <Clock className="h-6 w-6" aria-hidden />
            </span>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-body font-bold text-sky-950">Profile Updates Awaiting Admin Review</h3>
                <Badge tone="azure" className="font-semibold">Review Pending</Badge>
              </div>
              <p className="mt-1 text-small text-sky-800 leading-relaxed">
                You have submitted updates to your organization profile. Our compliance team will review and approve these changes.
                Your current verified profile remains active across the platform. Once an admin approves the changes, they will automatically be saved and applied to your live profile.
              </p>
              {profile.pendingChanges.submittedAt && (
                <p className="mt-2 text-caption text-sky-700">
                  Submitted on: {new Date(profile.pendingChanges.submittedAt).toLocaleString()}
                </p>
              )}
            </div>
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
          {profile?.pendingChanges && (
            <Badge tone="azure" className="font-semibold">Updates In Review</Badge>
          )}
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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-h3 font-bold text-ink">1. Organization Type</h2>
            {isApprovedOrg && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-caption font-bold text-emerald-800 border border-emerald-300">
                <Lock className="h-3.5 w-3.5 text-emerald-700" />
                Verified & Locked
              </span>
            )}
          </div>
          <p className="mt-1 text-small text-slate-600">
            {isApprovedOrg
              ? 'Your organization type has been officially verified and locked. Organization type cannot be modified once approved. To request a change in legal entity category, contact administration.'
              : 'Select the category that best represents your legal entity. Any verified organization can offer both degree programmes and training courses.'}
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              disabled={isApprovedOrg}
              onClick={() => !isApprovedOrg && setOrgType('university')}
              className={cn(
                'flex flex-col items-start rounded-xl border p-5 text-left transition-all',
                orgType === 'university'
                  ? 'border-azure-500 bg-azure-50/70 shadow-xs ring-2 ring-azure-500/20'
                  : 'border-line bg-white hover:border-azure-300',
                isApprovedOrg && orgType !== 'university' && 'opacity-40 cursor-not-allowed hover:border-line',
                isApprovedOrg && orgType === 'university' && 'cursor-default'
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white shadow-xs">
                  <GraduationCap className="h-6 w-6 text-azure" aria-hidden />
                </span>
                {isApprovedOrg && orgType === 'university' && (
                  <span className="inline-flex items-center gap-1 text-caption font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Approved
                  </span>
                )}
              </div>
              <p className="mt-3 text-body font-bold text-ink">
                University / Higher Education Institution
              </p>
              <p className="mt-1 text-caption text-slate-600">
                For universities, colleges, and accredited academic institutions. You can offer degree & diploma programmes as well as skill courses.
              </p>
            </button>

            <button
              type="button"
              disabled={isApprovedOrg}
              onClick={() => !isApprovedOrg && setOrgType('edtech')}
              className={cn(
                'flex flex-col items-start rounded-xl border p-5 text-left transition-all',
                orgType === 'edtech'
                  ? 'border-azure-500 bg-azure-50/70 shadow-xs ring-2 ring-azure-500/20'
                  : 'border-line bg-white hover:border-azure-300',
                isApprovedOrg && orgType !== 'edtech' && 'opacity-40 cursor-not-allowed hover:border-line',
                isApprovedOrg && orgType === 'edtech' && 'cursor-default'
              )}
            >
              <div className="flex w-full items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-lg bg-white shadow-xs">
                  <Building2 className="h-6 w-6 text-azure" aria-hidden />
                </span>
                {isApprovedOrg && orgType === 'edtech' && (
                  <span className="inline-flex items-center gap-1 text-caption font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" /> Approved
                  </span>
                )}
              </div>
              <p className="mt-3 text-body font-bold text-ink">EdTech / Training Company</p>
              <p className="mt-1 text-caption text-slate-600">
                For professional training providers, institutes, and EdTech companies. You can offer courses & certifications as well as degree programmes.
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
              <p className="text-caption text-slate-500 mb-3">Square aspect ratio (PNG, JPG, WebP, SVG)</p>
              <div className="flex flex-wrap items-center gap-4">
                <label
                  htmlFor="logo-file-input"
                  title="Click to choose a new logo"
                  className={cn(
                    "relative group h-16 w-16 shrink-0 rounded-xl border border-line overflow-hidden bg-white cursor-pointer shadow-xs transition-all hover:ring-2 hover:ring-azure-500/40",
                    logoUploading && "pointer-events-none opacity-60"
                  )}
                >
                  {logoPreview && !logoError ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      onError={() => setLogoError(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center border border-dashed border-slate-300">
                      <Building2 className="h-6 w-6 text-slate-400 group-hover:text-azure" aria-hidden />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Upload className="h-5 w-5" />
                  </div>
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="logo-file-input"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-small font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer",
                      logoUploading && "pointer-events-none opacity-50"
                    )}
                  >
                    <Upload className="h-4 w-4" aria-hidden />
                    {logoUploading ? 'Uploading…' : (logoPreview ? 'Change Logo' : 'Choose Logo')}
                  </label>
                  <input
                    id="logo-file-input"
                    type="file"
                    accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.gif"
                    onClick={(e) => { e.target.value = null; }}
                    onChange={handleLogoUpload}
                    disabled={logoUploading}
                    className="sr-only"
                  />
                  {(logoPreview || logoUrl) && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-caption font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
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
                <label
                  htmlFor="cover-file-input"
                  title="Click to choose a new cover banner"
                  className={cn(
                    "relative group h-16 w-28 shrink-0 rounded-xl border border-line overflow-hidden bg-white cursor-pointer shadow-xs transition-all hover:ring-2 hover:ring-azure-500/40",
                    coverUploading && "pointer-events-none opacity-60"
                  )}
                >
                  {coverPreview && !coverError ? (
                    <img
                      src={coverPreview}
                      alt="Cover banner preview"
                      onError={() => setCoverError(true)}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center border border-dashed border-slate-300">
                      <FileText className="h-6 w-6 text-slate-400 group-hover:text-azure" aria-hidden />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Upload className="h-5 w-5" />
                  </div>
                </label>

                <div className="flex flex-wrap items-center gap-2">
                  <label
                    htmlFor="cover-file-input"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-small font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors cursor-pointer",
                      coverUploading && "pointer-events-none opacity-50"
                    )}
                  >
                    <Upload className="h-4 w-4" aria-hidden />
                    {coverUploading ? 'Uploading…' : (coverPreview ? 'Change Banner' : 'Choose Banner')}
                  </label>
                  <input
                    id="cover-file-input"
                    type="file"
                    accept="image/*,.png,.jpg,.jpeg,.webp,.svg,.gif"
                    onClick={(e) => { e.target.value = null; }}
                    onChange={handleCoverUpload}
                    disabled={coverUploading}
                    className="sr-only"
                  />
                  {(coverPreview || coverImageUrl) && (
                    <button
                      type="button"
                      onClick={handleRemoveCover}
                      className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-caption font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer"
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
                  <label
                    htmlFor="doc-file-input"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-small font-semibold text-ink shadow-xs hover:bg-slate-50 transition-colors cursor-pointer",
                      docUploading && "pointer-events-none opacity-50"
                    )}
                  >
                    <Upload className="h-4 w-4" aria-hidden />
                    {docUploading ? 'Uploading…' : docUrl ? 'Replace Document' : 'Upload Verification Doc'}
                  </label>
                  <input
                    id="doc-file-input"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onClick={(e) => { e.target.value = null; }}
                    onChange={handleDocUpload}
                    disabled={docUploading}
                    className="sr-only"
                  />
                  {docUrl && (
                    <a
                      href={getMediaUrl(docUrl)}
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
            <Button
              type="submit"
              size="lg"
              loading={isSubmitting || logoUploading || coverUploading || docUploading}
              disabled={isSubmitting || logoUploading || coverUploading || docUploading}
            >
              {isApprovedOrg
                ? profile?.pendingChanges
                  ? 'Update Submitted Changes'
                  : 'Save & Submit Profile Changes'
                : 'Save Profile'}
            </Button>
            {!isApprovedOrg && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                loading={isSubmitting || logoUploading || coverUploading || docUploading}
                disabled={isSubmitting || logoUploading || coverUploading || docUploading}
                onClick={handleSubmit((vals) => onSubmit(vals, true))}
                className="border-azure-500 text-azure-700 hover:bg-azure-50"
              >
                Submit for Verification
              </Button>
            )}
            {profile?._id && (
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
            {isApprovedOrg
              ? 'Your organization is approved. Any profile changes will be sent to admin review and automatically applied once approved.'
              : 'Our compliance team reviews credentials within 1-2 business days.'}
          </p>
        </div>
      </form>
    </div>
  );
}
