/**
 * Mock AI service layer.
 *
 * Every DutyLaunch "AI" feature (profile strength, job match, career gaps,
 * course/education recommendations, the career assistant chat) calls into
 * this module rather than computing things inline in components. Today the
 * functions are deterministic heuristics over real profile/job data — no
 * network call, no model. Swapping in a real backend later means replacing
 * the bodies of these functions with `api.post('/ai/...')` calls; nothing
 * that imports this module needs to change.
 *
 * Because there is no real AI behind this yet, every string surfaced to the
 * user is hedged ("may strengthen", "based on your profile") rather than
 * stated as fact, and nothing here promises an outcome (a job, an offer, a
 * placement).
 */

const SKILL_LIBRARY = {
  operations: ['Power BI', 'Process Improvement', 'Vendor Management', 'SOP Documentation'],
  marketing: ['SEO', 'Performance Marketing', 'Content Strategy', 'Marketing Analytics'],
  sales: ['CRM (Salesforce)', 'Negotiation', 'Account Management', 'Sales Forecasting'],
  technology: ['Cloud (AWS/Azure)', 'System Design', 'CI/CD', 'Agile Delivery'],
  finance: ['Financial Modelling', 'Advanced Excel', 'SAP FICO', 'Budgeting & Forecasting'],
  hr: ['HRMS Tools', 'Talent Analytics', 'Employee Relations', 'Compensation Design'],
  design: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
  default: ['Advanced Excel', 'Data Analysis', 'Stakeholder Management', 'Project Management'],
};

function normalize(str = '') {
  return str.toLowerCase().trim();
}

function skillSetFor(category = '') {
  const key = Object.keys(SKILL_LIBRARY).find((k) => normalize(category).includes(k));
  return SKILL_LIBRARY[key] || SKILL_LIBRARY.default;
}

/**
 * DutyLaunch Profile Strength — NOT described as a validated employability
 * score anywhere in the UI. A simple, transparent weighting across the
 * fields that make a profile usable by the rest of the product.
 */
export function calculateProfileStrength(user) {
  const profile = user?.profile || {};
  const categories = [
    { key: 'basics', label: 'Basic details', weight: 15, met: Boolean(user?.name && user?.phone) },
    { key: 'headline', label: 'Headline & current role', weight: 15, met: Boolean(profile.headline && profile.currentRole) },
    { key: 'experience', label: 'Experience', weight: 10, met: Boolean(profile.experienceYears >= 0 && profile.currentRole) },
    { key: 'skills', label: 'Skills', weight: 20, met: (profile.skills || []).length >= 3 },
    { key: 'resume', label: 'Resume', weight: 20, met: Boolean(profile.resumeName) },
    { key: 'linkedin', label: 'LinkedIn', weight: 10, met: Boolean(profile.linkedinUrl) },
    { key: 'location', label: 'Location & preferences', weight: 10, met: Boolean(profile.location) },
  ];

  const score = categories.reduce((sum, c) => sum + (c.met ? c.weight : 0), 0);
  const missing = categories.filter((c) => !c.met).map((c) => c.label);

  return {
    score,
    max: 100,
    categories,
    missing,
    summary:
      score >= 80
        ? 'Your profile is strong across most categories.'
        : score >= 50
        ? 'Your profile is usable, but a few gaps are likely holding back your matches.'
        : 'Your profile is missing several details that jobs and recommendations rely on.',
  };
}

/** Simple completeness meter, distinct from "strength" — did they fill the field at all. */
export function calculateProfileCompletion(user) {
  const { score, missing } = calculateProfileStrength(user);
  return { percent: score, missing };
}

/**
 * Compares a candidate profile against a specific job. Distinguishes what
 * came from the job description (mandatory / preferred, from `job.skills`
 * and `job.requirements`) from what DutyLaunch is additionally suggesting
 * (clearly labelled as an AI recommendation, never presented as a JD
 * requirement).
 */
export function analyzeJobMatch(user, job) {
  const profile = user?.profile || {};
  const userSkills = new Set((profile.skills || []).map(normalize));
  const jobSkills = job?.skills || [];

  const matchedSkills = jobSkills.filter((s) => userSkills.has(normalize(s)));
  const missingRequired = jobSkills.filter((s) => !userSkills.has(normalize(s)));

  const expMin = job?.experience?.min ?? 0;
  const experienceOk = (profile.experienceYears ?? 0) >= expMin;

  const locationOk = profile.location && job?.location
    ? normalize(job.location).includes(normalize(profile.location)) || normalize(profile.location).includes(normalize(job.location))
    : false;

  const matches = [];
  if (experienceOk) matches.push(`${profile.experienceYears} years experience`);
  matchedSkills.forEach((s) => matches.push(s));
  if (locationOk) matches.push(profile.location);
  if (profile.currentRole) matches.push(profile.currentRole);

  const mandatoryGaps = missingRequired.map((skill) => ({
    label: skill,
    tier: 'mandatory',
    source: 'Mandatory according to this job description',
  }));

  // AI-suggested skills come from a category-level library, never from the
  // job's own requirements — kept separate so the UI never blurs the two.
  const suggested = skillSetFor(job?.category)
    .filter((s) => !userSkills.has(normalize(s)) && !jobSkills.some((js) => normalize(js) === normalize(s)))
    .slice(0, 2)
    .map((skill) => ({ label: skill, tier: 'recommendation', source: 'AI Recommendation' }));

  const totalSignals = 2 + jobSkills.length; // experience + location + each JD skill
  const hitSignals = (experienceOk ? 1 : 0) + (locationOk ? 1 : 0) + matchedSkills.length;
  const percent = totalSignals > 0 ? Math.round((hitSignals / totalSignals) * 100) : 50;

  let recommendation;
  if (percent >= 75) {
    recommendation =
      'Your profile aligns closely with this role. You can apply as you are — the gaps below are worth closing over time, not before applying.';
  } else if (mandatoryGaps.length > 0) {
    recommendation = `You can apply now, but strengthening ${mandatoryGaps
      .slice(0, 2)
      .map((g) => g.label)
      .join(' and ')} may improve your alignment with similar roles.`;
  } else {
    recommendation =
      'You meet the core requirements. Closing the suggested gaps below could improve how you come across for similar, more senior roles.';
  }

  return {
    percent: Math.max(10, Math.min(99, percent)),
    matches,
    mandatoryGaps,
    preferredGaps: [],
    suggested,
    recommendation,
  };
}

