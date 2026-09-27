/**
 * Generates public/sitemap.xml.
 *
 * robots.txt has always advertised a sitemap at /sitemap.xml, but the file
 * did not exist — so every crawler that asked for it got a 404 (or, worse
 * on an SPA host, the HTML shell). This script writes it from a single
 * list, and runs as a `prebuild` step so it cannot drift from a deploy.
 *
 * Only public, indexable URLs belong here. Anything behind authentication
 * is excluded, as are the legacy URLs — a sitemap listing a page that 301s
 * is a contradiction, and tells a crawler to keep the old URL alive.
 *
 * Run: node scripts/generate-sitemap.mjs
 */

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SITE = process.env.VITE_SITE_URL || 'https://dutylaunch.com';

/**
 * `priority` is a hint, not a ranking lever — it only tells a crawler
 * which of *our* pages matter most relative to each other. The free tools
 * lead because they are the entry point to everything else.
 */
const ROUTES = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },

  // Career tools — the acquisition surface.
  { path: '/resume-checker', changefreq: 'weekly', priority: '0.9' },
  { path: '/ai-resume-builder', changefreq: 'weekly', priority: '0.9' },
  { path: '/linkedin-optimization', changefreq: 'monthly', priority: '0.8' },
  { path: '/cover-letter-generator', changefreq: 'monthly', priority: '0.8' },
  { path: '/interview-preparation', changefreq: 'monthly', priority: '0.8' },
  { path: '/cv-templates', changefreq: 'monthly', priority: '0.7' },
  { path: '/cv-builder', changefreq: 'monthly', priority: '0.7' },

  // Marketplaces.
  { path: '/jobs', changefreq: 'daily', priority: '0.9' },
  { path: '/upskills', changefreq: 'weekly', priority: '0.8' },
  { path: '/higher-education', changefreq: 'weekly', priority: '0.8' },
  { path: '/professional-courses', changefreq: 'weekly', priority: '0.8' },
  { path: '/courses', changefreq: 'weekly', priority: '0.7' },

  // Services.
  { path: '/dubai-launch', changefreq: 'monthly', priority: '0.8' },
  { path: '/appostle-services', changefreq: 'monthly', priority: '0.8' },
  { path: '/career-services', changefreq: 'monthly', priority: '0.7' },
  { path: '/pricing', changefreq: 'monthly', priority: '0.7' },

  // Two-sided.
  { path: '/employers', changefreq: 'monthly', priority: '0.6' },
  { path: '/partners', changefreq: 'monthly', priority: '0.6' },

  // Company.
  { path: '/about', changefreq: 'monthly', priority: '0.5' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
  { path: '/faq', changefreq: 'monthly', priority: '0.5' },
  { path: '/blog', changefreq: 'weekly', priority: '0.6' },

  // Legal.
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  { path: '/cancellation-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/refund-policy', changefreq: 'yearly', priority: '0.3' },
];

const today = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map(
  (route) => `  <url>
    <loc>${SITE}${route.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
).join('\n')}
</urlset>
`;

const out = resolve(here, '..', 'public', 'sitemap.xml');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, xml, 'utf8');

// eslint-disable-next-line no-console
console.log(`[sitemap] wrote ${ROUTES.length} URLs to public/sitemap.xml`);
