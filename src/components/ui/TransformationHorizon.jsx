import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';

/**
 * TransformationHorizon: Scroll-linked dynamic transformation bridge between
 * daylight ServiceMatrix (#F1F6FC) and deep midnight JourneyRail (#132952).
 *
 * As the user scrolls through, the background color dynamically interpolates
 * so the transition feels completely seamless and organic:
 * "when user scrolling then he should not feel that the color is changed but color should change"
 */
export function TransformationHorizon({
  label = 'Process Transformation · From Services to Stages',
  className = '',
}) {
  const reduceMotion = usePrefersReducedMotion();
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Dynamic continuous background color interpolation
  const backgroundColor = useTransform(
    scrollYProgress,
    [0.2, 0.5, 0.8],
    ['#F1F6FC', '#2B4D87', '#132952']
  );

  return (
    <motion.div
      ref={containerRef}
      style={reduceMotion ? { backgroundColor: '#132952' } : { backgroundColor }}
      className={`relative z-20 overflow-hidden py-12 sm:py-16 ${className}`}
      data-testid="transformation-horizon"
    >
      {/* Dynamic ambient ray across the transformation threshold */}
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(79,193,230,.25), transparent 75%)',
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between gap-4">
          {/* Left Laser Transformation Beam */}
          <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-white/30 shadow-inner">
            <motion.div
              initial={reduceMotion ? false : { x: '-100%' }}
              whileInView={{ x: '100%' }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-frost-300 to-transparent shadow-[0_0_14px_rgba(79,193,230,0.9)]"
            />
          </div>

          {/* Central Transformation Capsule Badge */}
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 10 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.55, ease: [0.16, 0.84, 0.44, 1] }}
            className="group relative flex items-center gap-2.5 rounded-full border border-white/30 bg-ink-900/85 px-4 sm:px-5 py-2 shadow-[0_8px_28px_rgba(11,31,72,0.4),0_0_20px_rgba(79,193,230,0.35),inset_0_1px_0_rgba(255,255,255,0.3)] backdrop-blur-xl transition-all duration-300 hover:border-frost-300 hover:shadow-[0_0_32px_rgba(79,193,230,0.55)]"
          >
            {/* Pulsing Transformation Beacon */}
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-frost-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-r from-frost-400 to-aurora-400" />
            </span>

            <span className="text-[11px] font-extrabold uppercase tracking-widest text-white drop-shadow-sm sm:text-xs">
              {label}
            </span>

            <Sparkles className="h-3.5 w-3.5 text-aurora-300 transition-transform duration-300 group-hover:rotate-12" aria-hidden />
          </motion.div>

          {/* Right Laser Transformation Beam */}
          <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-white/30 shadow-inner">
            <motion.div
              initial={reduceMotion ? false : { x: '100%' }}
              whileInView={{ x: '-100%' }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-frost-300 to-transparent shadow-[0_0_14px_rgba(79,193,230,0.9)]"
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
