import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Select, Textarea } from '../ui/Field.jsx';
import { Button } from '../ui/Button.jsx';
import { enquiryService } from '../../services/contentService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { contact } from '../../data/site.js';

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

/** Profile years → the form's experience band ('' when unknown). */
function bandFor(years) {
  if (years === undefined || years === null || years === '') return '';
  const y = Number(years);
  if (Number.isNaN(y)) return '';
  if (y <= 3) return '0-3 years';
  if (y <= 7) return '4-7 years';
  if (y <= 14) return '8-14 years';
  return '15+ years';
}

/**
 * The one consultation form used across the site.
 *
 * Signed-in visitors are not asked again for what the site already knows:
 * name, email and phone come from their account and are folded into a
 * one-line summary ("Booking as … · Edit"), and experience is prefilled from
 * their profile. Only a missing phone number is asked for.
 *
 * successNote: optional sentence for the confirmation (e.g. which bundle).
 */
export function ConsultationForm({ defaultService, defaultMessage, successNote, compact = false }) {
  const toast = useToast();
  const { user } = useAuth();
  const [done, setDone] = useState(null);
  const [editingContact, setEditingContact] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { service: defaultService || '', experience: '', message: defaultMessage || '' },
  });

  // Fill in what the account already knows (also when the user loads after
  // the form has mounted). Never overwrites something the visitor typed.
  useEffect(() => {
    if (!user) return;
    const known = {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      experience: bandFor(user.profile?.experienceYears),
    };
    Object.entries(known).forEach(([k, v]) => {
      if (v && !getValues(k)) setValue(k, v, { shouldValidate: false });
    });
  }, [user, getValues, setValue]);

  // Signed in with name, email and phone on file → show a summary instead.
  const contactKnown = Boolean(user?.name && user?.email && user?.phone);
  const showContactFields = !contactKnown || editingContact;
  // Signed in but no phone on file → ask for the phone only.
  const phoneOnly = Boolean(user?.name && user?.email && !user?.phone && !editingContact);

  const onSubmit = async (values) => {
    try {
      const payload = Object.fromEntries(
        Object.entries(values).filter(([, v]) => v !== '' && v !== undefined)
      );
      await enquiryService.consultation(payload);
      setDone({ name: (values.name || '').split(' ')[0] });
      toast.success('Request received. A counsellor will call you within one working day.');
    } catch (error) {
      error.fieldErrors?.forEach((f) => setError(f.field, { message: f.message }));
      // If the problem is in a folded-away field, open it so it can be seen.
      if (error.fieldErrors?.some((f) => ['name', 'email', 'phone'].includes(f.field))) setEditingContact(true);
      toast.error(error.message);
    }
  };

  if (done) {
    return (
      <div className="rounded-lg border border-success/25 bg-success/[0.04] p-7 text-center">
        <h3 className="text-h3 font-semibold text-ink">
          {done.name ? `Thank you, ${done.name}.` : 'Thank you.'} Your request is in.
        </h3>
        <p className="mx-auto mt-2 max-w-sm text-small text-slate-600">
          {successNote || 'A counsellor will call you within one working day to understand what you need.'}
        </p>
        <p className="mx-auto mt-3 max-w-sm text-caption text-slate-500">
          Need to reach us sooner? Email{' '}
          <a href={`mailto:${contact.email}`} className="font-semibold text-azure hover:underline">
            {contact.email}
          </a>
          .
        </p>
        <Button variant="outline" size="sm" className="mt-5" onClick={() => setDone(null)}>
          Send another request
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (errs) => {
        // A folded-away field failed validation (e.g. a saved phone in an
        // unusual format): unfold it so the error is visible, rather than the
        // button silently doing nothing.
        if (errs.name || errs.email || errs.phone) setEditingContact(true);
      })}
      noValidate
      className="space-y-4"
    >
      {user && !showContactFields && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-line bg-paper px-4 py-3">
          <p className="min-w-0 text-small text-slate-600">
            Booking as <span className="font-semibold text-ink">{user.name}</span>
            <span className="text-slate-400"> · </span>
            <span className="break-all">{user.email}</span>
            {user.phone && (
              <>
                <span className="text-slate-400"> · </span>
                {user.phone}
              </>
            )}
          </p>
          <button
            type="button"
            onClick={() => setEditingContact(true)}
            className="text-small font-semibold text-azure hover:text-azure-700"
          >
            Edit
          </button>
        </div>
      )}
      {user && phoneOnly && (
        <p className="rounded-lg border border-line bg-paper px-4 py-3 text-small text-slate-600">
          Booking as <span className="font-semibold text-ink">{user.name}</span>
          <span className="text-slate-400"> · </span>
          <span className="break-all">{user.email}</span>
        </p>
      )}
      <div className={showContactFields && !phoneOnly ? (compact ? 'space-y-4' : 'grid gap-4 sm:grid-cols-2') : 'hidden'}>
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
        <div className={showContactFields ? '' : 'hidden'}>
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
        </div>
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