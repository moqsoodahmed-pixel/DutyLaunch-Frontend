import { LegalPage } from './LegalPage.jsx';
import { Link } from 'react-router-dom';
import { contact } from '../../data/site.js';
import { company } from '../../data/legal.js';

export default function Terms() {
  return (
    <LegalPage
      title="Terms & Conditions"
      description="The terms governing use of the DutyLaunch website and services."
      updated="28 September 2026"
    >
      <p>
        These terms govern your use of the DutyLaunch website and the services offered through it, including CV and
        career services, courses, documentation and attestation services, the job marketplace, and consultations. By
        creating an account, submitting a form or purchasing a service you agree to these terms.
      </p>

      <h2>Who we are</h2>
      <p>
        {company.brand} is operated by {company.legalName} (CIN: {company.cin}), with its registered office at{' '}
        {company.registeredOffice}. In these terms, &ldquo;DutyLaunch&rdquo;, &ldquo;we&rdquo; and &ldquo;us&rdquo;
        mean that company.
      </p>

      <h2>Accounts</h2>
      <p>
        You must provide accurate information when registering and keep your password secure. You are responsible
        for activity on your account. Employer accounts must represent a genuine hiring organisation; job postings
        that misrepresent the employer or the role may be removed without notice.
      </p>

      <h2>Career and documentation services</h2>
      <p>
        Paid services are scoped as described on the relevant service page at the time of purchase. Delivery
        timelines are estimates unless stated as guaranteed. Where a price depends on case-specific factors —
        attestation is the clearest example — the final price is confirmed in writing before payment and is binding
        once confirmed.
      </p>
      <p>
        We do not guarantee interview invitations, job offers, course completion outcomes, visa approvals, or
        university admission decisions, because these decisions are made by third parties we do not control. We do
        guarantee that the deliverables described for each service (for example, an ATS-formatted CV) will be
        provided as described.
      </p>

      <h2>The job marketplace</h2>
      <p>
        Job listings are posted by employers and are moderated before publication, but DutyLaunch does not vet every
        employer and is not a party to any resulting employment relationship. Candidates apply at their own
        discretion. Listings marked as demonstration or sample records are not genuine vacancies.
      </p>

      <h2>Payments</h2>
      <p>
        Prices are shown in the currency stated on the relevant page, together with whether GST is included. Our{' '}
        <Link to="/refund-policy">Refund &amp; Cancellation Policy</Link> and{' '}
        <Link to="/disclaimers">Disclaimers &amp; Licensing Disclosure</Link> form part of these terms.
      </p>

      <h2>Acceptable use</h2>
      <ul>
        <li>Do not submit false information in a job application, a consultation request, or an employer registration.</li>
        <li>Do not use the platform to harvest candidate data for purposes unrelated to genuine hiring.</li>
        <li>Do not attempt to bypass rate limits, security controls, or access data belonging to another account.</li>
      </ul>

      <h2>Limitation of liability</h2>
      <p>
        DutyLaunch provides guidance and services on a best-effort, professional basis. To the extent permitted by
        law, we are not liable for indirect or consequential losses arising from decisions you make based on our
        guidance, or from the actions of third parties such as employers, institutions or government departments.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Material changes will be reflected by the "last updated" date
        at the top of this page.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to <a href={`mailto:${contact.supportEmail}`}>{contact.supportEmail}</a>.
      </p>
      {/* TODO (counsel): add governing law and the dispute-resolution forum.
          Not stated here because it is a legal choice, not a fact we have. */}
    </LegalPage>
  );
}
