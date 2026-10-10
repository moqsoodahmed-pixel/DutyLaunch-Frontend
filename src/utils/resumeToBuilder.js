/**
 * Converts a parsed resume (the backend's resume schema, as returned by
 * POST /api/career/resume/parse or the saved career profile) into the
 * Resume Builder's form state, so "Yes, upload from my resume" opens the
 * builder already filled in.
 */

const uid = (prefix, i) => `${prefix}-${Date.now().toString(36)}-${i}`;
const text = (v) => (typeof v === 'string' ? v.trim() : '');
const list = (v) => (Array.isArray(v) ? v.map(text).filter(Boolean) : []);
const uniq = (arr) => [...new Set(arr.map((s) => s.trim()).filter(Boolean))];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Uploads store dates as "2026-03" (or "2026-03-14"). A resume should read
 * "Mar 2026", the form ATS systems expect. Anything else ("2019",
 * "Present", "Spring 2020") is returned unchanged.
 */
export function readableDate(value) {
  const v = text(value);
  const m = v.match(/^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/);
  if (m && Number(m[2]) >= 1 && Number(m[2]) <= 12) return `${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
  return v;
}

function dates(start, end, current) {
  const from = readableDate(start);
  const to = current ? 'Present' : readableDate(end);
  if (from && to) return `${from} – ${to}`;
  return from || to;
}

export function resumeToBuilder(resume = {}) {
  const p = resume.personal || {};
  const skills = resume.skills || {};

  return {
    personalInfo: {
      fullName: text(p.name),
      title: text(p.headline),
      email: text(p.email),
      phone: text(p.phone),
      location: text(p.location),
      website: text(p.website),
      profileImage: '',
      showPhoto: false,
    },
    socialLinks: { linkedin: text(p.linkedin), github: '', twitter: '', portfolio: '' },
    summary: text(resume.summary),
    experience: (resume.experience || []).map((r, i) => {
      const bullets = uniq([...list(r.achievements), ...list(r.responsibilities)]);
      return {
        id: uid('exp', i),
        title: text(r.title),
        company: text(r.company),
        location: text(r.location),
        dates: dates(r.startDate, r.endDate, r.current),
        bullets: bullets.length ? bullets : [''],
      };
    }),
    education: (resume.education || []).map((e, i) => ({
      id: uid('edu', i),
      degree: [text(e.degree), text(e.field)].filter(Boolean).join(' in '),
      institution: text(e.institution),
      location: text(e.location),
      year: text(e.endDate) || text(e.startDate),
      honors: [text(e.grade), ...list(e.highlights)].filter(Boolean).join(' · '),
    })),
    projects: (resume.projects || []).map((pr, i) => ({
      id: uid('prj', i),
      name: text(pr.name),
      role: text(pr.role),
      impact: text(pr.description) || list(pr.highlights).join('; '),
      link: text(pr.link),
    })),
    skills: {
      hard: uniq([...list(skills.technical), ...list(skills.functional), ...list(skills.industry)]),
      tools: uniq(list(skills.tools)),
      soft: uniq(list(skills.soft)),
    },
    certifications: (resume.certifications || []).map((c, i) => ({
      id: uid('c', i),
      name: text(c.name),
      issuer: text(c.issuer),
      year: readableDate(c.issueDate),
    })),
    languages: (resume.languages || [])
      .map((l, i) =>
        typeof l === 'string'
          ? { id: uid('lang', i), name: text(l), level: '' }
          : // A level is shown only if the candidate wrote one — never a made-up default.
            { id: uid('lang', i), name: text(l?.name), level: text(l?.proficiency) }
      )
      .filter((l) => l.name),
    awards: list(resume.awards).map((a, i) => ({ id: uid('awd', i), title: a, issuer: '', year: '', description: '' })),
    achievements: list(resume.achievements),
    customSections: (resume.customSections || [])
      .map((c, i) => ({ id: uid('cst', i), title: text(c.title), items: list(c.items).length ? list(c.items) : [text(c.body)].filter(Boolean) }))
      .filter((c) => c.title),
  };
}

/** Hand-off between the Resume Builder start page and the editor (same tab only). */
export const BUILDER_IMPORT_KEY = 'dl_resume_builder_import';