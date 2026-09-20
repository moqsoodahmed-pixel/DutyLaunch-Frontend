import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Container } from '../ui/Container.jsx';
import { Logo } from './Logo.jsx';
import { contact, footerColumns, legalPages, socials } from '../../data/site.js';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink-900 text-slate-300">
      <Container className="py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo tone="light" />
            <p className="mt-4 max-w-sm text-small text-slate-400">
              Career services, education guidance and global mobility support — for students,
              professionals and people planning a move abroad.
            </p>

            <ul className="mt-6 space-y-2.5 text-small">
              <li>
                <a href={`mailto:${contact.email}`} className="inline-flex items-center gap-2.5 hover:text-white">
                  <Mail className="h-4 w-4 text-slate-500" aria-hidden />
                  {contact.email}
                </a>
              </li>
              <li>
                <a href={contact.phoneHref} className="inline-flex items-center gap-2.5 hover:text-white">
                  <Phone className="h-4 w-4 text-slate-500" aria-hidden />
                  {contact.phone}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                <span>{contact.addressLines.join(', ')}</span>
              </li>
            </ul>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7 lg:col-start-6 lg:grid-cols-4">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="text-small font-bold text-white">{column.title}</h3>
                <ul className="mt-3.5 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.path}>
                      <Link to={link.path} className="text-small text-slate-400 transition-colors hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-slate-500">© {year} DutyLaunch. All rights reserved.</p>

          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {legalPages.map((page) => (
              <li key={page.path}>
                <Link to={page.path} className="text-caption text-slate-400 hover:text-white">
                  {page.label}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="flex gap-4">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-caption text-slate-400 hover:text-white"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
