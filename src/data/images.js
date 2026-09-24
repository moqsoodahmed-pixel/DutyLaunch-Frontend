/**
 * Every photographic asset used on the public site, in one place.
 *
 * Files live in /public/images and are referenced by absolute path, so Vite
 * copies them to the build unchanged. `width`/`height` are the TRUE pixel
 * size of each file: <SiteImage> uses them to reserve space (no layout
 * shift) and never displays an image larger than its native width, so a
 * small source is not upscaled into a blurry one.
 *
 * Source: all images are crops of the two supplied DutyLaunch visual assets
 * (the Dubai Launch hero and the website concept board), with every piece of
 * baked-in text, logo and UI removed. The concept-board crops are small —
 * roughly 240–300px wide — so they are used as supporting images only.
 * To upgrade one, drop a higher-resolution file at the same path and update
 * its width/height here; no component changes are needed.
 *
 * People shown are generated imagery, not DutyLaunch staff or clients, so no
 * alt text or caption presents them as the team or as real candidates.
 */
export const images = {
  dubaiHero: {
    src: '/images/hero/dubai-launch-hero.webp',
    srcSet: '/images/hero/dubai-launch-hero-480.webp 480w, /images/hero/dubai-launch-hero.webp 886w',
    sizes: '(min-width: 1024px) 400px, 100vw',
    width: 886,
    height: 835,
    alt: 'Dubai skyline at sunset with the Burj Khalifa and Burj Al Arab, and a plane climbing overhead',
    position: '30% 40%',
  },
  dubaiRelocation: {
    src: '/images/careers/dubai-relocation.webp',
    width: 248,
    height: 276,
    alt: 'A traveller with a backpack looking out over the Dubai skyline',
  },
  campus: {
    src: '/images/education/university-campus.webp',
    width: 236,
    height: 222,
    alt: 'Students walking towards a university building on a green campus',
  },
  training: {
    src: '/images/education/professional-training.webp',
    width: 294,
    height: 222,
    alt: 'A learner taking notes during a professional training class',
  },
  upskills: {
    src: '/images/careers/upskills.webp',
    width: 270,
    height: 237,
    alt: 'A learner with headphones studying on a laptop, with data and code icons',
  },
  consultation: {
    src: '/images/branding/consultation.webp',
    width: 266,
    height: 276,
    alt: 'A small group reviewing a profile together on a laptop',
  },
  hiring: {
    src: '/images/careers/hiring.webp',
    width: 286,
    height: 222,
    alt: 'A candidate shaking hands with an interviewer',
  },
  careerGrowth: {
    src: '/images/careers/career-growth.webp',
    width: 284,
    height: 237,
    alt: 'A professional looking out at a city skyline at sunrise',
  },
  /* ---- Second batch: generated per page, upscaled/cleaned to 1600px. ---- */
  jobsHeader: {
    src: '/images/careers/jobs-header.webp',
    srcSet: '/images/careers/jobs-header-800.webp 800w, /images/careers/jobs-header.webp 1600w',
    sizes: '(min-width: 1024px) 420px, 100vw',
    width: 1600,
    height: 1067,
    alt: 'Two colleagues reviewing a job posting together on a laptop',
  },
  contactOffice: {
    src: '/images/branding/contact-office.webp',
    srcSet: '/images/branding/contact-office-800.webp 800w, /images/branding/contact-office.webp 1600w',
    sizes: '(min-width: 1024px) 400px, 100vw',
    width: 1600,
    height: 1068,
    alt: 'A tidy desk with a laptop, an open notebook, a coffee cup and a small plant',
  },
  cvBuilder: {
    src: '/images/careers/cv-builder.webp',
    srcSet: '/images/careers/cv-builder-800.webp 800w, /images/careers/cv-builder.webp 1536w',
    sizes: '(min-width: 1024px) 400px, 100vw',
    width: 1536,
    height: 1024,
    alt: 'Hands marking up a printed CV with a pen',
  },
  atsChecker: {
    src: '/images/careers/ats-resume-checker.webp',
    srcSet: '/images/careers/ats-resume-checker-800.webp 800w, /images/careers/ats-resume-checker.webp 1600w',
    sizes: '(min-width: 1024px) 400px, 100vw',
    width: 1600,
    height: 1067,
    alt: 'Résumé documents being scanned and compared on a laptop',
  },
  coursesHero: {
    src: '/images/education/courses-hero.webp',
    srcSet: '/images/education/courses-hero-800.webp 800w, /images/education/courses-hero.webp 1600w',
    sizes: '(min-width: 1024px) 400px, 100vw',
    width: 1600,
    height: 1090,
    alt: 'An instructor leading a workshop for a group of learners with laptops',
  },
  blogHero: {
    src: '/images/branding/blog-hero.webp',
    srcSet: '/images/branding/blog-hero-800.webp 800w, /images/branding/blog-hero.webp 1200w',
    sizes: '(min-width: 1024px) 400px, 100vw',
    width: 1200,
    height: 1011,
    alt: 'A woman writing in a notebook at a desk by a window',
  },
  authBackground: {
    src: '/images/branding/auth-background.webp',
    width: 1600,
    height: 1068,
    alt: '',
  },
  notFound: {
    src: '/images/branding/not-found.webp',
    srcSet: '/images/branding/not-found-800.webp 800w, /images/branding/not-found.webp 1600w',
    sizes: '(min-width: 768px) 480px, 100vw',
    width: 1600,
    height: 1067,
    alt: 'An empty glass-walled walkway leading towards a city skyline at sunrise',
  },
};
