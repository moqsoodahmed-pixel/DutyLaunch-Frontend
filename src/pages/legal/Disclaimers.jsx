import { Link } from 'react-router-dom';
import { LegalPage } from './LegalPage.jsx';
import { company } from '../../data/legal.js';

/**
 * Disclaimers & Licensing Disclosure.
 *
 * Only statements that are verifiable facts, or policies the site already
 * states elsewhere, are published here.
 *
 * TODO (counsel): overseas recruitment in India generally requires a
 * Recruiting Agent licence under the Emigration Act, 1983. Confirm whether
 * DutyLaunch or a named partner holds one for Dubai/UAE placements, and
 * add the licence holder and number to "Registrations and licences". Do
 * not publish a licensing statement until it is confirmed.
 */
export default function Disclaimers() {
  const mail = <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a>;
  return (
    <LegalPage
      title="Disclaimers & Licensing Disclosure"
      description="What DutyLaunch does and does not guarantee, how partner services work, and the company's registration details."
      updated="28 September 2026"
    >
      <h2>Registrations and licences</h2>
      <p>
        {company.brand} is operated by {company.legalName}, a private limited company incorporated in India and
        registered with the Ministry of Corporate Affairs under CIN {company.cin}. Registered office:{' '}
        {company.registeredOffice}.
      </p>
      <p>
        DutyLaunch is not a government body and is not affiliated with any ministry, embassy or consulate unless we
        say so explicitly for a specific service. Visas, work permits, residency and document attestations are granted
        only by the relevant government authorities.
      </p>

      <h2>No guarantee of outcomes</h2>
      <p>
        We help you present your real qualifications clearly and prepare for opportunities. We do not guarantee job
        offers, interviews, admissions, visa approvals or any other decision made by an employer, institution or
        government authority. Those decisions depend on your eligibility and on third parties we do not control.
      </p>

      <h2>Scores and AI-generated content</h2>
      <ul>
        <li>
          Resume Health, ATS and Job Match scores are indicators calculated by DutyLaunch&apos;s own methodology. They
          are not a guarantee that any applicant tracking system will accept your resume, or that you will be
          shortlisted.
        </li>
        <li>
          Suggestions, rewrites, cover letters and interview material are drafts for you to review. You are responsible
          for checking that anything you send to an employer is accurate. Our tools are designed not to add experience,
          qualifications or figures you have not given us, and they flag anything they cannot verify.
        </li>
      </ul>

      <h2>Job listings</h2>
      <p>
        Jobs are posted by employers, and each employer is responsible for its listing and hiring decisions. Applying to
        jobs through DutyLaunch is free for candidates. If anyone claiming to represent DutyLaunch asks you to pay in
        return for a job offer, do not pay, and report it to {mail}.
      </p>

      <h2>Partner and third-party services</h2>
      <p>
        Some services — for example education programmes, education financing, relocation support under Dubai Launch
        and parts of document processing — are provided by partner organisations. We tell you which organisation
        provides a service before you engage it. Admission, accreditation, loan approval and similar decisions rest
        with that partner or institution, and their own terms apply.
      </p>

      <h2>Information on this website</h2>
      <p>
        We keep this website accurate and up to date, but information such as fees charged by third parties,
        government procedures and programme details can change without notice. Please confirm anything important with
        us before you rely on it.
      </p>

      <h2>Questions</h2>
      <p>
        Contact {mail}. See also our <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>,{' '}
        <Link to="/privacy-policy">Privacy Policy</Link> and{' '}
        <Link to="/refund-policy">Refund &amp; Cancellation Policy</Link>.
      </p>
    </LegalPage>
  );
}
