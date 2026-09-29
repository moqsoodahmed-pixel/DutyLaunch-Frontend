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
  'relative overflow-hidden group/btn inline-flex max-w-full items-center justify-center gap-2 text-center leading-tight sm:whitespace-nowrap rounded font-semibold cursor-pointer transition-all duration-[250ms] ease-out disabled:cursor-not-allowed disabled:opacity-55 active:scale-[0.98] active:translate-y-0 hover:scale-[1.04] hover:-translate-y-0.5 before:pointer-events-none before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:transition-transform before:duration-500 before:ease-out hover:before:translate-x-full [&>svg]:transition-transform [&>svg]:duration-[250ms] [&>svg]:ease-out group-hover/btn:[&>svg]:scale-110';

const variants = {
  // Glossy gradient fill, matching the LauncherDesk primary button exactly.
  primary:
    'bg-btn-grad text-white shadow-blue ring-1 ring-inset ring-white/15 hover:brightness-105 hover:ring-white/30 hover:shadow-[0_16px_40px_-8px_rgba(29,93,184,0.7)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-azure-300 focus-visible:outline-offset-2',
  secondary:
    'bg-ink-800 text-white shadow-lift ring-1 ring-inset ring-white/10 hover:bg-ink-700 hover:brightness-110 hover:ring-white/20 hover:shadow-[0_14px_34px_-10px_rgba(19,41,82,0.75)]',
  outline:
    'border-[1.5px] border-azure-500 bg-transparent text-azure hover:border-azure-600 hover:bg-azure-50 hover:text-azure-600 hover:shadow-[0_10px_26px_-10px_rgba(29,93,184,0.5)]',
  quiet:
    'border-[1.5px] border-ink-800/15 bg-transparent text-slate-700 hover:border-line hover:bg-slate-100 hover:text-ink',
  ghost: 'text-ink hover:bg-slate-100',
  onInk:
    'bg-white text-ink shadow-xs hover:brightness-[1.02] hover:shadow-crystal',
  outlineInk:
    'border border-white/20 bg-white/10 text-white hover:bg-white/[0.18]',
  danger:
    'bg-danger text-white ring-1 ring-inset ring-white/10 hover:brightness-105 hover:ring-white/25 hover:shadow-[0_12px_30px_-10px_rgba(220,38,38,0.65)]',
  link: 'text-azure underline-offset-4 hover:underline px-0 hover:scale-100 hover:translate-y-0 before:hidden',
  /* Glacier premium variant: frost→aurora gradient, glow shadow, and a
     shimmer sweep on hover matching official Analyze My Resume Free button. */
  premium:
    'bg-gradient-to-r from-frost-500 via-azure-400 to-aurora-500 text-white shadow-[0_8px_20px_-4px_rgba(79,193,230,0.45),0_4px_12px_-2px_rgba(169,140,234,0.4)] hover:shadow-[0_16px_36px_-6px_rgba(79,193,230,0.6),0_6px_18px_-2px_rgba(169,140,234,0.5)] focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-frost-400 focus-visible:outline-offset-2',
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