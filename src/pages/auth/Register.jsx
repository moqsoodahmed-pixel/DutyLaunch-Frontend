import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Handshake, UserRound } from 'lucide-react';
import { Input, Checkbox } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Seo } from '../../components/ui/Seo.jsx';
import { PasswordInput } from '../../components/auth/PasswordInput.jsx';
import { PasswordStrength } from '../../components/auth/PasswordStrength.jsx';
import { AuthDivider } from '../../components/auth/AuthDivider.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { friendlyAuthError } from '../../utils/authErrors.js';
import { cn } from '../../utils/cn.js';
import { homePathFor } from '../../utils/homePath.js';

// "user" is the existing, fully-supported candidate role — unchanged.
// "customer" is a NEW segment the product wants to offer, but the API has
// no such role today (only 'user', 'employer', 'admin' exist — see
// AuthContext.isEmployer, ProtectedRoute's `roles` gate, and the employer-only
// routes in AppRoutes.jsx). Rather than silently sending an unsupported role
// string to /auth/register, or repurposing 'employer' under a new label
// (which would drop the person into the employer job-posting dashboard),
// the card is shown as a first-class option but flagged as not yet enabled.
// Flip this to `true` once the backend adds a real 'customer' role.
const CUSTOMER_ROLE_SUPPORTED = false;

const ACCOUNT_TYPES = [
  { value: 'user', label: 'Candidate', hint: "I'm looking for work", icon: UserRound, supported: true },
  { value: 'customer', label: 'Customer', hint: "I'm looking for services", icon: Handshake, supported: CUSTOMER_ROLE_SUPPORTED },
  // Colleges, universities and training companies. After signing up they
  // complete a partner profile at /partner; it goes live once approved.
  { value: 'institute', label: 'Institute', hint: 'College or training partner', icon: Building2, supported: true },
];

export default function Register() {
  const { register: doRegister } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // /register?type=institute preselects the Institute card (linked from the
  // "Partner with DutyLaunch" calls to action).
  const [role, setRole] = useState(searchParams.get('type') === 'institute' ? 'institute' : 'user');
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch('password', '');
  const confirmPassword = watch('confirmPassword', '');

  const onSubmit = async (values) => {
    if (!values.acceptTerms) {
      setError('acceptTerms', { message: 'You need to accept the terms to continue' });
      return;
    }
    // Confirm Password is a frontend-only guard — the API has never accepted
    // this field, so it is validated here and then stripped before the
    // request is built rather than being forwarded as an extra payload key.
    if (values.password !== values.confirmPassword) {
      setError('confirmPassword', { message: 'Passwords do not match.' });
      return;
    }
    if (role === 'customer') {
      // No backend contract for this role yet — fail loudly here instead of
      // sending a role value the API has never seen.
      toast.error('Customer accounts are launching soon. Please continue with a Candidate account for now.');
      return;
    }

    try {
      const payload = { ...values, role };
      delete payload.acceptTerms;
      delete payload.confirmPassword;
      // Phone is optional — don't send an empty string.
      if (!payload.phone?.trim()) delete payload.phone;

      const user = await doRegister(payload);
      toast.success(`Welcome to DutyLaunch, ${user.name.split(' ')[0]}`);
      navigate(homePathFor(user.role), { replace: true });
    } catch (error) {
      error.fieldErrors?.forEach((f) => setError(f.field, { message: f.message }));
      toast.error(
        friendlyAuthError(error, 'Unable to create your account. Please check your details and try again.')
      );
    }
  };

  return (
    <>
      <Seo title="Create an account" description="Create a free DutyLaunch account." noIndex />

      <div>
        <h1 className="text-h1 font-extrabold text-ink">Create your DutyLaunch account</h1>
        <p className="mt-2 text-body text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-azure hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <fieldset className="mt-6">
        <legend className="mb-2 text-small font-semibold text-ink">I am signing up as</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ACCOUNT_TYPES.map(({ value, label, hint, icon: Icon, supported }) => {
            const active = role === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                aria-pressed={active}
                className={cn(
                  'relative flex flex-col items-start gap-2 rounded-lg border-[1.5px] p-4 text-left transition-all',
                  active
                    ? 'border-azure-500 bg-azure-50 shadow-xs'
                    : 'border-line bg-white hover:border-azure-300 hover:bg-azure-50/40'
                )}
              >
                {!supported && (
                  <Badge tone="amber" className="absolute right-3 top-3">
                    Coming soon
                  </Badge>
                )}
                <span
                  className={cn(
                    'grid h-9 w-9 place-items-center rounded-sm',
                    active ? 'bg-azure-500 text-white' : 'bg-paper text-slate-500'
                  )}
                >
                  <Icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <span className={cn('text-small font-bold', active ? 'text-azure-700' : 'text-ink')}>{label}</span>
                <span className="text-caption text-slate-500">{hint}</span>
              </button>
            );
          })}
        </div>
        {role === 'institute' && (
          <p className="mt-2 text-caption text-slate-600">
            After creating your account you&rsquo;ll add your institute&rsquo;s details and the programmes you offer.
            Your listing goes live on DutyLaunch once our team has reviewed it.
          </p>
        )}
        {role === 'customer' && (
          <p className="mt-2 text-caption font-medium text-amber-600">
            Customer accounts are launching soon — this option needs backend support and isn&rsquo;t open for
            registration yet.
          </p>
        )}
      </fieldset>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5" noValidate>
        <Input
          label={role === 'institute' ? 'Your name (contact person)' : 'Full name'}
          autoComplete="name"
          error={errors.name?.message}
          {...register('name', { required: 'Enter your name' })}
        />
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
        <Input
          label="Phone number"
          type="tel"
          autoComplete="tel"
          hint="Optional, but useful if a counsellor needs to reach you."
          error={errors.phone?.message}
          {...register('phone', {
            pattern: { value: /^[+\d][\d\s-]{7,}$/, message: 'Enter a valid phone number' },
          })}
        />
        <div>
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password', {
              required: 'Create a password',
              minLength: { value: 8, message: 'Use at least 8 characters' },
            })}
          />
          <PasswordStrength value={password} />
        </div>

        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          success={confirmPassword && confirmPassword === password ? 'Passwords match.' : undefined}
          {...register('confirmPassword', {
            required: 'Re-enter your password',
            validate: (value) => value === password || 'Passwords do not match.',
          })}
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

        <Button type="submit" fullWidth loading={isSubmitting} disabled={isSubmitting || role === 'customer'}>
          {isSubmitting ? 'Creating Account…' : 'Create Account'}
        </Button>
      </form>

      <AuthDivider />

      <p className="text-center text-body text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-azure hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}