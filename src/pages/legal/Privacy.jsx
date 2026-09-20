import { LegalPage } from './LegalPage.jsx';
import { contact } from '../../data/site.js';

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy policy"
      description="How DutyLaunch collects, uses and protects your personal data."
      updated="20 September 2026"
    >
      <p>
        This policy explains what personal data DutyLaunch collects through this website, why we collect it, and the
        choices you have over it. It applies to visitors, registered candidates, employers and anyone who submits a
        consultation or contact form.
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account details: name, email address, phone number and password (stored as a salted hash, never in plain text).</li>
        <li>Profile information you add: headline, experience, skills, LinkedIn URL and, if you upload one, your resume.</li>
        <li>Application data: the jobs you apply to, cover letters you submit and their status.</li>
        <li>Enquiry data: anything you submit through a consultation or contact form, including the service you asked about.</li>
        <li>Employer data: company name, website and job postings, for accounts registered as employers.</li>
        <li>Basic technical data: IP address and browser type, collected automatically for security and rate limiting.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To provide the service you asked for — matching you with jobs, processing a CV order, or preparing a documentation service.</li>
        <li>To respond to consultation and contact requests.</li>
        <li>To protect the platform against abuse, including rate limiting and fraud prevention.</li>
        <li>To meet legal and accounting obligations connected to paid services.</li>
      </ul>
      <p>We do not sell personal data to third parties, and we do not use your data to train third-party advertising systems.</p>

      <h2>Resumes and documents</h2>
      <p>
        Uploaded resumes are stored privately and are never listed publicly. A resume is only made visible to an
        employer once you apply to their specific job posting, or to DutyLaunch staff for the service you have
        engaged us for.
      </p>

      <h2>Cookies</h2>
      <p>
        We use a small number of strictly necessary cookies to keep you signed in. We do not currently run
        third-party advertising or tracking cookies on this site.
      </p>

      <h2>Your rights</h2>
      <p>
        You can review and update your profile information at any time from your dashboard. To request a copy of
        your data, ask us to correct it, or ask us to delete your account, contact{' '}
        <a href={`mailto:${contact.supportEmail}`}>{contact.supportEmail}</a>.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep account and application data for as long as your account is active, and for a limited period after
        closure where required for legal, tax or dispute-resolution purposes.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to <a href={`mailto:${contact.supportEmail}`}>{contact.supportEmail}</a>.
      </p>

      <p className="rounded-lg border border-dashed border-line bg-paper p-4 text-small not-prose">
        <strong className="font-semibold text-ink">Note for the DutyLaunch team:</strong> this policy should be
        reviewed by counsel before publication, and should name the registered legal entity, its jurisdiction, and any
        data processors used (payment gateway, hosting provider, email service) once those are finalised.
      </p>
    </LegalPage>
  );
}
