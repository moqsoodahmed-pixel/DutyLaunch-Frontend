/**
 * Static site content: navigation, service taxonomy and marketing copy.
 * Anything a non-developer should be able to change (pricing, FAQs, articles,
 * courses, programmes) lives in MongoDB and is edited in the admin instead.
 *
 * Contact details (phone, WhatsApp, registered address) are confirmed.
 * Keep DutyLaunch-Backend/data/companyProfile.js in sync when they change —
 * the AI Career Assistant reads its copy from there.
 */
export const contact = {
  email: 'contact@dutylaunch.com',
  // Support address as stated in the corporate entity notice.
  supportEmail: 'support@dutylaunch.in',
  phone: '+91 85488 54826',
  phoneHref: 'tel:+918548854826',
  whatsapp: '918548854826',
  // As shown on DutyLaunch's own Google Business listing.
  addressLines: [
    'Plazzo Retail Mall, Ibrahim Sahib St',
    'Bharati Nagar, Shivaji Nagar',
    'Bengaluru, Karnataka 560001',
  ],
  addressMapUrl: 'https://www.google.com/maps/place/DutyLaunch/@12.983623,77.6094233,17z/data=!4m6!3m5!1s0x3bae17cc3757987d:0xfba9cd46257832ef!8m2!3d12.983623!4d77.6094233!16s%2Fg%2F11p19s05hm',
  hours: 'Monday to Saturday, 10:00 – 19:00 IST',
  needsConfirmation: false,
};

