import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyWizard, emptyJob, applyOptimizedToWizard, wizardToResume } from '../src/utils/wizardResume.js';

/**
 * Putting the AI-optimised resume back into the wizard form.
 * Only WORDING and ORDER may change — never facts, never added skills.
 * Run: node --test tests/atsMerge.test.mjs   (from DutyLaunch-Frontend)
 */

function typed() {
  const w = emptyWizard();
  w.personal = { ...w.personal, firstName: 'Srinivas', surname: 'Sutar', profession: 'Web Developer', email: 's@example.com', phone: '9876543210', city: 'Bengaluru' };
  const job = { ...emptyJob(), title: 'Web Developer', company: 'Acme', startDate: 'Jan 2022', endDate: 'Dec 2023', bullets: ['Worked on making websites for clients using React', 'Fixed bugs in the Node.js backend'] };
  w.experience = [job];
  w.education = [{ id: 'e1', institution: 'VTU', location: '', degree: 'B.E.', field: 'Computer Science', endDate: '2021', current: false, grade: '' }];
  w.skills = ['Git', 'React', 'Node.js'];
  w.summary = 'I am a web developer. I work on websites.';
  return w;
}

/** What the server returns: the same resume with improved wording and skills reordered. */
function optimizedFrom(w, patch = {}) {
  const r = wizardToResume(w);
  r.summary = 'Web developer building client websites with React and Node.js.';
  r.experience[0].achievements = ['Built websites for clients using React.', 'Fixed bugs in the Node.js backend.'];
  r.skills = { technical: ['React', 'Node.js', 'Git'] };
  return { ...r, ...patch };
}

test('summary and bullet points take the optimised wording', () => {
  const w = typed();
  const out = applyOptimizedToWizard(w, optimizedFrom(w));
  assert.equal(out.summary, 'Web developer building client websites with React and Node.js.');
  assert.deepEqual(out.experience[0].bullets, ['Built websites for clients using React.', 'Fixed bugs in the Node.js backend.']);
});

test('nothing factual changes: name, contact, employer, title, dates, education, template', () => {
  const w = typed();
  const out = applyOptimizedToWizard(w, optimizedFrom(w));
  assert.equal(out.personal.firstName, 'Srinivas');
  assert.equal(out.personal.surname, 'Sutar');
  assert.equal(out.personal.email, 's@example.com');
  assert.equal(out.personal.phone, '9876543210');
  assert.equal(out.experience[0].id, w.experience[0].id, 'same job object (ids kept)');
  assert.deepEqual([out.experience[0].title, out.experience[0].company, out.experience[0].startDate, out.experience[0].endDate], ['Web Developer', 'Acme', 'Jan 2022', 'Dec 2023']);
  assert.deepEqual(out.education, w.education);
  assert.equal(out.templateId, w.templateId);
});

test('skills are only reordered: a skill the candidate never listed is ignored', () => {
  const w = typed();
  const opt = optimizedFrom(w, { skills: { technical: ['React', 'AWS', 'Node.js', 'TypeScript'] } });
  const out = applyOptimizedToWizard(w, opt);
  assert.deepEqual(out.skills, ['React', 'Node.js', 'Git'], 'AWS and TypeScript are not added; Git (left out) stays at the end');
});

test('a skill the optimiser dropped is kept, not lost', () => {
  const w = typed();
  const out = applyOptimizedToWizard(w, optimizedFrom(w, { skills: { technical: ['Node.js'] } }));
  assert.equal(out.skills.length, 3);
  assert.deepEqual(new Set(out.skills), new Set(['Git', 'React', 'Node.js']));
});

test('if the optimiser returns a different number of bullets for a job, what was typed is kept', () => {
  const w = typed();
  const opt = optimizedFrom(w);
  opt.experience[0].achievements = ['Only one bullet came back.'];
  const out = applyOptimizedToWizard(w, opt);
  assert.deepEqual(out.experience[0].bullets, w.experience[0].bullets);
});

test('a job whose title or company differs in the result is left alone', () => {
  const w = typed();
  const opt = optimizedFrom(w);
  opt.experience[0].company = 'Some Other Company';
  const out = applyOptimizedToWizard(w, opt);
  assert.deepEqual(out.experience[0].bullets, w.experience[0].bullets);
});

test('the profession is filled only when the candidate left it empty', () => {
  const w = typed();
  const opt = optimizedFrom(w);
  opt.personal.headline = 'Senior Engineer';
  assert.equal(applyOptimizedToWizard(w, opt).personal.profession, 'Web Developer', 'the candidate\'s own title wins');
  w.personal.profession = '';
  assert.equal(applyOptimizedToWizard(w, opt).personal.profession, 'Senior Engineer');
});

test('an empty optimised summary never erases what was typed', () => {
  const w = typed();
  const opt = optimizedFrom(w);
  opt.summary = '';
  assert.equal(applyOptimizedToWizard(w, opt).summary, w.summary);
});

test('a confirmed keyword is written the way a resume shows it', async () => {
  const { displaySkill } = await import('../src/utils/wizardResume.js');
  assert.equal(displaySkill('aws'), 'AWS');
  assert.equal(displaySkill('typescript'), 'TypeScript');
  assert.equal(displaySkill('node.js'), 'Node.js');
  assert.equal(displaySkill('project delivery'), 'Project Delivery');
  assert.equal(displaySkill('SpotDraft'), 'SpotDraft', 'capitals the candidate already used are kept');
  assert.equal(displaySkill('  '), '');
});
