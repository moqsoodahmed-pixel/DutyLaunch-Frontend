import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Textarea } from '../ui/Field.jsx';
import { Button } from '../ui/Button.jsx';
import { enquiryService } from '../../services/contentService.js';
import { useToast } from '../../context/ToastContext.jsx';

export function ContactForm() {
  const toast = useToast();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      const payload = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ''));
      await enquiryService.contact(payload);
      reset();
      setDone(true);
      toast.success('Message sent. We reply within one working day.');
    } catch (error) {
      error.fieldErrors?.forEach((f) => setError(f.field, { message: f.message }));
      toast.error(error.message);
    }
  };

  if (done) {
    return (
      <div className="rounded-lg border border-success/25 bg-success/[0.04] p-7">
        <h3 className="text-h3 font-semibold text-ink">Message sent</h3>
        <p className="mt-2 text-small text-slate-600">We reply within one working day.</p>
        <Button variant="outline" size="sm" className="mt-5" onClick={() => setDone(false)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Full name"
          required
          autoComplete="name"
          error={errors.name?.message}
          {...register('name', { required: 'Enter your name' })}
        />
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Enter your email',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
          })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Phone" type="tel" autoComplete="tel" error={errors.phone?.message} {...register('phone')} />
        <Input
          label="Subject"
          required
          error={errors.subject?.message}
          {...register('subject', { required: 'Add a short subject', minLength: { value: 3, message: 'Add a short subject' } })}
        />
      </div>
      <Textarea
        label="Message"
        required
        rows={6}
        error={errors.message?.message}
        {...register('message', { required: 'Write your message', minLength: { value: 10, message: 'Tell us a little more' } })}
      />
      <Button type="submit" size="lg" loading={isSubmitting}>
        Send message
      </Button>
    </form>
  );
}
