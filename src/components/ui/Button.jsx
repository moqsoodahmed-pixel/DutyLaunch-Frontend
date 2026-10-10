import { forwardRef, useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/* Buttons use a minimum height rather than a fixed one, so a label can never
   spill outside its button. From 640px up labels stay on one line; on small
   phones a long label ("Check Your Document Requirements") wraps onto a second
   line and the button grows, instead of pushing the page wider than the
   screen. max-w-full keeps any button inside its container. */
const base =
  'relative overflow-hidden dl-glass-btn group/btn inline-flex max-w-full items-center justify-center gap-2 text-center leading-tight sm:whitespace-nowrap rounded font-semibold cursor-pointer transition-all duration-[250ms] ease-out disabled:cursor-not-allowed disabled:opacity-55 active:scale-[0.98] active:translate-y-0 hover:scale-[1.04] hover:-translate-y-0.5 [&>svg]:transition-transform [&>svg]:duration-[250ms] [&>svg]:ease-out group-hover/btn:[&>svg]:scale-110';

const variants = {
  // Glossy gradient fill, matching the LauncherDesk primary button exactly.
  primary:
    'bg-btn-grad text-white shadow-blue ring-1 ring-inset ring-white/15 hover:brightness-105 hover:ring-white/30 hover:shadow-[0_16px_40px_-8px_rgba(29,93,184,0.7)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-azure-300 focus-visible:outline-offset-2',
  secondary:
    'bg-ink-800 text-white shadow-lift ring-1 ring-inset ring-white/10 hover:bg-ink-700 hover:brightness-110 hover:ring-white/20 hover:shadow-[0_14px_34px_-10px_rgba(22,15,41,0.75)]',
  outline:
    'border-[1.5px] border-azure-400 bg-azure-50/90 text-azure-800 hover:border-azure-500 hover:bg-azure-100 hover:text-azure-900 hover:shadow-[0_10px_26px_-10px_rgba(29,93,184,0.5)]',
  quiet:
    'border-[1.5px] border-slate-300 bg-slate-100/90 text-slate-800 hover:border-slate-400 hover:bg-slate-200 hover:text-ink',
  ghost: 'bg-slate-100/80 text-ink hover:bg-slate-200/90',
  onInk:
    'bg-white text-ink shadow-xs hover:brightness-[1.02] hover:shadow-crystal',
  outlineInk:
    'border border-sky-200/70 bg-gradient-to-r from-sky-700 via-cyan-700 to-sky-800 text-white hover:brightness-110 hover:shadow-[0_8px_22px_-6px_rgba(0,0,0,0.6)]',
  danger:
    'bg-danger text-white ring-1 ring-inset ring-white/10 hover:brightness-105 hover:ring-white/25 hover:shadow-[0_12px_30px_-10px_rgba(220,38,38,0.65)]',
  link: 'text-azure underline-offset-4 hover:underline px-0 hover:scale-100 hover:translate-y-0 before:hidden after:hidden',
  /* Glacier premium variant: frost→aurora gradient, glow shadow, and a
     shimmer sweep on hover matching official Analyze My Resume Free button. */
  premium:
    'bg-gradient-to-r from-[#0E7FB8] via-[#2557C9] to-[#6A47D9] text-white border border-white/30 shadow-[0_6px_16px_-4px_rgba(22,15,41,0.55)] hover:brightness-110 hover:shadow-[0_10px_24px_-6px_rgba(22,15,41,0.65)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-frost-400 focus-visible:outline-offset-2',
};


const sizes = {
  sm: 'min-h-[38px] py-2 px-4 text-[13.5px] rounded-xs',
  md: 'min-h-12 py-2.5 px-[22px] text-[14.5px]',
  lg: 'min-h-[54px] py-3 px-6 sm:px-[30px] text-[15.5px] rounded-lg',
};

export const Button = forwardRef(function Button(
  { as, to, href, variant = 'primary', size = 'md', loading = false, fullWidth, magnetic = false, className, children, ...rest },
  ref
) {
  const classes = cn(base, variants[variant], variant !== 'link' && sizes[size], fullWidth && 'w-full', className);
  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </>
  );

  /* Magnetic interaction — opt-in only. The element leans a few pixels
     toward the cursor while hovered, and eases back to rest on leave. Plain
     inline transform + CSS transition (no motion library dependency here),
     clamped to a small range so it reads as a subtle premium detail rather
     than the button visibly chasing the pointer. */
  const magneticRef = useRef(null);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const mergedRef = useCallback(
    (node) => {
      magneticRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  const magneticHandlers = magnetic
    ? {
      onMouseMove: (e) => {
        const rect = magneticRef.current?.getBoundingClientRect();
        if (!rect) return;
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        setMagneticOffset({ x: relX * 10, y: relY * 8 });
      },
      onMouseLeave: () => setMagneticOffset({ x: 0, y: 0 }),
    }
    : {};
  const magneticStyle = magnetic
    ? {
      transform: `translate3d(${magneticOffset.x}px, ${magneticOffset.y}px, 0)`,
      transition: 'transform 0.25s cubic-bezier(.16,.84,.44,1)',
    }
    : undefined;

  if (to) {
    return (
      <Link ref={mergedRef} to={to} className={classes} style={magneticStyle} {...magneticHandlers} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={mergedRef} href={href} className={classes} style={magneticStyle} {...magneticHandlers} {...rest}>
        {content}
      </a>
    );
  }

  const Tag = as || 'button';
  return (
    <Tag
      ref={mergedRef}
      className={classes}
      style={magneticStyle}
      disabled={loading || rest.disabled}
      {...magneticHandlers}
      {...rest}
    >
      {content}
    </Tag>
  );
});