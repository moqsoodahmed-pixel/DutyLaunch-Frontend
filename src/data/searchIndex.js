import { menuGroups } from './site.js';

/**
 * In-site search index.
 *
 * Built from the real navigation (menuGroups → every page with its route and
 * description) plus a curated layer of synonyms/keywords, so a search for a
 * word that is NOT in a page title ("visa", "salary", "attestation", "cost")
 * still lands on the right page. Everything here is a real, existing route.
 */
const CURATED = [
    { title: 'Home', path: '/', group: 'Pages', description: 'Career, education, jobs and documentation — one launchpad.', keywords: 'home start dutylaunch' },
    { title: 'Resume Checker', path: '/resume-checker', group: 'Career+', description: 'Free Resume Health score with a fix for every issue.', keywords: 'ats cv resume score check free analyze analysis health scan' },
    { title: 'Resume Builder', path: '/resume-builder', group: 'Career+', description: 'Upload your resume or start from scratch. Free and paid templates.', keywords: 'resume builder cv builder create write new improve upload template make' },
    { title: 'CV Templates', path: '/cv-templates', group: 'Career+', description: 'ATS-friendly resume templates by role.', keywords: 'cv resume templates ats format design role sample' },
    { title: 'LinkedIn Optimization', path: '/linkedin-optimization', group: 'Career+', description: 'Headline, About and keyword review.', keywords: 'linkedin profile optimization headline keywords social network' },
    { title: 'Cover Letter Generator', path: '/cover-letter-generator', group: 'Career+', description: 'A cover letter built from your own evidence.', keywords: 'cover letter generator write application' },
    { title: 'Interview Preparation', path: '/interview-preparation', group: 'Career+', description: 'Practice questions from the job and your resume.', keywords: 'interview preparation questions practice coach mock prep' },
    { title: 'Jobs', path: '/jobs', group: 'Jobs', description: 'Search and filter open roles — free for candidates.', keywords: 'jobs search vacancy vacancies roles hiring careers salary apply openings work' },
    { title: 'For Employers', path: '/employers', group: 'Jobs', description: 'Post a role and manage applicants.', keywords: 'employer post job hire recruiter recruitment applicants vacancy' },
    { title: 'Pricing', path: '/pricing', group: 'Services', description: 'CV bundles priced by experience.', keywords: 'pricing price cost cv bundles packages fees plans charges rates' },
    { title: 'Career Services', path: '/career-services', group: 'Services', description: 'CV writing, counselling and job-search support.', keywords: 'career services cv writing counselling job search coaching guidance' },
    { title: 'Dubai Launch', path: '/dubai-launch', group: 'Global mobility', description: 'Jobs and relocation support in the Gulf.', keywords: 'dubai uae gulf abroad relocation visa job seeker package overseas' },
    { title: 'Apostille & Attestation', path: '/appostle-services', group: 'Documentation', description: 'Document legalisation, tracked end to end.', keywords: 'apostille attestation documents legalisation certificate embassy mea passport translation visa notary' },
    { title: 'Higher Education', path: '/higher-education', group: 'Education', description: 'Study-abroad programmes and applications.', keywords: 'higher education study abroad degree university college masters admission sop bachelors' },
    { title: 'Professional Courses', path: '/professional-courses', group: 'Education', description: 'Industry-recognised certifications.', keywords: 'professional courses certification certificate training programme' },
    { title: 'Courses', path: '/courses', group: 'Education', description: 'Browse the full course catalogue.', keywords: 'courses catalogue upskill learning certification class training' },
    { title: 'Upskills', path: '/upskills', group: 'Education', description: 'Short courses for a specific gap.', keywords: 'upskill upskilling short course skills learn' },
    { title: 'Blog', path: '/blog', group: 'Company', description: 'Articles on careers, education and moving abroad.', keywords: 'blog articles news guides tips stories' },
    { title: 'FAQ', path: '/faq', group: 'Company', description: 'Common questions, answered plainly.', keywords: 'faq questions help support answers' },
    { title: 'Contact', path: '/contact', group: 'Company', description: 'Talk to us — the first conversation is free.', keywords: 'contact support email phone whatsapp consultation book call reach' },
    { title: 'About', path: '/about', group: 'Company', description: 'One team for the career, qualification and paperwork.', keywords: 'about company team who we are story' },
    { title: 'Partners', path: '/partners', group: 'Company', description: 'Institutes, EdTech and service partners.', keywords: 'partners partnership institutes collaborate affiliate' },
    { title: 'Privacy Policy', path: '/privacy-policy', group: 'Legal', description: 'How we handle your data.', keywords: 'privacy policy data protection' },
    { title: 'Terms & Conditions', path: '/terms-and-conditions', group: 'Legal', description: 'The terms of using DutyLaunch.', keywords: 'terms conditions legal agreement' },
    { title: 'Refund Policy', path: '/refund-policy', group: 'Legal', description: 'Payment and refund conditions.', keywords: 'refund cancellation payment policy money back' },
];

function build() {
    const byPath = new Map();
    const add = (e) => {
        if (!e.path || e.path.includes('#')) return; // skip in-page anchors
        const prev = byPath.get(e.path);
        if (prev) {
            prev.keywords = `${prev.keywords} ${(e.keywords || '')} ${(e.title || '')} ${(e.description || '')}`.toLowerCase();
            return;
        }
        byPath.set(e.path, {
            title: e.title,
            path: e.path,
            description: e.description || '',
            group: e.group || 'Pages',
            keywords: `${e.title} ${(e.keywords || '')} ${(e.description || '')}`.toLowerCase(),
        });
    };
    CURATED.forEach(add);
    menuGroups.forEach((g) =>
        (g.items || []).forEach((it) =>
            add({ title: it.label, path: it.path, description: it.description, group: g.label, keywords: `${g.label} ${it.description || ''}` })
        )
    );
    return [...byPath.values()];
}

export const SEARCH_INDEX = build();

export const POPULAR_SEARCHES = ['/resume-checker', '/jobs', '/pricing', '/cv-templates', '/dubai-launch', '/appostle-services']
    .map((p) => SEARCH_INDEX.find((e) => e.path === p))
    .filter(Boolean);

/** Token-based scoring: every query word must match somewhere; title hits
    and prefix hits are weighted highest. Returns the best `limit` entries. */
export function searchSite(query, limit = 8) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const tokens = q.split(/\s+/).filter(Boolean);
    const scored = [];
    for (const e of SEARCH_INDEX) {
        const title = e.title.toLowerCase();
        let score = 0;
        let allMatch = true;
        for (const t of tokens) {
            let hit = false;
            if (title.startsWith(t)) { score += 6; hit = true; }
            else if (title.includes(t)) { score += 4; hit = true; }
            if (e.keywords.includes(t)) { score += 2; hit = true; }
            if (!hit) { allMatch = false; break; }
        }
        if (!allMatch) continue;
        if (title === q) score += 10;
        scored.push({ ...e, score });
    }
    scored.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
    return scored.slice(0, limit);
}