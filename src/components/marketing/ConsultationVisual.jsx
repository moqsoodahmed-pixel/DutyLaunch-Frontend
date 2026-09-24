import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, PhoneCall, Send } from 'lucide-react';
import { SiteImage } from '../ui/SiteImage.jsx';
import { images } from '../../data/images.js';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';

const ease = [0.16, 0.84, 0.44, 1];

/* Every line here comes from the form's own copy on this page ("Tell us your
   field and your timeline. A counsellor will call you within one working
   day.") — no new promises, no outcome claims. */
const STEPS = ['Tell us your field', 'Share your timeline', 'A counsellor calls you back'];

function Float({ children, reduced, amplitude = 6, duration = 5, delay = 0, className }) {
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -amplitude, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Sits beside the Dubai Launch consultation form: a photo of two people
 * reviewing a profile together, with two floating cards that walk through
 * what happens after you submit — the three steps tick off one by one, then
 * the call-back card pulses. Runs once when scrolled into view, then idles.
 * Decorative (aria-hidden); the form next to it carries all the real content.
 */
export function ConsultationVisual({ className }) {
  const reduced = usePrefersReducedMotion();
  const [inView, setInView] = useState(false);
  const [done, setDone] = useState(reduced ? STEPS.length : 0);

  // Tick the steps off in sequence once the visual is on screen.
  useEffect(() => {
    if (!inView || reduced) return undefined;
    const timers = STEPS.map((_, i) => setTimeout(() => setDone(i + 1), 700 + i * 650));
    return () => timers.forEach(clearTimeout);
  }, [inView, reduced]);

  const enter = (delay) =>
    reduced
      ? { initial: false }
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-80px' },
          transition: { duration: 0.6, delay, ease },
        };

  const allDone = done >= STEPS.length;

  return (
    <motion.div
      className={`relative ${className || ''}`}
      aria-hidden
      onViewportEnter={() => setInView(true)}
      viewport={{ once: true, margin: '-80px' }}
    >
      <motion.div {...enter(0)}>
        <SiteImage image={images.jobsHeader} decorative rounded="rounded-2xl" />
      </motion.div>

      {/* Steps card — bottom left, overlapping the photo */}
      <motion.div {...enter(0.25)} className="absolute -bottom-10 -left-6 w-[17rem]">
        <Float reduced={reduced} amplitude={6} duration={6} delay={1.2}>
          <div className="rounded-lg border border-line bg-white p-4 shadow-raise">
            <p className="flex items-center gap-2 text-caption font-semibold text-slate-500">
              <Send className="h-3.5 w-3.5 text-azure" aria-hidden />
              Your request
            </p>
            <ul className="mt-3 space-y-2.5">
              {STEPS.map((label, i) => {
                const ticked = i < done;
                return (
                  <li key={label} className="flex items-center gap-2.5">
                    <span
                      className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                        ticked ? 'bg-success/15' : 'border border-dashed border-slate-300'
                      }`}
                    >
                      {ticked && (
                        <motion.span
                          initial={reduced ? false : { scale: 0, rotate: -30 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: 'spring', stiffness: 420, damping: 16 }}
                          className="inline-flex"
                        >
                          <Check className="h-3 w-3 text-success" strokeWidth={3.5} />
                        </motion.span>
                      )}
                    </span>
                    <span className={`text-small transition-colors duration-300 ${ticked ? 'text-ink' : 'text-slate-400'}`}>
                      {label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </Float>
      </motion.div>

      {/* Call-back card — top right; pulses once all three steps are ticked */}
      <motion.div {...enter(0.45)} className="absolute -right-5 -top-8 w-[15.5rem]">
        <Float reduced={reduced} amplitude={7} duration={5.5} delay={1.6}>
          <div className="rounded-lg border border-line bg-white p-4 shadow-raise">
            <div className="flex items-center gap-3">
              <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-azure-50">
                {allDone && !reduced && (
                  <motion.span
                    className="absolute inset-0 rounded-full border-2 border-azure-300"
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                  />
                )}
                <PhoneCall className="h-[18px] w-[18px] text-azure" aria-hidden />
              </span>
              <div>
                <p className="text-small font-bold text-ink">Counsellor call-back</p>
                <p className="text-caption text-slate-500">Within one working day</p>
              </div>
            </div>
          </div>
        </Float>
      </motion.div>
    </motion.div>
  );
}