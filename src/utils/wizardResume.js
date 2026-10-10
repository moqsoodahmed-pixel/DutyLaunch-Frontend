/**
 * Data for the guided Resume Builder wizard.
 *
 *   wizard state  ⇄  resume (backend schema: saved as the career profile,
 *                    used by Cover letter and Interview prep)
 *   wizard state  →  builder state (via resumeToBuilder) → template preview
 */
import { resumeToBuilder, readableDate } from './resumeToBuilder.js';

const id = () => Math.random().toString(36).slice(2, 10);
const t = (v) => (typeof v === 'string' ? v.trim() : '');
const lines = (arr) => (Array.isArray(arr) ? arr.map(t).filter(Boolean) : []);

/**
 * A role stores duties and achievements in two lists, but the candidate wrote
 * them as one list in a deliberate order. Restore that order by matching each
 * bullet (original or AI-reworded) to the closest line of the role's original
 * text. Bullets with no match keep their relative position at the end.
 */
function orderBullets(job) {
  const all = [...new Set([...lines(job.responsibilities), ...lines(job.achievements)])];
  const source = String(job._originalText || '').split(/\r?\n/).map(t).filter(Boolean);
  if (all.length < 2 || !source.length) return [...new Set([...lines(job.achievements), ...lines(job.responsibilities)])];

  const words = (text) => new Set(String(text).toLowerCase().split(/[^a-z0-9%+.]+/).filter((x) => x.length > 3));
  const sourceWords = source.map(words);
  const keyOf = (bullet) => {
    const bw = words(bullet);
    let best = -1;
    let bestScore = 0;
    sourceWords.forEach((sw, i) => {
      let common = 0;
      bw.forEach((x) => { if (sw.has(x)) common += 1; });
      const score = common / Math.max(1, Math.min(bw.size, sw.size));
      if (score > bestScore) { bestScore = score; best = i; }
    });
    return bestScore >= 0.5 ? best : Infinity;
  };
  return all
    .map((bullet, position) => ({ bullet, position, key: keyOf(bullet) }))
    .sort((a, b) => (a.key === b.key ? a.position - b.position : a.key - b.key))
    .map((x) => x.bullet);
}

export const emptyJob = () => ({ id: id(), title: '', company: '', location: '', startDate: '', endDate: '', current: false, bullets: [] });
export const emptySchool = () => ({ id: id(), institution: '', location: '', degree: '', field: '', endDate: '', current: false, grade: '' });

export function emptyWizard() {
  return {
    personal: { firstName: '', surname: '', profession: '', city: '', country: 'India', pinCode: '', phone: '', email: '', linkedin: '', website: '' },
    experience: [],
    noExperience: false,
    education: [],
    skills: [],
    summary: '',
    extras: {
      on: {},
      websites: [],
      certifications: [],
      languages: [],
      software: [],
      accomplishments: [],
      projects: [],
      additional: '',
      affiliations: [],
      interests: [],
    },
    templateId: 'dl-elite',
  };
}

/** Wizard → backend resume schema. */
export function wizardToResume(w) {
  const p = w.personal || {};
  const x = w.extras || {};
  const on = x.on || {};
  const custom = [];
  if (on.software && lines(x.software).length) custom.push({ title: 'Software', items: lines(x.software) });
  if (on.affiliations && lines(x.affiliations).length) custom.push({ title: 'Affiliations', items: lines(x.affiliations) });
  if (on.interests && lines(x.interests).length) custom.push({ title: 'Interests', items: lines(x.interests) });
  if (on.additional && t(x.additional)) custom.push({ title: 'Additional information', items: [], body: t(x.additional) });
  if (on.websites && lines(x.websites).length > 1) custom.push({ title: 'Websites & profiles', items: lines(x.websites).slice(1) });

  return {
    personal: {
      name: [t(p.firstName), t(p.surname)].filter(Boolean).join(' '),
      headline: t(p.profession),
      email: t(p.email),
      phone: t(p.phone),
      location: [t(p.city), t(p.country)].filter(Boolean).join(', ') + (t(p.pinCode) ? ` ${t(p.pinCode)}` : ''),
      linkedin: t(p.linkedin),
      website: t(p.website) || (on.websites ? lines(x.websites)[0] || '' : ''),
    },
    summary: t(w.summary),
    experience: (w.noExperience ? [] : w.experience || [])
      .filter((j) => t(j.title) || t(j.company))
      .map((j) => ({
        title: t(j.title),
        company: t(j.company),
        location: t(j.location),
        startDate: t(j.startDate),
        endDate: j.current ? '' : t(j.endDate),
        current: Boolean(j.current),
        achievements: lines(j.bullets),
        responsibilities: [],
      })),
    education: (w.education || [])
      .filter((e) => t(e.institution) || t(e.degree))
      .map((e) => ({
        institution: t(e.institution),
        location: t(e.location),
        degree: t(e.degree),
        field: t(e.field),
        endDate: e.current ? 'Present' : t(e.endDate),
        grade: t(e.grade),
      })),
    skills: { technical: lines(w.skills) },
    certifications: on.certifications ? (x.certifications || []).filter((c) => t(c.name)).map((c) => ({ name: t(c.name), issuer: t(c.issuer), issueDate: t(c.year) })) : [],
    languages: on.languages ? (x.languages || []).filter((l) => t(l.name)).map((l) => ({ name: t(l.name), proficiency: t(l.level) })) : [],
    projects: on.projects ? (x.projects || []).filter((pr) => t(pr.name)).map((pr) => ({ name: t(pr.name), description: t(pr.description), link: t(pr.link) })) : [],
    achievements: on.accomplishments ? lines(x.accomplishments) : [],
    customSections: custom,
  };
}

