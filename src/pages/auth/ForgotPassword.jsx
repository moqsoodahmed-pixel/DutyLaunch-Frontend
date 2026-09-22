import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { MailCheck } from 'lucide-react';
import { Input } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Seo } from '../../components/ui/Seo.jsx';
import { authService } from '../../services/authService.js';
import { useToast } from '../../context/ToastContext.jsx';
import { friendlyAuthError } from '../../utils/authErrors.js';

export default function ForgotPassword() {
  const toast = useToast();
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      await authService.forgotPassword(values);
      // Always show success, whether or not the address has an account —
      // confirming otherwise would let someone enumerate registered emails.
      setSent(true);
    } catch (error) {
      toast.error(friendlyAuthError(error, 'We could not send that link. Please try again.'));
    }
  };

  if (sent) {
    return (
      <div className="text-center sm:text-left">
        <span className="inline-grid h-12 w-12 place-items-center rounded-full bg-success/10">
          <MailCheck className="h-6 w-6 text-success" aria-hidden />
        </span>
        <h1 className="mt-5 text-h1 font-extrabold text-ink">Check your inbox</h1>
        <p className="mt-3 max-w-sm text-body text-slate-600">
          If an account exists for that email address, we have sent a link to reset your password. It can take a
          few minutes to arrive.
        </p>
        <Link to="/login" className="mt-6 inline-block font-semibold text-azure hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <Seo title="Reset your password" description="Reset your DutyLaunch account password." noIndex />
      <h1 className="text-h1 font-extrabold text-ink">Reset your password</h1>
      <p className="mt-2 text-body text-slate-600">
        Enter the email address on your account and we will send you a link to choose a new password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', { required: 'Enter your email address' })}
        />
        <Button type="submit" fullWidth loading={isSubmitting} disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>

      <Link to="/login" className="mt-6 inline-block text-small font-medium text-slate-600 hover:text-ink">
        ← Back to sign in
      </Link>
    </>
  );
}
