import { motion } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';

/**
 * TransformationHorizon: the divider that bridges the services section into
 * the process section. It sits on the same pale mist blue as the sections
 * around it, with a travelling light beam either side of a solid label pill,
 * so it reads clearly without any dark band or colour change while scrolling.
 */
export function TransformationHorizon({
  label = 'Process Transformation · From Services to Stages',
  className = '',
}) {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div
      className={`relative z-20 overflow-hidden bg-mist-base py-10 sm:py-12 ${className}`}
      data-testid="transformation-horizon"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between gap-4">
          {/* Left beam */}
          <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-azure-300/50">
            <motion.div
              initial={reduceMotion ? false : { x: '-100%' }}
              whileInView={{ x: '100%' }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-azure to-transparent"
            />
          </div>

          {/* Label pill */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.55, ease: [0.16, 0.84, 0.44, 1] }}
            className="group relative flex items-center gap-2.5 rounded-full border-2 border-azure-300 bg-white px-4 py-2 shadow-[0_8px_22px_-10px_rgba(29,93,184,0.45)] transition-all duration-300 hover:border-azure sm:px-5"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-azure-400 opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-azure" />
            </span>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-ink sm:text-xs">{label}</span>
          </motion.div>

          {/* Right beam */}
          <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-azure-300/50">
            <motion.div
              initial={reduceMotion ? false : { x: '100%' }}
              whileInView={{ x: '-100%' }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-azure to-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
