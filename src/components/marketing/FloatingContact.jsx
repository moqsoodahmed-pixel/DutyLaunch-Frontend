import { MessageCircle } from 'lucide-react';
import { contact } from '../../data/site.js';

/* Floating WhatsApp button — the reference site's bottom-left quick-contact.
   Uses the confirmed WhatsApp number from data/site.js. Fixed and out of the
   document flow, so it never affects layout. */
export function FloatingContact() {
    const href = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(
        "Hi DutyLaunch, I'd like help with my career/documents."
    )}`;

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            id="floating-contact"
            aria-label="Chat with us on WhatsApp"
            className="group fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] py-3 pl-3 pr-4 text-white shadow-[0_12px_30px_-8px_rgba(37,211,102,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-10px_rgba(37,211,102,0.7)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] print:hidden"
            style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
        >
            <MessageCircle className="h-6 w-6 shrink-0" aria-hidden />
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-small font-bold opacity-0 transition-all duration-300 group-hover:max-w-[8rem] group-hover:opacity-100">
                Chat with us
            </span>
        </a>
    );
}