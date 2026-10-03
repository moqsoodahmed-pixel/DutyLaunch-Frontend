import { contact } from '../../data/site.js';

const WA_ICON_PATH = 'M16 2C8.268 2 2 8.268 2 16c0 2.434.658 4.714 1.806 6.68L2 30l7.52-1.774A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.834-1.598l-.418-.248-4.333 1.022 1.044-4.224-.272-.434A11.46 11.46 0 0 1 4.5 16C4.5 9.648 9.648 4.5 16 4.5S27.5 9.648 27.5 16 22.352 27.5 16 27.5zm6.29-8.574c-.345-.172-2.04-1.006-2.355-1.12-.316-.115-.546-.172-.776.172-.23.345-.89 1.12-1.09 1.35-.2.23-.4.258-.746.086-.345-.172-1.458-.537-2.776-1.712-1.026-.916-1.719-2.047-1.92-2.392-.2-.345-.02-.532.15-.703.155-.155.345-.4.518-.603.172-.2.23-.345.345-.574.115-.23.058-.432-.029-.603-.086-.172-.776-1.87-1.063-2.56-.28-.673-.563-.581-.776-.592l-.66-.012c-.23 0-.603.086-.918.432s-1.205 1.178-1.205 2.873 1.233 3.333 1.405 3.563c.172.23 2.427 3.706 5.878 5.196.822.355 1.463.567 1.963.726.824.263 1.574.226 2.167.137.661-.099 2.04-.834 2.327-1.638.287-.805.287-1.494.2-1.638-.086-.144-.316-.23-.66-.4z';

/* Floating WhatsApp button — bottom-left quick-contact with the official WhatsApp logo. */
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
            className="group fixed left-5 sm:left-6 z-50 inline-flex items-center rounded-full bg-[#25D366] p-3 text-white shadow-[0_10px_25px_-5px_rgba(37,211,102,0.6)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_16px_35px_-6px_rgba(37,211,102,0.7)] hover:pr-4.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] print:hidden"
            style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
        >
            <svg viewBox="0 0 32 32" width={26} height={26} fill="currentColor" className="shrink-0" aria-hidden="true">
                <path d={WA_ICON_PATH} />
            </svg>
            <span className="max-w-0 overflow-hidden whitespace-nowrap text-small font-bold opacity-0 transition-all duration-300 ease-out group-hover:ml-2.5 group-hover:max-w-[8rem] group-hover:opacity-100">
                Chat with us
            </span>
        </a>
    );
}