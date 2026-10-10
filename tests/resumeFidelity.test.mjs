import test from 'node:test';
import assert from 'node:assert/strict';
import { readableDate, resumeToBuilder } from '../src/utils/resumeToBuilder.js';
import { resumeToWizard, wizardToBuilder } from '../src/utils/wizardResume.js';

/**
 * What the candidate wrote must reach the template as written:
 * real-looking dates, and no language level the candidate never stated.
 * Run: node --test tests/resumeFidelity.test.mjs   (from DutyLaunch-Frontend)
 */

test('uploaded ISO dates are shown as "Mar 2026", not "2026-03"', () => {
  assert.equal(readableDate('2026-03'), 'Mar 2026');
  assert.equal(readableDate('2022-11-14'), 'Nov 2022');
  assert.equal(readableDate('2019-02'), 'Feb 2019');
});

test('dates that are already readable, years, "Present" and odd values are untouched', () => {
  for (const v of ['March 2026', '2019', 'Present', 'Spring 2020', '2026-13', '']) assert.equal(readableDate(v), v);
  assert.equal(readableDate(null), '');
});

test('a job range reaches the template as "May 2022 – Nov 2025" and "Mar 2026 – Present"', () => {
  const b = resumeToBuilder({
    personal: { name: 'A B' },
    experience: [
      { title: 'Legal Ops', company: 'Noon', startDate: '2026-03', endDate: '', current: true },
      { title: 'Legal Ops', company: 'PhonePe', startDate: '2022-05', endDate: '2025-11', current: false },
    ],
  });
  assert.equal(b.experience[0].dates, 'Mar 2026 – Present');
  assert.equal(b.experience[1].dates, 'May 2022 – Nov 2025');
});

test('the wizard form shows the same readable dates (what the candidate edits)', () => {
  const w = resumeToWizard({ personal: { name: 'A B' }, experience: [{ title: 'X', company: 'Y', startDate: '2022-05', endDate: '2025-11' }] });
  assert.equal(w.experience[0].startDate, 'May 2022');
  assert.equal(w.experience[0].endDate, 'Nov 2025');
});

test('languages with no level stay without a level — nothing like "Full Professional" is invented', () => {
  const b = resumeToBuilder({
    personal: { name: 'A B' },
    languages: [{ name: 'English', proficiency: '' }, { name: 'Hindi' }, 'Kannada'],
  });
  assert.deepEqual(b.languages.map((l) => [l.name, l.level]), [['English', ''], ['Hindi', ''], ['Kannada', '']]);
});

test('a level the candidate DID write is kept', () => {
  const b = resumeToBuilder({ personal: { name: 'A B' }, languages: [{ name: 'English', proficiency: 'Native' }] });
  assert.equal(b.languages[0].level, 'Native');
});

test('end to end: upload → wizard → template data has no made-up levels', () => {
  const w = resumeToWizard({ personal: { name: 'A B' }, languages: [{ name: 'English', proficiency: '' }, { name: 'Urdu', proficiency: '' }] });
  const builder = wizardToBuilder({ ...w, extras: { ...w.extras, on: { ...w.extras.on, languages: true } } });
  assert.deepEqual(builder.languages.map((l) => l.level), ['', '']);
});
