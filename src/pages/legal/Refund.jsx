import { LegalPage } from './LegalPage.jsx';
import { contact } from '../../data/site.js';

export default function Refund() {
  return (
    <LegalPage
      title="Refund policy"
      description="When DutyLaunch issues refunds for CV services, courses and documentation services."
      updated="20 September 2026"
    >
      <h2>CV, cover letter and LinkedIn bundles</h2>
      <ul>
        <li>Full refund if cancelled before a first draft is delivered.</li>
        <li>
          If you are not satisfied with the first draft, the revision window (one month, unlimited revisions) is
          the primary remedy. A refund at that stage is considered case by case, generally pro-rated against work
          already completed.
        </li>
        <li>No refund once the final, approved file has been delivered and the revision window has closed.</li>
      </ul>

      <h2>Courses</h2>
      <ul>
        <li>Full refund if you cancel before the course start date.</li>
        <li>
          Partial refunds after the course has started are assessed against how much content and mentor time has
          been delivered, and are not automatic.
        </li>
        <li>No refund after course completion or after a completion certificate has been issued.</li>
      </ul>

      <h2>Documentation and attestation services</h2>
      <ul>
        <li>Our service fee is refundable if we have not yet submitted your documents to any third party.</li>
        <li>
          Government, embassy and courier fees paid on your behalf are generally non-refundable once paid, because
          they are set and collected by third parties. We flag this before you authorise payment.
        </li>
        <li>
          If a document is rejected due to an error on our part, we correct and resubmit it at no additional service
          fee.
        </li>
      </ul>

      <h2>How refunds are paid</h2>
      <p>
        Approved refunds are returned to the original payment method. Processing time depends on your bank or
        payment provider and is typically 5–10 working days after approval.
      </p>

      <h2>Requesting a refund</h2>
      <p>
        Email <a href={`mailto:${contact.supportEmail}`}>{contact.supportEmail}</a> with your order reference and
        the reason for the request. We respond within one working day.
      </p>

      <p className="rounded-lg border border-dashed border-line bg-paper p-4 text-small not-prose">
        <strong className="font-semibold text-ink">Note for the DutyLaunch team:</strong> confirm exact refund
        windows, any non-refundable service-fee percentage, and the payment gateway's own refund processing time
        once finalised, and update this page to match precisely — vague refund policies are a common source of
        disputes.
      </p>
    </LegalPage>
  );
}
