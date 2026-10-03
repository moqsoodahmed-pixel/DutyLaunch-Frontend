import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { seoFor } from '../data/seoPages.js';
import { Container, Section } from '../components/ui/Container.jsx';
import { PageHero } from '../components/marketing/PageHero.jsx';
import { GlacierBackdrop } from '../components/premium/GlacierBackdrop.jsx';
import { ConsultationForm } from '../components/marketing/ConsultationForm.jsx';
import { contact, socials } from '../data/site.js';
import { images } from '../data/images.js';
import { SiteImage } from '../components/ui/SiteImage.jsx';
import { SocialIcon } from '../components/ui/SocialIcon.jsx';

export default function Contact() {
  return (
    <>
      <Seo title={seoFor('contact').title} description={seoFor('contact').description} />
      <PageHero
        eyebrow="Contact"
        title="Talk to us before you commit to anything."
        lead="The first conversation is free and unscripted. Tell us where you are, and we will tell you honestly whether we can help."
        breadcrumb={[{ label: 'Contact' }]}
        aside={<SiteImage image={images.contactOffice} priority ratio="5 / 4" className="mx-auto w-full lg:ml-auto lg:mr-0" />}
      />

      <Section tone="glacier" backdrop={<GlacierBackdrop />}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="glass-panel lg:col-span-4 self-start">
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
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  {socials.map((s) => (
                    <SocialIcon key={s.label} social={s} size="md" rounded="full" />
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-8">
              <div id="consultation" className="max-w-xl scroll-mt-24">
                <ConsultationForm />
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}