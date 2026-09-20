import { Link, Outlet } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Logo } from '../components/layout/Logo.jsx';

const reasons = [
  'Track every application in one place',
  'Save roles and come back to them',
  'Keep one resume on file for faster applying',
  'Pick up a consultation request where you left it',
];

/**
 * Split shell. The left column is a genuine reason to hold an account rather
 * than decoration, and it collapses away entirely below `lg`.
 */
export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-gutter py-8 sm:py-12">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
          <Logo className="w-fit" />
          <main id="main" className="flex flex-1 flex-col justify-center py-10">
            <Outlet />
          </main>
          <p className="text-caption text-slate-500">
            <Link to="/privacy-policy" className="hover:text-ink">
              Privacy policy
            </Link>
            <span className="px-2 text-slate-300">·</span>
            <Link to="/terms" className="hover:text-ink">
              Terms
            </Link>
          </p>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-ink-900 px-12 py-16 text-white lg:flex lg:flex-col lg:justify-center">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 70% 30%, #000 10%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 70% 30%, #000 10%, transparent 70%)',
          }}
          aria-hidden
        />
        <div className="relative max-w-md">
          <p className="text-small font-semibold text-azure-200">Your DutyLaunch account</p>
          <h2 className="mt-4 text-h1 font-extrabold text-white">One place for the whole search.</h2>
          <ul className="mt-9 space-y-4">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-3">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-xs bg-azure-400/20">
                  <Check className="h-3.5 w-3.5 text-azure-200" aria-hidden />
                </span>
                <span className="text-body text-slate-300">{reason}</span>
              </li>
            ))}
          </ul>
          <p className="mt-10 border-t border-white/10 pt-6 text-small text-slate-400">
            Accounts are free. Career services and courses are paid separately and never charged automatically.
          </p>
        </div>
      </aside>
    </div>
  );
}
