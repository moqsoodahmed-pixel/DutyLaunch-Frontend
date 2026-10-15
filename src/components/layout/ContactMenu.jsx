import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, Mail, MessageCircle, Phone } from 'lucide-react';
import { contact } from '../../data/site.js';

/**
 * Call-icon dropdown — the reference site's contact popover, with DutyLaunch's
 * real, confirmed channels. Presentational only: the navbar owns the open
 * state and closes it on outside-click / Esc / navigation.
 */
export function ContactMenu({ onClose }) {
    const rows = [
        {
            key: 'call',
            href: contact.phoneHref,
            icon: Phone,
            title: contact.phone,
            sub: 'New enquiry, call us',
        },
        {
            key: 'whatsapp',
            href: `https://wa.me/${contact.whatsapp}`,
            external: true,
            icon: MessageCircle,
            title: 'Chat on WhatsApp',
            sub: 'Usually the fastest reply',
        },
        {
            key: 'email',
            href: `mailto:${contact.email}`,
            icon: Mail,
            title: contact.email,
            sub: 'Email us anytime',
        },
        {
            key: 'consult',
            to: '/contact#consultation',
            icon: CalendarCheck,
            title: 'Book a free consultation',
            sub: 'A counsellor calls within a working day',
        },
    ];

    const rowClass =
        'group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 hover:bg-dl-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dl-blue';

    const Body = ({ icon: Icon, title, sub }) => (
        <>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-dl-border/70 bg-dl-hover text-dl-blue transition-colors group-hover:bg-white">
                <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-small font-bold text-dl-ink">{title}</span>
                <span className="block text-caption text-dl-muted">{sub}</span>
            </span>
        </>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.16 }}
            aria-label="Contact options"
            className="absolute right-0 top-full z-[80] mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-dl-border bg-white p-2 shadow-dl-menu"
        >
            <p className="px-3 pb-1 pt-1 text-caption font-bold uppercase tracking-wider text-dl-navy">Talk to us</p>
            <ul className="grid gap-0.5">
                {rows.map((r) => (
                    <li key={r.key}>
                        {r.to ? (
                            <Link to={r.to} onClick={onClose} className={rowClass}>
                                <Body icon={r.icon} title={r.title} sub={r.sub} />
                            </Link>
                        ) : (
                            <a
                                href={r.href}
                                onClick={onClose}
                                {...(r.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                className={rowClass}
                            >
                                <Body icon={r.icon} title={r.title} sub={r.sub} />
                            </a>
                        )}
                    </li>
                ))}
            </ul>
            <p className="border-t border-dl-border px-3 pb-1 pt-2.5 text-caption text-dl-muted">{contact.hours}</p>
        </motion.div>
    );
}