import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Seo } from '../../components/ui/Seo.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { PasswordInput } from '../../components/auth/PasswordInput.jsx';
import { AuthDivider } from '../../components/auth/AuthDivider.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { friendlyAuthError } from '../../utils/authErrors.js';
import { homePathFor } from '../../utils/homePath.js';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      const from = location.state?.from;
      navigate(from || homePathFor(user.role), { replace: true });
    } catch (error) {
      if (error.status === 401) {
        setError('password', { message: 'Incorrect email or password' });
      } else {
        error.fieldErrors?.forEach((f) => setError(f.field, { message: f.message }));
      }
      toast.error(friendlyAuthError(error, 'We could not sign you in. Please check your details and try again.'));
    }
  };

  const fromPath = location.state?.from || '';
  const contextMessage = fromPath.includes('pricing')
    ? 'Sign in to complete your plan purchase.'
    : fromPath.includes('resume-checker')
      ? 'Sign in to run your free ATS resume check.'
      : fromPath.includes('resume-builder')
        ? 'Sign in to create and save your resume.'
        : fromPath.includes('jobs')
          ? 'Sign in to apply and track your job applications.'
          : null;

  return (
    <>
      <Seo title="Sign in" description="Sign in to your DutyLaunch account." noIndex />

      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-azure-200/80 bg-azure-50/80 px-3 py-1 text-xs font-semibold text-azure-700">
          <ShieldCheck className="h-3.5 w-3.5 text-azure-600" aria-hidden="true" />
          <span>Secure Member Access</span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Welcome back</h1>
        <p className="mt-1.5 text-small text-slate-500">Sign in to continue your DutyLaunch career journey.</p>
        {contextMessage && (
          <div className="mt-3.5 rounded-xl border border-azure-200 bg-azure-50/90 px-3.5 py-2.5 text-small font-medium text-azure-800 shadow-xs">
            {contextMessage}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4.5" noValidate>
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

        <div>
          <PasswordInput
            label="Password"
            autoComplete="current-password"
            icon={Lock}
            error={errors.password?.message}
            {...register('password', { required: 'Enter your password' })}
          />
          <div className="mt-2 flex justify-end">
            <Link
              to="/forgot-password"
              className="text-caption font-semibold text-azure-600 transition-colors hover:text-azure-700 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
          size="lg"
          className="mt-2 font-bold shadow-blue hover:shadow-blue-lg transition-all"
        >
          <span>{isSubmitting ? 'Signing In…' : 'Sign In'}</span>
          {!isSubmitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </form>

      <AuthDivider />

      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 text-center text-small text-slate-600">
        Don&rsquo;t have an account yet?{' '}
        <Link to="/register" className="font-bold text-azure-600 hover:text-azure-700 hover:underline">
          Create an account
        </Link>
      </div>
    </>
  );
}