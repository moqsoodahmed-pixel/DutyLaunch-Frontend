import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn.js';

/* min-w-0: a <select>'s intrinsic width is its longest option, which would
   otherwise stop a grid/flex column shrinking on small screens. */
const control =
  'w-full min-w-0 rounded border bg-white px-3.5 text-body text-ink placeholder:text-slate-400 transition-colors focus:border-azure-400 disabled:bg-slate-100';

export function FormField({ label, hint, error, required, htmlFor, children, className }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-small font-semibold text-ink">
          {label}
          {required && <span className="ml-1 text-danger" aria-hidden>*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-caption text-slate-500">{hint}</p>}
      {error && (
        <p className="text-caption font-medium text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, hint, error, className, id, ...rest }, ref) {
  const generated = useId();
  const inputId = id || generated;
  const input = (
    <input
      ref={ref}
      id={inputId}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error ? `${inputId}-error` : undefined}
      className={cn(control, 'h-11', error ? 'border-danger' : 'border-line', className)}
      {...rest}
    />
  );
  if (!label && !error && !hint) return input;
  return (
    <FormField label={label} hint={hint} error={error} required={rest.required} htmlFor={inputId}>
      {input}
    </FormField>
  );
});

export const Textarea = forwardRef(function Textarea({ label, hint, error, className, id, rows = 5, ...rest }, ref) {
  const generated = useId();
  const inputId = id || generated;
  return (
    <FormField label={label} hint={hint} error={error} required={rest.required} htmlFor={inputId}>
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={error ? 'true' : undefined}
        className={cn(control, 'py-2.5 leading-relaxed', error ? 'border-danger' : 'border-line', className)}
        {...rest}
      />
    </FormField>
  );
});

export const Select = forwardRef(function Select(
  { label, hint, error, options = [], placeholder, className, id, children, ...rest },
  ref
) {
  const generated = useId();
  const inputId = id || generated;
  const select = (
    <select
      ref={ref}
      id={inputId}
      aria-invalid={error ? 'true' : undefined}
      className={cn(control, 'h-11 appearance-none bg-[length:16px] pr-9', error ? 'border-danger' : 'border-line', className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2347566E' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
      }}
      {...rest}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => {
        const value = typeof opt === 'string' ? opt : opt.value;
        const text = typeof opt === 'string' ? opt : opt.label;
        return (
          <option key={value} value={value}>
            {text}
          </option>
        );
      })}
      {children}
    </select>
  );
  if (!label && !error && !hint) return select;
  return (
    <FormField label={label} hint={hint} error={error} required={rest.required} htmlFor={inputId}>
      {select}
    </FormField>
  );
});

export const Checkbox = forwardRef(function Checkbox({ label, id, className, ...rest }, ref) {
  const generated = useId();
  const inputId = id || generated;
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        className="mt-0.5 h-4 w-4 rounded-xs border-line text-azure focus:ring-azure-400"
        {...rest}
      />
      <label htmlFor={inputId} className="text-small text-slate-700">
        {label}
      </label>
    </div>
  );
});
