import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/* whitespace-nowrap: every size has a fixed height, so a label that wraps
   spills out of the button instead of growing it. Labels stay on one line;
   layouts give buttons room (or stack them full-width on mobile) instead. */
const base =
  'inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap text-center rounded font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-55 active:translate-y-px';

const variants = {
  // Glossy gradient fill, matching the LauncherDesk primary button exactly.
  primary:
    'bg-btn-grad text-white shadow-blue hover:shadow-blue-lg hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-azure-300 focus-visible:outline-offset-2',
  secondary: 'bg-ink-800 text-white shadow-lift hover:bg-ink-700 hover:-translate-y-0.5',
  outline: 'border-[1.5px] border-azure-500 bg-transparent text-azure hover:border-azure-600 hover:bg-azure-50 hover:text-azure-600',
  quiet: 'border-[1.5px] border-ink-800/15 bg-transparent text-slate-700 hover:border-line hover:bg-slate-100 hover:text-ink',
  ghost: 'text-ink hover:bg-slate-100',
  onInk: 'bg-white text-ink shadow-xs hover:shadow-lift hover:-translate-y-0.5',
  outlineInk: 'border border-white/20 bg-white/10 text-white hover:bg-white/[0.18]',
  danger: 'bg-danger text-white hover:bg-danger/90',
  link: 'text-azure underline-offset-4 hover:underline px-0',
};

const sizes = {
  sm: 'h-[38px] px-4 text-[13.5px] rounded-xs',
  md: 'h-12 px-[22px] text-[14.5px]',
  lg: 'h-[54px] px-[30px] text-[15.5px] rounded-lg',
};

export const Button = forwardRef(function Button(
  { as, to, href, variant = 'primary', size = 'md', loading = false, fullWidth, className, children, ...rest },
  ref
) {
  const classes = cn(base, variants[variant], variant !== 'link' && sizes[size], fullWidth && 'w-full', className);
  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </>
  );

  if (to) {
    return (
      <Link ref={ref} to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={ref} href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  const Tag = as || 'button';
  return (
    <Tag ref={ref} className={classes} disabled={loading || rest.disabled} {...rest}>
      {content}
    </Tag>
  );
});