/**
 * ATS resume templates — five distinct visual identities.
 *
 * Every string is TEMPLATE PLACEHOLDER COPY.  Employers are written as
 * "Company Name" / "Previous Company", the candidate is "YOUR NAME", and
 * every figure is a bracketed blank ([X]%) the writer fills in from their
 * actual history.  A gallery of realistic-looking resumes would require
 * inventing people, employers and results — these are achievement PATTERNS
 * (verb + object + measure) the writer uses as a starting structure.
 *
 * `ats`:
 *   'max'  — single column, no tables, no text boxes, no graphics.
 *   'high' — visually structured but still a single text flow.
 */

export const FAMILIES = [
  { value: 'all',        label: 'All roles'           },
  { value: 'software',  label: 'Software'             },
  { value: 'data',      label: 'Data & AI'            },
  { value: 'infra',     label: 'IT & Security'        },
  { value: 'engineering',label: 'Engineering'         },
  { value: 'business',  label: 'Business & Finance'   },
  { value: 'marketing', label: 'Marketing & Creative' },
  { value: 'healthcare',label: 'Healthcare'           },
  { value: 'education', label: 'Education'            },
  { value: 'operations',label: 'Operations & Support' },
];

export const LAYOUTS = [
  { value: 'all',       label: 'All layouts'  },
  { value: 'meridian',  label: 'Meridian'     },
  { value: 'pulse',     label: 'Pulse'        },
  { value: 'slate',     label: 'Slate'        },
  { value: 'grove',     label: 'Grove'        },
  { value: 'arc',       label: 'Arc'          },
];

export const LEVELS = [
  { value: 'all',    label: 'All levels' },
  { value: 'entry',  label: '0–3 years'  },
  { value: 'mid',    label: '4–14 years' },
  { value: 'senior', label: '15+ years'  },
];

/* Shared qualification blocks */
const DEGREE = {
  cs:     'B.E. Computer Science',
  it:     'B.Sc. Information Technology',
  mech:   'B.E. Mechanical Engineering',
  civil:  'B.E. Civil Engineering',
  eee:    'B.E. Electrical & Electronics Engineering',
  com:    'B.Com / M.Com',
  mba:    'MBA',
  stats:  'B.Sc. Statistics / Mathematics',
  nursing:'B.Sc. Nursing',
  pharm:  'B.Pharm / PharmD',
  edu:    'B.Ed / M.A.',
  design: 'B.Des / Diploma in Design',
  mass:   'B.A. Mass Communication',
};

