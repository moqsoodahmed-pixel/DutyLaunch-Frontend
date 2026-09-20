import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { canonical, siteUrl } from '../../utils/seo.js';

const DEFAULT_TITLE = 'DutyLaunch — Career, education and global opportunities';
const SUFFIX = ' · DutyLaunch';

function upsertMeta(attr, key, content) {
  if (!content) return;
  let tag = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
}

/**
 * Per-page metadata. Kept as a small imperative component rather than pulling
 * in react-helmet, which is one fewer dependency in the bundle.
 */
export function Seo({ title, description, image, type = 'website', noIndex = false, schema }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = title ? `${title}${SUFFIX}` : DEFAULT_TITLE;
    const url = canonical(pathname);
    const ogImage = image || `${siteUrl}/favicon.svg`;

    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', noIndex ? 'noindex,nofollow' : 'index,follow');
    upsertLink('canonical', url);

    upsertMeta('property', 'og:site_name', 'DutyLaunch');
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', ogImage);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', ogImage);
  }, [title, description, image, type, noIndex, pathname]);

  useEffect(() => {
    const blocks = (Array.isArray(schema) ? schema : [schema]).filter(Boolean);
    const nodes = blocks.map((block) => {
      const el = document.createElement('script');
      el.type = 'application/ld+json';
      el.textContent = JSON.stringify(block);
      el.dataset.seo = 'page';
      document.head.appendChild(el);
      return el;
    });
    return () => nodes.forEach((el) => el.remove());
  }, [schema]);

  return null;
}
