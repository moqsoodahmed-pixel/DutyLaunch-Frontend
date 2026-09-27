import { forwardRef, useId } from 'react';
import { Link } from 'react-router-dom';
import { CONSENT_TEXT } from '../../data/legal.js';

/**
 * The DPDP Act 2023 consent checkbox used on every form that collects
 * personal data or a resume. Never pre-ticked. The server rejects the
 * submission without it, so this is a convenience, not the enforcement.
 *
 * Works controlled (checked + onChange) or with react-hook-form
 * (`{...register('consent', { required: ... })}`), since extra props go
 * straight to the <input>.
 *
 * The two policy links open in a new tab so a half-filled form is not lost.
 */
const [BEFORE, REST] = CONSENT_TEXT.split('Terms & Conditions');
const [MIDDLE, AFTER] = REST.split('Privacy Policy');

export const ConsentCheckbox = forwardRef(function ConsentCheckbox({ error, className = '', id, ...rest }, ref) {
  const generated = useId();
  const inputId = id || generated;
  const errorId = `${inputId}-error`;
  return (
    <div className={className}>
      <div className="flex items-start gap-2.5">
        <input
          ref={ref}
          id={inputId}
          type="checkbox"
          required
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5 h-4 w-4 shrink-0 rounded-xs border-line text-azure focus:ring-azure-400"
          {...rest}
        />
        <label htmlFor={inputId} className="text-caption leading-relaxed text-slate-600">
          {BEFORE}
          <Link to="/terms-and-conditions" target="_blank" rel="noopener" className="font-semibold text-azure hover:underline">
            Terms &amp; Conditions
          </Link>
          {MIDDLE}
          <Link to="/privacy-policy" target="_blank" rel="noopener" className="font-semibold text-azure hover:underline">
            Privacy Policy
          </Link>
          {AFTER}
        </label>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 pl-[26px] text-caption text-danger">
          {error}
        </p>
      )}
    </div>
  );
});
