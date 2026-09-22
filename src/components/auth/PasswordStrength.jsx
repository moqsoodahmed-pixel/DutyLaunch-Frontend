import { Check, X } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * Requirements mirror the only rule the backend/register form currently
 * states ("at least 8 characters, with a letter and a number" — see the
 * hint text on the password field). The extra checks (uppercase, symbol)
 * are shown as advisory only and never block submission — the backend is
 * still the source of truth for what it will actually accept.
 */
const CHECKS = [
  { key: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { key: 'number', label: 'Contains a number', test: (v) => /\d/.test(v) },
  { key: 'letter', label: 'Contains a letter', test: (v) => /[a-zA-Z]/.test(v) },
  { key: 'upper', label: 'Contains an uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { key: 'symbol', label: 'Contains a special character', test: (v) => /[^a-zA-Z0-9]/.test(v) },
];

export function passwordScore(value = '') {
  if (!value) return 0;
  return CHECKS.filter((c) => c.test(value)).length;
}

/** Whether the password satisfies the rules the backend actually enforces. */
export function meetsMinimumRequirements(value = '') {
  const first = CHECKS.slice(0, 3); // length + number + letter
  return first.every((c) => c.test(value));
}

const LEVELS = [
  { max: 1, label: 'Weak', bar: 'bg-danger', text: 'text-danger' },
  { max: 3, label: 'Weak', bar: 'bg-danger', text: 'text-danger' },
  { max: 4, label: 'Medium', bar: 'bg-amber', text: 'text-amber-600' },
  { max: 5, label: 'Strong', bar: 'bg-success', text: 'text-success' },
];

export function PasswordStrength({ value = '', showChecklist = true }) {
  if (!value) return null;
  const score = passwordScore(value);
  const level = LEVELS.find((l) => score <= l.max) || LEVELS[LEVELS.length - 1];

  return (
    <div className="mt-1.5" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="flex h-1.5 flex-1 gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={cn('h-full flex-1 rounded-full bg-slate-200 transition-colors', i < score && level.bar)}
            />
          ))}
        </div>
        <span className={cn('shrink-0 text-caption font-semibold', level.text)}>{level.label}</span>
      </div>

      {showChecklist && (
        <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
          {CHECKS.map((c) => {
            const ok = c.test(value);
            return (
              <li key={c.key} className={cn('flex items-center gap-1.5 text-caption', ok ? 'text-success' : 'text-slate-400')}>
                {ok ? <Check className="h-3 w-3 shrink-0" aria-hidden /> : <X className="h-3 w-3 shrink-0" aria-hidden />}
                {c.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
