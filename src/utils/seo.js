const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://dutylaunch.com').replace(/\/$/, '');
const SITE_NAME = 'DutyLaunch';

export const siteUrl = SITE_URL;

export function canonical(pathname = '/') {
  return `${SITE_URL}${pathname === '/' ? '' : pathname}`;
}

export function organizationSchema(contact) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description:
      'Career services, education guidance, upskilling, documentation and global mobility support.',
    ...(contact?.email ? { email: contact.email } : {}),
    ...(contact?.phone ? { telephone: contact.phone } : {}),
  };
}

export function serviceSchema({ name, description, path }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url: canonical(path),
    provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    areaServed: ['IN', 'AE'],
  };
}

export function faqSchema(items = []) {
  if (!items.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function articleSchema(post) {
  if (!post) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` } },
    mainEntityOfPage: canonical(`/blog/${post.slug}`),
    ...(post.featuredImage ? { image: post.featuredImage } : {}),
  };
}

/**
 * JobPosting schema is only emitted for real, published listings —
 * never for illustrative or demo records.
 */
export function jobPostingSchema(job) {
  if (!job || job.status !== 'published' || job.title?.startsWith('[DEMO]')) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.publishedAt || job.createdAt,
    ...(job.expiresAt ? { validThrough: job.expiresAt } : {}),
    employmentType: job.jobType?.toUpperCase().replace('-', '_'),
    hiringOrganization: { '@type': 'Organization', name: job.company },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: job.location, addressCountry: job.country },
    },
    ...(job.salary?.disclosed && job.salary?.min
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: job.salary.currency,
            value: {
              '@type': 'QuantitativeValue',
              minValue: job.salary.min,
              maxValue: job.salary.max || job.salary.min,
              unitText: job.salary.period === 'month' ? 'MONTH' : 'YEAR',
            },
          },
        }
      : {}),
  };
}
