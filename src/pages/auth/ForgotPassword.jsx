import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, KeyRound, Mail, MailCheck } from 'lucide-react';
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
      setSent(true);
    } catch (error) {
      toast.error(friendlyAuthError(error, 'We could not send that link. Please try again.'));
    }
  };

  if (sent) {
    return (
      <div className="text-center sm:text-left">
        <div className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 shadow-sm">
          <MailCheck className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Check your inbox</h1>
        <p className="mt-2 text-small leading-relaxed text-slate-600">
          If an account exists for that email address, we have sent instructions to reset your password. It can take a
          few moments to arrive.
        </p>
        <div className="mt-6">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-azure-600 px-5 py-2.5 text-small font-bold text-white shadow-blue transition-all hover:bg-azure-700 hover:shadow-blue-lg"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Back to sign in</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo title="Reset your password" description="Reset your DutyLaunch account password." noIndex />

      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-azure-200/80 bg-azure-50/80 px-3 py-1 text-xs font-semibold text-azure-700">
          <KeyRound className="h-3.5 w-3.5 text-azure-500" aria-hidden="true" />
          <span>Password Recovery</span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Reset your password</h1>
        <p className="mt-1.5 text-small text-slate-500">
          Enter the email address registered with your account and we&rsquo;ll send you a recovery link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          icon={Mail}
          error={errors.email?.message}
          {...register('email', {
            required: 'Enter your email address',
            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
          })}
        />

        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
          size="lg"
          className="font-bold shadow-blue hover:shadow-blue-lg transition-all"
        >
          <span>{isSubmitting ? 'Sending Link…' : 'Send Reset Link'}</span>
          {!isSubmitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-small font-semibold text-slate-600 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to sign in</span>
        </Link>
      </div>
    </>
  );
}