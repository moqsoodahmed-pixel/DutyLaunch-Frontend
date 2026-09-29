/**
 * DutyLaunch Flagship ATS Resume Templates.
 *
 * Exactly FIVE flagship templates exist:
 * 1. DL Elite       — Universal (any industry, any seniority, recruiter-preferred)
 * 2. DL Tech        — Software, Cybersecurity, AI, Engineering, Cloud
 * 3. DL Professional— Business, Finance, Marketing, Operations, HR, Sales
 * 4. DL Executive   — Leadership, CXO, Director, Senior Management
 * 5. DL Project+    — Students, Freshers, Internships, Career Switchers
 *
 * Production-ready realistic profiles with real metrics, company names,
 * verified education, certifications, projects, achievements, and languages.
 * Built to strict ATS-first rules:
 * - Single-column linear text flow, DOM-order safe
 * - No tables, text boxes, or unparseable graphic artifacts
 * - Standard section headings
 * - Consistent date and contact hierarchies
 */

export const LAYOUTS = [
  { value: 'all', label: 'All 5 Flagship Templates' },
  {
    value: 'dl-elite',
    label: 'DL Elite',
    tagline: 'Universal',
    targetRoles: 'Universal',
    description: 'Universal professional. Recruiter-preferred layout for any industry or seniority.',
    accent: '#0B1F48',
  },
  {
    value: 'dl-tech',
    label: 'DL Tech',
    tagline: 'Software & Engineering',
    targetRoles: 'Software, Cybersecurity, AI, Engineering, Cloud',
    description: 'Software, cybersecurity, AI, engineering, developer and cloud roles.',
    accent: '#2FA3CC',
  },
  {
    value: 'dl-professional',
    label: 'DL Professional',
    tagline: 'Business & Operations',
    targetRoles: 'Business, Finance, Marketing, Operations, HR, Sales',
    description: 'Business, marketing, finance, operations, HR and sales.',
    accent: '#5A38D6',
  },
  {
    value: 'dl-executive',
    label: 'DL Executive',
    tagline: 'Executive Leadership',
    targetRoles: 'Leadership, CXO, Director, Senior Management',
    description: 'Leadership, director, VP, CXO and senior management.',
    accent: '#132952',
  },
  {
    value: 'dl-modern',
    label: 'DL Modern',
    tagline: 'Modern & Clean',
    targetRoles: 'Modern Tech, Product, Creative, Early Career & Switchers',
    description: 'Clean modern hierarchy with high ATS compliance for contemporary tech and creative roles.',
    accent: '#1D5DB8',
  },
];

export const FAMILIES = [
  { value: 'all', label: 'All Templates' },
  { value: 'universal', label: 'Universal' },
  { value: 'tech', label: 'Tech & Engineering' },
  { value: 'business', label: 'Business & Finance' },
  { value: 'executive', label: 'Executive Leadership' },
  { value: 'early-career', label: 'Students & Switchers' },
];

export const LEVELS = [
  { value: 'all', label: 'All levels' },
  { value: 'entry', label: 'Students & Freshers (0–3 yrs)' },
  { value: 'mid', label: 'Mid-Senior (4–12 yrs)' },
  { value: 'executive', label: 'Executive / Leadership (12+ yrs)' },
];

