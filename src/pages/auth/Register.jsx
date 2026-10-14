import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Briefcase,
  Building2,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  UserRound,
  Zap,
} from 'lucide-react';
import { Input } from '../../components/ui/Field.jsx';
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
import { ConsentCheckbox } from '../../components/ui/ConsentCheckbox.jsx';
import { CONSENT_REQUIRED_MESSAGE } from '../../data/legal.js';
import { homePathFor } from '../../utils/homePath.js';

const ACCOUNT_TYPES = [
  {
    value: 'user',
    label: 'Candidate',
    hint: 'Looking for jobs & career growth',
    icon: UserRound,
    perk: 'Free ATS score analyzer, verified UAE & India job applications, career mentorship.',
    supported: true,
  },
  {
    value: 'employer',
    label: 'Employer',
    hint: 'Company or hiring consultant',
    icon: Briefcase,
    perk: 'Post verified roles, access screened talent pipelines, and manage candidates.',
    supported: true,
  },
  {
    value: 'institute',
    label: 'Institute',
    hint: 'College or training partner',
    icon: Building2,
    perk: 'List accredited degree/training programmes and showcase campus credentials.',
    supported: true,
  },
];

export default function Register() {
  const { register: doRegister } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(
    ['institute', 'employer'].includes(searchParams.get('type')) ? searchParams.get('type') : 'user'
  );
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
      setError('acceptTerms', { message: CONSENT_REQUIRED_MESSAGE });
      return;
    }
    if (values.password !== values.confirmPassword) {
      setError('confirmPassword', { message: 'Passwords do not match.' });
      return;
    }
    try {
      const payload = { ...values, role };
      delete payload.acceptTerms;
      delete payload.confirmPassword;
      if (!payload.phone?.trim()) delete payload.phone;

      const user = await doRegister(payload);
      toast.success(`Welcome to DutyLaunch, ${user.name.split(' ')[0]}`);
      const next = searchParams.get('next');
      const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
      navigate(safeNext || homePathFor(user.role), { replace: true });
    } catch (error) {
      error.fieldErrors?.forEach((f) => setError(f.field, { message: f.message }));
      toast.error(
        friendlyAuthError(error, 'Unable to create your account. Please check your details and try again.')
      );
    }
  };

  const currentRoleConfig = ACCOUNT_TYPES.find((t) => t.value === role) || ACCOUNT_TYPES[0];

  return (
    <>
      <Seo title="Create an account" description="Create a free DutyLaunch account." noIndex />

      <div>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-azure-200/80 bg-azure-50/80 px-3 py-1 text-xs font-semibold text-azure-700">
          <Zap className="h-3.5 w-3.5 text-azure-600" aria-hidden="true" />
          <span>Fast 60-Second Onboarding</span>
        </div>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Create your account</h1>
        <p className="mt-1.5 text-small text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-azure-600 hover:text-azure-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {/* Account Type Selector */}
      <fieldset className="mt-6">
        <legend className="mb-2.5 text-xs font-bold uppercase tracking-wider text-slate-500">
          I am registering as
        </legend>
        <div className="grid grid-cols-3 gap-2.5">
          {ACCOUNT_TYPES.map(({ value, label, hint, icon: Icon, supported }) => {
            const active = role === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                aria-pressed={active}
                className={cn(
                  'group relative flex flex-col items-center rounded-2xl border p-3 text-center transition-all duration-200 cursor-pointer sm:p-3.5',
                  active
                    ? 'border-azure-500 bg-azure-50/90 shadow-[0_4px_16px_rgba(29,93,184,0.12)] ring-2 ring-azure-500/20'
                    : 'border-slate-200/90 bg-white/70 hover:border-slate-300 hover:bg-slate-50/60 shadow-xs'
                )}
              >
                {!supported && (
                  <Badge tone="amber" className="absolute right-2 top-2 text-[10px]">
                    Soon
                  </Badge>
                )}
                <span
                  className={cn(
                    'mb-2 grid h-10 w-10 place-items-center rounded-xl transition-all duration-200',
                    active
                      ? 'bg-azure-600 text-white shadow-sm scale-105'
                      : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200/80 group-hover:text-ink'
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className={cn('text-xs font-bold tracking-tight', active ? 'text-azure-900' : 'text-slate-800')}>
                  {label}
                </span>
                <span className="mt-0.5 hidden text-[10.5px] leading-tight text-slate-500 sm:block">
                  {hint}
                </span>
                {active && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-azure-400 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-azure-600" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic role capability banner */}
        <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-azure-100 bg-azure-50/70 p-3 text-caption text-azure-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-azure-600" aria-hidden="true" />
          <span className="leading-relaxed">{currentRoleConfig.perk}</span>
        </div>
      </fieldset>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        <Input
          label={role === 'user' ? 'Full name' : 'Your name (contact person)'}
          autoComplete="name"
          icon={UserRound}
          error={errors.name?.message}
          {...register('name', { required: 'Enter your name' })}
        />

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

        <Input
          label="Phone number"
          type="tel"
          autoComplete="tel"
          icon={Phone}
          hint="Optional, used for priority interview notifications."
          error={errors.phone?.message}
          {...register('phone', {
            pattern: { value: /^[+\d][\d\s-]{7,}$/, message: 'Enter a valid phone number' },
          })}
        />

        <div>
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            icon={Lock}
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
          icon={Lock}
          error={errors.confirmPassword?.message}
          success={confirmPassword && confirmPassword === password ? 'Passwords match.' : undefined}
          {...register('confirmPassword', {
            required: 'Re-enter your password',
            validate: (value) => value === password || 'Passwords do not match.',
          })}
        />

        <ConsentCheckbox error={errors.acceptTerms?.message} {...register('acceptTerms')} />

        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          disabled={isSubmitting}
          size="lg"
          className="font-bold shadow-blue hover:shadow-blue-lg transition-all"
        >
          <span>{isSubmitting ? 'Creating Account…' : 'Create Account'}</span>
          {!isSubmitting && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </form>

      <AuthDivider />

      <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 text-center text-small text-slate-600">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-azure-600 hover:text-azure-700 hover:underline">
          Sign in
        </Link>
      </div>
    </>
  );
}