/** Career gaps aggregated across a set of jobs — used on the dashboard, not tied to one JD. */
export function identifyCareerGaps(user, jobs = []) {
  const profile = user?.profile || {};
  const userSkills = new Set((profile.skills || []).map(normalize));
  const counts = new Map();

  jobs.forEach((job) => {
    (job.skills || []).forEach((skill) => {
      if (userSkills.has(normalize(skill))) return;
      counts.set(skill, (counts.get(skill) || 0) + 1);
    });
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, count]) => ({
      skill,
      frequency: count,
      reason: `Appears in ${count} of the roles you're closest to matching.`,
    }));
}

export function recommendCourses(user, { limit = 3 } = {}) {
  const profile = user?.profile || {};
  const pool = skillSetFor(profile.currentRole || profile.headline);
  const userSkills = new Set((profile.skills || []).map(normalize));

  return pool
    .filter((s) => !userSkills.has(normalize(s)))
    .slice(0, limit)
    .map((skill) => ({
      skill,
      relevance: 'High relevance',
      reason: `Frequently relevant to ${profile.currentRole || 'roles like yours'} and adjacent senior roles.`,
    }));
}

export function recommendEducation(user) {
  const profile = user?.profile || {};
  const years = profile.experienceYears ?? 0;
  if (years >= 4 && !normalize(profile.headline).includes('mba')) {
    return {
      program: 'Online MBA / Executive Management Programme',
      why: `With ${years}+ years in ${profile.currentRole || 'your field'}, a management qualification is commonly requested for the senior and leadership roles you may be targeting next.`,
      relevance: 'Potential relevance to leadership-track roles in your field.',
    };
  }
  return {
    program: 'Relevant certification in your functional area',
    why: 'A focused certification can close specific skill gaps faster than a full degree at this stage.',
    relevance: 'Useful alongside — not instead of — hands-on experience.',
  };
}

export function recommendJobs(user, jobs = [], { limit = 4 } = {}) {
  return jobs
    .map((job) => ({ job, match: analyzeJobMatch(user, job) }))
    .sort((a, b) => b.match.percent - a.match.percent)
    .slice(0, limit);
}

export function analyzeCandidateForEmployer(candidateProfile, job) {
  return analyzeJobMatch({ profile: candidateProfile }, job);
}

/**
 * Mock conversational assistant. Returns a canned, profile-aware response
 * plus a short list of action cards. Never claims real model inference is
 * happening — the UI around this labels it as a demo assistant.
 */
export function careerAssistant(message, user) {
  const profile = user?.profile || {};
  const strength = calculateProfileStrength(user);
  const text = normalize(message);

  const targetRoleMatch = text.match(/become an? ([a-z ]+)/) || text.match(/target(?:ing)? ([a-z ]+)/);
  const targetRole = targetRoleMatch ? targetRoleMatch[1].trim() : null;

  let reply;
  let actions;

  if (targetRole) {
    const suggestions = skillSetFor(targetRole).slice(0, 2);
    reply = `Based on your current profile, you already have ${
      profile.currentRole ? `relevant experience as ${profile.currentRole}` : 'a foundation to build on'
    }. Your profile could be strengthened by improving ${suggestions.join(
      ' and '
    )} depending on the roles you are targeting for ${targetRole}.`;
    actions = [
      { label: `Improve ${suggestions[0]}`, to: '/upskills' },
      { label: 'Explore relevant management programs', to: '/higher-education' },
      { label: `Find ${targetRole} jobs`, to: `/jobs?q=${encodeURIComponent(targetRole)}` },
      { label: 'Improve resume', to: '/ats-resume-checker' },
    ];
  } else if (text.includes('resume') || text.includes('cv')) {
    reply = profile.resumeName
      ? 'Your resume is on file. Running it through the ATS checker will show a category-by-category score and specific fixes.'
      : 'You have not uploaded a resume yet — that is one of the biggest gaps in your profile strength right now. Upload one and I can point out what to tighten.';
    actions = [{ label: 'Check my resume', to: '/ats-resume-checker' }, { label: 'Update my profile', to: '/profile' }];
  } else if (text.includes('gap') || text.includes('missing')) {
    reply =
      strength.missing.length > 0
        ? `Right now, ${strength.missing.slice(0, 3).join(', ')} ${
            strength.missing.length > 1 ? 'are' : 'is'
          } missing from your profile — those are the fastest wins.`
        : 'Your profile looks complete on the basics. From here, closing skill gaps against specific jobs will matter more than profile fields.';
    actions = [{ label: 'Complete my profile', to: '/profile' }, { label: 'See recommended courses', to: '/upskills' }];
  } else {
    reply =
      "Tell me a role you're targeting (for example, \"I want to become an Operations Manager\") and I'll compare it with your current profile.";
    actions = [
      { label: 'See my profile strength', to: '/dashboard' },
      { label: 'Browse jobs', to: '/jobs' },
    ];
  }

  return { reply, actions };
}
