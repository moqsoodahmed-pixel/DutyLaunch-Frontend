import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Seo } from '../../components/ui/Seo.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
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
      navigate(from || (user.role === 'admin' ? '/admin' : '/dashboard'), { replace: true });
    } catch (error) {
      if (error.status === 401) {
        setError('password', { message: 'Incorrect email or password' });
      } else {
        error.fieldErrors?.forEach((f) => setError(f.field, { message: f.message }));
      }
      toast.error(error.message);
    }
  };

  return (
    <>
      <Seo title="Sign in" description="Sign in to your DutyLaunch account." noIndex />
      <h1 className="text-h1 font-extrabold text-ink">Sign in</h1>
      <p className="mt-2 text-body text-slate-600">
        New here?{' '}
        <Link to="/register" className="font-semibold text-azure hover:underline">
          Create an account
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', { required: 'Enter your email address' })}
        />

        <div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              error={errors.password?.message}
              className="pr-11"
              {...register('password', { required: 'Enter your password' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-9 rounded p-1 text-slate-400 hover:text-ink"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" aria-hidden /> : <Eye className="h-4.5 w-4.5" aria-hidden />}
            </button>
          </div>
          <Link to="/forgot-password" className="mt-2 inline-block text-caption font-medium text-azure hover:underline">
            Forgot your password?
          </Link>
        </div>

        <Button type="submit" fullWidth loading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </>
  );
}
