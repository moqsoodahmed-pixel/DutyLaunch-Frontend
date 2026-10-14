import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { FormField } from '../ui/Field.jsx';
import { cn } from '../../utils/cn.js';

const control =
  'w-full rounded-xl border border-slate-200/90 bg-white/95 text-body text-ink shadow-[0_1px_2px_rgba(15,28,46,0.04)] placeholder:text-slate-400 transition-all duration-200 hover:border-slate-300 focus:bg-white focus:border-azure-500 focus:ring-4 focus:ring-azure-500/10 focus:shadow-sm disabled:bg-slate-100/70 disabled:cursor-not-allowed';

/**
 * Password field with a keyboard-accessible show/hide toggle. Shares the
 * exact visual language of `Input` (same control classes, same FormField
 * wrapper) so it drops into the same form layout without looking bolted on.
 */
export const PasswordInput = forwardRef(function PasswordInput(
  { label, hint, error, success, icon: Icon, className, id, autoComplete = 'current-password', ...rest },
  ref
) {
  const [visible, setVisible] = useState(false);
  const generated = useId();
  const inputId = id || generated;

  return (
    <FormField label={label} hint={success ? undefined : hint} error={error} required={rest.required} htmlFor={inputId}>
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(
            control,
            'h-11 pr-11',
            Icon ? 'pl-11' : 'pl-3.5',
            error ? 'border-danger focus:border-danger focus:ring-danger/10' : 'border-slate-200/90',
            className
          )}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-ink hover:bg-slate-100 focus-visible:text-ink"
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          tabIndex={0}
        >
          {visible ? <EyeOff className="h-4.5 w-4.5" aria-hidden /> : <Eye className="h-4.5 w-4.5" aria-hidden />}
        </button>
      </div>
      {success && !error && (
        <p className="text-caption font-medium text-success" role="status">
          {success}
        </p>
      )}
    </FormField>
  );
});