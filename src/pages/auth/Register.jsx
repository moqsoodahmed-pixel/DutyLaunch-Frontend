import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Checkbox } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Seo } from '../../components/ui/Seo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { cn } from '../../utils/cn.js';

export default function Register() {
  const { register: doRegister } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [role, setRole] = useState('user');
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    if (!values.acceptTerms) {
      setError('acceptTerms', { message: 'You need to accept the terms to continue' });
      return;
    }
    try {
      const payload = { ...values, role };
      if (role === 'employer') {
        payload.company = { name: values.companyName };
      }
      delete payload.acceptTerms;
      delete payload.companyName;

      const user = await doRegister(payload);
      toast.success(`Welcome to DutyLaunch, ${user.name.split(' ')[0]}`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (error) {
      error.fieldErrors?.forEach((f) => setError(f.field, { message: f.message }));
      toast.error(error.message);
    }
  };

  return (
    <>
      <Seo title="Create an account" description="Create a free DutyLaunch account." noIndex />
      <h1 className="text-h1 font-extrabold text-ink">Create your account</h1>
      <p className="mt-2 text-body text-slate-600">
        Already registered?{' '}
        <Link to="/login" className="font-semibold text-azure hover:underline">
          Sign in
        </Link>
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-lg border border-line bg-paper p-1">
        {[
          ['user', "I'm looking for work"],
          ['employer', "I'm hiring"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={cn(
              'rounded px-3 py-2 text-small font-semibold transition-colors',
              role === value ? 'bg-white text-ink shadow-raise' : 'text-slate-500 hover:text-ink'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
        <Input
          label="Full name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name', { required: 'Enter your name' })}
        />
        <Input
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', { required: 'Enter your email address' })}
        />
        <Input
          label="Phone number"
          type="tel"
          autoComplete="tel"
          hint="Optional, but useful if a counsellor needs to reach you."
          error={errors.phone?.message}
          {...register('phone')}
        />
        {role === 'employer' && (
          <Input
            label="Company name"
            error={errors.companyName?.message}
            {...register('companyName', { required: 'Enter your company name' })}
          />
        )}
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least 8 characters, with a letter and a number."
          error={errors.password?.message}
          {...register('password', { required: 'Create a password' })}
        />

        <Checkbox
          label={
            <>
              I agree to the{' '}
              <Link to="/terms" className="font-medium text-azure hover:underline">
                terms of service
              </Link>{' '}
              and{' '}
              <Link to="/privacy-policy" className="font-medium text-azure hover:underline">
                privacy policy
              </Link>
              .
            </>
          }
          {...register('acceptTerms')}
        />
        {errors.acceptTerms && <p className="text-caption font-medium text-danger">{errors.acceptTerms.message}</p>}

        <Button type="submit" fullWidth loading={isSubmitting}>
          Create account
        </Button>
      </form>
    </>
  );
}
