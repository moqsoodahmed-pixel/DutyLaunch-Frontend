import { api, postForm } from './api.js';

/**
 * Client for the Career Intelligence API (/api/career/*).
 *
 * Two things worth knowing before using this:
 *
 * 1. Anonymous callers are supported everywhere except the profile and
 *    version endpoints. A visitor can upload a CV, get a full analysis
 *    and see their report without an account — but nothing is stored for
 *    them, so every subsequent call has to send the resume back with
 *    `resume`. `withResume()` handles that.
 *
 * 2. Nothing here mutates the candidate's resume as a side effect.
 *    `optimize()` returns *proposals*; they only become part of the
 *    resume when `applyOptimization()` is called with explicit accept /
 *    edit / reject decisions.
 */

/**
 * Builds the body every resume-scoped endpoint takes.
 *
 * When signed in, omitting `resume` makes the server use the stored
 * master profile, which is both cheaper and guarantees the analysis runs
 * against the same document the integrity checker will diff against.
 */
function withResume({ resume, versionId, jobDescription, jobHints } = {}, extra = {}) {
  const body = { ...extra };
  if (resume) body.resume = resume;
  if (versionId) body.versionId = versionId;
  if (jobDescription) body.jobDescription = jobDescription;
  if (jobHints) body.jobHints = jobHints;
  return body;
}

/*
 * The api.js interceptor already returns the response body
 * ({ success, message, data }), so the payload is `res.data`. The
 * `res.data.data` branch only applies if a raw axios response ever
 * reaches here.
 */
const unwrap = (res) => (res && typeof res === 'object' && 'success' in res ? res.data : res?.data?.data);

