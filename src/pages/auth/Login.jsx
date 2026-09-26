import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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

  // react-hook-form already guards against re-entrant submits (isSubmitting
  // stays true until the promise settles), and the button is disabled while
  // loading — so a second Enter/click can't fire a second request.
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

  return (
    <>
      <Seo title="Sign in" description="Sign in to your DutyLaunch account." noIndex />

      <div>
        <h1 className="text-h1 font-extrabold text-ink">Welcome back</h1>
        <p className="mt-2 text-body text-slate-600">Sign in to continue your DutyLaunch journey.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
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
            error={errors.password?.message}
            {...register('password', { required: 'Enter your password' })}
          />
          <Link to="/forgot-password" className="mt-2 inline-block text-caption font-medium text-azure hover:underline">
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={isSubmitting} disabled={isSubmitting}>
          {isSubmitting ? 'Signing In…' : 'Sign In'}
        </Button>
      </form>

      <AuthDivider />

      <p className="text-center text-body text-slate-600">
        Don&rsquo;t have an account?{' '}
        <Link to="/register" className="font-semibold text-azure hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}