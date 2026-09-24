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
};