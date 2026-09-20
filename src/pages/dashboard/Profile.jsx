import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileText, UploadCloud } from 'lucide-react';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { Input, Textarea, Select, FormField } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { LoadingBlock } from '../../components/ui/States.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { profileService } from '../../services/contentService.js';
import { formatDate } from '../../utils/format.js';

const MAX_MB = 5;

function ResumeCard() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const resume = user?.profile?.resumeName;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`That file is larger than ${MAX_MB}MB.`);
      return;
    }
    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);
    try {
      const res = await profileService.uploadResume(formData);
      setUser((u) => ({ ...u, profile: { ...u.profile, ...res.data } }));
      toast.success('Resume uploaded');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <h2 className="text-h3 font-bold text-ink">Resume</h2>
      <p className="mt-1 text-small text-slate-600">
        PDF or Word, up to {MAX_MB}MB. Used automatically when you apply to a job.
      </p>

      {resume && (
        <div className="mt-4 flex items-center gap-3 rounded border border-line bg-paper px-3.5 py-2.5">
          <FileText className="h-4.5 w-4.5 shrink-0 text-slate-500" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="truncate text-small font-semibold text-ink">{resume}</p>
            {user.profile?.resumeUpdatedAt && (
              <p className="text-caption text-slate-500">Updated {formatDate(user.profile.resumeUpdatedAt)}</p>
            )}
          </div>
        </div>
      )}

      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
      <Button variant="outline" size="sm" className="mt-4" loading={uploading} onClick={() => inputRef.current?.click()}>
        <UploadCloud className="h-4 w-4" aria-hidden />
        {resume ? 'Replace resume' : 'Upload resume'}
      </Button>
    </div>
  );
}

export default function Profile() {
  const { user, setUser, isEmployer } = useAuth();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (!user) return;
    reset(
      isEmployer
        ? { name: user.name, phone: user.phone, companyName: user.company?.name, companyWebsite: user.company?.website, companyAbout: user.company?.about }
        : {
            name: user.name,
            phone: user.phone,
            headline: user.profile?.headline,
            location: user.profile?.location,
            experienceYears: user.profile?.experienceYears,
            currentRole: user.profile?.currentRole,
            skills: (user.profile?.skills || []).join(', '),
            linkedinUrl: user.profile?.linkedinUrl,
          }
    );
  }, [user, isEmployer, reset]);

  if (!user) return <LoadingBlock />;

  const onSubmit = async (values) => {
    try {
      const payload = { name: values.name, phone: values.phone };
      if (isEmployer) {
        payload.company = { name: values.companyName, website: values.companyWebsite, about: values.companyAbout };
      } else {
        payload.profile = {
          headline: values.headline,
          location: values.location,
          experienceYears: values.experienceYears,
          currentRole: values.currentRole,
          skills: values.skills ? values.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
          linkedinUrl: values.linkedinUrl,
        };
      }
      const res = await profileService.update(payload);
      setUser(res.data.user);
      toast.success('Profile updated');
    } catch (error) {
      error.fieldErrors?.forEach((f) => setError(f.field, { message: f.message }));
      toast.error(error.message);
    }
  };

  return (
    <>
      <PanelHeader title="Profile" description="Kept private except for what you choose to share when you apply." />

      <div className="grid gap-6 lg:grid-cols-12">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-lg border border-line bg-white p-5 lg:col-span-8" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Full name" error={errors.name?.message} {...register('name', { required: 'Enter your name' })} />
            <Input label="Phone" type="tel" error={errors.phone?.message} {...register('phone')} />
          </div>
          <FormField label="Email address" hint="Contact support to change your sign-in email.">
            <Input value={user.email} disabled />
          </FormField>

          {isEmployer ? (
            <>
              <Input label="Company name" error={errors.companyName?.message} {...register('companyName')} />
              <Input label="Company website" error={errors.companyWebsite?.message} {...register('companyWebsite')} />
              <Textarea label="About the company" rows={4} {...register('companyAbout')} />
            </>
          ) : (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Headline" hint="e.g. Business analyst, 4 years" {...register('headline')} />
                <Input label="Current location" {...register('location')} />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Input label="Current role" {...register('currentRole')} />
                <Input label="Years of experience" type="number" min="0" max="60" {...register('experienceYears')} />
              </div>
              <Input label="Skills" hint="Comma separated" {...register('skills')} />
              <Input label="LinkedIn URL" {...register('linkedinUrl')} />
            </>
          )}

          <Button type="submit" loading={isSubmitting}>
            Save changes
          </Button>
        </form>

        <div className="lg:col-span-4">{!isEmployer && <ResumeCard />}</div>
      </div>
    </>
  );
}