export const careerService = {
  /* ---------- upload and parse ---------- */

  /**
   * Uploads a CV and returns the parsed Resume JSON.
   *
   * The response carries `needsReview` and `reviewNote`: fields the
   * parser could not read confidently. Show them. The parser writes an
   * empty string rather than guessing, and the review step is where that
   * gets corrected.
   */
  /* `consent` must come from the user ticking the DPDP checkbox; the
     server rejects the upload without it. */
  async parseFile(file, onProgress, { consent, purpose } = {}) {
    const form = new FormData();
    form.append('resume', file);
    form.append('consent', consent ? 'true' : 'false');
    if (purpose) form.append('purpose', purpose);
    const res = await postForm('/career/resume/parse', form, onProgress);
    return unwrap(res);
  },

  async parseText(text, { consent } = {}) {
    const res = await api.post('/career/resume/parse', { text, consent: Boolean(consent) });
    return unwrap(res);
  },

  /* ---------- analysis ---------- */

  /**
   * The main call. Returns profile, job intelligence, keyword tiers,
   * match, skill gap, Resume Health, evidence questions and next
   * actions. Without a job description the keyword and relevance
   * categories are omitted and `health.scoredAgainstJd` is false.
   */
  async analyze(opts = {}) {
    const res = await api.post('/career/analyze', withResume(opts, opts.record === false ? { record: false } : {}));
    return unwrap(res);
  },

  async analyzeJob({ jobDescription, jobTitle, jobHints } = {}) {
    const res = await api.post('/career/job/analyze', { jobDescription, jobTitle, jobHints });
    return unwrap(res);
  },

  /* ---------- master career profile (requires sign-in) ---------- */

  async getProfile() {
    const res = await api.get('/career/profile');
    return unwrap(res);
  },

  async updateProfile({ resume, preferences, consent } = {}) {
    const res = await api.put('/career/profile', { resume, preferences, consent });
    return unwrap(res);
  },

  async deleteProfile() {
    const res = await api.delete('/career/profile');
    return unwrap(res);
  },

  /* ---------- evidence ---------- */

  async getEvidenceQuestions(opts = {}) {
    const res = await api.post('/career/evidence/questions', withResume(opts));
    return unwrap(res);
  },

  /**
   * Records an answer and returns a bullet built only from it. The
   * bullet is a suggestion — it is not in the resume until the candidate
   * accepts it.
   */
  async submitEvidenceAnswer({ question, answers }) {
    const res = await api.post('/career/evidence/answer', { question, answers });
    return unwrap(res);
  },

  /* ---------- optimisation ---------- */

  /** Returns proposals for review. Changes nothing. */
  async optimize(opts = {}) {
    const { signal, timeout, autoApply, ...rest } = opts;
    const res = await api.post(
      '/career/optimize',
      withResume(rest, { scope: rest.scope, ...(autoApply ? { autoApply: true } : {}) }),
      // Rewriting calls an AI model several times, so it gets far longer than
      // the 20 s default; `signal` lets the candidate cancel.
      { timeout: timeout || 150000, signal }
    );
    return unwrap(res);
  },

  /**
   * Applies the candidate's decisions.
   *
   * `proposals` must be the same array `optimize()` returned — the server
   * applies exactly what was reviewed rather than regenerating, so the
   * candidate cannot end up accepting text they never saw.
   */
  async applyOptimization({ proposals, decisions, ...opts }) {
    const res = await api.post('/career/optimize/apply', withResume(opts, { proposals, decisions }));
    return unwrap(res);
  },

  /* ---------- versions (requires sign-in) ---------- */

  async createVersion(opts = {}) {
    const res = await api.post(
      '/career/versions',
      withResume(opts, { label: opts.label, kind: opts.kind, templateId: opts.templateId, jobId: opts.jobId })
    );
    return unwrap(res);
  },

  async listVersions() {
    const res = await api.get('/career/versions');
    return unwrap(res);
  },

  async getVersion(versionId) {
    const res = await api.get(`/career/versions/${versionId}`);
    return unwrap(res);
  },

  async updateVersion(versionId, { resume, label, templateId } = {}) {
    const res = await api.put(`/career/versions/${versionId}`, { resume, label, templateId });
    return unwrap(res);
  },

  async deleteVersion(versionId) {
    const res = await api.delete(`/career/versions/${versionId}`);
    return unwrap(res);
  },

  async restoreVersion(versionId) {
    const res = await api.post(`/career/versions/${versionId}/restore`);
    return unwrap(res);
  },

  /* ---------- validation, templates, export ---------- */

  async validate(opts = {}) {
    const res = await api.post('/career/validate', withResume(opts));
    return unwrap(res);
  },

  async getTemplates() {
    const res = await api.get('/career/templates');
    return unwrap(res);
  },

  async render(opts = {}) {
    const res = await api.post('/career/render', withResume(opts, { templateId: opts.templateId }));
    return unwrap(res);
  },

  /**
   * Returns a self-contained HTML document to print.
   *
   * Throws when a high-severity integrity issue is outstanding. Surface
   * the message, show the issues, and retry with
   * `acknowledgeIssues: true` only after the candidate has actually read
   * them — that acknowledgement is the whole safeguard.
   */
  async exportResume(opts = {}) {
    const res = await api.post(
      '/career/export',
      withResume(opts, { templateId: opts.templateId, acknowledgeIssues: opts.acknowledgeIssues })
    );
    return unwrap(res);
  },

  /* ---------- career tools ---------- */

  async linkedin(opts = {}) {
    const res = await api.post('/career/linkedin', withResume(opts));
    return unwrap(res);
  },

  async coverLetter(opts = {}) {
    const res = await api.post(
      '/career/cover-letter',
      withResume(opts, { company: opts.company, hiringManager: opts.hiringManager, tone: opts.tone })
    );
    return unwrap(res);
  },

  async interview(opts = {}) {
    const res = await api.post('/career/interview', withResume(opts));
    return unwrap(res);
  },
};

/**
 * Opens the exported HTML in a print window.
 *
 * Rendering to PDF in the browser keeps the candidate's document off our
 * servers entirely, and the print dialog is the one PDF exporter that is
 * already on every device.
 */
export function printResumeHtml(html, fileName = 'resume') {
  const win = window.open('', '_blank');
  if (!win) return false;
  win.document.title = fileName;
  win.document.write(html);
  win.document.close();
  win.focus();
  // Give the browser a beat to lay out the page before the dialog opens.
  setTimeout(() => win.print(), 350);
  return true;
}

export default careerService;
