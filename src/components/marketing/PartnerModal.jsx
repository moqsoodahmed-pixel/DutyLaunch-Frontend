import { useEffect, useState } from 'react';
import { ArrowLeft, Building2, Info, MapPin } from 'lucide-react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { ConsultationForm } from './ConsultationForm.jsx';
import { partnersFor, SHOW_SAMPLE_NOTICE } from '../../data/partners.js';

const MODE_STYLE = {
  Online: 'bg-azure-50 text-azure-700',
  Distance: 'bg-azure-50 text-azure-700',
  Regular: 'bg-success/10 text-success',
  Classroom: 'bg-success/10 text-success',
  Hybrid: 'bg-amber-500/10 text-amber-700',
};

/**
 * Opens when a programme/course chip is clicked. Lists the partner
 * institutes for that programme; "Enquire" switches the same modal to the
 * consultation form with the service and a message prefilled, so the
 * counsellor knows exactly which programme and institute the enquiry is about.
 *
 * selection: { item, group } | null
 * service:   the ConsultationForm service option to preselect
 */
export function PartnerModal({ selection, onClose, service }) {
  const [enquiring, setEnquiring] = useState(null);

  // Reset to the list view whenever a different programme is opened.
  useEffect(() => setEnquiring(null), [selection?.item]);

  if (!selection) return null;
  const { item, group } = selection;
  const partners = partnersFor(item, group);

  return (
    <Modal
      open={Boolean(selection)}
      onClose={onClose}
      title={enquiring ? `Enquire about ${item}` : item}
      description={
        enquiring
          ? `At ${enquiring.name} — a counsellor will confirm availability and next steps within one working day.`
          : `Partner institutes offering ${item}.`
      }
      size="lg"
    >
      {enquiring ? (
        <div>
          <button
            type="button"
            onClick={() => setEnquiring(null)}
            className="mb-4 inline-flex items-center gap-1.5 text-small font-semibold text-slate-600 hover:text-ink"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to institutes
          </button>
          <ConsultationForm
            key={`${item}-${enquiring.name}`}
            defaultService={service}
            defaultMessage={`I'm interested in ${item} at ${enquiring.name}.`}
            compact
          />
        </div>
      ) : (
        <div className="space-y-3">
          {partners.length === 0 && (
            <p className="text-small text-slate-600">
              Partner institutes for this programme are shared during your consultation.
            </p>
          )}

          {partners.map((p) => (
            <article
              key={p.name}
              className="flex flex-col gap-3 rounded-lg border border-line bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-azure-50">
                  <Building2 className="h-5 w-5 text-azure" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="text-body font-bold text-ink">{p.name}</h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" aria-hidden />
                      {p.location}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 font-semibold ${MODE_STYLE[p.mode] || 'bg-slate-100 text-slate-600'}`}>
                      {p.mode}
                    </span>
                  </p>
                  {p.note && <p className="mt-1.5 text-small text-slate-600">{p.note}</p>}
                </div>
              </div>
              <Button size="sm" onClick={() => setEnquiring(p)} className="shrink-0 sm:w-auto">
                Enquire
              </Button>
            </article>
          ))}

          {SHOW_SAMPLE_NOTICE && (
            <p className="flex items-start gap-2 rounded-lg bg-paper px-3 py-2.5 text-caption text-slate-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              Sample listings for demonstration. Confirmed partner institutes, eligibility and fees are shared during
              your free consultation.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}