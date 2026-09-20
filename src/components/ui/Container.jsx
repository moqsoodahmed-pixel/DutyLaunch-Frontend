import { cn } from '../../utils/cn.js';

export function Container({ as: Tag = 'div', size = 'shell', className, children, ...rest }) {
  const widths = { shell: 'max-w-shell', narrow: 'max-w-4xl', prose: 'max-w-prose' };
  return (
    <Tag className={cn('mx-auto w-full px-gutter', widths[size], className)} {...rest}>
      {children}
    </Tag>
  );
}

/** Vertical rhythm wrapper. `tone` picks one of the four surface treatments. */
export function Section({ tone = 'white', className, children, id, ...rest }) {
  const tones = {
    white: 'bg-white',
    paper: 'bg-paper',
    ink: 'surface-dark',
    sand: 'bg-sand-200',
  };
  return (
    <section id={id} className={cn('py-section', tones[tone], className)} {...rest}>
      {tone === 'ink' ? <div className="relative z-[1]">{children}</div> : children}
    </section>
  );
}
