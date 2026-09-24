/**
 * Programme and course catalogue shown on /higher-education and
 * /professional-courses. Single source of truth: the listing pages render
 * these groups as chips, and each chip links to its own detail page
 * (/higher-education/:slug, /professional-courses/:slug) built from the
 * same entries — so a programme added here gets its page automatically.
 */

export function slugify(label) {
  return label
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/* Content from dutylaunch.com/higher-education, in the live site's order. */
export const SCHOOL = [
  { title: 'X / SSLC', icon: 'School' },
  { title: 'XII / PUC', icon: 'BookOpen' },
];

export const DEGREES = [
  {
    title: 'Diploma Programmes',
    icon: 'ScrollText',
    items: [
      'Polytechnic Diploma',
      'ITI Courses',
      'Diploma in Engineering',
      'Diploma in Management',
      'Diploma in Computer Applications',
      'Other Diploma Programmes',
    ],
  },
  {
    title: "Bachelor's Degrees",
    icon: 'GraduationCap',
    description: 'Choose from a wide range of undergraduate programs approved by leading universities.',
    items: [
      'B.Com', 'BBA', 'B.Des', 'BCA', 'B.Sc', 'BA', 'BSW', 'B.Pharm', 'BE', 'B.Tech',
      'LLB', 'BHM', 'B.Ed', 'B.Arch', 'B.Lib', 'Other UG Programmes',
    ],
  },
  {
    title: "Master's Degrees",
    icon: 'Award',
    description: 'Advance your career with postgraduate programs that enhance your expertise and leadership skills.',
    items: [
      'MBA', 'M.Com', 'MCA', 'M.Sc', 'MA', 'M.Tech', 'M.Ed', 'MSW', 'M.Lib', 'M.Pharm',
      'LLM', 'PGDM', 'Other PG Programmes',
    ],
  },
];

/* Content from dutylaunch.com/online-distance-education, in the live site's order. */
export const COURSE_GROUPS = [
  {
    title: 'Business & Management',
    icon: 'Briefcase',
    items: ['Digital Marketing', 'HR & Recruitment', 'Finance & Accounting', 'GST & Taxation', 'Banking & Finance'],
  },
  {
    title: 'Career Development',
    icon: 'TrendingUp',
    items: [
      'Soft Skills Development',
      'Communication Skills',
      'Spoken English',
      'Personality Development',
      'Interview Preparation',
      'Leadership Skills',
    ],
  },
  {
    title: 'Technology',
    icon: 'Cpu',
    items: [
      'Data Analytics',
      'Data Science',
      'Artificial Intelligence (AI)',
      'Machine Learning',
      'Cyber Security',
      'Software Testing',
      'Cloud Computing',
      'Full Stack Development',
      'UI / UX Design',
    ],
  },
  {
    title: 'Certifications',
    icon: 'Award',
    items: [
      'Microsoft Certifications',
      'Tally Prime',
      'Google Certifications',
      'AWS Certifications',
      'Power BI',
      'SAP',
      'Advanced Excel',
    ],
  },
];

/* track → base path, listing-page label, the ConsultationForm service, groups */
export const TRACKS = {
  education: {
    basePath: '/higher-education',
    label: 'Higher Education',
    service: 'Higher education',
    noun: 'programme',
    groups: [...SCHOOL, ...DEGREES],
  },
  courses: {
    basePath: '/professional-courses',
    label: 'Professional courses',
    service: 'Professional courses',
    noun: 'course',
    groups: COURSE_GROUPS,
  },
};

/** Every programme in a track as { item, group, slug }. Title-only groups
    (X / SSLC, XII / PUC) are programmes in their own right. */
export function programmesIn(track) {
  return TRACKS[track].groups.flatMap((g) =>
    g.items?.length
      ? g.items.map((item) => ({ item, group: g.title, groupDescription: g.description, slug: slugify(item) }))
      : [{ item: g.title, group: g.title, groupDescription: g.description, slug: slugify(g.title) }]
  );
}

export function findProgramme(track, slug) {
  return programmesIn(track).find((p) => p.slug === slug) || null;
}

export function programmeHref(track, item) {
  return `${TRACKS[track].basePath}/${slugify(item)}`;
}