/** Backend resume schema (e.g. an uploaded CV) → wizard. */
const COUNTRIES = /^(india|uae|united arab emirates|dubai|usa|united states|uk|united kingdom|canada|australia|singapore|qatar|saudi arabia|oman|kuwait|bahrain|germany|new zealand)$/i;

export function resumeToWizard(r = {}) {
  const w = emptyWizard();
  const p = r.personal || {};
  const [first, ...rest] = t(p.name).split(/\s+/);
  const loc = t(p.location).split(',').map((s) => s.trim().replace(/\s*\b\d{6}\b/, '').trim()).filter(Boolean);
  // A location that is only a country ("India") has no city.
  if (loc.length === 1 && COUNTRIES.test(loc[0])) loc.unshift('');
  w.personal = {
    ...w.personal,
    firstName: first || '',
    surname: rest.join(' '),
    profession: t(p.headline),
    // Everything before the country stays with the city ("Mysuru, Karnataka").
    city: loc.length > 1 ? loc.slice(0, -1).filter(Boolean).join(', ') : loc[0] || '',
    country: loc.length > 1 ? loc[loc.length - 1] : w.personal.country,
    pinCode: (t(p.location).match(/\b\d{6}\b/) || [''])[0],
    phone: t(p.phone),
    email: t(p.email),
    linkedin: t(p.linkedin),
    website: t(p.website),
  };
  w.summary = t(r.summary);
  w.experience = (r.experience || []).map((j) => ({
    ...emptyJob(),
    title: t(j.title),
    company: t(j.company),
    location: t(j.location),
    startDate: readableDate(j.startDate),
    endDate: j.current ? '' : readableDate(j.endDate),
    current: Boolean(j.current) || /present|current/i.test(t(j.endDate)),
    bullets: orderBullets(j),
  }));
  w.education = (r.education || []).map((e) => ({
    ...emptySchool(),
    institution: t(e.institution),
    location: t(e.location),
    degree: t(e.degree),
    field: t(e.field),
    endDate: /present/i.test(t(e.endDate)) ? '' : readableDate(e.endDate) || readableDate(e.startDate),
    current: /present/i.test(t(e.endDate)),
    grade: t(e.grade),
  }));
  const sk = r.skills || {};
  w.skills = [...new Set([...lines(sk.technical), ...lines(sk.tools), ...lines(sk.functional), ...lines(sk.soft), ...lines(sk.industry)])];
  const x = w.extras;
  x.certifications = (r.certifications || []).map((c) => ({ id: id(), name: t(c.name), issuer: t(c.issuer), year: t(c.issueDate) }));
  x.languages = (r.languages || []).map((l) => (typeof l === 'string' ? { id: id(), name: t(l), level: '' } : { id: id(), name: t(l.name), level: t(l.proficiency) }));
  x.projects = (r.projects || []).map((pr) => ({ id: id(), name: t(pr.name), description: t(pr.description) || lines(pr.highlights).join('; '), link: t(pr.link) }));
  x.accomplishments = [...lines(r.achievements), ...lines(r.awards)];
  (r.customSections || []).forEach((c) => {
    const title = t(c.title).toLowerCase();
    const items = lines(c.items);
    if (/software|tools/.test(title)) x.software = items;
    else if (/affiliation|membership/.test(title)) x.affiliations = items;
    else if (/interest|hobb/.test(title)) x.interests = items;
    else x.additional = [x.additional, t(c.title) + ': ' + [...items, t(c.body)].filter(Boolean).join('; ')].filter(Boolean).join('\n');
  });
  x.on = {
    certifications: x.certifications.length > 0,
    languages: x.languages.length > 0,
    projects: x.projects.length > 0,
    accomplishments: x.accomplishments.length > 0,
    software: x.software.length > 0,
    affiliations: x.affiliations.length > 0,
    interests: x.interests.length > 0,
    additional: Boolean(x.additional),
  };
  return w;
}

/** Wizard → Resume Builder form state (what the templates render). */
export const wizardToBuilder = (w) => resumeToBuilder(wizardToResume(w));

/** Rough "Resume completeness" for the progress bar. */
export function completeness(w) {
  const p = w.personal || {};
  const checks = [
    t(p.firstName) && t(p.surname),
    t(p.email) || t(p.phone),
    t(p.profession),
    w.noExperience || (w.experience || []).some((j) => t(j.title) && lines(j.bullets).length),
    (w.education || []).some((e) => t(e.degree) || t(e.institution)),
    lines(w.skills).length >= 3,
    t(w.summary).length > 30,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}