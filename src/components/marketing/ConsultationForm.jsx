import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Select, Textarea } from '../ui/Field.jsx';
import { Button } from '../ui/Button.jsx';
import { enquiryService } from '../../services/contentService.js';
import { useToast } from '../../context/ToastContext.jsx';

const SERVICES = [
  'Career services',
  'CV & LinkedIn',
  'Interview preparation',
  'Higher education',
  'Professional courses',
  'UAE job seeker package',
  'Documentation & attestation',
  'Something else',
];

const EXPERIENCE = ['Student', '0-3 years', '4-7 years', '8-14 years', '15+ years'];

export function ConsultationForm({ defaultService, defaultMessage, compact = false }) {
  const toast = useToast();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { service: defaultService || '', experience: '', message: defaultMessage || '' },
  });

  const onSubmit = async (values) => {
    try {
      const payload = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== '' && v !== undefined)
      );
      await enquiryService.consultation(payload);
      setDone(true);
      toast.success('Request received. A counsellor will call you within one working day.');
    } catch (error) {
      error.fieldErrors?.forEach((f) => setError(f.field, { message: f.message }));
      toast.error(error.message);
    }
  };

  if (done) {
    return (
      <div className="rounded-lg border border-success/25 bg-success/[0.04] p-7 text-center">
        <h3 className="text-h3 font-semibold text-ink">Request received</h3>
        <p className="mx-auto mt-2 max-w-sm text-small text-slate-600">
          A counsellor will call you within one working day. If it is urgent, email us and mention
          the service you asked about.
        </p>
        <Button variant="outline" size="sm" className="mt-5" onClick={() => setDone(false)}>
          Send another request
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className={compact ? 'space-y-4' : 'grid gap-4 sm:grid-cols-2'}>
        <Input
          label="Full name"
          required
          autoComplete="name"
          placeholder="Your name"
          error={errors.name?.message}
          {...register('name', { required: 'Enter your name', minLength: { value: 2, message: 'Enter your name' } })}
        />
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email', {
            required: 'Enter your email',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
          })}
        />
      </div>

      <div className={compact ? 'space-y-4' : 'grid gap-4 sm:grid-cols-2'}>
        <Input
          label="Phone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="+91 00000 00000"
          error={errors.phone?.message}
          {...register('phone', {
            required: 'Enter a phone number we can reach you on',
            pattern: { value: /^[+\d][\d\s()-]{6,19}$/, message: 'Enter a valid phone number' },
          })}
        />
        <Select
          label="Experience"
          required
          placeholder="Select your experience"
          options={EXPERIENCE}
          error={errors.experience?.message}
          {...register('experience', { required: 'Select your experience level' })}
        />
      </div>

      <Select
        label="What do you need help with?"
        required
        placeholder="Select a service"
        options={SERVICES}
        error={errors.service?.message}
        {...register('service', { required: 'Select a service' })}
      />

      <Textarea
        label="Anything we should know?"
        rows={4}
        placeholder="Your current role, where you are trying to get to, and any deadlines."
        error={errors.message?.message}
        {...register('message', { maxLength: { value: 2000, message: 'Keep this under 2000 characters' } })}
      />

      <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
        Request a free consultation
      </Button>
      <p className="text-caption text-slate-500">
        We use your details only to respond to this request. See our{' '}
        <a href="/privacy-policy" className="underline underline-offset-2">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}