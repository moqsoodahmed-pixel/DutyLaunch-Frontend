import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Seo } from '../../components/ui/Seo.jsx';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { Input, Textarea, Select, Checkbox, FormField } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { LoadingBlock, ErrorState } from '../../components/ui/States.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { employerService, jobService } from '../../services/jobService.js';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const WORK_MODES = ['On-site', 'Hybrid', 'Remote'];
const CURRENCIES = ['INR', 'AED', 'USD', 'GBP', 'EUR'];

/** Turns a textarea of one item per line into a clean string array. */
function linesToArray(text = '') {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

export default function EmployerJobForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();

  const [existing, setExisting] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(isEdit);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        let found = null;
        // 1. Try dedicated employer GET endpoint
        try {
          const res = await employerService.getJob(id);
          const candidate = res?.data ?? res;
          if (candidate && (candidate.title || candidate._id)) {
            found = candidate;
          }
        } catch {
          // If server returns 404 (route not found on older deploys), fall through
          found = null;
        }

        // 2. Try fetching from public/authenticated job endpoint
        if (!found) {
          try {
            const res = await jobService.get(id);
            const candidate = res?.job ?? res?.data?.job ?? (res?.title ? res : null);
            if (candidate && (candidate.title || candidate._id)) {
              found = candidate;
            }
          } catch {
            found = null;
          }
        }

        // 3. Fallback: find it in employer's jobs list
        if (!found) {
          try {
            const res = await employerService.listJobs({ limit: 100 });
            const list = res?.data ?? res ?? [];
            if (Array.isArray(list)) {
              found = list.find((j) => j._id === id || j.slug === id);
            }
          } catch {
            found = null;
          }
        }

        if (!found) throw new Error('Job post not found or could not be loaded.');
        setExisting(found);
      } catch (err) {
        setLoadError(err);
      } finally {
        setLoadingExisting(false);
      }
    })();
  }, [id, isEdit]);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { status: 'published', jobType: 'Full-time', workMode: 'On-site', currency: 'INR', period: 'year' },
  });

  // The backend (validators/schemas.js) rejects a description under 40
  // characters. Matching that here, with a live count, means someone finds
  // out while they are still typing — not after a round trip to the server
  // that comes back with "Some fields need attention" and no clue which one.
  const DESCRIPTION_MIN = 40;
  const descriptionLength = (watch('description') || '').trim().length;

  useEffect(() => {
    if (!existing) return;
    reset({
      title: existing.title,
      company: existing.company,
      location: existing.location,
      country: existing.country,
      category: existing.category,
      jobType: existing.jobType,
      workMode: existing.workMode,
      description: existing.description,
      responsibilities: (existing.responsibilities || []).join('\n'),
      requirements: (existing.requirements || []).join('\n'),
      skills: (existing.skills || []).join(', '),
      minExperience: existing.experience?.min,
      maxExperience: existing.experience?.max,
      minSalary: existing.salary?.min,
      maxSalary: existing.salary?.max,
      currency: existing.salary?.currency || 'INR',
      period: existing.salary?.period || 'year',
      disclosed: existing.salary?.disclosed,
      status: existing.status,
    });
  }, [existing, reset]);

  const onSubmit = async (values) => {
    clearErrors();
    const minExp = values.minExperience !== '' && values.minExperience !== undefined ? Number(values.minExperience) : undefined;
    const maxExp = values.maxExperience !== '' && values.maxExperience !== undefined ? Number(values.maxExperience) : undefined;
    if (minExp !== undefined && maxExp !== undefined && minExp > maxExp) {
      setError('maxExperience', { message: 'Maximum experience must be greater than or equal to minimum experience' });
      return;
    }

    const minSal = values.minSalary !== '' && values.minSalary !== undefined ? Number(values.minSalary) : undefined;
    const maxSal = values.maxSalary !== '' && values.maxSalary !== undefined ? Number(values.maxSalary) : undefined;
    if (minSal !== undefined && maxSal !== undefined && minSal > maxSal) {
      setError('maxSalary', { message: 'Maximum salary must be greater than or equal to minimum salary' });
      return;
    }

    const payload = {
      title: values.title,
      company: values.company,
      location: values.location,
      country: values.country || undefined,
      category: values.category,
      jobType: values.jobType,
      workMode: values.workMode,
      description: values.description,
      responsibilities: linesToArray(values.responsibilities),
      requirements: linesToArray(values.requirements),
      skills: values.skills ? values.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
      experience: {
        min: minExp ?? 0,
        max: maxExp ?? minExp ?? 0,
      },
      salary: {
        min: minSal,
        max: maxSal,
        currency: values.currency,
        period: values.period,
        disclosed: Boolean(values.disclosed),
      },
      status: values.status || 'draft',
    };

    try {
      if (isEdit) {
        await employerService.updateJob(id, payload);
        toast.success(
          values.status === 'draft'
            ? 'Job draft updated.'
            : values.status === 'closed'
              ? 'Job closed.'
              : 'Job post updated and live on website.'
        );
      } else {
        await employerService.createJob(payload);
        toast.success(
          values.status === 'draft'
            ? 'Job draft saved.'
            : 'Job post published! It is now live on the website.'
        );
      }
      navigate('/employer/jobs');
    } catch (err) {
      err.fieldErrors?.forEach((f) => setError(f.field, { message: f.message }));
      toast.error(err.message);
    }
  };

  if (loadingExisting) return <LoadingBlock label="Loading job" />;
  if (loadError)
    return (
      <div className="space-y-4">
        <ErrorState error={loadError} />
        <div className="flex justify-center">
          <Button to="/employer/jobs" variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to job posts
          </Button>
        </div>
      </div>
    );

  return (
    <>
      <Seo title={isEdit ? 'Edit Job Post' : 'Post a Job'} noIndex />
      <PanelHeader
        title={isEdit ? 'Edit job post' : 'Post a job'}
        description="Fields marked required are needed for candidates to make sense of the role."
        action={
          <Button to="/employer/jobs" variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to job posts
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6 rounded-lg border border-line bg-white p-6" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Job title"
            required
            error={errors.title?.message}
            {...register('title', { required: 'Enter a job title', minLength: { value: 3, message: 'Use at least 3 characters' } })}
          />
          <Input
            label="Company name"
            required
            error={errors.company?.message}
            {...register('company', { required: 'Enter the company name', minLength: { value: 2, message: 'Use at least 2 characters' } })}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label="Location"
            required
            error={errors.location?.message}
            {...register('location', { required: 'Enter a location', minLength: { value: 2, message: 'Use at least 2 characters' } })}
          />
          <Input label="Country" {...register('country')} />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Input
            label="Category"
            required
            hint="e.g. Data & Analytics"
            error={errors.category?.message}
            {...register('category', { required: 'Enter a category', minLength: { value: 2, message: 'Use at least 2 characters' } })}
          />
          <Select label="Job type" options={JOB_TYPES} {...register('jobType')} />
          <Select label="Work mode" options={WORK_MODES} {...register('workMode')} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Minimum years experience" type="number" min="0" error={errors.minExperience?.message} {...register('minExperience')} />
          <Input label="Maximum years experience" type="number" min="0" error={errors.maxExperience?.message} {...register('maxExperience')} />
        </div>

        <fieldset className="rounded border border-line p-4">
          <legend className="px-1 text-small font-bold text-ink">Salary</legend>
          <div className="grid gap-4 sm:grid-cols-4">
            <Input label="Min" type="number" min="0" error={errors.minSalary?.message} {...register('minSalary')} />
            <Input label="Max" type="number" min="0" error={errors.maxSalary?.message} {...register('maxSalary')} />
            <Select label="Currency" options={CURRENCIES} {...register('currency')} />
            <Select label="Period" options={[{ value: 'year', label: 'Per year' }, { value: 'month', label: 'Per month' }]} {...register('period')} />
          </div>
          <Checkbox label="Show this salary range publicly" className="mt-3" {...register('disclosed')} />
        </fieldset>

        <Textarea
          label="Description"
          rows={6}
          required
          hint={`At least ${DESCRIPTION_MIN} characters — ${descriptionLength}/${DESCRIPTION_MIN} so far.`}
          error={errors.description?.message}
          {...register('description', {
            required: 'Describe the role',
            minLength: { value: DESCRIPTION_MIN, message: `Add a bit more detail — at least ${DESCRIPTION_MIN} characters` },
          })}
        />
        <Textarea label="Responsibilities" rows={4} hint="One per line" {...register('responsibilities')} />
        <Textarea label="Requirements" rows={4} hint="One per line" {...register('requirements')} />
        <Input label="Skills" hint="Comma separated" {...register('skills')} />

        <FormField label="Status" hint="Published jobs are immediately visible to candidates in the website Job section.">
          <Select
            options={[
              { value: 'published', label: 'Publish immediately (Visible on website)' },
              { value: 'draft', label: 'Save as draft (Hidden from website)' },
              { value: 'closed', label: 'Closed (No longer accepting applications)' },
            ]}
            {...register('status')}
          />
        </FormField>

        <div className="flex gap-3 border-t border-line pt-5">
          <Button type="submit" loading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create job post'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/employer/jobs')}>
            Cancel
          </Button>
        </div>
      </form>
    </>
  );
}