export const TEMPLATES = [
  /* ══════════════════════════════════════════════════════════════════
   * 1 — DL ELITE | Universal
   * Authoritative, clean ink-navy left accent bar, balanced serif/sans
   * hierarchy. The ultimate ATS-safe universal standard for any industry.
   * Persona: Aarav N. Kapoor — Global Operations & Strategy Director
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'dl-elite',
    name: 'DL Elite',
    personName: 'Aarav N. Kapoor',
    role: 'Universal Professional',
    tagline: 'Universal',
    targetRoles: 'Universal (All Industries & Seniorities)',
    level: 'mid',
    layout: 'dl-elite',
    ats: 'max',
    badge: 'Universal Standard',
    headline: 'Senior Director of Global Operations & Enterprise Strategy | $120M+ P&L',
    contact: {
      email: 'aarav.kapoor@executive-advisory.com',
      phone: '+1 (415) 890-4219',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/aaravnkapoor',
      website: 'aaravkapoor.com',
    },
    summary:
      'Accomplished Operations and Corporate Strategy Director with 14+ years spearheading large-scale digital transformations, cross-functional organizational restructuring, and multinational business scaling. Proven track record managing $120M+ P&L portfolios, accelerating product delivery velocity by 34%, and orchestrating post-merger integrations across Fortune 100 enterprise environments.',
    experience: [
      {
        title: 'Senior Director of Operations & Strategy',
        company: 'Apex Global Enterprises',
        location: 'San Francisco, CA',
        dates: '04/2021 – Present',
        bullets: [
          'Spearheaded enterprise operational roadmap across 14 business units, eliminating $18.4M in operational redundancies while increasing cross-departmental delivery velocity by 34%.',
          'Directed cross-functional steering committee of 65+ program managers, principal engineers, and finance directors for flagship SaaS platform launch, capturing 2.4M active users within 6 months.',
          'Negotiated tier-1 vendor consolidations and cloud infrastructure contracts, yielding $6.2M in annual recurring OpEx savings.',
          'Instituted enterprise-wide OKR governance framework adopted by executive committee, increasing milestone delivery predictability from 68% to 94%.',
        ],
      },
      {
        title: 'Strategy & Operations Director',
        company: 'Beacon Strategic Advisory',
        location: 'New York, NY',
        dates: '06/2018 – 03/2021',
        bullets: [
          'Advised Fortune 50 industrial and financial technology clients on post-merger integration (PMI) mandates totaling $4.8B in combined asset valuations.',
          'Led digital workflow modernization for multinational logistics client, cutting warehouse processing overhead by 29% and boosting EBITDA margins by 380 bps.',
          'Formulated 12 standard operating playbooks adopted across corporate business units; mentored 22 associates with a 92% retention rate.',
        ],
      },
      {
        title: 'Senior Engagement Manager — Enterprise Operations',
        company: 'McKinsey & Company',
        location: 'Chicago, IL',
        dates: '07/2014 – 05/2018',
        bullets: [
          'Led corporate turnaround and commercial optimization engagements for healthcare and enterprise software clients across 8 countries.',
          'Identified and executed $12.5M working capital improvement strategy for a leading medical device manufacturer.',
          'Conducted quarterly performance reviews and established automated executive dashboards for C-suite governance.',
        ],
      },
    ],
    skills: [
      'Strategic Operations Planning',
      'Cross-Functional Leadership',
      'M&A & Post-Merger Integration',
      'P&L Governance ($120M+)',
      'Digital Transformation',
      'Capital Allocation',
      'Enterprise OKRs & Agile',
      'Supply Chain Optimization',
      'Executive Stakeholder Management',
      'Risk Mitigation & Compliance',
    ],
    education: [
      {
        degree: 'Master of Business Administration (MBA) — Strategy & Operations',
        institution: 'Harvard Business School (HBS)',
        location: 'Boston, MA',
        year: '2014',
      },
      {
        degree: 'Bachelor of Science in Industrial Engineering (Summa Cum Laude)',
        institution: 'Northwestern University',
        location: 'Evanston, IL',
        year: '2010',
      },
    ],
    certs: [
      'PMP® — Project Management Professional (PMI #1984210)',
      'Lean Six Sigma Black Belt (LSSBB) — ASQ Certified',
      'Prosci® Certified Change Management Practitioner',
    ],
    projects: [
      {
        name: 'Global ERP Consolidation Program',
        role: 'Executive Program Sponsor',
        impact: 'Unified 11 disparate regional ERP systems into a single SAP S/4HANA instance across 14,000 seats with zero operational downtime.',
      },
      {
        name: 'APAC Market Expansion GTM',
        role: 'Strategy Lead',
        impact: 'Formulated regulatory and go-to-market strategy for expansion into Singapore, Tokyo, and Sydney, producing $32M ARR in year two.',
      },
    ],
    achievements: [
      'Recipient of Apex "Global Executive Excellence Award" (2023) for highest portfolio ROI across North American operations.',
      'Keynote Speaker at Global Operations Leadership Summit (GOLS 2022, Zurich).',
    ],
    languages: [
      'English (Native / Bilingual)',
      'French (Professional Working)',
      'Hindi (Native Fluency)',
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
   * 2 — DL TECH | Software, Cybersecurity, AI, Engineering, Cloud
   * Sharp, modern, data-dense engineering layout with frost-blue
   * top border, inline categorized tech badges, and quantifiable metrics.
   * Persona: Vikramaditya Singhania — Staff Distributed Systems Architect
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'dl-tech',
    name: 'DL Tech',
    personName: 'Vikramaditya Singhania',
    role: 'Staff Distributed Systems Architect',
    tagline: 'Tech & Engineering',
    targetRoles: 'Software, Cybersecurity, AI, Engineering, Cloud',
    level: 'mid',
    layout: 'dl-tech',
    ats: 'max',
    badge: 'Engineers & Developers',
    headline: 'Staff Distributed Systems Architect & Infrastructure Lead | Cloud Native · High Throughput · Kubernetes',
    contact: {
      email: 'vikram.singhania@cloudarch.dev',
      phone: '+1 (206) 555-0184',
      location: 'Seattle, WA',
      github: 'github.com/vsinghania-dev',
      linkedin: 'linkedin.com/in/vikram-singhania',
    },
    summary:
      'Staff Infrastructure Architect and Principal Backend Engineer with 11+ years architecting mission-critical distributed systems, ultra-low-latency event pipelines, and multi-region Kubernetes cloud infrastructure. Designed core systems processing 85B+ daily API requests at 99.999% availability while cutting annualized cloud compute expenditure by $4.2M. Expert in Go, Rust, microservices resilience, and automated CI/CD.',
    experience: [
      {
        title: 'Staff Infrastructure Architect (Distributed Systems)',
        company: 'Stripe Inc.',
        location: 'Seattle, WA',
        dates: '04/2021 – Present',
        bullets: [
          'Architected core payment ledger streaming pipeline in Go and Rust processing 180,000 transactions/sec at sub-12ms p99 latency with zero data loss guarantees.',
          'Spearheaded multi-region active-active failover architecture on AWS EKS and GCP Anthos, reducing disaster recovery RTO from 14 minutes to under 8 seconds.',
          'Authored custom eBPF networking telemetry daemon, replacing resource-heavy sidecar proxies and slashing cluster CPU overhead by 28% across 12,000 nodes.',
          'Mentored 16 senior and staff engineers; established company-wide architectural review RFC standards and production incident response runbooks.',
        ],
      },
      {
        title: 'Senior Software Development Engineer (DynamoDB & S3)',
        company: 'Amazon Web Services (AWS)',
        location: 'Seattle, WA',
        dates: '02/2018 – 03/2021',
        bullets: [
          'Designed and implemented consensus-based storage replication partitioner for high-throughput distributed database engines.',
          'Optimized memory allocation routines in C++ and Go, preventing GC pauses under sustained 10M QPS ingestion spikes.',
          'Reduced customer P99.9 tail latencies by 35% across key tier-1 AWS regions through adaptive query caching and hardware-accelerated TLS termination.',
        ],
      },
      {
        title: 'Software Engineer II (Data Infrastructure & Kafka)',
        company: 'Uber Technologies',
        location: 'San Francisco, CA',
        dates: '08/2015 – 01/2018',
        bullets: [
          'Scaled enterprise Apache Kafka cluster to 4.5M messages/sec across 400+ consumer microservices with automated partition rebalancing.',
          'Developed real-time geospatial geofencing stream processing service using Apache Flink and RocksDB.',
        ],
      },
    ],
    skills: [
      'Go',
      'Rust',
      'Python',
      'Distributed Systems',
      'Kubernetes (EKS/GKE)',
      'Docker',
      'AWS / GCP',
      'Apache Kafka',
      'PostgreSQL',
      'Redis',
      'Terraform (IaC)',
      'gRPC / Protobuf',
      'eBPF Telemetry',
      'Microservices Architecture',
      'CI/CD (GitHub Actions)',
      'Zero-Downtime Deployments',
    ],
    education: [
      {
        degree: 'Master of Science in Computer Science (Distributed Systems)',
        institution: 'University of Washington',
        location: 'Seattle, WA',
        year: '2015',
      },
      {
        degree: 'Bachelor of Technology in Computer Science & Engineering',
        institution: 'Indian Institute of Technology (IIT) Bombay',
        location: 'Mumbai, India',
        year: '2013',
      },
    ],
    certs: [
      'AWS Certified Solutions Architect – Professional (SAP-C02)',
      'Certified Kubernetes Administrator (CKA — Linux Foundation #CKA-220084)',
      'HashiCorp Certified: Terraform Authoring & Operations Associate',
    ],
    projects: [
      {
        name: 'AetherKV — Distributed Storage Engine',
        role: 'Creator & Maintainer',
        impact: 'Consensus-backed persistent key-value store in Rust featuring Raft replication and LSM-tree engine (3.2k GitHub Stars).',
      },
      {
        name: 'KubeFlow-Edge Autoscaler',
        role: 'Lead Architect',
        impact: 'Predictive horizontal pod autoscaling controller based on Fourier-transform load signatures, saving 34% idle capacity.',
      },
    ],
    achievements: [
      'Winner of AWS Global Architecture Innovation Challenge (2020) for automated partition rebalancing algorithm.',
      'Published author in IEEE Transactions on Cloud Computing: "Sub-Millisecond Fault Recovery in Multi-Tenant Mesh Architectures".',
    ],
    languages: [
      'English (Fluent / Bilingual)',
      'Hindi (Native Fluency)',
      'German (Elementary)',
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
   * 3 — DL PROFESSIONAL | Business, Finance, Marketing, Operations, HR, Sales
   * Elegant violet accents, refined Georgia typography, balanced margins,
   * designed for credible corporate impact and measurable business revenue.
   * Persona: Priya S. Sundaram — VP of Corporate Finance & FP&A
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'dl-professional',
    name: 'DL Professional',
    personName: 'Priya S. Sundaram',
    role: 'Business & Finance VP',
    tagline: 'Business & Operations',
    targetRoles: 'Business, Finance, Marketing, Operations, HR, Sales',
    level: 'mid',
    layout: 'dl-professional',
    ats: 'max',
    badge: 'Business & Finance',
    headline: 'Vice President of Corporate Finance, Strategy & Commercial Operations | FP&A · M&A · Capital Markets',
    contact: {
      email: 'priya.sundaram@cfo-advisory.com',
      phone: '+1 (212) 749-3820',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/priya-sundaram-cfa',
      website: 'priyasundaram.com',
    },
    summary:
      'Results-driven Corporate Finance and Commercial Operations executive with 12+ years directing financial planning & analysis (FP&A), commercial pricing strategy, and M&A capital deployment for high-growth tech and Fortune 500 enterprises. Governed $480M+ operating budgets, led $1.2B in equity and debt syndications, and unlocked $34M in recurring EBITDA margin gains through predictive econometric forecasting.',
    experience: [
      {
        title: 'Vice President of Commercial Finance & Portfolio Operations',
        company: 'Morgan Stanley Capital Partners',
        location: 'New York, NY',
        dates: '05/2020 – Present',
        bullets: [
          'Direct financial governance, capital allocation, and variance modeling across a $480M private equity portfolio encompassing 8 mid-market enterprise SaaS companies.',
          'Partnered with portfolio CEOs and CFOs to re-engineer commercial packaging and pricing tiers, driving +22% Net Revenue Retention (NRR) and expanding blended gross margins by 450 bps.',
          'Spearheaded comprehensive buy-side due diligence, DCF valuations, and debt covenant structuring for three acquisitions valued at $310M.',
          'Built automated board financial reporting engine in Anaplan and PowerBI, cutting monthly close reporting cycle from 12 days to 3.5 days.',
        ],
      },
      {
        title: 'Senior Associate — Investment Banking (TMT Group)',
        company: 'Goldman Sachs',
        location: 'New York, NY',
        dates: '07/2016 – 04/2020',
        bullets: [
          'Executed 9 public and private market financing transactions, including two IPOs and $850M in senior syndicated credit facilities.',
          'Built dynamic 3-statement operating models, LBO valuation analyses, and comprehensive credit rating agency presentations.',
          'Managed underwriting workstreams, audited transaction trails, and liaised directly with SEC legal counsel during S-1 filing procedures.',
        ],
      },
      {
        title: 'Senior Financial Analyst — Financial Advisory',
        company: 'Deloitte Financial Advisory Services',
        location: 'Chicago, IL',
        dates: '08/2013 – 06/2016',
        bullets: [
          'Conducted intangible asset valuations (ASC 805/820), goodwill impairment testing, and portfolio performance analytics for Fortune 100 clients.',
          'Recognized as "National Top Analyst" across Financial Advisory Services group (2015).',
        ],
      },
    ],
    skills: [
      'Financial Planning & Analysis (FP&A)',
      'Corporate Valuation (DCF / LBO)',
      'M&A Due Diligence & Deal Structuring',
      'Capital Budgeting & Cash Management',
      'Commercial Pricing & Packaging',
      'Anaplan & SAP S/4HANA',
      'Advanced Econometric Modeling',
      'PowerBI, Tableau & SQL',
      'SEC Compliance & US GAAP',
      'Executive & Board Presentations',
    ],
    education: [
      {
        degree: 'Master of Science in Finance (Honors)',
        institution: 'Columbia Business School',
        location: 'New York, NY',
        year: '2013',
      },
      {
        degree: 'Bachelor of Science in Economics & Mathematics (Magna Cum Laude)',
        institution: 'NYU Stern School of Business',
        location: 'New York, NY',
        year: '2011',
      },
    ],
    certs: [
      'CFA® Charterholder — CFA Institute (#948123)',
      'Financial Risk Manager (FRM®) — GARP',
      'Certified Management Accountant (CMA®) — IMA',
    ],
    projects: [
      {
        name: 'Enterprise Billing & Revenue Cloud Migration',
        role: 'Finance Workstream Lead',
        impact: 'Replaced legacy billing with automated multi-currency recurring revenue engine, reducing unbilled DSO by 24 days across $320M ARR.',
      },
      {
        name: 'Liquidity Protection Revolving Credit Facility',
        role: 'Capital Markets Lead',
        impact: 'Negotiated $75M revolving credit line during volatile debt cycles, securing 125 bps margin spread below benchmark rate.',
      },
    ],
    achievements: [
      'Named to "Top 40 Under 40 in Corporate Finance" by FinTech Global Review (2022).',
      'Guest Lecturer on Advanced Private Equity Financial Modeling at NYU Stern School of Business.',
    ],
    languages: [
      'English (Native / Bilingual)',
      'Tamil (Native Fluency)',
      'Spanish (Conversational)',
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
   * 4 — DL EXECUTIVE | Leadership, CXO, Director, Senior Management
   * Prestigious ink band header, authoritative serif titles, high-level
   * governance metrics, board advisory, and P&L scale representation.
   * Persona: Dr. Rajeshwar Rao, Ph.D. — Chief Executive Officer
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'dl-executive',
    name: 'DL Executive',
    personName: 'Dr. Rajeshwar Rao, Ph.D.',
    role: 'Chief Executive Officer',
    tagline: 'Executive Leadership',
    targetRoles: 'Leadership, CXO, Director, Senior Management',
    level: 'executive',
    layout: 'dl-executive',
    ats: 'max',
    badge: 'Senior Leadership & CXO',
    headline: 'Chief Executive Officer & Board Director | Enterprise Scaling · Global P&L ($500M+) · Organizational Transformation',
    contact: {
      email: 'rajeshwar.rao@board-executive.org',
      phone: '+1 (650) 412-9850',
      location: 'Palo Alto, CA & London, UK',
      linkedin: 'linkedin.com/in/dr-rajeshwar-rao',
      website: 'rajeshwarrao-executive.com',
    },
    summary:
      'Transformational Chief Executive Officer, Independent Board Director, and Fortune 500 veteran with 22+ years driving multinational scale, corporate turnarounds, and shareholder value creation across global technology and industrial sectors. Accountable for $500M+ global P&L operations, leading 4,500+ personnel across 18 countries, and executing 14 strategic M&A acquisitions delivering $3.2B in enterprise valuation growth.',
    experience: [
      {
        title: 'Chief Executive Officer & Executive Board Director',
        company: 'OmniGlobal Industrial Technologies Group',
        location: 'Palo Alto, CA & London, UK',
        dates: '01/2018 – Present',
        bullets: [
          'Assumed CEO helm of a $540M industrial automation conglomerate; reversed 3-year revenue contraction into sustained 18% CAGR top-line growth over a 6-year operational tenure.',
          'Restructured organizational hierarchy into 4 agile business divisions, divesting non-core assets for $142M while reinvesting capital into high-margin AI/cloud predictive maintenance solutions.',
          'Expanded international revenue footprint across Western Europe, UAE, and Southeast Asia, growing offshore revenue from 24% to 58% of total group turnover.',
          'Delivered 4.2x shareholder total return (TSR), outperforming benchmark S&P Global Industrial Index by 240% and presenting quarterly performance directly to Board and activist investors.',
        ],
      },
      {
        title: 'Senior Vice President & Managing Director (Americas Division)',
        company: 'Siemens Enterprise Solutions',
        location: 'New York, NY',
        dates: '03/2012 – 12/2017',
        bullets: [
          'Governed $320M P&L and 1,800-person multi-disciplinary engineering, sales, and field operations organization across North and South America.',
          'Closed 14 multi-year enterprise contracts each exceeding $25M in total contract value (TCV) with public utilities and Fortune 100 manufacturers.',
          'Improved employee engagement index from 62% to 91% through cultural transformation, equity incentive democratization, and leadership accountability matrices.',
        ],
      },
      {
        title: 'Partner — Global Industrial & Technology Practice',
        company: 'McKinsey & Company',
        location: 'London, UK',
        dates: '09/2004 – 02/2012',
        bullets: [
          'Elected to Partnership within 6 years; advised multinational conglomerates, sovereign wealth funds, and private equity sponsors on cross-border acquisitions and corporate restructuring.',
          'Led restructuring of a 9,000-employee manufacturing conglomerate, achieving sustained profitability within 18 months.',
        ],
      },
    ],
    skills: [
      'Global Enterprise P&L ($500M+)',
      'Board & Shareholder Governance',
      'Mergers, Acquisitions & Divestitures',
      'Corporate Turnaround & Restructuring',
      'Capital Markets & PE Relations',
      'Global Supply Chain Resilience',
      'Cross-Border Regulatory & ESG',
      'Executive Succession & Talent Strategy',
      'Enterprise Commercial Strategy',
      'Strategic Debt & Equity Financing',
    ],
    education: [
      {
        degree: 'Ph.D. in Engineering Systems & Optimization',
        institution: 'Massachusetts Institute of Technology (MIT)',
        location: 'Cambridge, MA',
        year: '2004',
      },
      {
        degree: 'Master of Science in Management Science',
        institution: 'Stanford University',
        location: 'Stanford, CA',
        year: '2000',
      },
      {
        degree: 'Bachelor of Technology in Electrical Engineering (First Class with Distinction)',
        institution: 'Indian Institute of Technology (IIT) Madras',
        location: 'Chennai, India',
        year: '1998',
      },
    ],
    certs: [
      'NACD Board Leadership Fellow — National Association of Corporate Directors',
      'Corporate Director Certification — Institute of Directors (IoD)',
      'Executive Leadership Program — Harvard Business School Executive Education',
    ],
    projects: [
      {
        name: 'Independent Board Director & Audit Committee Chair',
        role: 'Horizon Clean Energy Technologies (NASDAQ: HCET)',
        impact: 'Oversee corporate audit integrity, cybersecurity risk governance, and regulatory SEC filings for $1.8B market cap public company (2020 – Present).',
      },
      {
        name: 'Dean’s Advisory Council Trustee',
        role: 'MIT School of Engineering',
        impact: 'Advise university administration on multi-disciplinary engineering curriculums, philanthropic endowment allocations, and technology spinouts.',
      },
    ],
    achievements: [
      'Named "Industrial CEO of the Year" by Global Enterprise Magazine (2021).',
      'Author of executive bestseller: "Autonomous Enterprise: Rebuilding Industrial Scale for the Cloud Age" (Harvard Business Review Press).',
    ],
    languages: [
      'English (Native / Bilingual)',
      'German (Full Professional Fluency)',
      'Telugu (Native Fluency)',
    ],
  },

  /* ══════════════════════════════════════════════════════════════════
   * 5 — DL MODERN | Modern Tech, Product, Creative, Early Career & Switchers
   * Modern, clean, ATS-compliant layout with balanced typographic rhythm.
   * Persona: Ananya Deshmukh — Full-Stack Engineer & AI Researcher
   * ══════════════════════════════════════════════════════════════════ */
  {
    id: 'dl-modern',
    name: 'DL Modern',
    personName: 'Ananya Deshmukh',
    role: 'Full-Stack Engineer & AI Researcher',
    tagline: 'Modern & Clean',
    targetRoles: 'Modern Tech, Product, Creative, Early Career & Switchers',
    level: 'entry',
    layout: 'dl-modern',
    ats: 'max',
    badge: 'Modern & High Impact',
    headline: 'Full-Stack Software Engineer & AI Researcher | React · Node.js · Python · Distributed Cloud Systems · ML Pipelines',
    contact: {
      email: 'ananya.deshmukh@alumni.cmu.edu',
      phone: '+1 (412) 683-9142',
      location: 'Pittsburgh, PA & San Jose, CA',
      github: 'github.com/ananya-deshmukh',
      website: 'ananyadeshmukh.dev',
      linkedin: 'linkedin.com/in/ananya-deshmukh',
    },
    summary:
      'High-achieving Full-Stack Software Engineer and AI Research Fellow (Carnegie Mellon MSCS graduate, GPA 3.96/4.0) with deep hands-on expertise building production-grade web applications, asynchronous backend microservices, and applied machine learning pipelines. Winner of 3 national collegiate hackathons, core open-source contributor to React developer tooling, and author of 2 peer-reviewed IEEE papers on efficient LLM inference quantization.',
    experience: [
      {
        title: 'Software Engineering Fellow (Cloud & AI DevTools)',
        company: 'Microsoft Research & Developer Tools',
        location: 'Redmond, WA',
        dates: '05/2023 – 08/2023',
        bullets: [
          'Engineered intelligent code completion extension microservice utilizing Python, ONNX Runtime, and TypeScript, serving 45,000+ internal engineering users.',
          'Implemented distributed WebSocket telemetry ingestion engine handling 12,000 events/sec with sub-5ms serialization latency using Node.js and Redis.',
          'Authored comprehensive integration test suite with Jest and Cypress, elevating automated CI/CD branch coverage from 78% to 96%.',
        ],
      },
      {
        title: 'Graduate Research Assistant — Language Technologies',
        company: 'Carnegie Mellon University (LTI)',
        location: 'Pittsburgh, PA',
        dates: '08/2022 – 05/2024',
        bullets: [
          'Developed novel 4-bit transformer weight quantization method reducing GPU memory consumption by 54% with less than 0.8% perplexity loss on open benchmarks.',
          'Built full-stack interactive model evaluation benchmark portal using React, Next.js, FastAPI, and PostgreSQL utilized by 35 university research labs globally.',
        ],
      },
      {
        title: 'Full-Stack Developer Intern',
        company: 'CloudMatrix Innovations',
        location: 'Austin, TX',
        dates: '05/2022 – 08/2022',
        bullets: [
          'Developed responsive customer onboarding dashboard using React 18, Tailwind CSS, and TanStack Query, cutting user drop-off rate by 28%.',
          'Migrated legacy monolithic Express endpoints to AWS Lambda serverless functions, decreasing monthly AWS cloud bills by 36%.',
        ],
      },
    ],
    skills: [
      'TypeScript & JavaScript',
      'Python',
      'React 18 & Next.js 14',
      'Node.js & Express',
      'PostgreSQL & MongoDB',
      'Redis & Docker',
      'AWS (S3, Lambda, EC2)',
      'FastAPI & PyTorch',
      'RESTful & GraphQL APIs',
      'Tailwind CSS',
      'Git & CI/CD Pipelines',
      'Data Structures & Algorithms',
    ],
    education: [
      {
        degree: 'Master of Science in Computer Science (Specialization in AI & Systems)',
        institution: 'Carnegie Mellon University (CMU)',
        location: 'Pittsburgh, PA',
        year: '2024',
      },
      {
        degree: 'Bachelor of Science in Computer Science (Summa Cum Laude, GPA 3.94)',
        institution: 'University of California, Berkeley',
        location: 'Berkeley, CA',
        year: '2022',
      },
    ],
    certs: [
      'AWS Certified Solutions Architect – Associate (SAA-C03)',
      'Meta Front-End Developer Professional Certificate — Coursera',
      'HackerRank Problem Solving (Advanced) Verified',
    ],
    projects: [
      {
        name: 'OmniChat AI — Real-Time Collaboration Platform',
        role: 'Full-Stack Lead Creator',
        impact: 'Multimodal collaboration portal built with React, WebSockets, FastAPI, and Pinecone vector search (2.4k GitHub Stars, 12,000 MAUs).',
      },
      {
        name: 'NeuroParse — Open-Source ATS CV Parser',
        role: 'Lead ML Developer',
        impact: 'Transformer-based Named Entity Recognition (NER) parser achieving 97.4% precision on standard resume corpora with zero OCR artifacts.',
      },
    ],
    achievements: [
      'First Place Winner — MIT HackNation (Grand Prize out of 180 teams globally, 2023).',
      'Best Paper Award — IEEE International Conference on Software Engineering (ICSE Workshop 2023).',
    ],
    languages: [
      'English (Native / Bilingual)',
      'Marathi (Native Fluency)',
      'Hindi (Full Fluency)',
      'Spanish (Elementary)',
    ],
  },
];

export const TEMPLATE_COUNT = TEMPLATES.length;

export default TEMPLATES;