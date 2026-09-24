/**
 * Partner institutes and colleges shown when someone clicks a programme or
 * course chip on /higher-education or /professional-courses.
 *
 * ⚠️  EVERY NAME BELOW IS FICTIONAL DEMO DATA. None of these institutions
 * exist, and none is a real DutyLaunch partner. Real brand names (QSpiders,
 * JSpiders, real universities) are deliberately NOT used: listing a real
 * company as "partnered" without an agreement would be a false claim to
 * visitors and a trademark problem.
 *
 * Before launch:
 *   1. Replace each pool with the partners you actually have agreements with.
 *   2. Set SHOW_SAMPLE_NOTICE to false.
 *
 * Deliberately no accreditation, ranking, fee or placement claims on any
 * entry — add those only for real partners, from their own published details.
 *
 * Structure: each programme label (exactly as it appears on the page) maps to
 * a pool of partners. Programmes not listed explicitly fall back to their
 * group's pool, so a new chip added to a page still opens something sensible.
 */

export const SHOW_SAMPLE_NOTICE = true;

/* ---------------- Education pools ---------------- */
const OPEN_SCHOOL = [
  { name: 'Northbridge Open Schooling Centre', location: 'Bengaluru', mode: 'Distance', note: 'Self-paced study with exam-centre support' },
  { name: 'Lakeview Learning Centre', location: 'Hyderabad', mode: 'Hybrid', note: 'Weekend contact classes' },
  { name: 'Brightfield Study Centre', location: 'Online', mode: 'Online', note: 'Recorded lessons with doubt-clearing sessions' },
];

const DIPLOMA = [
  { name: 'Crestline Polytechnic Institute', location: 'Pune', mode: 'Regular', note: 'Full-time campus programmes' },
  { name: 'Meridian Technical Institute', location: 'Chennai', mode: 'Regular', note: 'Workshop-based practical training' },
  { name: 'Harborview Skills College', location: 'Online', mode: 'Distance', note: 'Distance diplomas for working learners' },
];

const BACHELORS = [
  { name: 'Riverstone University (Online)', location: 'Online', mode: 'Online', note: 'Online degree programmes' },
  { name: 'Silverleaf College of Arts & Science', location: 'Bengaluru', mode: 'Regular', note: 'Full-time campus programmes' },
  { name: 'Kavera Institute of Technology', location: 'Hyderabad', mode: 'Regular', note: 'Engineering and technology programmes' },
  { name: 'Westfield School of Business', location: 'Pune', mode: 'Hybrid', note: 'Weekday and weekend batches' },
  { name: 'Oakridge College of Design', location: 'Bengaluru', mode: 'Regular', note: 'Studio-based design programmes' },
];

const MASTERS = [
  { name: 'Riverstone University (Online)', location: 'Online', mode: 'Online', note: 'Online postgraduate programmes' },
  { name: 'Northgate School of Management', location: 'Bengaluru', mode: 'Hybrid', note: 'Weekend classes for working professionals' },
  { name: 'Summit Institute of Postgraduate Studies', location: 'Chennai', mode: 'Regular', note: 'Full-time postgraduate programmes' },
  { name: 'Kavera Institute of Technology', location: 'Hyderabad', mode: 'Regular', note: 'Technology and engineering postgraduate study' },
];

/* ---------------- Professional course pools ---------------- */
const BUSINESS = [
  { name: 'LedgerLeaf Academy', location: 'Bengaluru', mode: 'Classroom', note: 'Weekday and weekend batches' },
  { name: 'BrightPath Business Institute', location: 'Online', mode: 'Online', note: 'Live online classes' },
  { name: 'Northwind Finance School', location: 'Mumbai', mode: 'Hybrid', note: 'Classroom sessions with online practice' },
];

const CAREER_DEV = [
  { name: 'SpeakWell Communication Lab', location: 'Online', mode: 'Online', note: 'Small-group live sessions' },
  { name: 'Pinnacle Soft Skills Studio', location: 'Hyderabad', mode: 'Classroom', note: 'Workshop-style training' },
  { name: 'CareerCraft Training Centre', location: 'Bengaluru', mode: 'Hybrid', note: 'Evening and weekend batches' },
];

const TECH = [
  { name: 'CodeHarbor Academy', location: 'Bengaluru', mode: 'Classroom', note: 'Project-based classroom training' },
  { name: 'ByteForge Institute', location: 'Hyderabad', mode: 'Hybrid', note: 'Classroom with online lab access' },
  { name: 'DataNest Learning Labs', location: 'Online', mode: 'Online', note: 'Live online cohorts' },
  { name: 'CloudPeak Tech School', location: 'Pune', mode: 'Classroom', note: 'Hands-on lab sessions' },
];

const CERTS = [
  { name: 'CertifyPro Training Centre', location: 'Bengaluru', mode: 'Classroom', note: 'Exam-preparation batches' },
  { name: 'SkillStack Certification Hub', location: 'Online', mode: 'Online', note: 'Self-paced with mock tests' },
  { name: 'ExamReady Learning', location: 'Chennai', mode: 'Hybrid', note: 'Classroom revision with online practice' },
];

/* Group title (as shown on the page) → default pool. */
const GROUP_POOLS = {
  'X / SSLC': OPEN_SCHOOL,
  'XII / PUC': OPEN_SCHOOL,
  'Diploma Programmes': DIPLOMA,
  "Bachelor's Degrees": BACHELORS,
  "Master's Degrees": MASTERS,
  'Business & Management': BUSINESS,
  'Career Development': CAREER_DEV,
  Technology: TECH,
  Certifications: CERTS,
};

/* Programme-specific pools, where a group pool would be a poor fit. */
const ITEM_POOLS = {
  'B.Des': [BACHELORS[4], BACHELORS[0], BACHELORS[3]],
  'B.Arch': [BACHELORS[4], BACHELORS[2], BACHELORS[1]],
  BE: [BACHELORS[2], BACHELORS[0], BACHELORS[1]],
  'B.Tech': [BACHELORS[2], BACHELORS[0], BACHELORS[1]],
  BBA: [BACHELORS[3], BACHELORS[0], BACHELORS[1]],
  'B.Com': [BACHELORS[3], BACHELORS[1], BACHELORS[0]],
  MBA: [MASTERS[1], MASTERS[0], MASTERS[2]],
  PGDM: [MASTERS[1], MASTERS[2], MASTERS[0]],
  'M.Tech': [MASTERS[3], MASTERS[0], MASTERS[2]],
  MCA: [MASTERS[3], MASTERS[0], MASTERS[2]],
  'Diploma in Engineering': [DIPLOMA[0], DIPLOMA[1], DIPLOMA[2]],
  'ITI Courses': [DIPLOMA[1], DIPLOMA[0]],
};

/** Partners for a programme; three at most, deterministic per programme. */
export function partnersFor(item, group) {
  if (ITEM_POOLS[item]) return ITEM_POOLS[item];
  const pool = GROUP_POOLS[group] || [];
  if (pool.length <= 3) return pool;
  // Rotate the pool by the programme name so neighbouring chips don't all
  // show the same three institutes in the same order.
  const offset = [...item].reduce((n, ch) => n + ch.charCodeAt(0), 0) % pool.length;
  return [...pool.slice(offset), ...pool.slice(0, offset)].slice(0, 3);
}