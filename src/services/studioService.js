import { api, postForm } from './api.js';

/**
 * AI Career Studio API. Every call goes to the authenticated backend — no
 * AI provider, key or model is ever contacted from the browser.
 *
 * Responses are unwrapped to their `data` payload. AI endpoints get a long
 * timeout: generating ten tailored questions can take far longer than the
 * default 20 seconds.
 */

const AI_TIMEOUT = 150000;
const unwrap = (res) => (res && typeof res === 'object' && 'success' in res ? res.data : res);

/** A failed download arrives as a Blob; turn its JSON body back into an error. */
async function blobError(err) {
  const blob = err?.response?.data;
  if (blob instanceof Blob) {
    try {
      const body = JSON.parse(await blob.text());
      return Object.assign(new Error(body.message || 'Download failed.'), { status: err.response.status });
    } catch {
      /* fall through */
    }
  }
  return err instanceof Error ? err : new Error('Download failed.');
}

/**
 * Fetches a document with the candidate's credentials. `mode: 'save'`
 * triggers a download; `mode: 'preview'` returns an object URL for an
 * <iframe>, which the caller must revoke.
 */
async function fetchDocument(path, { format = 'pdf', mode = 'save', filename } = {}) {
  const inline = mode === 'preview' ? '&inline=1' : '';
  let blob;
  try {
    blob = await api.get(`${path}${path.includes('?') ? '&' : '?'}format=${format}${inline}`, { responseType: 'blob', timeout: 60000 });
  } catch (err) {
    throw await blobError(err);
  }
  const url = URL.createObjectURL(blob);
  if (mode === 'preview') return url;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `DutyLaunch_document.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  return null;
}

export const studioService = {
  /* Progress + every saved document */
  get: async () => unwrap(await api.get('/studio')),

  /* Step 1 — import */
  importFile: async (file, { consent, mode = 'replace', linkedinUrl } = {}, onProgress) => {
    const form = new FormData();
    form.append('resume', file);
    form.append('consent', consent ? 'true' : 'false');
    form.append('mode', mode);
    if (linkedinUrl) form.append('linkedinUrl', linkedinUrl);
    return unwrap(await postForm('/studio/import', form, onProgress));
  },
  setLinkedInUrl: async (url) => unwrap(await api.put('/studio/linkedin-url', { url })),
  startManual: async (resume, { consent }) => unwrap(await api.post('/studio/manual', { resume, consent: consent ? 'true' : 'false' })),

  /* Step 2 — review */
  confirm: async (resume) => unwrap(await api.post('/studio/confirm', resume ? { resume } : {})),

  /* Downloads */
  profileDocument: (opts) => fetchDocument('/studio/profile-document', opts),
  resumeDocument: (versionId, opts) => fetchDocument(`/studio/versions/${versionId}/document`, opts),
  coverLetterDocument: (id, opts) => fetchDocument(`/studio/cover-letters/${id}/document`, opts),
  interviewDocument: (id, opts) => fetchDocument(`/studio/interview-sets/${id}/document`, opts),
  mockDocument: (id, opts) => fetchDocument(`/studio/mock/${id}/document`, opts),

  /* Step 4 — AI-written target job description from the confirmed LinkedIn profile */
  suggestJobDescription: async ({ jobTitle, company, industry, experienceLevel } = {}) =>
    unwrap(
      await api.post('/studio/job-description', {
        jobTitle: jobTitle || undefined,
        company: company || undefined,
        industry: industry || undefined,
        experienceLevel: experienceLevel || undefined,
      })
    ),

  /* Step 6 — cover letters */
  createCoverLetter: async (body) => unwrap(await api.post('/studio/cover-letters', body, { timeout: AI_TIMEOUT })),
  listCoverLetters: async () => unwrap(await api.get('/studio/cover-letters')),
  getCoverLetter: async (id) => unwrap(await api.get(`/studio/cover-letters/${id}`)),
  updateCoverLetter: async (id, body) => unwrap(await api.put(`/studio/cover-letters/${id}`, body)),
  deleteCoverLetter: async (id) => unwrap(await api.delete(`/studio/cover-letters/${id}`)),
  duplicateCoverLetter: async (id) => unwrap(await api.post(`/studio/cover-letters/${id}/duplicate`)),
  regenerateParagraph: async (id, index, tone) => unwrap(await api.post(`/studio/cover-letters/${id}/paragraphs/${index}`, tone ? { tone } : {}, { timeout: AI_TIMEOUT })),

  /* Step 7 — top 10 */
  createInterviewSet: async (body) => unwrap(await api.post('/studio/interview-sets', body, { timeout: AI_TIMEOUT })),
  getInterviewSet: async (id) => unwrap(await api.get(`/studio/interview-sets/${id}`)),
  updateInterviewSet: async (id, body) => unwrap(await api.put(`/studio/interview-sets/${id}`, body)),
  deleteInterviewSet: async (id) => unwrap(await api.delete(`/studio/interview-sets/${id}`)),
  regenerateQuestion: async (id, number) => unwrap(await api.post(`/studio/interview-sets/${id}/questions/${number}/regenerate`, {}, { timeout: AI_TIMEOUT })),

  /* Phase 2 — mock interview */
  startMock: async (body) => unwrap(await api.post('/studio/mock', body, { timeout: AI_TIMEOUT })),
  listMocks: async () => unwrap(await api.get('/studio/mock')),
  getMock: async (id) => unwrap(await api.get(`/studio/mock/${id}`)),
  answerMock: async (id, answer, mode = 'text') => unwrap(await api.post(`/studio/mock/${id}/answer`, { answer, mode }, { timeout: AI_TIMEOUT })),
  finishMock: async (id) => unwrap(await api.post(`/studio/mock/${id}/finish`, {}, { timeout: AI_TIMEOUT })),
  deleteMock: async (id) => unwrap(await api.delete(`/studio/mock/${id}`)),
};

export const COVER_LETTER_TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'confident', label: 'Confident' },
  { value: 'concise', label: 'Concise' },
  { value: 'entry-level', label: 'Entry-level / Fresher' },
  { value: 'experienced', label: 'Experienced professional' },
  { value: 'career-change', label: 'Career change' },
];

export const INTERVIEW_TYPES = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'hr', label: 'HR' },
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioural' },
  { value: 'situational', label: 'Situational' },
  { value: 'managerial', label: 'Managerial' },
  { value: 'project', label: 'Project-based' },
  { value: 'coding', label: 'Coding & problem-solving' },
  { value: 'system-design', label: 'System design' },
];

export const EXPERIENCE_LEVELS = [
  { value: 'fresher', label: 'Fresher / graduate' },
  { value: 'entry', label: 'Entry level (0–2 yrs)' },
  { value: 'mid', label: 'Mid level (3–7 yrs)' },
  { value: 'senior', label: 'Senior (8+ yrs)' },
  { value: 'lead', label: 'Lead / manager' },
];

export const errMsg = (err, fallback) => err?.fieldErrors?.[0]?.message || err?.message || fallback;