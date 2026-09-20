const CURRENCY_LOCALE = { INR: 'en-IN', AED: 'en-AE', USD: 'en-US', GBP: 'en-GB', EUR: 'de-DE' };

export function formatCurrency(amount, currency = 'INR', { compact = false } = {}) {
  if (amount === null || amount === undefined) return null;
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency] || 'en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  }).format(amount);
}

export function formatSalary(salary) {
  if (!salary || salary.disclosed === false) return 'Salary not disclosed';
  const { min, max, currency = 'INR', period = 'year' } = salary;
  if (!min && !max) return 'Salary not disclosed';
  const unit = period === 'month' ? '/month' : '/year';
  if (min && max) {
    return `${formatCurrency(min, currency, { compact: true })} – ${formatCurrency(max, currency, { compact: true })}${unit}`;
  }
  return `${formatCurrency(min || max, currency, { compact: true })}${unit}`;
}

export function formatExperience(experience) {
  if (!experience) return 'Any experience';
  const { min = 0, max } = experience;
  if (!max || max === min) return min === 0 ? 'Entry level' : `${min}+ years`;
  return `${min}–${max} years`;
}

export function formatDate(value, opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-IN', opts).format(new Date(value));
}

export function relativeTime(value) {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const days = Math.floor(diff / 86400000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

export function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
}
