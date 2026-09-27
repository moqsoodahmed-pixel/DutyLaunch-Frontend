import { Link } from 'react-router-dom';
import { LegalPage } from './LegalPage.jsx';
import { company } from '../../data/legal.js';

/**
 * Refund & Cancellation Policy — merges the former /refund-policy and
 * /cancellation-policy pages (their content is unchanged, only combined).
 *
 * TODO (DutyLaunch): confirm exact cancellation/refund windows, any
 * non-refundable service-fee percentage and the payment gateway's own
 * refund time, then state them precisely here. They were never confirmed,
 * so no percentages are quoted.
 */
export default function RefundCancellation() {
  const mail = <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a>;
  return (
    <LegalPage
      title="Refund & Cancellation Policy"
      description="How to cancel a DutyLaunch service, and when refunds are issued for CV services, courses and documentation services."
      updated="28 September 2026"
    >
      <p>
        This policy applies to services purchased from {company.legalName} (&ldquo;DutyLaunch&rdquo;). It forms part
        of our <Link to="/terms-and-conditions">Terms &amp; Conditions</Link>.
      </p>

      <h2>CV, cover letter and LinkedIn bundles</h2>
      <ul>
        <li>You can cancel before a first draft is delivered for a full refund.</li>
        <li>
          Once a first draft has been delivered, the engagement has started. If you are not satisfied with it, the
          revision window (one month, unlimited revisions) is the primary remedy. A refund at that stage is
          considered case by case, generally pro-rated against work already completed.
        </li>
        <li>No refund once the final, approved file has been delivered and the revision window has closed.</li>
      </ul>

      <h2>Courses</h2>
      <ul>
        <li>You can cancel before the course start date for a full refund.</li>
        <li>
          Cancellations after a course has started are assessed against how much content and mentor time has been
          delivered, and refunds at that stage are not automatic.
        </li>
        <li>No refund after course completion or after a completion certificate has been issued.</li>
      </ul>

      <h2>Documentation and attestation services</h2>
      <ul>
        <li>
          You can cancel before we submit your documents to any third-party office (state authority, embassy or
          translation partner), and our service fee is refunded.
        </li>
        <li>
          Government, embassy and courier fees paid on your behalf are generally non-refundable once paid, because
          they are set and collected by third parties. We tell you this before you authorise payment.
        </li>
        <li>If a document is rejected because of an error on our part, we correct and resubmit it at no additional service fee.</li>
      </ul>

      <h2>Consultations</h2>
      <p>Free consultations can be rescheduled or cancelled at any time at no charge.</p>

      <h2>How to cancel or request a refund</h2>
      <p>
        Email {mail} with your order reference and the reason for your request, or message us from your dashboard if
        you have an account. We aim to respond within one working day.
      </p>

      <h2>How refunds are paid</h2>
      <p>
        Approved refunds are returned to the original payment method. Processing time depends on your bank or payment
        provider and is typically 5–10 working days after approval.
      </p>
    </LegalPage>
  );
}
