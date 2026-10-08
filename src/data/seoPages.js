/**
 * SEO copy for the public landing pages.
 *
 * Every title, meta description and hero string for the new information
 * architecture lives here, in one file, rather than being scattered
 * through page components. Two reasons:
 *
 *  1. Marketing copy changes far more often than page logic, and whoever
 *     rewrites a meta description should not have to open a JSX file.
 *  2. The URLs, titles and descriptions can be reviewed as a set — which
 *     is the only way to catch two pages competing for the same search
 *     intent, or a title that runs past what Google will render.
 *
 * Keep titles under ~60 characters and descriptions between 140 and 160,
 * or they get truncated in results.
 *
 * NOTE FOR CONTENT: the strings below follow the agreed page structure
 * and messaging rules (no guarantees of employment, ATS acceptance or
 * visa approval). If you have final approved copy, replace the values
 * here and nothing else needs to change.
 */

export const seoPages = {
  home: {
    path: '/',
    title: 'DutyLaunch — Career Intelligence & Opportunity Platform',
    description:
      'Analyse your resume free, find where it falls short against a real job description, close the gaps and apply with a profile that reflects your actual experience.',
    heading: 'Your Career. Your Next Opportunity. One Launchpad.',
    subheading:
      'Upload your CV and get an honest read on where you stand — what a recruiter will see, what a job description is asking for that you have not evidenced, and what to do about it.',
    primaryCta: { label: 'Analyze My Resume Free', to: '/resume-checker' },
    secondaryCta: { label: 'Browse jobs', to: '/jobs' },
  },

  aiResumeBuilder: {
    path: '/resume-builder',
    title: 'Resume Builder — Build a Resume That Matches the Job',
    description:
      'Upload your resume, add a job description, and DutyLaunch identifies gaps, strengthens your content from your own evidence and builds a clean, ATS-friendly resume.',
    heading: 'Build a Resume That Matches the Job',
    subheading:
      'Upload your resume, add a job description, and let DutyLaunch identify gaps, strengthen your content and build a professional, ATS-friendly resume.',
    primaryCta: { label: 'Analyze My Resume Free', to: '/resume-checker' },
    secondaryCta: { label: 'Create resume from scratch', to: '/resume-builder?start=scratch' },
  },

  resumeChecker: {
    path: '/resume-checker',
    title: 'Free Resume Checker — Score Your CV in Minutes',
    description:
      'Get a free Resume Health score covering structure, readability, achievement strength and keyword coverage, with a specific fix for every issue found.',
    heading: 'Check your resume before a recruiter does',
    subheading:
      'A category-by-category read on your CV: what is strong, what needs work and what is missing. Free, and you keep the report.',
    primaryCta: { label: 'Analyze My Resume Free', to: '/resume-checker#upload' },
    secondaryCta: { label: 'See how scoring works', to: '/resume-checker#methodology' },
  },

  jobs: {
    path: '/jobs',
    title: 'Jobs — Search and Apply with a Matched Profile',
    description:
      'Search open roles and see how your profile matches each one before you apply, with the gaps named so you can decide where your application is worth sending.',
    heading: 'Find roles worth applying to',
    subheading:
      'Search, filter and apply. Where you have a DutyLaunch profile, each role shows how your evidence lines up against what the employer asked for.',
    primaryCta: { label: 'Browse jobs', to: '/jobs' },
    secondaryCta: { label: 'Analyze My Resume Free', to: '/resume-checker' },
  },

  upskills: {
    path: '/upskills',
    title: 'Upskills — Courses Chosen for the Gap You Actually Have',
    description:
      'Short courses and certifications matched to the specific skills your target roles ask for and your resume does not yet evidence.',
    heading: 'Learn the thing that is actually holding you back',
    subheading:
      'We name the gap first, then show the courses that close it. No catalogue-browsing and hoping.',
    primaryCta: { label: 'Find my skill gap', to: '/resume-checker' },
    secondaryCta: { label: 'Browse all courses', to: '/courses' },
  },

  higherEducation: {
    path: '/higher-education',
    title: 'Higher Education — Degrees and Programmes with a Career Plan',
    description:
      'Undergraduate and postgraduate programmes with admissions support, financing options and an honest view of what each qualification opens up.',
    heading: 'Choose a programme for where it takes you',
    subheading:
      'Degrees, diplomas and distance programmes, with admissions guidance and financing — matched to the career you are aiming at.',
    primaryCta: { label: 'Explore programmes', to: '/higher-education' },
    secondaryCta: { label: 'Talk to a counsellor', to: '/contact#consultation' },
  },

  professionalCourses: {
    path: '/professional-courses',
    title: 'Professional Courses — Industry-Recognised Certifications',
    description:
      'Structured, mentor-led certifications in the skills employers are hiring for, with the course chosen against your target role rather than a catalogue.',
    heading: 'Certifications that employers actually ask for',
    subheading:
      'Mentor-led programmes in the tools and disciplines your target job descriptions name most often.',
    primaryCta: { label: 'Browse courses', to: '/professional-courses' },
    secondaryCta: { label: 'Find my skill gap', to: '/resume-checker' },
  },

  dubaiLaunch: {
    path: '/dubai-launch',
    title: 'Dubai Launch — Job Search Support for the UAE',
    description:
      'CV and profile work to UAE conventions, employer outreach, documentation and relocation guidance for candidates targeting Dubai and the wider Gulf.',
    heading: 'Working in Dubai, planned properly',
    subheading:
      'A UAE-format CV, the documentation in order and a realistic view of the market — before you spend money on a job-seeker visa.',
    primaryCta: { label: 'See what is included', to: '/dubai-launch#package' },
    secondaryCta: { label: 'Talk to us first', to: '/contact#consultation' },
    /* Compliance: nothing on this page may imply a guaranteed job,
       guaranteed visa approval or a guaranteed timeline (spec §40). */
    disclaimer:
      'We help you prepare and apply. We do not guarantee employment, visa approval or a processing timeline — those decisions sit with employers and authorities.',
  },

  appostleServices: {
    path: '/appostle-services',
    title: 'Apostille & Attestation Services — Tracked End to End',
    description:
      'Apostille, embassy attestation and certified translation for educational and personal documents, handled and tracked from collection to delivery.',
    heading: 'Documents ready before the employer asks',
    subheading:
      'Apostille, attestation and certified translation, with a tracked status at every stage rather than a black box.',
    primaryCta: { label: 'See services and timelines', to: '/appostle-services#services' },
    secondaryCta: { label: 'Ask about your documents', to: '/contact' },
  },

  linkedinOptimization: {
    path: '/linkedin-optimization',
    title: 'LinkedIn Optimization — Headline, About and Keywords',
    description:
      'Rewrite your LinkedIn headline, About section and experience so recruiters searching for your target role actually find you — using only your real evidence.',
    heading: 'Be findable for the role you want',
    subheading:
      'Your LinkedIn and your resume should tell the same story. We align them, using the experience you already have.',
    primaryCta: { label: 'Optimise my LinkedIn', to: '/linkedin-optimization#start' },
    secondaryCta: { label: 'Check my resume first', to: '/resume-checker' },
  },

  coverLetterGenerator: {
    path: '/cover-letter-generator',
    title: 'Cover Letter Generator — Written from Your Real Experience',
    description:
      'Generate a cover letter built from your resume and the job description, with every claim traceable to something you have actually done.',
    heading: 'A cover letter that says something',
    subheading:
      'Built from your resume and the job description — specific to the role, and free of the claims you would have to walk back in an interview.',
    primaryCta: { label: 'Draft my cover letter', to: '/cover-letter-generator#start' },
    secondaryCta: { label: 'Analyze My Resume Free', to: '/resume-checker' },
  },

  interviewPreparation: {
    path: '/interview-preparation',
    title: 'Interview Preparation — Questions from Your Own Resume',
    description:
      'Practise the questions this job description and your own resume claims are most likely to produce, including how to back up every number you have written.',
    heading: 'Prepare for the questions you will actually get',
    subheading:
      'Role-specific questions, plus a challenge on every claim in your resume — because that is what a good interviewer does.',
    primaryCta: { label: 'Start interview prep', to: '/interview-preparation#start' },
    secondaryCta: { label: 'Review my resume', to: '/resume-checker' },
  },

  employers: {
    path: '/employers',
    title: 'For Employers — Post Roles and Reach Matched Candidates',
    description:
      'Post a role and reach candidates whose evidenced skills match your requirements, with structured profiles instead of a stack of inconsistent PDFs.',
    heading: 'Hire from evidence, not formatting',
    subheading:
      'Post a role and see candidates whose skills are actually evidenced against what you asked for.',
    primaryCta: { label: 'Post a role', to: '/employers#post' },
    secondaryCta: { label: 'Talk to our team', to: '/contact' },
  },

  partners: {
    path: '/partners',
    title: 'Partner with DutyLaunch — Institutes, EdTech and Services',
    description:
      'List your programmes in front of candidates who have already identified the exact skill gap your course closes. For universities, training providers and service partners.',
    heading: 'Reach candidates at the moment they decide to learn',
    subheading:
      'We tell a candidate which skill is holding them back. Partner institutes are what we show them next.',
    primaryCta: { label: 'Apply to partner', to: '/partners#apply' },
    secondaryCta: { label: 'Ask a question', to: '/contact' },
  },

  about: {
    path: '/about',
    title: 'About DutyLaunch — Career Intelligence, Honestly Done',
    description:
      'DutyLaunch helps candidates assess their career profile, improve applications, develop relevant skills and find opportunities — without fabricating anything.',
    heading: 'We will not write a resume you cannot defend',
    subheading:
      'DutyLaunch is a career intelligence and opportunity platform. The resume is where most people meet us; it is not the whole product.',
  },

  contact: {
    path: '/contact',
    title: 'Contact DutyLaunch — Talk to a Career Advisor',
    description:
      'Questions about your CV, a course, documentation or working abroad? Talk to a DutyLaunch advisor, or book a free consultation.',
    heading: 'Talk to someone who has seen your situation before',
    subheading: 'Tell us where you are and what you are trying to do next.',
  },

  faq: {
    path: '/faq',
    title: 'Frequently Asked Questions — DutyLaunch',
    description:
      'How the resume analysis works, what we do with your data, what we can and cannot promise, and how pricing, courses and documentation services work.',
    heading: 'Questions, answered plainly',
    subheading: 'Including the ones with answers you might not want to hear.',
  },
};

/**
 * Old URLs that must keep working. Anything indexed or linked from an
 * existing campaign redirects permanently to its new home rather than
 * 404ing — losing the ranking of a page like /ats-resume-checker would
 * be an expensive way to rename a route.
 */
export const legacyRedirects = [
  { from: '/ats-resume-checker', to: '/resume-checker' },
  { from: '/career-tools/linkedin', to: '/linkedin-optimization' },
  { from: '/career-tools/cover-letter', to: '/cover-letter-generator' },
  { from: '/career-tools/interview', to: '/interview-preparation' },
  { from: '/dubai-job-seeker-package', to: '/dubai-launch' },
  { from: '/documentation', to: '/appostle-services' },
  { from: '/employer', to: '/employers' },
];

/** Convenience lookup used by the pages: seoFor('resumeChecker'). */
export function seoFor(key) {
  return seoPages[key] || {};
}
