import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Container, Section } from '../components/ui/Container.jsx';
import { PageHero } from '../components/marketing/PageHero.jsx';
import { ContactForm } from '../components/marketing/ContactForm.jsx';
import { ConsultationForm } from '../components/marketing/ConsultationForm.jsx';
import { Tabs } from '../components/ui/Tabs.jsx';
import { useState } from 'react';
import { contact, socials } from '../data/site.js';

const TABS = [
  { value: 'consultation', label: 'Book a free consultation' },
  { value: 'message', label: 'Send a general message' },
];

export default function Contact() {
  const [tab, setTab] = useState('consultation');

  return (
    <>
      <Seo title="Contact" description="Book a free consultation or send DutyLaunch a message." />
      <PageHero
        eyebrow="Contact"
        title="Talk to us before you commit to anything."
        lead="The first conversation is free and unscripted. Tell us where you are, and we will tell you honestly whether we can help."
        breadcrumb={[{ label: 'Contact' }]}
      />

      <Section tone="white">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-h3 font-bold text-ink">Reach us directly</h2>
              <ul className="mt-5 space-y-4 text-small text-slate-700">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" aria-hidden />
                  <a href={`mailto:${contact.email}`} className="hover:text-azure">{contact.email}</a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" aria-hidden />
                  <a href={contact.phoneHref} className="hover:text-azure">{contact.phone}</a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" aria-hidden />
                  <span>
                    {contact.addressLines.map((line, i) => (
                      <span key={i}>{line}{i < contact.addressLines.length - 1 && <br />}</span>
                    ))}
                    {contact.addressMapUrl && (
                      <a
                        href={contact.addressMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 flex items-center gap-1 text-azure hover:underline"
                      >
                        Open on Google Maps →
                      </a>
                    )}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-4.5 w-4.5 shrink-0 text-slate-400" aria-hidden />
                  <span>{contact.hours}</span>
                </li>
              </ul>
              {contact.needsConfirmation && (
                <p className="mt-5 rounded border border-amber-200 bg-amber-50 p-3 text-caption text-amber-700">
                  Contact details above are placeholders pending confirmation from DutyLaunch.
                </p>
              )}
              {socials.length > 0 && (
                <div className="mt-6 flex gap-3">
                  {socials.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border border-line px-3 py-1.5 text-caption font-medium text-slate-600 hover:border-slate-300"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-8">
              <Tabs options={TABS} value={tab} onChange={setTab} label="Choose contact method" />
              <div id="consultation" className="mt-6 max-w-xl scroll-mt-24">
                {tab === 'consultation' ? <ConsultationForm /> : <ContactForm />}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
