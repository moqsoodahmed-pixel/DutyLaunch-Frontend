import { LegalPage } from './LegalPage.jsx';
import { contact } from '../../data/site.js';

export default function Cancellation() {
  return (
    <LegalPage
      title="Cancellation policy"
      description="How to cancel a DutyLaunch service and what happens to work already in progress."
      updated="20 September 2026"
    >
      <h2>CV, cover letter and LinkedIn bundles</h2>
      <p>
        You can cancel before any draft work has been sent to you for a full refund. Once a first draft has been
        delivered, the engagement is considered started; see the refund policy for what applies from that point.
      </p>

      <h2>Courses</h2>
      <p>
        You can cancel a course enrolment before it begins for a full refund, less any payment-processing fee shown
        at checkout. Cancellations made after a course has started are handled case by case, taking into account how
        much of the course content and mentor time has already been delivered.
      </p>

      <h2>Documentation and attestation services</h2>
      <p>
        You can cancel before we submit your documents to any third-party office (state authority, embassy or
        translation partner). Once a document has been submitted to a third party, government and embassy fees are
        typically non-refundable regardless of the outcome, and we will tell you this explicitly before submission.
      </p>

      <h2>Consultations</h2>
      <p>Free consultations can be rescheduled or cancelled at any time with no charge.</p>

      <h2>How to cancel</h2>
      <p>
        Email <a href={`mailto:${contact.supportEmail}`}>{contact.supportEmail}</a> with your order reference, or
        message us through your dashboard if you have an account. We aim to confirm cancellations within one working
        day.
      </p>

      <p className="rounded-lg border border-dashed border-line bg-paper p-4 text-small not-prose">
        <strong className="font-semibold text-ink">Note for the DutyLaunch team:</strong> confirm exact cancellation
        windows (in hours or days) and any processing-fee percentages once the payment gateway is finalised, and
        update this page to match.
      </p>
    </LegalPage>
  );
}