export const TEMPLATES = [

  /* ══════════════════════════════════════════════════════════════════
   * 1 — MERIDIAN  |  classic, any industry, any seniority
   * Left-border accent rule separates sections; serif name with
   * tracked sans headings.  The safest template for government,
   * banking, legal and any role that still expects a Word document.
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'product-manager',
    role: 'Product Manager',
    family: 'business',
    level: 'mid',
    layout: 'meridian',
    ats: 'max',
    headline: 'Product Manager | 0→1 Products | Platform Strategy | Growth',
    summary:
      'Product manager with [X] years taking products from concept to adoption. Works best at the boundary between engineering, design and commercial teams — translating between them rather than sitting above any of them.',
    titles: ['Senior Product Manager', 'Product Manager', 'Associate Product Manager'],
    bullets: [
      'Defined and shipped [product/feature] from discovery to GA in [X] months, reaching [X]k MAU in the first quarter.',
      'Reduced time-to-close for [customer segment] by [X]% by re-sequencing the onboarding flow.',
      'Ran [X] A/B tests per quarter; shipped [X]% of winners, killing [X]% that looked promising in discovery.',
      'Collaborated with engineering to reduce P1 incident rate by [X]% through better definition-of-done criteria.',
    ],
    skills: ['Product Strategy', 'Roadmapping', 'OKRs', 'User Research', 'A/B Testing', 'SQL', 'Figma', 'JIRA', 'Amplitude', 'Stakeholder Management'],
    certs: ['Product Management Certification — Product School'],
    degree: DEGREE.mba,
  },
  {
    id: 'software-engineer',
    role: 'Software Engineer',
    family: 'software',
    level: 'mid',
    layout: 'meridian',
    ats: 'max',
    headline: 'Software Engineer | Backend Systems | Distributed Services',
    summary:
      'Software engineer with [X] years building and operating production services. Focused on reliability, clean interfaces between systems, and shipping changes that survive contact with real traffic.',
    titles: ['Software Engineer', 'Software Engineer', 'Junior Software Engineer'],
    bullets: [
      'Designed and shipped [service/feature] serving [X] requests per day, cutting p95 latency from [X]ms to [X]ms.',
      'Reduced production incidents by [X]% by introducing [testing/observability practice] across [X] services.',
      'Migrated [component] from [old stack] to [new stack] with zero downtime and no customer-facing regressions.',
      'Reviewed [X] pull requests per week and mentored [X] junior engineers through their first production releases.',
    ],
    skills: ['Java', 'Python', 'Go', 'REST APIs', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'CI/CD', 'System Design', 'Git'],
    certs: ['AWS Certified Developer – Associate'],
    degree: DEGREE.cs,
  },
  {
    id: 'finance-analyst',
    role: 'Finance Analyst',
    family: 'business',
    level: 'mid',
    layout: 'meridian',
    ats: 'max',
    headline: 'Finance Analyst | FP&A | Financial Modelling | Management Reporting',
    summary:
      'Finance professional with [X] years in FP&A and business partnering. Comfortable building three-statement models from scratch, running variance commentary and presenting to non-finance stakeholders.',
    titles: ['Senior Finance Analyst', 'Finance Analyst', 'Junior Finance Analyst'],
    bullets: [
      'Built the annual budget model for a [currency][X]m P&L, reducing prep time by [X] days through automation.',
      'Identified [X]% cost reduction opportunity in [spend category] through activity-based analysis.',
      'Produced monthly management pack for [X] business units; reduced commentary cycle from [X] days to [X].',
      'Improved forecast accuracy from [X]% to [X]% MAE by rebuilding the driver-based model in Power BI.',
    ],
    skills: ['Financial Modelling', 'FP&A', 'Excel / Power Query', 'Power BI', 'SAP', 'SQL', 'Variance Analysis', 'Management Reporting', 'Budgeting & Forecasting'],
    certs: ['CFA Level I', 'ICAI / CMA'],
    degree: DEGREE.com,
  },

  /* ══════════════════════════════════════════════════════════════════
   * 2 — PULSE  |  tech, data, product — mid/senior
   * Teal name, tight dense layout, skills as a chip row.
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'data-scientist',
    role: 'Data Scientist',
    family: 'data',
    level: 'mid',
    layout: 'pulse',
    ats: 'max',
    headline: 'Data Scientist | Predictive Modelling | NLP | Production ML',
    summary:
      'Data scientist with [X] years taking models from notebook to production. Equally comfortable debating loss functions and explaining results to non-technical stakeholders.',
    titles: ['Senior Data Scientist', 'Data Scientist', 'Data Analyst'],
    bullets: [
      'Built [model type] that improved [business metric] by [X]%, deployed to [X]k daily users.',
      'Reduced model inference time from [X]ms to [X]ms through feature engineering and quantisation.',
      'Ran end-to-end NLP pipeline for [use case]; F1 score of [X]% on the held-out set.',
      'Designed A/B testing framework adopted by [X] product teams; accelerated decision cycle by [X] days.',
    ],
    skills: ['Python', 'PyTorch', 'scikit-learn', 'SQL', 'Spark', 'dbt', 'Airflow', 'AWS SageMaker', 'Tableau', 'Statistical Modelling'],
    certs: ['Google Professional ML Engineer', 'Databricks Certified Associate'],
    degree: DEGREE.stats,
  },
  {
    id: 'frontend-developer',
    role: 'Frontend Developer',
    family: 'software',
    level: 'mid',
    layout: 'pulse',
    ats: 'max',
    headline: 'Frontend Developer | React | Design Systems | Accessibility',
    summary:
      'Frontend developer with [X] years building web products that load fast and stay accessible. Equally interested in component architecture and the pixel-level details that make interfaces feel finished.',
    titles: ['Senior Frontend Developer', 'Frontend Developer', 'UI Developer'],
    bullets: [
      'Rebuilt [feature/page] in React; reduced bundle size by [X]kB and improved Lighthouse score from [X] to [X].',
      'Led the design system migration for [X] components; reduced designer-developer handoff time by [X] days per sprint.',
      'Achieved WCAG 2.1 AA compliance across [X] pages; resolved [X] screen-reader issues identified in audit.',
      'Mentored [X] junior developers; introduced PR template and code review guide adopted across the frontend team.',
    ],
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Storybook', 'Playwright', 'Figma', 'Accessibility (WCAG 2.1)', 'Web Performance', 'Git'],
    certs: ['AWS Certified Cloud Practitioner'],
    degree: DEGREE.cs,
  },
  {
    id: 'devops-engineer',
    role: 'DevOps Engineer',
    family: 'infra',
    level: 'mid',
    layout: 'pulse',
    ats: 'max',
    headline: 'DevOps Engineer | Kubernetes | CI/CD | SRE Practices',
    summary:
      'DevOps/SRE engineer with [X] years building the platforms that ship, run and recover production software. Comfortable holding pager duty and writing the runbooks that make the next incident shorter.',
    titles: ['Senior DevOps Engineer', 'DevOps Engineer', 'Systems Engineer'],
    bullets: [
      'Reduced deployment lead time from [X] hours to [X] minutes by rebuilding the CI/CD pipeline on [platform].',
      'Improved service availability from [X]% to [X]% by introducing SLO tracking and automated rollback.',
      'Cut cloud infrastructure cost by [X]% through right-sizing, spot instances and Reserved Instance planning.',
      'Migrated [X] services from on-prem to Kubernetes; coordinated with [X] teams over [X]-month programme.',
    ],
    skills: ['Kubernetes', 'Terraform', 'AWS / GCP', 'GitHub Actions', 'ArgoCD', 'Prometheus / Grafana', 'Docker', 'Bash / Python', 'Linux', 'Incident Management'],
    certs: ['CKA – Certified Kubernetes Administrator', 'AWS Solutions Architect – Associate'],
    degree: DEGREE.cs,
  },

  /* ══════════════════════════════════════════════════════════════════
   * 3 — SLATE  |  operations, executive, management
   * Dark header band reverses the name; authoritative and structured.
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'operations-manager',
    role: 'Operations Manager',
    family: 'operations',
    level: 'mid',
    layout: 'slate',
    ats: 'high',
    headline: 'Operations Manager | Process Excellence | Team Leadership | P&L',
    summary:
      'Operations leader with [X] years running teams and processes at scale. Holds cost, quality and headcount together rather than trading one for another quietly.',
    titles: ['Operations Manager', 'Assistant Operations Manager', 'Operations Executive'],
    bullets: [
      'Led operations teams of [X] across [X] sites, owning a [currency][X] cost centre.',
      'Improved process efficiency by [X]% through [Lean/Six Sigma] initiatives.',
      'Reduced operating cost by [X]% while holding service levels at [X]%.',
      'Cut attrition from [X]% to [X]% through workforce planning and shift redesign.',
    ],
    skills: ['Operations Management', 'Lean / Six Sigma', 'P&L Management', 'KPI Reporting', 'Team Leadership', 'Process Improvement', 'SOP Development', 'ERP Systems', 'Capacity Planning'],
    certs: ['Six Sigma Black Belt'],
    degree: DEGREE.mba,
  },
  {
    id: 'project-manager',
    role: 'Project Manager',
    family: 'business',
    level: 'mid',
    layout: 'slate',
    ats: 'high',
    headline: 'Project Manager | PMO | Agile & Waterfall | Stakeholder Management',
    summary:
      'Project manager with [X] years delivering technology and business change programmes. Keeps scope, budget and quality honest without making the team miserable in the process.',
    titles: ['Senior Project Manager', 'Project Manager', 'Project Coordinator'],
    bullets: [
      'Delivered [project] on time and [X]% under budget; [X] stakeholders across [X] departments.',
      'Managed concurrent portfolio of [X] projects, total budget [currency][X]m.',
      'Reduced change request cycle from [X] days to [X] days by introducing a lightweight scope-change process.',
      'Improved sprint velocity by [X]% over [X] quarters through retrospective-driven process improvements.',
    ],
    skills: ['Project Planning', 'Risk Management', 'Agile / Scrum', 'MS Project', 'JIRA', 'Stakeholder Management', 'Budget Control', 'Change Management', 'PMP / PRINCE2'],
    certs: ['PMP – Project Management Professional', 'PRINCE2 Practitioner'],
    degree: DEGREE.mba,
  },
  {
    id: 'hr-manager',
    role: 'HR Manager',
    family: 'operations',
    level: 'mid',
    layout: 'slate',
    ats: 'high',
    headline: 'HR Manager | Talent Acquisition | L&D | Employee Relations',
    summary:
      'HR professional with [X] years building and running people functions in [industry]. Holds the day-to-day compliance together while also working on the longer-term capability agenda.',
    titles: ['HR Manager', 'HR Business Partner', 'HR Executive'],
    bullets: [
      'Reduced time-to-hire from [X] days to [X] days across [X] role families through process redesign.',
      'Designed and delivered L&D programme for [X] employees; improved engagement score by [X] points.',
      'Managed [X] employee relations cases to conclusion with zero escalations to tribunal.',
      'Built the performance management framework adopted across [X] business units.',
    ],
    skills: ['Talent Acquisition', 'HR Business Partnering', 'L&D', 'Employee Relations', 'HRMS / SAP SuccessFactors', 'Compensation & Benefits', 'Policy Writing', 'Workforce Planning'],
    certs: ['SHRM-CP / PHR'],
    degree: DEGREE.mba,
  },

  /* ══════════════════════════════════════════════════════════════════
   * 4 — GROVE  |  healthcare, education, consulting, non-profit
   * Warm moss accent, generous leading, calm and trustworthy.
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'nurse',
    role: 'Staff Nurse / Clinical Nurse',
    family: 'healthcare',
    level: 'mid',
    layout: 'grove',
    ats: 'max',
    headline: 'Registered Nurse | Critical Care | Patient Advocacy | Clinical Leadership',
    summary:
      'Registered nurse with [X] years in [specialty]. Brings clinical accuracy and a clear focus on patient outcomes to both bedside care and ward management responsibilities.',
    titles: ['Senior Staff Nurse', 'Staff Nurse', 'Junior Staff Nurse'],
    bullets: [
      'Managed care for [X]–[X] patients per shift in [ward/unit]; maintained [X]% medication administration accuracy.',
      'Led handover process redesign that reduced missed observations by [X]% across the ward.',
      'Mentored [X] student nurses through clinical placements; [X]% completed their competency sign-offs on time.',
      'Contributed to infection control audit; ward maintained zero HCAI incidents for [X] consecutive months.',
    ],
    skills: ['Critical Care', 'IV Therapy', 'Patient Assessment', 'Medication Administration', 'Ward Management', 'Clinical Documentation', 'BLS / ALS Certified', 'EMR / EHR', 'Infection Control'],
    certs: ['BLS / ACLS Certification', 'Postgraduate Certificate – Critical Care Nursing'],
    degree: DEGREE.nursing,
  },
  {
    id: 'teacher',
    role: 'Teacher / Academic',
    family: 'education',
    level: 'mid',
    layout: 'grove',
    ats: 'max',
    headline: 'Secondary School Teacher | English / Mathematics | Curriculum Development',
    summary:
      'Teacher with [X] years in secondary education. Designs lessons that connect subject content to the students in front of me — and measures whether they worked.',
    titles: ['Senior Teacher', 'Classroom Teacher', 'Trainee Teacher'],
    bullets: [
      '[Subject] pass rate improved from [X]% to [X]% over [X] academic years with the cohort I led.',
      'Designed differentiated schemes of work adopted across [X] year groups.',
      'Coordinated [X]-student extracurricular programme; [X]% of participants progressed to the national round.',
      'Mentored [X] NQTs through their first year; all received "Good" or "Outstanding" in final assessments.',
    ],
    skills: ['Lesson Planning', 'Curriculum Design', 'Differentiated Instruction', 'Assessment & Feedback', 'Classroom Management', 'Parent Communication', 'SEN Awareness', 'Google Classroom / Microsoft Teams'],
    certs: ['B.Ed / PGCE', 'CPD – Child Protection Level 3'],
    degree: DEGREE.edu,
  },
  {
    id: 'management-consultant',
    role: 'Management Consultant',
    family: 'business',
    level: 'mid',
    layout: 'grove',
    ats: 'max',
    headline: 'Management Consultant | Strategy | Operating Model | Change Delivery',
    summary:
      'Management consultant with [X] years across [industries]. Builds the analysis, writes the recommendation and stays in the room for the delivery — not just the slide.',
    titles: ['Senior Consultant', 'Consultant', 'Analyst'],
    bullets: [
      'Led [X]-person workstream on [engagement type]; delivered [X]% cost reduction recommendation adopted by the client.',
      'Built the business case that secured [currency][X]m investment approval for [programme].',
      'Designed and facilitated [X] workshops with C-suite and senior leadership to align on [objective].',
      'Reduced client reporting cycle from [X] weeks to [X] days through process redesign and tooling.',
    ],
    skills: ['Strategy Development', 'Operating Model Design', 'Financial Modelling', 'Workshop Facilitation', 'Stakeholder Management', 'Change Management', 'PowerPoint / Excel', 'Data Analysis'],
    certs: ['MBA (if applicable)', 'Six Sigma Green Belt'],
    degree: DEGREE.mba,
  },

  /* ══════════════════════════════════════════════════════════════════
   * 5 — ARC  |  marketing, creative, design — sidebar layout
   * Deep indigo sidebar; contact, skills, certs in the rail; story
   * on the right.  DOM order keeps ATS readability (main col first).
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'digital-marketing-manager',
    role: 'Digital Marketing Manager',
    family: 'marketing',
    level: 'mid',
    layout: 'arc',
    ats: 'high',
    headline: 'Digital Marketing Manager | Paid & Organic | Growth | Brand',
    summary:
      'Digital marketing manager with [X] years growing consumer brands across paid search, social and organic channels. Comfortable with both the creative brief and the ROAS spreadsheet.',
    titles: ['Digital Marketing Manager', 'Senior Digital Marketing Executive', 'Digital Marketing Executive'],
    bullets: [
      'Grew organic traffic by [X]% in [X] months through content strategy and technical SEO fixes.',
      'Managed [currency][X]m annual paid media budget across Google, Meta and LinkedIn; blended ROAS of [X]x.',
      'Launched [campaign] that generated [X]k leads at [currency][X] CPL, [X]% below target.',
      'Built and scaled the email programme from [X]k to [X]k subscribers; open rate [X]%, conversion [X]%.',
    ],
    skills: ['SEO / SEM', 'Google Ads', 'Meta Ads', 'Email Marketing', 'HubSpot / Salesforce', 'Google Analytics 4', 'Content Strategy', 'Conversion Optimisation', 'A/B Testing', 'Copywriting'],
    certs: ['Google Ads Certified', 'HubSpot Content Marketing'],
    degree: DEGREE.mass,
  },
  {
    id: 'ui-ux-designer',
    role: 'UI/UX Designer',
    family: 'marketing',
    level: 'mid',
    layout: 'arc',
    ats: 'high',
    headline: 'UI/UX Designer | Product Design | Design Systems | User Research',
    summary:
      'Product designer with [X] years working across discovery, interaction design and delivery. Builds things that feel simple to use because the hard thinking happened before the first frame.',
    titles: ['Senior Product Designer', 'UI/UX Designer', 'UI Designer'],
    bullets: [
      'Redesigned [product/feature]; SUS score improved from [X] to [X], and task completion rate from [X]% to [X]%.',
      'Built and documented the design system used by [X] product teams; reduced design-to-dev handoff time by [X]%.',
      'Ran [X] rounds of usability testing per quarter; findings directly influenced [X] shipped features.',
      'Designed the onboarding flow that reduced drop-off from [X]% to [X]% in the first [X] days.',
    ],
    skills: ['Figma', 'Prototyping', 'User Research', 'Usability Testing', 'Design Systems', 'Interaction Design', 'Information Architecture', 'Zeroheight', 'Accessibility (WCAG 2.1)', 'HTML / CSS basics'],
    certs: ['Google UX Design Certificate', 'Nielsen Norman Group UX Certification'],
    degree: DEGREE.design,
  },
  {
    id: 'sales-manager',
    role: 'Sales Manager',
    family: 'business',
    level: 'mid',
    layout: 'arc',
    ats: 'high',
    headline: 'Sales Manager | B2B SaaS | Enterprise | Revenue Growth',
    summary:
      'Sales leader with [X] years closing enterprise deals and building the teams that replicate the process. Numbers-first but relationship-led — the two are not in conflict at the right deal size.',
    titles: ['Sales Manager', 'Senior Account Executive', 'Account Executive'],
    bullets: [
      'Exceeded quota by [X]% in [X] of the last [X] quarters; [currency][X]m ARR personally sourced.',
      'Built and managed a team of [X] AEs; team hit [X]% of collective quota in the first year.',
      'Reduced average sales cycle from [X] days to [X] days by introducing MEDDIC qualification gates.',
      'Landed [X] enterprise accounts with ACV above [currency][X]k in [X]-month period.',
    ],
    skills: ['Enterprise Sales', 'B2B SaaS', 'MEDDIC', 'Salesforce', 'Outbound Prospecting', 'Negotiation', 'Account Planning', 'Forecasting', 'Sales Enablement', 'CRM Management'],
    certs: ['Salesforce Certified Administrator'],
    degree: DEGREE.mba,
  },
];

export const TEMPLATE_COUNT = TEMPLATES.length;