import { LegalPage } from './LegalPage.jsx';
import { Link } from 'react-router-dom';
import { contact } from '../../data/site.js';
import { company } from '../../data/legal.js';

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="How DutyLaunch collects, uses and protects your personal data, and your rights under the DPDP Act, 2023."
      updated="28 September 2026"
    >
      <p>
        This policy explains what personal data DutyLaunch collects through this website, why we collect it, and the
        choices you have over it. It applies to visitors, registered candidates, employers and anyone who submits a
        consultation or contact form.
      </p>
      <p>
        {company.legalName} (CIN: {company.cin}), registered office {company.registeredOffice}, is the Data Fiduciary
        for this personal data under the Digital Personal Data Protection Act, 2023 (&ldquo;DPDP Act&rdquo;).
      </p>
      <h2>Your consent</h2>
      <p>
        Every form that collects personal data or a resume asks you to tick a consent box, which is never ticked for
        you. We record that you consented, the wording you agreed to and when, so that we can show it if asked. We
        process your data only for the purpose you gave it for: career and recruitment facilitation services.
      </p>
      <p>
        You can withdraw consent at any time by emailing{' '}
        <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a>, or by deleting your career profile from{' '}
        <Link to="/my-resumes">My resumes</Link> in your dashboard. Withdrawal does not affect processing already
        carried out, but we will stop processing for that purpose, and the service may no longer be available to you.
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
      <p>
        If you use the free resume checker without an account, your CV is processed to produce your report and is
        not saved. If you are signed in, it is saved to your career profile so you can return to it.
      </p>

      <h2>AI-assisted processing</h2>
      <p>
        Some career tools (resume rewriting, cover letters, LinkedIn and interview preparation, and mock interviews)
        send the text of your resume and the job description to an AI model provider to generate suggestions. Only the
        text needed for that request is sent, and it is sent from our servers, never directly from your browser.
      </p>
      <p>We currently use the following AI providers:</p>
      <ul>
        <li>
          <strong>Groq, Inc.</strong> (United States): resume rewriting, LinkedIn suggestions, mock interviews and the
          AI Career Assistant;
        </li>
        <li>
          <strong>Mistral AI</strong> (France): cover letters;
        </li>
        <li>
          <strong>Google LLC, Gemini API</strong> (United States): interview questions and answers.
        </li>
      </ul>
      <p>
        If one provider is temporarily unavailable, your request may be handled by another provider on this list.
        Some of these providers may retain or use the content they receive to operate and improve their services,
        under their own terms. DutyLaunch itself does not use your data to train AI models unless you separately opt
        in from your dashboard, and that option is off by default. If you do not want your resume processed by these
        providers, do not use the AI tools; you can still edit your documents manually.
      </p>

      <h2>Payments</h2>
      <p>
        Online payments are processed by <strong>Razorpay Software Private Limited</strong> (India). Your card, UPI,
        net-banking or wallet details are entered on Razorpay&apos;s secure checkout and are never seen or stored by
        DutyLaunch. We keep a record of what you bought, the amount, the date and the Razorpay payment reference so we
        can deliver the service, issue receipts and handle refunds.
      </p>

      <h2>Cookies</h2>
      <p>
        We use a small number of strictly necessary cookies to keep you signed in. We do not currently run
        third-party advertising or tracking cookies on this site.
      </p>

      <h2>Your rights</h2>
      <p>Under the DPDP Act you have the right to:</p>
      <ul>
        <li>get a summary of the personal data we hold about you and how it is processed;</li>
        <li>have inaccurate or incomplete data corrected, completed or updated;</li>
        <li>have your data erased once it is no longer needed for the purpose you gave it for;</li>
        <li>withdraw your consent, as described above;</li>
        <li>nominate another person to exercise these rights if you die or become unable to;</li>
        <li>have a grievance addressed by us.</li>
      </ul>
      <p>
        You can update most profile information yourself from your dashboard. For anything else, contact{' '}
        <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a>.
      </p>

      <h2>Grievances</h2>
      <p>
        Send any complaint about how we handle your personal data to{' '}
        <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a>. If you are not satisfied with our
        response, you may complain to the Data Protection Board of India.
      </p>

      <h2>Data retention</h2>
      <p>
        We keep account and application data for as long as your account is active, and for a limited period after
        closure where required for legal, tax or dispute-resolution purposes. A career profile with no activity for 24
        months is deleted automatically.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to <a href={`mailto:${contact.supportEmail}`}>{contact.supportEmail}</a>.
      </p>
      {/* TODO (counsel): review the AI provider list above, and name the
          remaining data processors (hosting, email) and a
          named grievance contact person once finalised. */}
    </LegalPage>
  );
}