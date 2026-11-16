import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';
import { Seo } from '../../components/ui/Seo.jsx';
import { PasswordInput } from '../../components/auth/PasswordInput.jsx';
import { PasswordStrength } from '../../components/auth/PasswordStrength.jsx';
import { authService } from '../../services/authService.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { friendlyAuthError } from '../../utils/authErrors.js';
import { homePathFor } from '../../utils/homePath.js';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email') || '';
  const { setUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password', '');

  const onSubmit = async (values) => {
    if (!token) {
      toast.error('Reset token is missing. Please request a new password reset link.');
      return;
    }
    if (values.password !== values.confirmPassword) {
      setError('confirmPassword', { message: 'Passwords do not match.' });
      return;
    }

    try {
      const user = await authService.resetPassword({
        token,
        newPassword: values.password,
      });
      setUser(user);
      setSuccess(true);
      toast.success('Your password has been successfully reset! You are now signed in.');
      setTimeout(() => {
        navigate(homePathFor(user.role), { replace: true });
      }, 1500);
    } catch (err) {
      toast.error(friendlyAuthError(err, 'Could not reset password. The link may have expired.'));
    }
  };

  if (!token) {
    return (
      <div className="text-center sm:text-left">
        <div className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20 shadow-sm">
          <Lock className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Invalid or Expired Link
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          This password reset link is invalid or incomplete. Please request a fresh reset link to your email address.
        </p>
        <div className="mt-6">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 rounded-xl bg-azure px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-azure-700"
          >
            <span>Request New Reset Link</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center sm:text-left">
        <div className="inline-grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 shadow-sm">
          <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Password Reset Complete
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Your new password has been activated and you are signed in. Redirecting you to your dashboard now…
        </p>
      </div>
    );
  }

  return (
    <>
      <Seo title="Create new password" description="Set a new password for your DutyLaunch account." noIndex />

      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-azure-200/80 bg-azure-50/80 px-3 py-1 text-xs font-semibold text-azure-700">
          <ShieldCheck className="h-3.5 w-3.5 text-azure-600" aria-hidden="true" />
          <span>Account Security</span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Create new password
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          {emailParam ? `Resetting password for ${emailParam}.` : 'Choose a strong password with at least 8 characters.'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4.5" noValidate>
        <div>
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            icon={Lock}
            error={errors.password?.message}
            {...register('password', {
              required: 'Enter a new password',
              minLength: { value: 8, message: 'Use at least 8 characters' },
              pattern: {
                value: /^(?=.*[a-zA-Z])(?=.*\d)/,
                message: 'Must include at least one letter and one number',
              },
            })}
          />
          <PasswordStrength password={password} />
        </div>

        <div>
          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            icon={Lock}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Confirm your new password',
            })}
          />
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
          size="lg"
          className="mt-2 font-bold shadow-blue hover:shadow-blue-lg transition-all"
        >
          <span>{isSubmitting ? 'Updating Password…' : 'Update Password & Sign In'}</span>
          {!isSubmitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Back to sign in</span>
        </Link>
      </div>
    </>
  );
}
