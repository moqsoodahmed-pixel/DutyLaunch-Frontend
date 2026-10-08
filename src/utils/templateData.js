/**
 * Turns Resume Builder form state into the data a resume template renders.
 *
 * useSamples: while the candidate has entered nothing, the preview shows the
 * template's sample content so they can see the design. As soon as they have
 * entered anything, ONLY their own content is used — empty sections stay
 * empty instead of being filled with the template's sample data (which would
 * otherwise end up in the downloaded PDF).
 */
const has = (v) => (typeof v === 'string' ? v.trim().length > 0 : Boolean(v));

export function hasAnyUserData(s = {}) {
  const p = s.personalInfo || {};
  const sk = s.skills || {};
  return (
    ['fullName', 'title', 'email', 'phone', 'location'].some((k) => has(p[k])) ||
    has(s.summary) ||
    [s.experience, s.education, s.projects, s.certifications, s.languages, s.awards, s.achievements].some((a) => (a || []).length > 0) ||
    [sk.hard, sk.tools, sk.soft].some((a) => (a || []).length > 0)
  );
}

export function buildTemplateData(baseTpl, s = {}, { useSamples = !hasAnyUserData(s), style = {} } = {}) {
  const p = s.personalInfo || {};
  const social = s.socialLinks || {};
  const sk = s.skills || {};
  const pick = (mine, sample) => (has(mine) ? mine : useSamples ? sample : '');
  const list = (mine, sample, map) => ((mine || []).length ? mine.map(map) : useSamples ? sample || [] : []);
  const skillsList = [...(sk.hard || []), ...(sk.tools || []), ...(sk.soft || [])];
  const certs = list(s.certifications, baseTpl.certifications || baseTpl.certs, (c) =>
    typeof c === 'string' ? c : [c.name, c.issuer && `— ${c.issuer}`, c.year && `(${c.year})`].filter(Boolean).join(' ')
  );

  return {
    ...baseTpl,
    personName: pick(p.fullName, baseTpl.personName || baseTpl.name),
    headline: pick(p.title, baseTpl.headline),
    contact: {
      email: pick(p.email, baseTpl.contact?.email),
      phone: pick(p.phone, baseTpl.contact?.phone),
      location: pick(p.location, baseTpl.contact?.location),
      linkedin: pick(social.linkedin, baseTpl.contact?.linkedin),
      github: pick(social.github, baseTpl.contact?.github),
      website: pick(p.website || social.portfolio, baseTpl.contact?.website),
    },
    summary: pick(s.summary, baseTpl.summary),
    experience: list(s.experience, baseTpl.experience, (e) => ({
      title: e.title || 'Job Title',
      company: e.company || '',
      location: e.location || '',
      dates: e.dates || '',
      bullets: (e.bullets || []).filter(has),
    })),
    education: list(s.education, baseTpl.education, (e) => ({
      degree: e.degree || 'Qualification',
      institution: e.institution || '',
      location: e.location || '',
      year: e.year || '',
      honors: e.honors || '',
    })),
    projects: list(s.projects, baseTpl.projects, (pr) => ({ name: pr.name || 'Project', role: pr.role || '', impact: pr.impact || '', link: pr.link || '' })),
    skills: skillsList.length ? skillsList : useSamples ? baseTpl.skills : [],
    certs,
    certifications: certs,
    languages: list(s.languages, baseTpl.languages, (l) =>
      typeof l === 'string' ? l : l?.level ? `${l.name} (${l.level})` : l?.name || ''
    ).filter(has),
    awards: list(s.awards, baseTpl.awards, (a) =>
      typeof a === 'string' ? a : [a.title, a.issuer && `— ${a.issuer}`, a.year && `(${a.year})`, a.description && `: ${a.description}`].filter(Boolean).join(' ')
    ),
    achievements: list(s.achievements, baseTpl.achievements, (a) =>
      typeof a === 'string' ? a : [a.title, a.issuer && `— ${a.issuer}`, a.year && `(${a.year})`].filter(Boolean).join(' ')
    ),
    customSections: s.customSections || [],
    // Tells the preview not to back-fill empty sections with sample content.
    userContent: !useSamples,
    showPhoto: Boolean(p.showPhoto),
    profileImage: p.profileImage || '',
    ...style,
  };
}
