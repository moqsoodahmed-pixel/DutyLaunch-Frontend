import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanLine } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery.js';
import { WELCOME_KEY, hasFlag, requestAtsHighlight, setFlag } from '../../utils/atsWelcome.js';
import AtsResumeVisual from './AtsResumeVisual.jsx';

// Wait a beat after the homepage settles so the dialog never competes with
// the hero's own entrance.
const SHOW_DELAY_MS = 1600;

/**
 * One-time welcome dialog for first-time visitors.
 *
 * The caller (Home) is responsible for the eligibility rules that depend on
 * the session — signed out and the auth check finished — so this never
 * renders for an authenticated visitor or flashes before the session
 * resolves. This component owns the rest: the one-time flag, the timing, and
 * what the buttons do.
 *
 * The flag is written when the dialog is *shown*, not when it is dismissed.
 * That is what makes a loop impossible: leaving the page, reloading, or
 * navigating between routes while it is open can never bring it back.
 */
export default function AtsWelcomeExperience() {
  const navigate = useNavigate();
  const reduce = usePrefersReducedMotion();
  const [open, setOpen] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    if (hasFlag(WELCOME_KEY)) return undefined;
    const id = window.setTimeout(() => {
      setFlag(WELCOME_KEY);
      setOpen(true);
    }, SHOW_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);

  const close = useCallback(() => setOpen(false), []);

  const explore = useCallback(() => {
    setOpen(false);
    // Let the dialog release its scroll lock before moving the page.
    const id = window.setTimeout(() => {
      const panel = document.querySelector('[data-ats-panel]') || document.getElementById('ats-checker');
      if (!panel) {
        navigate('/resume-checker');
        return;
      }
      const rect = panel.getBoundingClientRect();
      const fullyVisible = rect.top >= 72 && rect.bottom <= window.innerHeight;
      // Already on screen: highlight in place, no scroll. Otherwise a
      // user-triggered smooth scroll (instant under reduced motion).
      if (!fullyVisible) {
        panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      }
      // The panel highlights itself the moment it is actually on screen, so
      // there is no guessing how long the scroll takes.
      requestAtsHighlight();
    }, 140);
    timers.current.push(id);
  }, [navigate, reduce]);

  return (
    <Modal
      open={open}
      onClose={close}
      size="sm"
      title="Meet Your AI Resume Assistant"
      footer={
        <div className="flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="quiet" size="sm" onClick={close}>
            Maybe Later
          </Button>
          <Button type="button" variant="premium" size="sm" onClick={explore} data-autofocus>
            <ScanLine className="h-4 w-4" aria-hidden />
            Explore Free ATS Check
          </Button>
        </div>
      }
    >
      <div className="mx-auto w-full max-w-[14.5rem] [@media(max-height:640px)]:max-w-[10.5rem]">
        <AtsResumeVisual compact />
      </div>
      <p className="mt-2 text-center text-small text-slate-600">
        Discover how your resume performs, identify areas to improve, and take the next step
        toward your career goals.
      </p>
    </Modal>
  );
}