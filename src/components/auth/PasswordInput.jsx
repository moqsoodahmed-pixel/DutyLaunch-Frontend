import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { FormField } from '../ui/Field.jsx';
import { cn } from '../../utils/cn.js';

const control =
  'w-full rounded border bg-white px-3.5 pr-11 text-body text-ink placeholder:text-slate-400 transition-colors focus:border-azure-400 disabled:bg-slate-100';

/**
 * Password field with a keyboard-accessible show/hide toggle. Shares the
 * exact visual language of `Input` (same control classes, same FormField
 * wrapper) so it drops into the same form layout without looking bolted on.
 */
export const PasswordInput = forwardRef(function PasswordInput(
  { label, hint, error, success, className, id, autoComplete = 'current-password', ...rest },
  ref
) {
  const [visible, setVisible] = useState(false);
  const generated = useId();
  const inputId = id || generated;

  return (
    <FormField label={label} hint={success ? undefined : hint} error={error} required={rest.required} htmlFor={inputId}>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={cn(control, 'h-11', error ? 'border-danger' : 'border-line', className)}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition-colors hover:text-ink focus-visible:text-ink"
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
