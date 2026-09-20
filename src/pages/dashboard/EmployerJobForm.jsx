import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { PanelHeader } from '../../layouts/AppShell.jsx';
import { Input, Textarea, Select, Checkbox, FormField } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { LoadingBlock, ErrorState } from '../../components/ui/States.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { employerService } from '../../services/jobService.js';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
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
    // There is no single-job employer GET endpoint, so we find it from the
    // paginated list — acceptable at the scale this dashboard serves.
    (async () => {
      try {
        let page = 1;
        let found = null;
        for (; page <= 20 && !found; page += 1) {
          // eslint-disable-next-line no-await-in-loop
          const res = await employerService.listJobs({ page, limit: 50 });
          found = res.data.find((j) => j._id === id);
          if (!res.meta?.hasNextPage) break;
        }
        if (!found) throw new Error('Job not found');
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
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { jobType: 'Full-time', workMode: 'On-site', currency: 'INR', period: 'year' },
  });

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
        min: Number(values.minExperience) || 0,
        max: Number(values.maxExperience) || Number(values.minExperience) || 0,
      },
      salary: {
        min: values.minSalary ? Number(values.minSalary) : undefined,
        max: values.maxSalary ? Number(values.maxSalary) : undefined,
        currency: values.currency,
        period: values.period,
        disclosed: Boolean(values.disclosed),
      },
      status: values.status || 'draft',
    };

    try {
      if (isEdit) {
        await employerService.updateJob(id, payload);
        toast.success('Job post updated');
      } else {
        await employerService.createJob(payload);
        toast.success('Job post created. It will appear once approved.');
      }
      navigate('/employer/jobs');
    } catch (err) {
      err.fieldErrors?.forEach((f) => setError(f.field, { message: f.message }));
      toast.error(err.message);
    }
  };

  if (loadingExisting) return <LoadingBlock label="Loading job" />;
  if (loadError) return <ErrorState error={loadError} />;

  return (
    <>
      <PanelHeader
        title={isEdit ? 'Edit job post' : 'Post a job'}
        description="Fields marked required are needed for candidates to make sense of the role."
      />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6 rounded-lg border border-line bg-white p-6" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Job title" required error={errors.title?.message} {...register('title', { required: 'Enter a job title' })} />
          <Input label="Company name" required error={errors.company?.message} {...register('company', { required: 'Enter the company name' })} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Location" required error={errors.location?.message} {...register('location', { required: 'Enter a location' })} />
          <Input label="Country" {...register('country')} />
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <Input label="Category" required hint="e.g. Data & Analytics" error={errors.category?.message} {...register('category', { required: 'Enter a category' })} />
          <Select label="Job type" options={JOB_TYPES} {...register('jobType')} />
          <Select label="Work mode" options={WORK_MODES} {...register('workMode')} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Input label="Minimum years experience" type="number" min="0" {...register('minExperience')} />
          <Input label="Maximum years experience" type="number" min="0" {...register('maxExperience')} />
        </div>

        <fieldset className="rounded border border-line p-4">
          <legend className="px-1 text-small font-bold text-ink">Salary</legend>
          <div className="grid gap-4 sm:grid-cols-4">
            <Input label="Min" type="number" min="0" {...register('minSalary')} />
            <Input label="Max" type="number" min="0" {...register('maxSalary')} />
            <Select label="Currency" options={CURRENCIES} {...register('currency')} />
            <Select label="Period" options={[{ value: 'year', label: 'Per year' }, { value: 'month', label: 'Per month' }]} {...register('period')} />
          </div>
          <Checkbox label="Show this salary range publicly" className="mt-3" {...register('disclosed')} />
        </fieldset>

        <Textarea
          label="Description"
          rows={6}
          required
          hint="At least a few sentences describing the role."
          error={errors.description?.message}
          {...register('description', { required: 'Describe the role' })}
        />
        <Textarea label="Responsibilities" rows={4} hint="One per line" {...register('responsibilities')} />
        <Textarea label="Requirements" rows={4} hint="One per line" {...register('requirements')} />
        <Input label="Skills" hint="Comma separated" {...register('skills')} />

        <FormField label="Status">
          <Select
            options={[
              { value: 'draft', label: 'Save as draft' },
              { value: 'published', label: 'Submit for review' },
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