export const socials = [
  { label: 'Instagram', href: 'https://www.instagram.com/dutylaunch_?stkn=ZHVnOXZ3ZW5scGdl', icon: 'Instagram' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/1Df5RbBE8N/', icon: 'Facebook' },
  { label: 'X (Twitter)', href: 'https://x.com/Dutylaunch_2025', icon: 'Twitter' },
  { label: 'YouTube', href: 'https://www.youtube.com/@DutyLaunch_2025', icon: 'Youtube' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/', icon: 'Linkedin' },
];

/** Six pillars. Used by the navigation, the homepage matrix and the footer. */
export const pillars = [
  {
    id: 'career',
    label: 'Career',
    path: '/career-services',
    icon: 'Compass',
    summary: 'Profile, applications and interviews — the work that gets you shortlisted.',
    items: [
      { label: 'Career services', path: '/career-services', description: 'CV, cover letter, LinkedIn, interviews' },
      { label: 'CV pricing', path: '/pricing', description: 'Bundles by years of experience' },
      { label: 'Career counselling', path: '/career-services#counselling', description: 'Direction before applications' },
      { label: 'Job search assistance', path: '/career-services#job-search', description: 'Targeting and outreach' },
    ],
  },
  {
    id: 'education',
    label: 'Education',
    path: '/higher-education',
    icon: 'GraduationCap',
    summary: 'Degrees, diplomas and certifications, chosen for what they actually unlock.',
    items: [
      { label: 'Higher education', path: '/higher-education', description: 'Study abroad programmes and applications' },
      { label: 'Professional courses', path: '/professional-courses', description: 'Structured, mentor-led programmes' },
      { label: 'All courses', path: '/courses', description: 'Browse the full catalogue' },
      { label: 'Upskilling', path: '/upskills', description: 'Short courses for a specific gap' },
    ],
  },
  {
    id: 'global',
    label: 'Global mobility',
    path: '/dubai-launch',
    icon: 'Plane',
    summary: 'Working abroad, from the first application to your first week.',
    items: [
      { label: 'Dubai Launch package', path: '/dubai-launch', description: 'Dubai and the wider Gulf' },
      { label: 'Visa & relocation guidance', path: '/dubai-launch#relocation', description: 'Paperwork, housing, arrival' },
      { label: 'Apostille & attestation', path: '/appostle-services', description: 'Document legalisation' },
    ],
  },
  {
    id: 'documentation',
    label: 'Documentation',
    path: '/appostle-services',
    icon: 'FileCheck2',
    summary: 'Apostille, attestation and certified translation, tracked end to end.',
    items: [
      { label: 'All services', path: '/appostle-services', description: 'Apostille, attestation, translation' },
      { label: 'Apostille', path: '/appostle-services?category=Apostille', description: 'Hague Convention countries' },
      { label: 'Embassy attestation', path: '/appostle-services?category=Attestation', description: 'UAE and non-Hague countries' },
    ],
  },
  {
    id: 'jobs',
    label: 'Jobs',
    path: '/jobs',
    icon: 'Briefcase',
    summary: 'Search, apply and track — free for candidates.',
    items: [
      { label: 'Browse jobs', path: '/jobs', description: 'Search and filter open roles' },
      { label: 'For employers', path: '/employers', description: 'Post a role and manage applicants' },
      { label: 'Your applications', path: '/applications', description: 'Track where each application stands' },
    ],
  },
  {
    id: 'career-tools',
    label: 'Career+',
    path: '/ai-resume-builder',
    icon: 'LogoMark',
    summary: 'Everything that turns your experience into a stronger application.',
    items: [
      { label: 'AI Resume Builder', path: '/ai-resume-builder', description: 'Build a resume matched to a job description' },
      { label: 'LinkedIn Optimization', path: '/linkedin-optimization', description: 'Headline, About and keyword review' },
      { label: 'Cover Letter Generator', path: '/cover-letter-generator', description: 'A draft built from your own evidence' },
      { label: 'Interview Preparation', path: '/interview-preparation', description: 'Questions from the job and your resume' },
      { label: 'Career Profile', path: '/profile', description: 'The master profile every tool reads from' },
    ],
  },
];

/**
 * Dropdown groups that exist only in the navigation. Kept separate from
 * `pillars` because pillars also drive the homepage service matrix and the
 * About page — adding Upskills there would add a new card to both.
 */
export const navGroups = [
  {
    /* "Services" is the paid-services drawer: the things that are
       delivered by people rather than by the product. Keeping it out of
       `pillars` stops it appearing as another card on the homepage
       matrix, where it would compete with the free tools. */
    id: 'services',
    label: 'Services',
    path: '/career-services',
    icon: 'Compass',
    summary: 'Done-with-you services when the tools are not enough on their own.',
    items: [
      { label: 'Career services', path: '/career-services', description: 'CV writing, counselling, job search support' },
      { label: 'CV packages & pricing', path: '/pricing', description: 'Bundles by years of experience' },
      { label: 'Apostille & attestation', path: '/appostle-services', description: 'Document legalisation, tracked' },
      { label: 'For employers', path: '/employers', description: 'Post roles and reach matched candidates' },
      { label: 'Partner with us', path: '/partners', description: 'Institutes, EdTech and service partners' },
    ],
  },
  {
    id: 'upskills',
    label: 'Upskills',
    path: '/upskills',
    icon: 'GraduationCap',
    summary: 'Recognised programmes and industry courses to move your career forward.',
    items: [
      { label: 'Higher Education', path: '/higher-education', description: 'From X / SSLC to postgraduate degrees' },
      { label: 'Professional Courses', path: '/professional-courses', description: 'Industry-recognised certifications' },
    ],
  },
];

/** Every group a dropdown can open: the pillars plus nav-only groups. */
export const menuGroups = [...pillars, ...navGroups];

/**
 * Top-level navigation:
 * Home | Career Tools ▾ | Jobs | Upskills ▾ | Dubai Launch | Services | About
 *
 * Desktop navbar and mobile menu both read from this one array, so the
 * information architecture changes here and nowhere else.
 *
 * The ordering is the funnel, not the org chart: the free tool a visitor
 * came for sits second, the things they might buy sit after it, and the
 * company page sits last.
 */
export const primaryNav = [
  { label: 'Career+', menu: ['career-tools'] },
  { label: 'Jobs', path: '/jobs' },
  { label: 'Upskills', menu: ['upskills'] },
  { label: 'Dubai Launch', path: '/dubai-launch' },
  { label: 'Services', menu: ['services'] },
];

/**
 * The single primary call to action, used by the desktop navbar and the
 * mobile menu. It is the free analysis, deliberately — asking a stranger
 * to book a consultation before they have seen anything of value is the
 * slowest possible first step.
 */
export const primaryCta = {
  label: 'Analyze My Resume Free',
  to: '/resume-checker',
};

/** The signature five-stage section on the homepage. */
export const journey = [
  {
    stage: 'Discover',
    lead: 'Work out what you are actually aiming at.',
    detail:
      'A free counselling conversation about where you are, what the market pays for, and which of several plausible directions is worth your next two years.',
    support: ['Career counselling', 'Education goal setting', 'Market and role research'],
    link: { label: 'Book a free consultation', to: '/contact#consultation' },
  },
  {
    stage: 'Prepare',
    lead: 'Fix the documents before you send a single application.',
    detail:
      'An ATS-ready CV, a cover letter you can adapt, and a LinkedIn profile that reads as the person the role is for. This is the highest-leverage step and most people skip it.',
    support: ['ATS CV writing', 'Cover letter', 'LinkedIn optimisation'],
    link: { label: 'See CV bundles', to: '/pricing' },
  },
  {
    stage: 'Upskill',
    lead: 'Close the gap that is actually stopping you.',
    detail:
      'Sometimes the obstacle is a missing skill, sometimes it is a credential a regulator insists on. We tell you which, and only then recommend a course.',
    support: ['Professional courses', 'Short upskilling', 'Certification preparation'],
    link: { label: 'Browse courses', to: '/courses' },
  },
  {
    stage: 'Apply',
    lead: 'Apply deliberately, and prepare for what happens next.',
    detail:
      'Targeting, outreach and interview preparation — including mock interviews and the salary conversation most candidates go into unprepared.',
    support: ['Job search assistance', 'Interview preparation', 'Job marketplace'],
    link: { label: 'Browse jobs', to: '/jobs' },
  },
  {
    stage: 'Advance',
    lead: 'Move up, or move country.',
    detail:
      'Whether that means a senior role at home or a relocation to the Gulf, the work shifts to positioning, documentation and logistics.',
    support: ['UAE job seeker package', 'Visa & relocation guidance', 'Apostille & attestation'],
    link: { label: 'Take your career global', to: '/dubai-launch' },
  },
];

export const careerServices = [
  {
    id: 'ats-cv',
    title: 'ATS resume writing',
    icon: 'FileText',
    promise: 'A CV that parses cleanly and reads well.',
    body:
      'Written to the constraints applicant tracking systems impose — single column, standard headings, real text — and then written properly for the person who reads it next. Every bullet answers what changed, by how much, and how you know.',
    includes: ['Single-column, parse-safe layout', 'Achievement rewriting', 'Keyword mapping to target roles', 'Editable source file'],
    link: '/pricing',
  },
  {
    id: 'cover-letter',
    title: 'Cover letters',
    icon: 'Mail',
    promise: 'One strong letter you can adapt, not a template.',
    body:
      'Built around your target role, with the structure explained so you can adjust it per application instead of sending the same paragraph to fifty employers.',
    includes: ['Role-specific opening', 'Evidence paragraph', 'Adaptation guide'],
    link: '/pricing',
  },
  {
    id: 'linkedin',
    title: 'LinkedIn optimisation',
    icon: 'Linkedin',
    promise: 'Get found by the recruiters searching for you.',
    body:
      'Headline, About section, experience and skills rewritten so the profile surfaces in recruiter searches and holds up when someone clicks through from your application.',
    includes: ['Headline and About rewrite', 'Experience section rewrite', 'Skills and keyword audit', 'Profile settings checklist'],
    link: '/pricing',
  },
  {
    id: 'interview',
    title: 'Interview preparation',
    icon: 'MessagesSquare',
    promise: 'Practise under pressure, not in your head.',
    body:
      'Mock interviews with direct feedback. Behavioural questions, competency frameworks, the gaps in your CV, and the salary conversation.',
    includes: ['Mock interview with feedback', 'Answer structure coaching', 'Difficult-question preparation', 'Offer and salary strategy'],
    link: '/contact#consultation',
  },
  {
    id: 'counselling',
    title: 'Career counselling',
    icon: 'Compass',
    promise: 'Decide the direction before you optimise the route.',
    body:
      'A structured conversation about your experience, constraints and options. Useful when you are choosing between paths, considering a change, or unsure whether more study is the answer.',
    includes: ['Experience and skills review', 'Option comparison', 'Written next steps'],
    link: '/contact#consultation',
  },
  {
    id: 'job-search',
    title: 'Job search assistance',
    icon: 'Search',
    promise: 'Fewer, better-aimed applications.',
    body:
      'Target list building, application tracking and outreach to people who are not advertising. Volume applying has poor returns; this is the alternative.',
    includes: ['Target role and employer list', 'Application tracking', 'Recruiter outreach templates'],
    link: '/jobs',
  },
];

/* Dubai Launch. Every line here maps to an item in the package's "What's
   Included" list on /dubai-job-seeker-package — visit visa, flight ticket,
   bedspace, airport pickup, SIM, NOL card, CV distribution, interview
   guidance, job search support, relocation guidance. Nothing the package
   does not deliver (banking, contract review, etc.) is claimed.
   `services` is not currently rendered; `timeline` is the "order things
   have to happen in" section. */
export const globalMobility = {
  services: [
    { title: 'Job search support', icon: 'Search', body: 'A target list of employers and roles, and a plan for your time in Dubai.' },
    { title: 'CV distribution', icon: 'Send', body: 'Your CV sent to employers and recruitment consultancies hiring in your field.' },
    { title: 'Interview guidance', icon: 'MessagesSquare', body: 'Preparation for UAE interviews, in person or remote.' },
    { title: 'Visit visa and flights', icon: 'BadgeCheck', body: 'Help applying for your UAE visit visa and booking your flight.' },
    { title: 'Accommodation', icon: 'Home', body: 'Bedspace or shared accommodation arranged for your stay.' },
    { title: 'Airport pickup', icon: 'Plane', body: 'Met on arrival and taken to your accommodation.' },
    { title: 'SIM and NOL cards', icon: 'Smartphone', body: 'A UAE SIM card and a NOL card for Dubai\'s metro and buses.' },
    { title: 'Relocation guidance', icon: 'Map', body: 'What to expect once you have an offer, and the order to do it in.' },
  ],
  timeline: [
    { when: 'Before you travel', what: 'CV prepared for the UAE market, visit visa and flight ticket assistance, and your bedspace arranged.' },
    { when: 'On arrival', what: 'Airport pickup, a UAE SIM card and a NOL card for the metro and buses, then settling into your accommodation.' },
    { when: 'While you search', what: 'CV distribution to employers, job search support and interview guidance.' },
    { when: 'Once you have an offer', what: 'Relocation guidance: what your employer arranges, and the documents they will ask for.' },
  ],
};

export const educationJourney = [
  { stage: 'Choose goal', detail: 'Career outcome first, then qualification. We say plainly when a degree will not change your options.' },
  { stage: 'Find programme', detail: 'Shortlisting against budget, intake, entry requirements and post-study work rules.' },
  { stage: 'Expert guidance', detail: 'Statement of purpose, academic CV, references and funding search.' },
  { stage: 'Enrol', detail: 'Application submission, offer handling, financial documentation and visa paperwork.' },
  { stage: 'Grow', detail: 'Arrival planning, part-time work rules and the graduate job search.' },
];

/* Kept for existing imports; the source of truth is data/legal.js. */
export { legalLinks as legalPages } from './legal.js';

export const footerColumns = [
  {
    title: 'Career',
    links: [
      { label: 'Career services', path: '/career-services' },
      { label: 'CV pricing', path: '/pricing' },
      { label: 'Interview preparation', path: '/career-services#interview' },
      { label: 'Career counselling', path: '/career-services#counselling' },
    ],
  },
  {
    title: 'Learn',
    links: [
      { label: 'Higher education', path: '/higher-education' },
      { label: 'Professional courses', path: '/professional-courses' },
      { label: 'Upskilling', path: '/upskills' },
      { label: 'All courses', path: '/courses' },
    ],
  },
  {
    title: 'Global',
    links: [
      { label: 'UAE job seeker package', path: '/dubai-launch' },
      { label: 'Documentation', path: '/appostle-services' },
      { label: 'Jobs', path: '/jobs' },
      { label: 'For employers', path: '/employers' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', path: '/about' },
      { label: 'Blog', path: '/blog' },
      { label: 'FAQ', path: '/faq' },
      { label: 'Contact', path: '/contact' },
    ],
  },
];