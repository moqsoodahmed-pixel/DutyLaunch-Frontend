/**
 * Company identity and legal wording, in one place.
 *
 * CONSENT_TEXT must match CONSENT_TEXT in the backend
 * (DutyLaunch-Backend/utils/consent.js) word for word — the server stores
 * that copy as the record of what the user agreed to. If you change one,
 * change both and bump CONSENT_VERSION there.
 */
export const company = {
  brand: 'DutyLaunch',
  legalName: 'DutyLaunch Solutions Private Limited',
  cin: 'U62099KA2025PTC211509',
  registeredOffice: 'Koramangala, Bengaluru, Karnataka 560034',
  supportEmail: 'support@dutylaunch.in',
};

export const CONSENT_TEXT =
  'I agree to the Terms & Conditions and Privacy Policy, and consent to DutyLaunch processing my personal data and resume for career and recruitment facilitation services.';

export const CONSENT_REQUIRED_MESSAGE = 'Please agree to the Terms & Conditions and Privacy Policy to continue.';

export const legalLinks = [
  { label: 'Terms & Conditions', path: '/terms-and-conditions' },
  { label: 'Privacy Policy', path: '/privacy-policy' },
  { label: 'Refund & Cancellation Policy', path: '/refund-policy' },
  { label: 'Disclaimers & Licensing Disclosure', path: '/disclaimers' },
];

/*
 * GST disclosure shown under every consumer price (Consumer Protection Act,
 * 2019 / Legal Metrology: the price must say whether tax is included).
 *
 * ⚠ CONFIRM BEFORE PUBLISHING. Set this to match how your prices are
 * actually charged — showing the wrong one is itself misleading:
 *   'exclusive' → "Exclusive of GST (18%)"  (GST is added at checkout)
 *   'inclusive' → "Inclusive of all taxes"  (the shown price is final)
 */
export const GST_PRICING = 'exclusive';

export const PRICE_TAX_NOTE = GST_PRICING === 'inclusive' ? 'Inclusive of all taxes' : 'Exclusive of GST (18%)';
