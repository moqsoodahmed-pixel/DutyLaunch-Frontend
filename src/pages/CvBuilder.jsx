import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  Award,
  Globe2,
  FileText,
  Palette,
  Type,
  ShieldCheck,
  Check,
  Plus,
  Trash2,
  Printer,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Layers,
  Settings2,
  CheckCircle2,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  Share2,
  Zap,
  TrendingUp,
  FileSpreadsheet,
  Lock,
  Loader2,
  Lightbulb,
  Wand2,
} from 'lucide-react';
import { Seo } from '../components/ui/Seo.jsx';
import { Button } from '../components/ui/Button.jsx';
import { TEMPLATES } from '../data/resumeTemplates.js';
import { ResumeTemplatePreview, PAGE_W } from '../components/cv/ResumeTemplatePreview.jsx';
import { cn } from '../utils/cn.js';
import { getTemplatePricing, PaymentRequiredModal, FREE_TEMPLATE_IDS } from '../components/cv/TemplateGallery.jsx';
import { useContentProtection } from '../hooks/useContentProtection.js';
import { paymentService } from '../services/paymentService.js';
import { studioService, errMsg } from '../services/studioService.js';
import { careerService } from '../services/careerService.js';
import { useToast } from '../context/ToastContext.jsx';
import { resumeToBuilder, BUILDER_IMPORT_KEY } from '../utils/resumeToBuilder.js';
import { printResumeSheet } from '../utils/printResume.js';
import { buildTemplateData } from '../utils/templateData.js';

// Curated Recommended Skills by Template / Industry
const RECOMMENDED_SKILLS = {
  'dl-tech': {
    hard: [
      'React.js',
      'Node.js',
      'TypeScript',
      'Python',
      'Go / Golang',
      'Kubernetes',
      'AWS Cloud',
      'Docker',
      'PostgreSQL',
      'Microservices',
      'System Architecture',
      'GraphQL',
      'REST APIs',
      'Redis',
      'CI/CD Pipelines',
    ],
    tools: ['Git / GitHub', 'Terraform', 'Linux / Bash', 'Prometheus', 'Grafana', 'Jira', 'Postman', 'Docker Compose'],
    soft: ['Technical Leadership', 'Code Review', 'Agile / Scrum', 'Cross-Functional Collaboration', 'System Design Mentorship'],
  },
  'dl-professional': {
    hard: [
      'Financial Modeling',
      'P&L Management',
      'Strategic Planning',
      'Budget Forecasting',
      'Risk Assessment',
      'Business Development',
      'Market Analysis',
      'Revenue Optimization',
      'KPI Reporting',
      'Commercial Strategy',
    ],
    tools: ['Microsoft Excel (Advanced)', 'Power BI', 'Tableau', 'Salesforce CRM', 'SAP ERP', 'SQL', 'Google Analytics'],
    soft: ['Executive Presentation', 'Stakeholder Management', 'Strategic Negotiation', 'Cross-Functional Leadership', 'Client Relations'],
  },
  'dl-executive': {
    hard: [
      'Corporate Governance',
      'P&L Ownership ($50M+)',
      'Global Operations',
      'Mergers & Acquisitions (M&A)',
      'Board Reporting',
      'Enterprise Transformation',
      'Investor Relations',
      'Capital Allocation',
      'Strategic Partnerships',
    ],
    tools: ['Enterprise ERP', 'Balanced Scorecard', 'Executive BI Dashboards', 'Workday HCM'],
    soft: ['Visionary Leadership', 'Crisis Management', 'Executive Presence', 'Culture Transformation', 'Talent Succession'],
  },
  'dl-modern': {
    hard: [
      'Product Management',
      'Full-Stack Development',
      'UX/UI Design',
      'Design Systems',
      'Data Analytics',
      'Rapid Prototyping',
      'User Research',
      'API Integration',
      'Cloud Architecture',
    ],
    tools: ['Figma', 'Next.js', 'Tailwind CSS', 'GitHub', 'Notion', 'Mixpanel', 'Supabase', 'Vercel'],
    soft: ['Product Sense', 'Growth Mindset', 'Adaptability', 'Creative Problem Solving', 'Cross-Disciplinary Thinking'],
  },
  'dl-elite': {
    hard: [
      'Project Management',
      'Operations Strategy',
      'Process Optimization',
      'Data Analysis',
      'Performance Metrics',
      'Client Advisory',
      'Workflow Automation',
      'Quality Assurance',
      'Resource Planning',
    ],
    tools: ['Jira Software', 'Asana', 'Microsoft 365', 'Google Workspace', 'Slack', 'Trello'],
    soft: ['Communication', 'Time Management', 'Critical Thinking', 'Team Leadership', 'Conflict Resolution'],
  },
};

// Recommended Professional Summary Starters by Template
const RECOMMENDED_SUMMARIES = {
  'dl-tech': [
    {
      label: 'Systems & Architecture Focus',
      text: 'Innovative Staff Software Engineer with 8+ years architecting scalable cloud platforms, distributed microservices, and high-throughput systems. Proven track record of reducing p99 latency, optimizing infrastructure spend, and championing agile DevOps best practices.',
    },
    {
      label: 'Full-Stack Delivery Focus',
      text: 'Full-Stack Engineer adept at designing responsive user interfaces, performant backend APIs, and reliable database architectures. Experienced in cross-functional delivery, automated testing pipelines, and developer enablement.',
    },
  ],
  'dl-professional': [
    {
      label: 'Financial & Strategic Planning',
      text: 'Results-driven Commercial Finance & Operations Manager with 7+ years directing financial modeling, budgeting, and revenue growth initiatives. Spearheaded data-driven strategies delivering multimillion-dollar savings and improved gross margins.',
    },
    {
      label: 'Business Development & Operations',
      text: 'Strategic Operations Leader experienced in streamlining cross-departmental workflows, expanding enterprise accounts, and implementing KPI governance frameworks across fast-paced business environments.',
    },
  ],
  'dl-executive': [
    {
      label: 'CXO & General Management',
      text: 'Chief Executive Officer with 15+ years steering international expansions, board governance, and $100M+ P&L management. Track record of revitalizing corporate strategy, accelerating investor returns, and building elite leadership teams.',
    },
    {
      label: 'VP Operations & Transformation',
      text: 'Senior Vice President of Global Operations recognized for driving enterprise digital transformations, reducing operational overhead by 35%, and managing high-stakes merger integrations.',
    },
  ],
  'dl-modern': [
    {
      label: 'Modern Product & Engineering',
      text: 'Product-minded Engineer and Builder passionate about crafting intuitive user experiences, robust cloud backends, and rapid prototypes. Proven ability to bridge engineering, design, and user analytics.',
    },
  ],
  'dl-elite': [
    {
      label: 'Universal Results-Driven',
      text: 'Accomplished professional with a comprehensive background in project management, operational excellence, and stakeholder alignment. Demonstrated success delivering complex client deliverables on schedule with high satisfaction ratings.',
    },
  ],
};

// Recommended High-Impact Bullet Formulas for Work Experience
const RECOMMENDED_BULLETS = [
  'Spearheaded [initiative/project] resulting in [X]% increase in [metric/revenue] within [timeframe].',
  'Architected and deployed [system/workflow] reducing turnaround time by [X]% across [team/users].',
  'Managed [X]-member cross-functional team to deliver [major milestone] on time and under budget.',
  'Automated [manual process] saving [X] hours weekly and eliminating error rates by [Y]%.',
  'Negotiated with [vendors/partners] reducing operational overhead by $[X]K annually.',
];

// Recommended Degree Starters
const RECOMMENDED_DEGREES = [
  'Bachelor of Science (B.S.) in Computer Science',
  'Master of Business Administration (MBA)',
  'Bachelor of Technology (B.Tech) in Engineering',
  'Master of Science (M.S.) in Data Analytics',
  'Bachelor of Arts (B.A.) in Business Economics',
];

// Demo sample data (only loaded when explicitly clicking "Load Demo Data")
const DEMO_PERSONA = {
  fullName: 'Aarav N. Kapoor',
  title: 'Staff Software Architect & Systems Engineer',
  email: 'aarav.kapoor@dutyfrontier.io',
  phone: '+1 (415) 890-4219',
  location: 'San Francisco, CA (Open to Remote)',
  website: 'https://aaravkapoor.dev',
  profileImage: '',
  showPhoto: false,
  linkedin: 'linkedin.com/in/aaravnkapoor',
  github: 'github.com/aaravkapoor',
  twitter: 'twitter.com/aarav_codes',
  portfolio: 'aaravkapoor.dev/portfolio',
  summary:
    'Staff Distributed Systems Architect with 9+ years architecting fault-tolerant cloud platforms, real-time message streams, and high-throughput microservices. Spearheaded infrastructure serving 42M+ active accounts with 99.999% SLA, cutting p99 latency by 38% and lowering annual cloud spend by $1.8M.',
  experience: [
    {
      id: 'exp-1',
      title: 'Lead Distributed Systems Architect',
      company: 'Apex Global Cloud Solutions',
      location: 'San Francisco, CA',
      dates: '2021 – Present',
      bullets: [
        'Architected Kubernetes multi-region failover cluster processing 140,000 req/sec at sub-18ms p99 latency.',
        'Led 14 senior engineers in decoupling legacy monolith into 28 containerized microservices on AWS EKS and Kafka.',
        'Formulated automated chaos engineering and canary deployment frameworks, reducing production outages by 74%.',
      ],
    },
    {
      id: 'exp-2',
      title: 'Senior Software Engineer (Core Platform)',
      company: 'HyperScale Systems Inc.',
      location: 'Mountain View, CA',
      dates: '2018 – 2021',
      bullets: [
        'Engineered high-throughput event processing pipeline handling 1.2B daily messages using Kafka, Go, and Redis.',
        'Optimized PostgreSQL queries, indexing, and connection pooling, boosting query execution performance by 45%.',
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'M.S. in Computer Science',
      institution: 'Stanford University',
      location: 'Stanford, CA',
      year: '2016',
      honors: 'GPA: 3.92 / 4.0 · Dean’s Academic Excellence Award',
    },
  ],
  projects: [
    {
      id: 'prj-1',
      name: 'KubeMesh: Multi-Cluster Service Mesh Engine',
      role: 'Creator & Lead Maintainer',
      impact: 'Open-source distributed control plane with 3.8k GitHub stars; benchmarked 35% lower memory footprint than Istio.',
      link: 'github.com/aaravkapoor/kubemesh',
    },
  ],
  skills: {
    hard: ['Distributed Systems', 'Kubernetes', 'Go / Golang', 'Python', 'AWS Cloud', 'PostgreSQL', 'Microservices'],
    tools: ['Docker', 'Terraform', 'Prometheus', 'Grafana', 'Git', 'Kafka'],
    soft: ['System Architecture', 'Technical Strategy', 'Cross-Functional Leadership', 'Mentorship'],
  },
  certifications: [{ id: 'c-1', name: 'AWS Certified Solutions Architect – Professional', issuer: 'Amazon Web Services', year: '2023', credentialId: 'AWS-PSA-98214' }],
  languages: [{ id: 'l-1', name: 'English', level: 'Native / Full Professional' }, { id: 'l-2', name: 'German', level: 'Professional Working Proficiency' }],
  awards: [{ id: 'a-1', title: 'Global Engineering Excellence Award', issuer: 'Apex Global Cloud Solutions', year: '2023', description: 'Awarded for zero-downtime migration of 42M active customer accounts.' }],
  achievements: [{ id: 'ach-1', title: 'Patent: Resilient Multi-Region State Synchronization', issuer: 'USPTO #11849201', year: '2022' }],
  customSections: [],
};

const COLOR_THEMES = [
  { id: 'navy', name: 'Executive Navy', hex: '#0B1F48' },
  { id: 'azure', name: 'Azure Brand', hex: '#1D5DB8' },
  { id: 'cyan', name: 'Cyber Cyan', hex: '#0284C7' },
  { id: 'purple', name: 'Amethyst Violet', hex: '#7C3AED' },
  { id: 'slate', name: 'Charcoal Slate', hex: '#334155' },
];

const FONT_OPTIONS = [
  { id: 'sans', name: 'Modern Sans (Inter)', desc: 'Universal & highly legible' },
  { id: 'serif', name: 'Executive Serif (Georgia)', desc: 'Distinguished & classic' },
  { id: 'modern', name: 'Tech Neo (Roboto)', desc: 'Sharp & contemporary' },
];

export default function CvBuilder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTpl = searchParams.get('template') || 'dl-elite';

  // Builder configuration states
  const [templateId, setTemplateId] = useState(initialTpl);
  const [colorTheme, setColorTheme] = useState('navy');
  const [fontFamily, setFontFamily] = useState('sans');
  const [spacing, setSpacing] = useState('standard');
  const [margins, setMargins] = useState('standard');
  const [lineHeight, setLineHeight] = useState('standard');

  // ATS Options
  const [atsOptions, setAtsOptions] = useState({
    singleColumn: true,
    standardHeaders: true,
    actionVerbs: true,
    scoreMatch: 98,
  });

  // START 100% EMPTY WHEN USER CLICKS "USE TEMPLATE"
  const [personalInfo, setPersonalInfo] = useState({
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    profileImage: '',
    showPhoto: false,
  });

  const [socialLinks, setSocialLinks] = useState({
    linkedin: '',
    github: '',
    twitter: '',
    portfolio: '',
  });

  const [summary, setSummary] = useState('');
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState({ hard: [], tools: [], soft: [] });
  const [certifications, setCertifications] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [awards, setAwards] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [customSections, setCustomSections] = useState([]);

  // Paid templates: usable only after a server-verified payment.
  const { isUnlocked, isReady: ownershipReady, freeTemplateUsed, freeTemplateUsedId, unlock: refreshEntitlements } = useContentProtection({ enabled: false });
  const toast = useToast();
  const [lockedTpl, setLockedTpl] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const isLocked = (id) => getTemplatePricing({ id }, { freeTemplateUsed, freeTemplateUsedId }).isPremium && !isUnlocked(id);
  const lockedByFreeUsed = (id) =>
    Boolean(id) && freeTemplateUsed && id !== freeTemplateUsedId && getTemplatePricing({ id }, { freeTemplateUsed, freeTemplateUsedId }).isPremium;

  // Records real, server-side usage of the one-time free-template allowance
  // right before the file is handed over — see the matching function in
  // ResumeWizard.jsx for the full reasoning (not duplicated here).
  async function claimFreeTemplateIfNeeded(id) {
    if (!FREE_TEMPLATE_IDS.includes(id)) return true;
    try {
      await paymentService.consumeFreeTemplate(id);
      await refreshEntitlements();
      return true;
    } catch (err) {
      toast.error(errMsg(err, "You've already used your one free resume template."));
      setLockedTpl(TEMPLATES.find((t) => t.id === id) || null);
      return false;
    }
  }
  const chooseTemplate = (id) => {
    if (isLocked(id)) {
      setLockedTpl(TEMPLATES.find((t) => t.id === id) || null);
      return;
    }
    setTemplateId(id);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('template', id);
      return next;
    });
  };

  const chooseTemplateAfterUnlock = (id) => {
    setLockedTpl(null);
    setTemplateId(id);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('template', id);
      return next;
    });
  };

  // A paid template opened from a link: fall back to the free template and
  // offer to unlock it, once we know what this user owns.
  useEffect(() => {
    if (!ownershipReady || !isLocked(templateId)) return;
    setLockedTpl(TEMPLATES.find((t) => t.id === templateId) || null);
    setTemplateId('dl-elite');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownershipReady, templateId]);

  // "Yes, upload from my resume": the start page leaves the parsed resume
  // here for this tab; fill the form once and clear it.
  useEffect(() => {
    let data = null;
    try {
      const raw = sessionStorage.getItem(BUILDER_IMPORT_KEY);
      if (raw) {
        sessionStorage.removeItem(BUILDER_IMPORT_KEY);
        data = resumeToBuilder(JSON.parse(raw));
      }
    } catch {
      data = null;
    }
    if (!data) return;
    setPersonalInfo(data.personalInfo);
    setSocialLinks(data.socialLinks);
    setSummary(data.summary);
    setExperience(data.experience);
    setEducation(data.education);
    setProjects(data.projects);
    setSkills(data.skills);
    setCertifications(data.certifications);
    setLanguages(data.languages);
    setAwards(data.awards);
    setAchievements(data.achievements);
    setCustomSections(data.customSections);
  }, []);

  // Skill input temp state
  const [newSkillText, setNewSkillText] = useState('');
  const [activeSkillCategory, setActiveSkillCategory] = useState('hard');

  // ── AI state ──────────────────────────────────────────────────────────
  // Summary AI
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummaryItems, setAiSummaryItems] = useState([]);
  const [aiSummaryNote, setAiSummaryNote] = useState('');
  // Skills AI
  const [aiSkillsLoading, setAiSkillsLoading] = useState(false);
  const [aiSkillItems, setAiSkillItems] = useState([]);
  const [aiSkillNote, setAiSkillNote] = useState('');
  // Bullets AI — keyed by role index
  const [aiBulletsLoading, setAiBulletsLoading] = useState({});
  const [aiBulletItems, setAiBulletItems] = useState({});
  const [aiBulletNote, setAiBulletNote] = useState({});

  async function fetchAiSummary() {
    setAiSummaryLoading(true);
    setAiSummaryNote('');
    try {
      const jobTitle = personalInfo.title || experience[0]?.title || '';
      const items = await studioService.suggestions({
        kind: 'summary',
        jobTitle,
        details: {
          name: personalInfo.fullName,
          profession: personalInfo.title,
          jobs: experience.map((e) => [e.title, e.company].filter(Boolean).join(' at ')).filter(Boolean),
          education: education.map((e) => [e.degree, e.field, e.institution].filter(Boolean).join(', ')).filter(Boolean),
          skills: [...(skills.hard || []), ...(skills.tools || []), ...(skills.soft || [])],
        },
      });
      setAiSummaryItems(Array.isArray(items) ? items : items?.items || []);
      setAiSummaryNote('AI-generated from your details. Pick one and customise it.');
    } catch (err) {
      setAiSummaryNote(errMsg(err, 'AI is busy right now. Use a starter or write your own.'));
    } finally {
      setAiSummaryLoading(false);
    }
  }

  async function fetchAiSkills() {
    setAiSkillsLoading(true);
    setAiSkillNote('');
    try {
      const jobTitle = personalInfo.title || experience[0]?.title || '';
      const items = await studioService.suggestions({ kind: 'skills', jobTitle });
      setAiSkillItems(Array.isArray(items) ? items : items?.items || []);
      setAiSkillNote('AI-suggested for your job title. Click to add.');
    } catch (err) {
      setAiSkillNote(errMsg(err, 'AI is busy right now. Use the recommended skills above.'));
    } finally {
      setAiSkillsLoading(false);
    }
  }

  async function fetchAiBullets(idx) {
    setAiBulletsLoading((prev) => ({ ...prev, [idx]: true }));
    setAiBulletNote((prev) => ({ ...prev, [idx]: '' }));
    try {
      const exp = experience[idx];
      const jobTitle = exp?.title || personalInfo.title || '';
      const items = await studioService.suggestions({
        kind: 'bullets',
        jobTitle,
        details: {
          name: personalInfo.fullName,
          profession: jobTitle,
          jobs: [exp?.company].filter(Boolean),
          skills: [...(skills.hard || []), ...(skills.tools || [])],
        },
      });
      setAiBulletItems((prev) => ({ ...prev, [idx]: Array.isArray(items) ? items : items?.items || [] }));
      setAiBulletNote((prev) => ({ ...prev, [idx]: 'AI-generated bullet ideas. Click to add.' }));
    } catch (err) {
      setAiBulletNote((prev) => ({ ...prev, [idx]: errMsg(err, 'AI is busy right now. Write your own bullets.') }));
    } finally {
      setAiBulletsLoading((prev) => ({ ...prev, [idx]: false }));
    }
  }

  // ── AI FULL RESUME OPTIMIZATION ───────────────────────────────────
  // Converts builder form state → Career Intelligence resume schema
  // so the backend can analyze + rewrite the actual content.
  function builderStateToResumeSchema() {
    const p = personalInfo;
    return {
      personal: {
        name: p.fullName || '',
        headline: p.title || '',
        email: p.email || '',
        phone: p.phone || '',
        location: p.location || '',
        website: p.website || '',
        linkedin: socialLinks.linkedin || '',
      },
      summary: summary || '',
      experience: experience.map((e) => ({
        title: e.title || '',
        company: e.company || '',
        location: e.location || '',
        startDate: (e.dates || '').split(/[–—-]/)[0]?.trim() || '',
        endDate: (e.dates || '').split(/[–—-]/)[1]?.trim() === 'Present' ? '' : (e.dates || '').split(/[–—-]/)[1]?.trim() || '',
        current: (e.dates || '').toLowerCase().includes('present'),
        responsibilities: (e.bullets || []).filter(Boolean),
        achievements: [],
      })),
      education: education.map((e) => ({
        degree: (e.degree || '').split(' in ')[0] || '',
        field: (e.degree || '').split(' in ')[1] || '',
        institution: e.institution || '',
        location: e.location || '',
        endDate: e.year || '',
        highlights: e.honors ? [e.honors] : [],
      })),
      skills: {
        technical: skills.hard || [],
        tools: skills.tools || [],
        soft: skills.soft || [],
      },
      projects: projects.map((pr) => ({
        name: pr.name || '',
        role: pr.role || '',
        description: pr.impact || '',
        link: pr.link || '',
      })),
      certifications: certifications.map((c) => ({
        name: c.name || '',
        issuer: c.issuer || '',
        issueDate: c.year || '',
      })),
      languages: languages.map((l) => ({ name: l.name || '', proficiency: l.level || '' })),
      awards: awards.map((a) => a.title).filter(Boolean),
      customSections: customSections.map((cs) => ({ title: cs.title || '', items: cs.items || [] })),
    };
  }

  // Applies AI proposals that the candidate accepted/edited to builder state
  function applyProposalsToBuilderState(currentProposals, currentDecisions) {
    const decisionsMap = {};
    (currentDecisions || []).forEach((d) => { decisionsMap[d.id] = d; });

    let newSummary = summary;
    const newExperience = experience.map((e) => ({ ...e, bullets: [...(e.bullets || [])] }));

    currentProposals.forEach((proposal) => {
      const decision = decisionsMap[proposal.id];
      // Default: accept all pending (user clicked "Accept All")
      const action = decision?.action || 'accept';
      if (action === 'reject') return;

      const finalText = action === 'edit' ? (decision.text || proposal.proposed) : proposal.proposed;
      if (!finalText) return;

      if (proposal.field === 'summary') {
        newSummary = finalText;
      } else if (proposal.field === 'responsibilities' || proposal.field === 'achievements') {
        const roleIdx = proposal.roleIndex;
        if (roleIdx >= 0 && roleIdx < newExperience.length) {
          // bullets[] merges both responsibilities and achievements
          const bulletIdx = proposal.index;
          if (bulletIdx >= 0 && bulletIdx < newExperience[roleIdx].bullets.length) {
            newExperience[roleIdx].bullets[bulletIdx] = finalText;
          }
        }
      }
    });

    return { newSummary, newExperience };
  }

  // Full optimize state
  const [optimizeOpen, setOptimizeOpen] = useState(false);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [optimizeError, setOptimizeError] = useState('');
  const [proposals, setProposals] = useState([]);
  const [decisions, setDecisions] = useState({});
  const [optimizeJd, setOptimizeJd] = useState('');
  const [optimizeEngine, setOptimizeEngine] = useState('');
  const [optimizeNote, setOptimizeNote] = useState('');
  const [originalSnapshot, setOriginalSnapshot] = useState(null);
  const [approveLoading, setApproveLoading] = useState(false);
  const [approveSuccess, setApproveSuccess] = useState(false);
  // Prevent duplicate submits
  const optimizeInFlight = useRef(false);

  async function runOptimize() {
    if (optimizeInFlight.current) return;
    optimizeInFlight.current = true;
    setOptimizeLoading(true);
    setOptimizeError('');
    setProposals([]);
    setDecisions({});
    setApproveSuccess(false);

    // Snapshot the current state so "Restore Original" always works
    setOriginalSnapshot({ summary, experience: JSON.parse(JSON.stringify(experience)) });

    try {
      const resumeSchema = builderStateToResumeSchema();
      const result = await careerService.optimize({
        resume: resumeSchema,
        jobDescription: optimizeJd || undefined,
        scope: 'all',
      });
      const props = result?.proposals || [];
      setProposals(props);
      setOptimizeEngine(result?.engine || 'model');
      setOptimizeNote(result?.engineNote || '');
      if (props.length === 0) {
        setOptimizeError('No improvements were needed — your resume is already in good shape!');
      }
    } catch (err) {
      setOptimizeError(errMsg(err, 'AI optimization failed. Your original resume is unchanged.'));
    } finally {
      setOptimizeLoading(false);
      optimizeInFlight.current = false;
    }
  }

  function setDecision(id, action, text) {
    setDecisions((prev) => ({ ...prev, [id]: { id, action, ...(text !== undefined ? { text } : {}) } }));
  }

  function acceptAll() {
    const next = {};
    proposals.forEach((p) => { next[p.id] = { id: p.id, action: 'accept' }; });
    setDecisions(next);
  }

  function rejectAll() {
    const next = {};
    proposals.forEach((p) => { next[p.id] = { id: p.id, action: 'reject' }; });
    setDecisions(next);
  }

  async function approveChanges() {
    if (approveLoading) return;
    setApproveLoading(true);
    setOptimizeError('');
    try {
      const decisionsList = proposals.map((p) => decisions[p.id] || { id: p.id, action: 'accept' });
      const { newSummary, newExperience } = applyProposalsToBuilderState(proposals, decisionsList);
      setSummary(newSummary);
      setExperience(newExperience);
      setApproveSuccess(true);
      setProposals([]);
      setDecisions({});
    } catch (err) {
      setOptimizeError(errMsg(err, 'Failed to apply changes.'));
    } finally {
      setApproveLoading(false);
    }
  }

  function restoreOriginal() {
    if (!originalSnapshot) return;
    setSummary(originalSnapshot.summary);
    setExperience(originalSnapshot.experience);
    setProposals([]);
    setDecisions({});
    setApproveSuccess(false);
    setOptimizeError('');
  }

  // Accordion active sections
  const [openSections, setOpenSections] = useState({
    template: false,
    theme: false,
    ats: false,
    personal: true,
    social: false,
    summary: true,
    experience: true,
    education: true,
    projects: false,
    skills: true,
    certifications: false,
    languages: false,
    awards: false,
    custom: false,
  });

  const toggleSection = (id) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Preview zoom factor
  const [previewZoom, setPreviewZoom] = useState('fit');

  // Downloads are blocked while a paid template is not unlocked, and claim
  // the one-time free-template allowance right before handing over the file.
  const handleDownload = async () => {
    if (isLocked(templateId)) {
      setLockedTpl(TEMPLATES.find((t) => t.id === templateId) || null);
      return;
    }
    setDownloading(true);
    const ok = await claimFreeTemplateIfNeeded(templateId);
    setDownloading(false);
    if (!ok) return;
    handlePrint();
  };

  // Handle print with high-precision isolated 1-page A4 export
  const handlePrint = () => printResumeSheet(liveTemplateData.personName);

  // Explicit action to load demo data
  const handleLoadDemo = () => {
    setPersonalInfo({
      fullName: DEMO_PERSONA.fullName,
      title: DEMO_PERSONA.title,
      email: DEMO_PERSONA.email,
      phone: DEMO_PERSONA.phone,
      location: DEMO_PERSONA.location,
      website: DEMO_PERSONA.website,
      profileImage: DEMO_PERSONA.profileImage,
      showPhoto: DEMO_PERSONA.showPhoto,
    });
    setSocialLinks({
      linkedin: DEMO_PERSONA.linkedin,
      github: DEMO_PERSONA.github,
      twitter: DEMO_PERSONA.twitter,
      portfolio: DEMO_PERSONA.portfolio,
    });
    setSummary(DEMO_PERSONA.summary);
    setExperience(DEMO_PERSONA.experience);
    setEducation(DEMO_PERSONA.education);
    setProjects(DEMO_PERSONA.projects);
    setSkills(DEMO_PERSONA.skills);
    setCertifications(DEMO_PERSONA.certifications);
    setLanguages(DEMO_PERSONA.languages);
    setAwards(DEMO_PERSONA.awards);
    setAchievements(DEMO_PERSONA.achievements);
    setCustomSections(DEMO_PERSONA.customSections);
  };

  // Clear all fields
  const handleClear = () => {
    setPersonalInfo({
      fullName: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      website: '',
      profileImage: '',
      showPhoto: false,
    });
    setSocialLinks({ linkedin: '', github: '', twitter: '', portfolio: '' });
    setSummary('');
    setExperience([]);
    setEducation([]);
    setProjects([]);
    setSkills({ hard: [], tools: [], soft: [] });
    setCertifications([]);
    setLanguages([]);
    setAwards([]);
    setAchievements([]);
    setCustomSections([]);
  };

  // Dynamic live template data:
  // Left side user form inputs are empty for entering user's own data.
  // Right side live preview displays the rich template preview by default,
  // and dynamically updates with what the current user gives as they type or select options on the left.
  const liveTemplateData = useMemo(() => {
    const baseTpl = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];

    const hasUserSkills =
      (skills.hard || []).length > 0 ||
      (skills.tools || []).length > 0 ||
      (skills.soft || []).length > 0;

    const userSkillsList = [
      ...(skills.hard || []),
      ...(skills.tools || []),
      ...(skills.soft || []),
    ];

    const hasUserExperience = experience && experience.length > 0;
    const hasUserEducation = education && education.length > 0;
    const hasUserProjects = projects && projects.length > 0;
    const hasUserCerts = certifications && certifications.length > 0;
    const hasUserLanguages = languages && languages.length > 0;
    const hasUserAwards = awards && awards.length > 0;
    const hasUserAchievements = achievements && achievements.length > 0;

    return {
      ...buildTemplateData(
        baseTpl,
        { personalInfo, socialLinks, summary, experience, education, projects, skills, certifications, languages, awards, achievements, customSections },
        { style: { colorTheme, fontFamily, spacing, margins, lineHeight } }
      ),
      id: templateId,
      layout: templateId,
      name: baseTpl.name,
    };
  }, [
    templateId,
    personalInfo,
    socialLinks,
    summary,
    experience,
    education,
    projects,
    skills,
    certifications,
    languages,
    awards,
    achievements,
    customSections,
    colorTheme,
    fontFamily,
    spacing,
    margins,
    lineHeight,
  ]);

  // Handle adding skill
  const handleAddSkill = (skillText, category = activeSkillCategory) => {
    const clean = (skillText || newSkillText).trim();
    if (!clean) return;
    if ((skills[category] || []).includes(clean)) return;
    setSkills((prev) => ({
      ...prev,
      [category]: [...(prev[category] || []), clean],
    }));
    if (!skillText) setNewSkillText('');
  };

  const handleAddAllRecommendedSkills = () => {
    const rec = RECOMMENDED_SKILLS[templateId] || RECOMMENDED_SKILLS['dl-elite'];
    setSkills((prev) => ({
      hard: Array.from(new Set([...(prev.hard || []), ...(rec.hard || [])])),
      tools: Array.from(new Set([...(prev.tools || []), ...(rec.tools || [])])),
      soft: Array.from(new Set([...(prev.soft || []), ...(rec.soft || [])])),
    }));
  };

  const handleRemoveSkill = (category, idx) => {
    setSkills((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== idx),
    }));
  };

  // Recommended skills for active template
  const currentRecSkills = RECOMMENDED_SKILLS[templateId] || RECOMMENDED_SKILLS['dl-elite'];
  const currentRecSummaries = RECOMMENDED_SUMMARIES[templateId] || RECOMMENDED_SUMMARIES['dl-elite'];

  return (
    <>
      <Seo
        title="Resume Builder · DutyLaunch"
        description="Build an ATS-optimized professional resume in real-time. Split layout with live A4 document preview, instant styling, 5 flagship templates, and strict recruiter compliance."
      />

      {/* Print Specific CSS to Isolate Real A4 Page for Browser Print / PDF Export */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm !important;
          }
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            width: 210mm !important;
            height: 297mm !important;
            overflow: hidden !important;
          }
          /* Hide all surrounding layout via display:none so zero extra sheets exist */
          header, nav, footer, aside, #announcement-bar, #floating-contact, .no-print, [role="banner"], [role="navigation"], [role="contentinfo"] {
            display: none !important;
          }

          main {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: #ffffff !important;
          }
          .cv-builder-left-col, .cv-builder-subheader, .cv-preview-controls, .cv-download-card {
            display: none !important;
          }
          .cv-builder-grid {
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .cv-builder-right-col {
            position: static !important;
            width: 210mm !important;
            height: 297mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            top: auto !important;
          }
          .cv-preview-outer {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            backdrop-filter: none !important;
          }
          #cv-print-area {
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            position: static !important;
            overflow: hidden !important;
            page-break-after: avoid !important;
            page-break-inside: avoid !important;
            background: #ffffff !important;
          }
          .dl-resume-preview-box {
            height: 297mm !important;
            aspect-ratio: auto !important;
            overflow: hidden !important;
          }
          .dl-resume-a4-sheet, [data-resume-sheet="true"] {
            transform: none !important;
            width: 210mm !important;
            height: 297mm !important;
            min-height: 297mm !important;
            max-height: 297mm !important;
          }
        }
      `}</style>

      {/* Sub-Header Banner (IN NORMAL FLOW - Never overlaps with sticky Navbar) */}
      <div className="border-b border-line bg-white shadow-xs cv-builder-subheader">
        <div className="mx-auto flex max-w-[96rem] flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link
              to="/resume-builder"
              className="inline-flex items-center gap-1.5 text-small font-semibold text-slate-600 transition-all duration-[250ms] hover:text-azure hover:-translate-y-0.5"
            >
              ← Back to Resume Builder
            </Link>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded bg-azure-50 text-azure font-extrabold text-[11px]">
                DL
              </span>
              <div>
                <span className="text-small font-bold text-ink">
                  Resume Builder · <span className="text-azure">{TEMPLATES.find((t) => t.id === templateId)?.name}</span>
                </span>
                <span className="ml-2 hidden text-[11px] text-slate-500 sm:inline">
                  (Clean Start · Add Recommended Options)
                </span>
              </div>
            </div>
          </div>

          {/* Center: ATS Status Badge */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11.5px] font-semibold text-emerald-800 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>ATS Safe Standard</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-700 font-bold">Optimal Compliance</span>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2">
            {/* OPTIMIZE WITH AI — primary action */}
            <button
              type="button"
              onClick={() => { setOptimizeOpen(true); setApproveSuccess(false); }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-purple-300 bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-[12px] font-bold text-white shadow-[0_2px_12px_-2px_rgba(124,58,237,0.5)] transition-all duration-[250ms] hover:scale-[1.04] hover:-translate-y-0.5 cursor-pointer"
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>Optimize with AI</span>
            </button>

            <button
              type="button"
              onClick={handleLoadDemo}
              title="Fill with demo sample data to preview"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-slate-700 shadow-2xs transition-all duration-[250ms] hover:bg-slate-50 hover:border-slate-300 hover:scale-[1.04] cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              <span>Load Demo Data</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              title="Clear all fields"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] font-semibold text-slate-500 shadow-2xs transition-all duration-[250ms] hover:bg-red-50 hover:text-red-700 hover:border-red-200 hover:scale-[1.04] cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>

            <Button
              variant="premium"
              size="sm"
              onClick={handleDownload}
              loading={downloading}
              className="!rounded-lg shadow-[0_4px_16px_-2px_rgba(79,193,230,0.5)] transition-all duration-[250ms] hover:scale-[1.04] hover:-translate-y-0.5"
            >
              <Printer className="mr-1.5 h-3.5 w-3.5" />
              Print / Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Main Workspace Split Layout */}
      <main className="min-h-screen bg-slate-50/70 py-6">
        <div className="mx-auto max-w-[96rem] px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start cv-builder-grid">
            {/* ════════════════════════════════════════════════════════════
             * LEFT CONFIGURATION PANEL (Inputs start empty + Recommended Options)
             * ════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-4 cv-builder-left-col">
              {/* Introduction Banner with Quick Template Switcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/90 bg-white p-4 shadow-crystal backdrop-blur-md">
                <div>
                  <h2 className="text-small font-bold text-ink">Resume Editor & Recommended Options</h2>
                  <p className="text-[12px] text-slate-600">
                    Template: <span className="font-semibold text-azure">{TEMPLATES.find((t) => t.id === templateId)?.name}</span>. Click recommended options below to populate in 1 click.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleSection('template')}
                  className="w-fit rounded-lg border border-azure-300 bg-azure-50 px-2.5 py-1 text-caption font-bold text-azure hover:bg-azure hover:text-white transition-colors cursor-pointer"
                >
                  Change Template
                </button>
              </div>

              {/* ── 1. TEMPLATE SELECTOR ACCORDION ── */}
              <div className="overflow-hidden rounded-xl border border-line bg-white shadow-crystal transition-all duration-200">
                <button
                  type="button"
                  onClick={() => toggleSection('template')}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-ink hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-small">
                    <Layers className="h-4 w-4 text-azure" />
                    Flagship Template Selector ({TEMPLATES.length} Flagships)
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="rounded bg-azure-50 px-2 py-0.5 text-caption font-bold text-azure">
                      {TEMPLATES.find((t) => t.id === templateId)?.name}
                    </span>
                    {openSections.template ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>

                {openSections.template && (
                  <div className="border-t border-line p-4 space-y-3 bg-slate-50/50">
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {TEMPLATES.map((tpl) => {
                        const isSelected = templateId === tpl.id;
                        return (
                          <div
                            key={tpl.id}
                            onClick={() => chooseTemplate(tpl.id)}
                            className={cn(
                              'group relative flex flex-col justify-between rounded-xl border p-3 cursor-pointer transition-all duration-[250ms] bg-white text-left',
                              isSelected
                                ? 'border-azure ring-2 ring-azure shadow-crystal scale-[1.02]'
                                : 'border-line hover:border-azure-300 hover:shadow-xs hover:-translate-y-0.5'
                            )}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-small font-bold text-ink">{tpl.name}</span>
                              {isSelected && (
                                <span className="flex h-5 w-5 place-items-center rounded-full bg-emerald-600 text-white">
                                  <Check className="h-3 w-3 mx-auto" />
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-[11px] text-slate-500 line-clamp-1">{tpl.tagline}</p>
                            <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2 text-[10.5px]">
                              <span className="text-slate-600 font-medium">{tpl.role}</span>
                              {!getTemplatePricing(tpl, { freeTemplateUsed, freeTemplateUsedId }).isPremium ? (
                                <span className="font-semibold text-emerald-700">Free · Use →</span>
                              ) : isUnlocked(tpl.id) ? (
                                <span className="font-semibold text-azure">Unlocked · Use →</span>
                              ) : (
                                <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap font-semibold text-amber-700">
                                  <Lock className="h-3 w-3" aria-hidden /> Paid · Unlock
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ── 2. COLOR THEME, FONT & GEOMETRY ACCORDION ── */}
              <div className="overflow-hidden rounded-xl border border-line bg-white shadow-crystal transition-all duration-200">
                <button
                  type="button"
                  onClick={() => toggleSection('theme')}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-ink hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-small">
                    <Palette className="h-4 w-4 text-purple-600" />
                    Color Palette, Typography & Margins
                  </span>
                  {openSections.theme ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {openSections.theme && (
                  <div className="border-t border-line p-4 space-y-4 bg-slate-50/50">
                    {/* Color Swatches */}
                    <div>
                      <label className="text-[12px] font-bold text-slate-700 block mb-2">Accent Color Palette</label>
                      <div className="flex flex-wrap gap-2">
                        {COLOR_THEMES.map((theme) => {
                          const isSelected = colorTheme === theme.id;
                          return (
                            <button
                              key={theme.id}
                              type="button"
                              onClick={() => setColorTheme(theme.id)}
                              className={cn(
                                'flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition-all duration-[250ms] cursor-pointer hover:scale-[1.04]',
                                isSelected
                                  ? 'border-azure bg-white text-ink shadow-xs ring-1 ring-azure'
                                  : 'border-line bg-white text-slate-600 hover:border-slate-300'
                              )}
                            >
                              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: theme.hex }} />
                              {theme.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Font Selector */}
                    <div>
                      <label className="text-[12px] font-bold text-slate-700 block mb-2">Typography Font Family</label>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                        {FONT_OPTIONS.map((f) => {
                          const isSelected = fontFamily === f.id;
                          return (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setFontFamily(f.id)}
                              className={cn(
                                'rounded-lg border p-2.5 text-left transition-all duration-[250ms] cursor-pointer hover:scale-[1.03]',
                                isSelected
                                  ? 'border-azure bg-white ring-1 ring-azure shadow-xs'
                                  : 'border-line bg-white text-slate-600 hover:border-slate-300'
                              )}
                            >
                              <div className="text-[12px] font-bold text-ink">{f.name.split(' ')[0]}</div>
                              <p className="text-[10px] text-slate-500 mt-0.5">{f.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Spacing, Margins & Line Height Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-line">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Section Spacing</label>
                        <select
                          value={spacing}
                          onChange={(e) => setSpacing(e.target.value)}
                          className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-700 focus:border-azure focus:outline-none"
                        >
                          <option value="compact">Compact (Dense)</option>
                          <option value="standard">Standard (Optimal)</option>
                          <option value="relaxed">Relaxed (Spacious)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">A4 Margins</label>
                        <select
                          value={margins}
                          onChange={(e) => setMargins(e.target.value)}
                          className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-700 focus:border-azure focus:outline-none"
                        >
                          <option value="compact">Narrow (24px)</option>
                          <option value="standard">Standard (32px)</option>
                          <option value="relaxed">Comfortable (40px)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Line Height</label>
                        <select
                          value={lineHeight}
                          onChange={(e) => setLineHeight(e.target.value)}
                          className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-700 focus:border-azure focus:outline-none"
                        >
                          <option value="tight">Tight (1.35)</option>
                          <option value="standard">Standard (1.48)</option>
                          <option value="relaxed">Relaxed (1.60)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── 3. PERSONAL INFORMATION ACCORDION (STARTS EMPTY) ── */}
              <div className="overflow-hidden rounded-xl border border-line bg-white shadow-crystal transition-all duration-200">
                <button
                  type="button"
                  onClick={() => toggleSection('personal')}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-ink hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-small">
                    <User className="h-4 w-4 text-azure" />
                    Personal Information
                  </span>
                  <span className="flex items-center gap-2">
                    {personalInfo.fullName ? (
                      <span className="text-caption font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="h-3 w-3" /> {personalInfo.fullName}
                      </span>
                    ) : (
                      <span className="text-caption text-slate-400 italic">Empty</span>
                    )}
                    {openSections.personal ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>

                {openSections.personal && (
                  <div className="border-t border-line p-4 space-y-3 bg-slate-50/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Full Legal Name</label>
                        <input
                          type="text"
                          value={personalInfo.fullName}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                          placeholder="e.g. John Doe"
                          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink focus:border-azure focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Target Professional Title</label>
                        <input
                          type="text"
                          value={personalInfo.title}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, title: e.target.value })}
                          placeholder="e.g. Senior Software Architect / VP Finance"
                          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink focus:border-azure focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Email Address</label>
                        <input
                          type="email"
                          value={personalInfo.email}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                          placeholder="e.g. candidate@example.com"
                          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink focus:border-azure focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Phone Number</label>
                        <input
                          type="tel"
                          value={personalInfo.phone}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                          placeholder="e.g. +1 (555) 019-2834"
                          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink focus:border-azure focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Location / Relocation</label>
                        <input
                          type="text"
                          value={personalInfo.location}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                          placeholder="e.g. San Francisco, CA / London, UK"
                          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink focus:border-azure focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11.5px] font-bold text-slate-700 block mb-1">Portfolio / Website</label>
                        <input
                          type="url"
                          value={personalInfo.website}
                          onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                          placeholder="e.g. https://portfolio.com"
                          className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[13px] text-ink focus:border-azure focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── 4. PROFESSIONAL SUMMARY ACCORDION WITH RECOMMENDED OPTIONS ── */}
              <div className="overflow-hidden rounded-xl border border-line bg-white shadow-crystal transition-all duration-200">
                <button
                  type="button"
                  onClick={() => toggleSection('summary')}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-ink hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-small">
                    <FileText className="h-4 w-4 text-emerald-600" />
                    Professional Executive Summary
                  </span>
                  <span className="flex items-center gap-2">
                    {summary ? (
                      <span className="text-caption font-bold text-emerald-600 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Configured
                      </span>
                    ) : (
                      <span className="text-caption text-slate-400 italic">Empty</span>
                    )}
                    {openSections.summary ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>

                {openSections.summary && (
                  <div className="border-t border-line p-4 space-y-3 bg-slate-50/50">
                    {/* RECOMMENDED SUMMARY STARTERS */}
                    <div className="rounded-lg border border-azure-200 bg-azure-50/60 p-3">
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-azure-800 mb-2">
                        <Zap className="h-3.5 w-3.5 text-azure" />
                        Recommended Summary Starters for {TEMPLATES.find((t) => t.id === templateId)?.name}:
                      </div>
                      <div className="space-y-2">
                        {currentRecSummaries.map((starter, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-white/90 bg-white p-2.5 text-left transition-all duration-200 hover:border-azure hover:shadow-2xs"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-bold text-ink">{starter.label}</span>
                              <button
                                type="button"
                                onClick={() => setSummary(starter.text)}
                                className="rounded bg-azure-50 px-2 py-0.5 text-[10.5px] font-bold text-azure hover:bg-azure hover:text-white transition-colors cursor-pointer"
                              >
                                Use Starter →
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">{starter.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* AI SUMMARY GENERATOR */}
                    <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-purple-800">
                          <Wand2 className="h-3.5 w-3.5 text-purple-600" />
                          Write my summary with AI
                        </div>
                        <button
                          type="button"
                          onClick={fetchAiSummary}
                          disabled={aiSummaryLoading}
                          className="inline-flex items-center gap-1.5 rounded bg-purple-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-purple-700 transition-colors disabled:opacity-60 cursor-pointer"
                        >
                          {aiSummaryLoading ? (
                            <><Loader2 className="h-3 w-3 animate-spin" /> Generating…</>
                          ) : (
                            <><Sparkles className="h-3 w-3" /> Generate</>
                          )}
                        </button>
                      </div>
                      {aiSummaryNote && (
                        <p className={`text-[11px] mb-2 ${aiSummaryNote.includes('busy') ? 'text-red-600' : 'text-purple-700'}`}>
                          {aiSummaryNote}
                        </p>
                      )}
                      {aiSummaryItems.length > 0 && (
                        <div className="space-y-1.5">
                          {aiSummaryItems.map((item, i) => (
                            <div key={i} className="flex items-start justify-between gap-2 rounded bg-white border border-purple-100 p-2">
                              <p className="text-[11px] text-slate-700 leading-relaxed flex-1">{item}</p>
                              <button
                                type="button"
                                onClick={() => setSummary(item)}
                                className="shrink-0 rounded bg-purple-50 px-2 py-0.5 text-[10.5px] font-bold text-purple-700 hover:bg-purple-600 hover:text-white transition-colors cursor-pointer"
                              >
                                Use →
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-[11.5px] font-bold text-slate-700">Executive Narrative</label>
                      <span className="text-[11px] text-slate-500">{summary.length} characters</span>
                    </div>
                    <textarea
                      rows={4}
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      placeholder="Type your own summary, or click 'Use Starter' above, or generate with AI…"
                      className="w-full rounded-lg border border-line bg-white p-3 text-[13px] text-ink focus:border-azure focus:outline-none leading-relaxed"
                    />
                  </div>
                )}
              </div>

              {/* ── 5. SKILLS ACCORDION WITH RECOMMENDED OPTIONS ── */}
              <div className="overflow-hidden rounded-xl border border-line bg-white shadow-crystal transition-all duration-200">
                <button
                  type="button"
                  onClick={() => toggleSection('skills')}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-ink hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-small">
                    <Wrench className="h-4 w-4 text-azure" />
                    Skills & Competencies ({(skills.hard || []).length + (skills.tools || []).length + (skills.soft || []).length} Added)
                  </span>
                  {openSections.skills ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>

                {openSections.skills && (
                  <div className="border-t border-line p-4 space-y-4 bg-slate-50/50">
                    {/* RECOMMENDED SKILLS CLOUD */}
                    <div className="rounded-lg border border-azure-200 bg-azure-50/60 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-azure-800">
                          <Zap className="h-3.5 w-3.5 text-azure" />
                          Recommended Skills for {TEMPLATES.find((t) => t.id === templateId)?.name} (Click to Add):
                        </div>
                        <button
                          type="button"
                          onClick={handleAddAllRecommendedSkills}
                          className="rounded bg-azure px-2 py-0.5 text-[10.5px] font-bold text-white hover:bg-azure-600 transition-colors cursor-pointer"
                        >
                          + Add All Recommended
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {(currentRecSkills[activeSkillCategory] || currentRecSkills.hard || []).map((recSkill) => {
                          const isAlreadyAdded = (skills[activeSkillCategory] || []).includes(recSkill);
                          return (
                            <button
                              key={recSkill}
                              type="button"
                              disabled={isAlreadyAdded}
                              onClick={() => handleAddSkill(recSkill, activeSkillCategory)}
                              className={cn(
                                'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-all duration-[200ms] cursor-pointer',
                                isAlreadyAdded
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'border border-azure-300 bg-white text-azure-800 hover:bg-azure hover:text-white hover:scale-[1.04]'
                              )}
                            >
                              {isAlreadyAdded ? <Check className="h-2.5 w-2.5" /> : <Plus className="h-2.5 w-2.5" />}
                              {recSkill}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* AI SKILL SUGGESTIONS */}
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-emerald-800">
                          <Lightbulb className="h-3.5 w-3.5 text-emerald-600" />
                          More skills with AI
                        </div>
                        <button
                          type="button"
                          onClick={fetchAiSkills}
                          disabled={aiSkillsLoading}
                          className="inline-flex items-center gap-1.5 rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-60 cursor-pointer"
                        >
                          {aiSkillsLoading ? (
                            <><Loader2 className="h-3 w-3 animate-spin" /> Generating…</>
                          ) : (
                            <><Sparkles className="h-3 w-3" /> Suggest Skills</>
                          )}
                        </button>
                      </div>
                      {aiSkillNote && (
                        <p className={`text-[11px] mb-2 ${aiSkillNote.includes('busy') ? 'text-red-600' : 'text-emerald-700'}`}>
                          {aiSkillNote}
                        </p>
                      )}
                      {aiSkillItems.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {aiSkillItems.map((sk) => {
                            const isAdded = [...(skills.hard || []), ...(skills.tools || []), ...(skills.soft || [])].includes(sk);
                            return (
                              <button
                                key={sk}
                                type="button"
                                disabled={isAdded}
                                onClick={() => handleAddSkill(sk, activeSkillCategory)}
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer',
                                  isAdded
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    : 'border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-600 hover:text-white'
                                )}
                              >
                                {isAdded ? <Check className="h-2.5 w-2.5" /> : <Plus className="h-2.5 w-2.5" />}
                                {sk}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Category tabs */}
                    <div className="flex gap-2">
                      {['hard', 'tools', 'soft'].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setActiveSkillCategory(cat)}
                          className={cn(
                            'rounded-lg px-3 py-1 text-[11px] font-bold uppercase transition-colors',
                            activeSkillCategory === cat
                              ? 'bg-azure text-white'
                              : 'bg-white text-slate-600 border border-line hover:bg-slate-100'
                          )}
                        >
                          {cat === 'hard' ? 'Core Hard Skills' : cat === 'tools' ? 'Tools & Technologies' : 'Soft & Leadership'}
                        </button>
                      ))}
                    </div>

                    {/* Custom Skill Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSkillText}
                        onChange={(e) => setNewSkillText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddSkill();
                          }
                        }}
                        placeholder={`Type custom ${activeSkillCategory} skill and press enter...`}
                        className="flex-1 rounded-lg border border-line bg-white px-3 py-1.5 text-[12.5px] text-ink focus:border-azure focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSkill()}
                        className="rounded-lg bg-azure px-3 py-1.5 text-[12px] font-bold text-white hover:bg-azure-600 transition-colors cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {/* Active Selected Skill Tags */}
                    <div>
                      <div className="text-[11px] font-bold text-slate-700 mb-1.5">
                        Active {activeSkillCategory === 'hard' ? 'Core Skills' : activeSkillCategory === 'tools' ? 'Tools' : 'Soft Skills'} ({(skills[activeSkillCategory] || []).length}):
                      </div>
                      <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-white rounded-lg border border-line">
                        {(skills[activeSkillCategory] || []).length > 0 ? (
                          (skills[activeSkillCategory] || []).map((s, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-md border border-glacier-300 bg-frost-50/50 px-2 py-0.5 text-[11.5px] font-semibold text-slate-800"
                            >
                              {s}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(activeSkillCategory, idx)}
                                className="text-slate-400 hover:text-red-600 font-bold ml-0.5"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        ) : (
                          <span className="text-[11.5px] text-slate-400 italic">
                            No {activeSkillCategory} skills added yet. Click recommended skill pills above or type to add.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── 6. WORK EXPERIENCE ACCORDION WITH RECOMMENDED BULLETS ── */}
              <div className="overflow-hidden rounded-xl border border-line bg-white shadow-crystal transition-all duration-200">
                <button
                  type="button"
                  onClick={() => toggleSection('experience')}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-ink hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-small">
                    <Briefcase className="h-4 w-4 text-azure" />
                    Work Experience ({experience.length} Roles)
                  </span>
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExperience([
                          ...experience,
                          {
                            id: `exp-${Date.now()}`,
                            title: '',
                            company: '',
                            location: '',
                            dates: '',
                            bullets: [''],
                          },
                        ]);
                        setOpenSections((prev) => ({ ...prev, experience: true }));
                      }}
                      className="rounded bg-azure-50 px-2 py-0.5 text-[11px] font-bold text-azure hover:bg-azure hover:text-white transition-colors"
                    >
                      + Add Role
                    </button>
                    {openSections.experience ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>

                {openSections.experience && (
                  <div className="border-t border-line p-4 space-y-4 bg-slate-50/50">
                    {/* RECOMMENDED BULLET FORMULAS */}
                    <div className="rounded-lg border border-azure-200 bg-azure-50/60 p-3">
                      <div className="flex items-center gap-1.5 text-[12px] font-bold text-azure-800 mb-1.5">
                        <Zap className="h-3.5 w-3.5 text-azure" />
                        Recommended High-Impact Bullet Formulas (Click to insert):
                      </div>
                      <div className="space-y-1.5">
                        {RECOMMENDED_BULLETS.map((formula, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              if (experience.length === 0) {
                                setExperience([
                                  {
                                    id: `exp-${Date.now()}`,
                                    title: '',
                                    company: '',
                                    location: '',
                                    dates: '',
                                    bullets: [formula],
                                  },
                                ]);
                              } else {
                                const next = [...experience];
                                next[0].bullets.push(formula);
                                setExperience(next);
                              }
                            }}
                            className="block w-full text-left rounded border border-white/80 bg-white p-2 text-[11px] text-slate-700 hover:border-azure hover:text-azure transition-colors cursor-pointer"
                          >
                            + {formula}
                          </button>
                        ))}
                      </div>
                    </div>

                    {experience.length > 0 ? (
                      experience.map((exp, idx) => (
                        <div key={exp.id || idx} className="rounded-xl border border-line bg-white p-4 space-y-3 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-small font-bold text-ink">Role #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1"
                              title="Remove Role"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">Job Title</label>
                              <input
                                type="text"
                                placeholder="e.g. Lead Distributed Systems Architect"
                                value={exp.title}
                                onChange={(e) => {
                                  const next = [...experience];
                                  next[idx].title = e.target.value;
                                  setExperience(next);
                                }}
                                className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12.5px] text-ink focus:border-azure focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">Company / Organization</label>
                              <input
                                type="text"
                                placeholder="e.g. Apex Global Solutions"
                                value={exp.company}
                                onChange={(e) => {
                                  const next = [...experience];
                                  next[idx].company = e.target.value;
                                  setExperience(next);
                                }}
                                className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12.5px] text-ink focus:border-azure focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">Dates of Employment</label>
                              <input
                                type="text"
                                placeholder="e.g. 2021 – Present"
                                value={exp.dates}
                                onChange={(e) => {
                                  const next = [...experience];
                                  next[idx].dates = e.target.value;
                                  setExperience(next);
                                }}
                                className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12.5px] text-ink focus:border-azure focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">Location</label>
                              <input
                                type="text"
                                placeholder="e.g. San Francisco, CA"
                                value={exp.location}
                                onChange={(e) => {
                                  const next = [...experience];
                                  next[idx].location = e.target.value;
                                  setExperience(next);
                                }}
                                className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12.5px] text-ink focus:border-azure focus:outline-none"
                              />
                            </div>
                          </div>

                          {/* Bullet points */}
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              Key Achievements & Metric Bullets
                            </label>
                            <div className="space-y-2">
                              {(exp.bullets || []).map((b, bIdx) => (
                                <div key={bIdx} className="flex items-center gap-2">
                                  <span className="h-1.5 w-1.5 rounded-full bg-azure shrink-0" />
                                  <input
                                    type="text"
                                    placeholder="e.g. Architected microservices cluster boosting throughput by 40%..."
                                    value={b}
                                    onChange={(e) => {
                                      const next = [...experience];
                                      next[idx].bullets[bIdx] = e.target.value;
                                      setExperience(next);
                                    }}
                                    className="w-full rounded-lg border border-line bg-white px-2.5 py-1 text-[12px] text-ink focus:border-azure focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...experience];
                                      next[idx].bullets = next[idx].bullets.filter((_, i) => i !== bIdx);
                                      setExperience(next);
                                    }}
                                    className="text-slate-400 hover:text-red-600 p-1"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  const next = [...experience];
                                  next[idx].bullets.push('');
                                  setExperience(next);
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-azure hover:underline mt-1 cursor-pointer"
                              >
                                <Plus className="h-3 w-3" /> Add Empty Bullet
                              </button>
                            </div>

                            {/* AI BULLET IDEAS */}
                            <div className="rounded-lg border border-azure-200 bg-azure-50/50 p-2.5 mt-2">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="flex items-center gap-1 text-[11px] font-bold text-azure-800">
                                  <Wand2 className="h-3 w-3 text-azure" /> AI Bullet Ideas
                                </span>
                                <button
                                  type="button"
                                  onClick={() => fetchAiBullets(idx)}
                                  disabled={aiBulletsLoading[idx]}
                                  className="inline-flex items-center gap-1 rounded bg-azure px-2 py-0.5 text-[10.5px] font-bold text-white hover:bg-azure-600 transition-colors disabled:opacity-60 cursor-pointer"
                                >
                                  {aiBulletsLoading[idx] ? (
                                    <><Loader2 className="h-3 w-3 animate-spin" /> Generating…</>
                                  ) : (
                                    <><Sparkles className="h-3 w-3" /> Generate</>
                                  )}
                                </button>
                              </div>
                              {aiBulletNote[idx] && (
                                <p className={`text-[10.5px] mb-1.5 ${aiBulletNote[idx].includes('busy') ? 'text-red-600' : 'text-azure-700'}`}>
                                  {aiBulletNote[idx]}
                                </p>
                              )}
                              {(aiBulletItems[idx] || []).length > 0 && (
                                <div className="space-y-1">
                                  {(aiBulletItems[idx] || []).map((bullet, bi) => (
                                    <div key={bi} className="flex items-start gap-1.5 rounded bg-white border border-azure-100 p-1.5">
                                      <p className="flex-1 text-[11px] text-slate-700 leading-relaxed">{bullet}</p>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const next = [...experience];
                                          next[idx].bullets = [...(next[idx].bullets || []).filter(Boolean), bullet];
                                          setExperience(next);
                                        }}
                                        className="shrink-0 rounded bg-azure-50 px-1.5 py-0.5 text-[10px] font-bold text-azure hover:bg-azure hover:text-white transition-colors cursor-pointer"
                                      >
                                        + Add
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center bg-white">
                        <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-small font-bold text-slate-700">No Work Experience Added Yet</h4>
                        <p className="text-[12px] text-slate-500 max-w-sm mx-auto mt-1 mb-3">
                          Add your past job titles and quantified achievements, or click any recommended formula above.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setExperience([
                              {
                                id: `exp-${Date.now()}`,
                                title: '',
                                company: '',
                                location: '',
                                dates: '',
                                bullets: [''],
                              },
                            ])
                          }
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" /> Add First Role
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── 7. EDUCATION ACCORDION WITH RECOMMENDED OPTIONS ── */}
              <div className="overflow-hidden rounded-xl border border-line bg-white shadow-crystal transition-all duration-200">
                <button
                  type="button"
                  onClick={() => toggleSection('education')}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-ink hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-small">
                    <GraduationCap className="h-4 w-4 text-purple-600" />
                    Education & Academic Track ({education.length} Degrees)
                  </span>
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEducation([
                          ...education,
                          {
                            id: `edu-${Date.now()}`,
                            degree: '',
                            institution: '',
                            location: '',
                            year: '',
                            honors: '',
                          },
                        ]);
                        setOpenSections((prev) => ({ ...prev, education: true }));
                      }}
                      className="rounded bg-azure-50 px-2 py-0.5 text-[11px] font-bold text-azure hover:bg-azure hover:text-white transition-colors"
                    >
                      + Add Degree
                    </button>
                    {openSections.education ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>

                {openSections.education && (
                  <div className="border-t border-line p-4 space-y-3 bg-slate-50/50">
                    {/* RECOMMENDED DEGREE STARTERS */}
                    <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-3">
                      <div className="text-[12px] font-bold text-purple-900 mb-1.5 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-purple-600" />
                        Recommended Degree Starters (Click to add):
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {RECOMMENDED_DEGREES.map((deg, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setEducation([
                                ...education,
                                {
                                  id: `edu-${Date.now()}`,
                                  degree: deg,
                                  institution: '',
                                  location: '',
                                  year: '',
                                  honors: '',
                                },
                              ]);
                            }}
                            className="rounded-md border border-purple-200 bg-white px-2 py-1 text-[11px] font-semibold text-purple-900 hover:bg-purple-600 hover:text-white transition-all cursor-pointer"
                          >
                            + {deg}
                          </button>
                        ))}
                      </div>
                    </div>

                    {education.length > 0 ? (
                      education.map((edu, idx) => (
                        <div key={edu.id || idx} className="rounded-xl border border-line bg-white p-3.5 space-y-2.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-small font-bold text-ink">Degree #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => setEducation(education.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-red-600 p-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Degree / Major"
                              value={edu.degree}
                              onChange={(e) => {
                                const next = [...education];
                                next[idx].degree = e.target.value;
                                setEducation(next);
                              }}
                              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="University / College"
                              value={edu.institution}
                              onChange={(e) => {
                                const next = [...education];
                                next[idx].institution = e.target.value;
                                setEducation(next);
                              }}
                              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Graduation Year (e.g. 2022)"
                              value={edu.year}
                              onChange={(e) => {
                                const next = [...education];
                                next[idx].year = e.target.value;
                                setEducation(next);
                              }}
                              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Honors / GPA (e.g. First Class)"
                              value={edu.honors}
                              onChange={(e) => {
                                const next = [...education];
                                next[idx].honors = e.target.value;
                                setEducation(next);
                              }}
                              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center bg-white">
                        <GraduationCap className="h-7 w-7 text-slate-300 mx-auto mb-1.5" />
                        <h4 className="text-small font-bold text-slate-700">No Education Qualifications Added</h4>
                        <p className="text-[12px] text-slate-500 mb-2.5">Click any recommended degree above or add custom qualification.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── 8. LANGUAGES ACCORDION ── */}
              <div id="section-languages" className="overflow-hidden rounded-xl border border-line bg-white shadow-crystal transition-all duration-200">
                <button
                  type="button"
                  onClick={() => toggleSection('languages')}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-ink hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-small">
                    <Globe2 className="h-4 w-4 text-cyan-600" />
                    Languages ({languages.length})
                  </span>
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLanguages((prev) => [
                          ...prev,
                          { id: `lang-${Date.now()}`, name: '', level: 'Full Professional' },
                        ]);
                        setOpenSections((prev) => ({ ...prev, languages: true }));
                      }}
                      className="rounded bg-cyan-50 px-2 py-0.5 text-[11px] font-bold text-cyan-700 hover:bg-cyan-600 hover:text-white transition-colors cursor-pointer"
                    >
                      + Add Language
                    </button>
                    {openSections.languages ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>

                {openSections.languages && (
                  <div className="border-t border-line p-4 space-y-3 bg-slate-50/50">
                    {/* Quick Suggestions */}
                    <div className="rounded-lg border border-cyan-200 bg-cyan-50/50 p-3">
                      <div className="text-[12px] font-bold text-cyan-950 mb-1.5 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-cyan-600" />
                        <span>Quick Suggestions (Click to add):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {['English', 'Arabic', 'Hindi', 'French', 'German', 'Spanish', 'Malayalam', 'Tamil', 'Urdu', 'Russian'].map(
                          (langName) => {
                            const alreadyAdded = languages.some((l) => (l.name || '').toLowerCase() === langName.toLowerCase());
                            return (
                              <button
                                key={langName}
                                type="button"
                                disabled={alreadyAdded}
                                onClick={() => {
                                  setLanguages((prev) => [
                                    ...prev,
                                    { id: `lang-${Date.now()}`, name: langName, level: 'Full Professional' },
                                  ]);
                                }}
                                className={cn(
                                  'rounded-md border px-2 py-1 text-[11px] font-semibold transition-all cursor-pointer',
                                  alreadyAdded
                                    ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'border-cyan-200 bg-white text-cyan-900 hover:bg-cyan-600 hover:text-white'
                                )}
                              >
                                {alreadyAdded ? `✓ ${langName}` : `+ ${langName}`}
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>

                    {/* Language Cards */}
                    {languages.length > 0 ? (
                      languages.map((lang, idx) => (
                        <div key={lang.id || idx} className="rounded-xl border border-line bg-white p-3.5 space-y-2.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-small font-bold text-ink flex items-center gap-1.5">
                              <Globe2 className="h-3.5 w-3.5 text-cyan-600" />
                              <span>Language #{idx + 1}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setLanguages(languages.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                              aria-label={`Remove ${lang.name || 'language'}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Language Name</label>
                              <input
                                type="text"
                                placeholder="e.g. English, Arabic, French"
                                value={lang.name}
                                onChange={(e) => {
                                  const next = [...languages];
                                  next[idx] = { ...next[idx], name: e.target.value };
                                  setLanguages(next);
                                }}
                                className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Proficiency Level</label>
                              <select
                                value={lang.level}
                                onChange={(e) => {
                                  const next = [...languages];
                                  next[idx] = { ...next[idx], level: e.target.value };
                                  setLanguages(next);
                                }}
                                className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none cursor-pointer"
                              >
                                <option value="Native / Bilingual">Native / Bilingual</option>
                                <option value="Full Professional">Full Professional</option>
                                <option value="Professional Working">Professional Working</option>
                                <option value="Limited Working">Limited Working</option>
                                <option value="Elementary">Elementary</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center bg-white">
                        <Globe2 className="h-7 w-7 text-slate-300 mx-auto mb-1.5" />
                        <h4 className="text-small font-bold text-slate-700">No Languages Added</h4>
                        <p className="text-[12px] text-slate-500 mb-2.5">Click any recommended language above or add a custom one.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── 9. CERTIFICATIONS ACCORDION ── */}
              <div id="section-certifications" className="overflow-hidden rounded-xl border border-line bg-white shadow-crystal transition-all duration-200">
                <button
                  type="button"
                  onClick={() => toggleSection('certifications')}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-ink hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-small">
                    <Award className="h-4 w-4 text-emerald-600" />
                    Certifications ({certifications.length})
                  </span>
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCertifications((prev) => [
                          ...prev,
                          { id: `c-${Date.now()}`, name: '', issuer: '', year: '' },
                        ]);
                        setOpenSections((prev) => ({ ...prev, certifications: true }));
                      }}
                      className="rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                    >
                      + Add Certification
                    </button>
                    {openSections.certifications ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>

                {openSections.certifications && (
                  <div className="border-t border-line p-4 space-y-3 bg-slate-50/50">
                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">
                      <div className="text-[12px] font-bold text-emerald-950 mb-1.5 flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Popular Certifications:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { name: 'PMP® (Project Management Professional)', issuer: 'PMI' },
                          { name: 'AWS Certified Solutions Architect', issuer: 'AWS' },
                          { name: 'Six Sigma Green Belt', issuer: 'IASSC' },
                          { name: 'Google Cloud Professional', issuer: 'Google' },
                          { name: 'Scrum Master (CSM)', issuer: 'Scrum Alliance' },
                        ].map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => {
                              setCertifications((prev) => [
                                ...prev,
                                { id: `c-${Date.now()}`, name: c.name, issuer: c.issuer, year: new Date().getFullYear().toString() },
                              ]);
                            }}
                            className="rounded-md border border-emerald-200 bg-white px-2 py-1 text-[11px] font-semibold text-emerald-900 hover:bg-emerald-600 hover:text-white transition-all cursor-pointer"
                          >
                            + {c.name.split('(')[0]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {certifications.length > 0 ? (
                      certifications.map((cert, idx) => (
                        <div key={cert.id || idx} className="rounded-xl border border-line bg-white p-3.5 space-y-2.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-small font-bold text-ink">Certification #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => setCertifications(certifications.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Certification Name"
                              value={cert.name}
                              onChange={(e) => {
                                const next = [...certifications];
                                next[idx] = { ...next[idx], name: e.target.value };
                                setCertifications(next);
                              }}
                              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Issuing Organization"
                              value={cert.issuer}
                              onChange={(e) => {
                                const next = [...certifications];
                                next[idx] = { ...next[idx], issuer: e.target.value };
                                setCertifications(next);
                              }}
                              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Year Acquired (e.g. 2023)"
                              value={cert.year}
                              onChange={(e) => {
                                const next = [...certifications];
                                next[idx] = { ...next[idx], year: e.target.value };
                                setCertifications(next);
                              }}
                              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Credential ID / License URL (optional)"
                              value={cert.credentialId || ''}
                              onChange={(e) => {
                                const next = [...certifications];
                                next[idx] = { ...next[idx], credentialId: e.target.value };
                                setCertifications(next);
                              }}
                              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center bg-white">
                        <Award className="h-7 w-7 text-slate-300 mx-auto mb-1.5" />
                        <h4 className="text-small font-bold text-slate-700">No Certifications Added</h4>
                        <p className="text-[12px] text-slate-500 mb-2.5">Add professional credentials and licenses to stand out.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── 10. KEY PROJECTS ACCORDION ── */}
              <div id="section-projects" className="overflow-hidden rounded-xl border border-line bg-white shadow-crystal transition-all duration-200">
                <button
                  type="button"
                  onClick={() => toggleSection('projects')}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-ink hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-small">
                    <FolderGit2 className="h-4 w-4 text-azure" />
                    Key Projects ({projects.length})
                  </span>
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjects((prev) => [
                          ...prev,
                          { id: `prj-${Date.now()}`, name: '', role: '', impact: '', link: '' },
                        ]);
                        setOpenSections((prev) => ({ ...prev, projects: true }));
                      }}
                      className="rounded bg-azure-50 px-2 py-0.5 text-[11px] font-bold text-azure hover:bg-azure hover:text-white transition-colors cursor-pointer"
                    >
                      + Add Project
                    </button>
                    {openSections.projects ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>

                {openSections.projects && (
                  <div className="border-t border-line p-4 space-y-3 bg-slate-50/50">
                    {projects.length > 0 ? (
                      projects.map((prj, idx) => (
                        <div key={prj.id || idx} className="rounded-xl border border-line bg-white p-3.5 space-y-2.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-small font-bold text-ink">Project #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Project Name"
                              value={prj.name}
                              onChange={(e) => {
                                const next = [...projects];
                                next[idx] = { ...next[idx], name: e.target.value };
                                setProjects(next);
                              }}
                              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Your Role (e.g. Lead Architect)"
                              value={prj.role}
                              onChange={(e) => {
                                const next = [...projects];
                                next[idx] = { ...next[idx], role: e.target.value };
                                setProjects(next);
                              }}
                              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Demo URL or Repository (optional)"
                            value={prj.link || ''}
                            onChange={(e) => {
                              const next = [...projects];
                              next[idx] = { ...next[idx], link: e.target.value };
                              setProjects(next);
                            }}
                            className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                          />
                          <textarea
                            rows={2}
                            placeholder="Key Impact & Technologies used"
                            value={prj.impact}
                            onChange={(e) => {
                              const next = [...projects];
                              next[idx] = { ...next[idx], impact: e.target.value };
                              setProjects(next);
                            }}
                            className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center bg-white">
                        <FolderGit2 className="h-7 w-7 text-slate-300 mx-auto mb-1.5" />
                        <h4 className="text-small font-bold text-slate-700">No Projects Added</h4>
                        <p className="text-[12px] text-slate-500 mb-2.5">Showcase key initiatives, open source, or portfolio work.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── 11. AWARDS & HONORS ACCORDION ── */}
              <div id="section-awards" className="overflow-hidden rounded-xl border border-line bg-white shadow-crystal transition-all duration-200">
                <button
                  type="button"
                  onClick={() => toggleSection('awards')}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-ink hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-small">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    Awards & Honors ({awards.length})
                  </span>
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAwards((prev) => [
                          ...prev,
                          { id: `awd-${Date.now()}`, title: '', issuer: '', year: '', description: '' },
                        ]);
                        setOpenSections((prev) => ({ ...prev, awards: true }));
                      }}
                      className="rounded bg-purple-50 px-2 py-0.5 text-[11px] font-bold text-purple-700 hover:bg-purple-600 hover:text-white transition-colors cursor-pointer"
                    >
                      + Add Award
                    </button>
                    {openSections.awards ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>

                {openSections.awards && (
                  <div className="border-t border-line p-4 space-y-3 bg-slate-50/50">
                    {awards.length > 0 ? (
                      awards.map((awd, idx) => (
                        <div key={awd.id || idx} className="rounded-xl border border-line bg-white p-3.5 space-y-2.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-small font-bold text-ink">Award #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => setAwards(awards.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Award Title"
                              value={awd.title}
                              onChange={(e) => {
                                const next = [...awards];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setAwards(next);
                              }}
                              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Conferring Organization / Issuer"
                              value={awd.issuer}
                              onChange={(e) => {
                                const next = [...awards];
                                next[idx] = { ...next[idx], issuer: e.target.value };
                                setAwards(next);
                              }}
                              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Year (e.g. 2023)"
                              value={awd.year}
                              onChange={(e) => {
                                const next = [...awards];
                                next[idx] = { ...next[idx], year: e.target.value };
                                setAwards(next);
                              }}
                              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                            />
                            <input
                              type="text"
                              placeholder="Short Description"
                              value={awd.description}
                              onChange={(e) => {
                                const next = [...awards];
                                next[idx] = { ...next[idx], description: e.target.value };
                                setAwards(next);
                              }}
                              className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] text-ink focus:border-azure focus:outline-none"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center bg-white">
                        <Sparkles className="h-7 w-7 text-slate-300 mx-auto mb-1.5" />
                        <h4 className="text-small font-bold text-slate-700">No Awards Added</h4>
                        <p className="text-[12px] text-slate-500 mb-2.5">Highlight recognitions, hackathons, or company honors.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── 12. CUSTOM SECTION ACCORDION ── */}
              <div id="section-custom" className="overflow-hidden rounded-xl border border-line bg-white shadow-crystal transition-all duration-200">
                <button
                  type="button"
                  onClick={() => toggleSection('custom')}
                  className="flex w-full items-center justify-between p-4 text-left font-bold text-ink hover:bg-slate-50 transition-colors"
                >
                  <span className="flex items-center gap-2 text-small">
                    <Layers className="h-4 w-4 text-amber-600" />
                    Custom Section ({customSections.length})
                  </span>
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCustomSections((prev) => [
                          ...prev,
                          { id: `cst-${Date.now()}`, title: 'Publications & Speaking', items: [''] },
                        ]);
                        setOpenSections((prev) => ({ ...prev, custom: true }));
                      }}
                      className="rounded bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 hover:bg-amber-600 hover:text-white transition-colors cursor-pointer"
                    >
                      + Add Section
                    </button>
                    {openSections.custom ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>

                {openSections.custom && (
                  <div className="border-t border-line p-4 space-y-3 bg-slate-50/50">
                    {customSections.length > 0 ? (
                      customSections.map((sec, idx) => (
                        <div key={sec.id || idx} className="rounded-xl border border-line bg-white p-3.5 space-y-2.5 shadow-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-small font-bold text-ink">Custom Section #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => setCustomSections(customSections.filter((_, i) => i !== idx))}
                              className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <input
                            type="text"
                            placeholder="Section Title (e.g. Publications, Volunteer Work)"
                            value={sec.title}
                            onChange={(e) => {
                              const next = [...customSections];
                              next[idx] = { ...next[idx], title: e.target.value };
                              setCustomSections(next);
                            }}
                            className="w-full rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12px] font-semibold text-ink focus:border-azure focus:outline-none"
                          />
                          <div className="space-y-1.5">
                            <label className="block text-[11px] font-semibold text-slate-600">Bullet Points</label>
                            {(sec.items || ['']).map((item, itemIdx) => (
                              <div key={itemIdx} className="flex items-center gap-1.5">
                                <input
                                  type="text"
                                  placeholder={`Bullet #${itemIdx + 1}`}
                                  value={item}
                                  onChange={(e) => {
                                    const next = [...customSections];
                                    const newItems = [...(next[idx].items || [])];
                                    newItems[itemIdx] = e.target.value;
                                    next[idx] = { ...next[idx], items: newItems };
                                    setCustomSections(next);
                                  }}
                                  className="flex-1 rounded-lg border border-line bg-white px-2.5 py-1 text-[12px] text-ink focus:border-azure focus:outline-none"
                                />
                                {(sec.items || []).length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = [...customSections];
                                      next[idx] = {
                                        ...next[idx],
                                        items: next[idx].items.filter((_, i) => i !== itemIdx),
                                      };
                                      setCustomSections(next);
                                    }}
                                    className="text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const next = [...customSections];
                                next[idx] = { ...next[idx], items: [...(next[idx].items || []), ''] };
                                setCustomSections(next);
                              }}
                              className="text-[11px] font-bold text-azure hover:underline mt-1 inline-block cursor-pointer"
                            >
                              + Add Bullet
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center bg-white">
                        <Layers className="h-7 w-7 text-slate-300 mx-auto mb-1.5" />
                        <h4 className="text-small font-bold text-slate-700">No Custom Section Added</h4>
                        <p className="text-[12px] text-slate-500 mb-2.5">Create your own customized category.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── 13. RECOMMENDED ADDITIONAL SECTIONS ── */}
              <div className="rounded-xl border border-line bg-white p-4 shadow-crystal">
                <h3 className="text-small font-bold text-ink mb-2">Recommended Additional Sections</h3>
                <p className="text-[12px] text-slate-500 mb-3">Add only the extra sections relevant to your target role:</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (projects.length === 0) {
                        setProjects([{ id: `prj-${Date.now()}`, name: '', role: '', impact: '', link: '' }]);
                      }
                      setOpenSections((prev) => ({ ...prev, projects: true }));
                      setTimeout(() => {
                        document.getElementById('section-projects')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 50);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-slate-50 px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-azure hover:bg-azure-50 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-azure" /> Key Projects ({projects.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (certifications.length === 0) {
                        setCertifications([{ id: `c-${Date.now()}`, name: '', issuer: '', year: '' }]);
                      }
                      setOpenSections((prev) => ({ ...prev, certifications: true }));
                      setTimeout(() => {
                        document.getElementById('section-certifications')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 50);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-slate-50 px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-emerald-600" /> Certifications ({certifications.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (languages.length === 0) {
                        setLanguages([{ id: `lang-${Date.now()}`, name: '', level: 'Full Professional' }]);
                      }
                      setOpenSections((prev) => ({ ...prev, languages: true }));
                      setTimeout(() => {
                        document.getElementById('section-languages')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 50);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-slate-50 px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-cyan-500 hover:bg-cyan-50 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-cyan-600" /> Languages ({languages.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (awards.length === 0) {
                        setAwards([{ id: `awd-${Date.now()}`, title: '', issuer: '', year: '', description: '' }]);
                      }
                      setOpenSections((prev) => ({ ...prev, awards: true }));
                      setTimeout(() => {
                        document.getElementById('section-awards')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 50);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-slate-50 px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-purple-500 hover:bg-purple-50 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-purple-600" /> Awards & Honors ({awards.length})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (customSections.length === 0) {
                        setCustomSections([{ id: `cst-${Date.now()}`, title: 'Publications & Speaking', items: [''] }]);
                      }
                      setOpenSections((prev) => ({ ...prev, custom: true }));
                      setTimeout(() => {
                        document.getElementById('section-custom')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 50);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-line bg-slate-50 px-2.5 py-1.5 text-[12px] font-semibold text-slate-700 hover:border-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5 text-amber-600" /> Custom Section ({customSections.length})
                  </button>
                </div>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
             * RIGHT LIVE DOCUMENT PREVIEW (STICKY TOP-24 - Below Navbar)
             * Real ISO A4 Page (794px × 1123px) — NO placeholder boxes, NO fake wireframes!
             * ════════════════════════════════════════════════════════════ */}
            <div className="lg:col-span-6 xl:col-span-6 lg:sticky lg:top-24 space-y-4 cv-builder-right-col">
              {/* Preview Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/90 bg-white p-3 shadow-crystal backdrop-blur-md cv-preview-controls">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[12px] font-bold text-ink">
                    Live Preview: <span className="text-azure">{liveTemplateData.name}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Zoom Modes */}
                  <div className="inline-flex rounded-lg border border-line bg-slate-50 p-0.5 text-caption font-semibold text-slate-600">
                    <button
                      type="button"
                      onClick={() => setPreviewZoom('fit')}
                      className={cn(
                        'rounded-md px-2.5 py-1 transition-colors cursor-pointer',
                        previewZoom === 'fit' ? 'bg-white text-azure shadow-2xs font-bold' : 'hover:text-ink'
                      )}
                    >
                      Fit Width
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewZoom('100%')}
                      className={cn(
                        'rounded-md px-2.5 py-1 transition-colors cursor-pointer',
                        previewZoom === '100%' ? 'bg-white text-azure shadow-2xs font-bold' : 'hover:text-ink'
                      )}
                    >
                      100% A4
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 rounded-lg border border-azure-300 bg-azure-50 px-2.5 py-1 text-caption font-bold text-azure transition-all duration-[250ms] hover:bg-azure hover:text-white cursor-pointer"
                  >
                    <Printer className="h-3 w-3" />
                    Print
                  </button>
                </div>
              </div>

              {/* Live ISO A4 Document Container.
                  max-h + overflow-y-auto so a resume taller than one page
                  scrolls into view instead of being clipped — this preview
                  used to hard-crop at exactly one page's height with no way
                  to see or scroll to anything past that point, on screen or
                  in the printed PDF (same root cause fixed in
                  ResumeWizard.jsx's review screen; see allowOverflow below
                  and printResume.js for the matching print-side fix). */}
              <div
                className={cn(
                  'relative max-h-[85vh] overflow-y-auto rounded-2xl border border-white/80 bg-slate-200/60 p-3 sm:p-5 shadow-crystal-lg backdrop-blur-xl transition-all duration-300 cv-preview-outer',
                  previewZoom === '100%' ? 'overflow-x-auto' : ''
                )}
              >
                {/* Print Anchor Container */}
                <div
                  id="cv-print-area"
                  className="mx-auto rounded-lg shadow-2xl transition-all duration-300 bg-white"
                  style={{
                    maxWidth: previewZoom === '100%' ? `${PAGE_W}px` : '100%',
                    width: previewZoom === '100%' ? `${PAGE_W}px` : '100%',
                  }}
                >
                  <ResumeTemplatePreview template={liveTemplateData} crop={false} allowOverflow />
                </div>
              </div>

              {/* Bottom Quick-Launch Card */}
              <div className="flex items-center justify-between rounded-xl border border-white/90 bg-gradient-to-r from-azure-50/80 via-white to-aurora-100/40 p-3.5 shadow-crystal cv-download-card">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-[12px] font-semibold text-slate-700">
                    Ready to download? Prints or saves clean standard ATS PDF.
                  </span>
                </div>
                <Button
                  variant="premium"
                  size="sm"
                  onClick={handleDownload}
                  loading={downloading}
                  className="transition-all duration-[250ms] hover:scale-[1.04]"
                >
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <PaymentRequiredModal
        tpl={lockedTpl}
        open={Boolean(lockedTpl)}
        onClose={() => setLockedTpl(null)}
        reason={lockedByFreeUsed(lockedTpl?.id) ? 'free-used' : 'paid'}
        onUnlockSuccess={(tpl) => chooseTemplateAfterUnlock(tpl.id)}
      />

      {/* ════════════════════════════════════════════════════════════
       * AI OPTIMIZE PANEL — full-screen overlay modal
       * ════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {optimizeOpen && (
          <motion.div
            key="optimize-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto bg-slate-900/70 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setOptimizeOpen(false); }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 340, damping: 28 }}
              className="relative my-8 w-full max-w-3xl rounded-2xl border border-purple-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between rounded-t-2xl border-b border-purple-100 bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-white/20">
                    <Wand2 className="h-5 w-5 text-white" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-white">AI Resume Optimizer</h2>
                    <p className="text-[12px] text-purple-100">
                      Rewrites your summary and experience bullets. Facts are never changed.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOptimizeOpen(false)}
                  className="rounded-lg p-1.5 text-white/70 hover:bg-white/20 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Success banner */}
                {approveSuccess && (
                  <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-small font-bold text-emerald-800">Changes applied to your resume!</p>
                      <p className="text-[12px] text-emerald-700">
                        Your editor has been updated. Review the preview on the right — it reflects the approved changes.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setApproveSuccess(false); setOptimizeOpen(false); }}
                      className="ml-auto rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-bold text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Close & review
                    </button>
                  </div>
                )}

                {/* Job Description input */}
                {!proposals.length && !approveSuccess && (
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-slate-700">
                      Job Description <span className="font-normal text-slate-500">(optional — for targeted optimization)</span>
                    </label>
                    <textarea
                      rows={4}
                      value={optimizeJd}
                      onChange={(e) => setOptimizeJd(e.target.value)}
                      placeholder="Paste the job description here to optimize your resume for this specific role. Without it, general resume improvement is applied."
                      className="w-full rounded-lg border border-line bg-slate-50 p-3 text-[13px] text-ink focus:border-purple-400 focus:outline-none leading-relaxed resize-none"
                    />
                    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <TrendingUp className="h-4 w-4 text-amber-600 shrink-0" />
                      <p className="text-[11.5px] text-amber-800">
                        <strong>Factual accuracy is guaranteed.</strong> The AI improves wording only — it never adds employers, dates, qualifications, or metrics you have not provided.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={runOptimize}
                      disabled={optimizeLoading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-3 text-[13px] font-bold text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 transition-all duration-[250ms] hover:scale-[1.01] cursor-pointer"
                    >
                      {optimizeLoading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Analyzing and rewriting your resume…</>
                      ) : (
                        <><Sparkles className="h-4 w-4" /> Analyze &amp; Rewrite My Resume</>
                      )}
                    </button>
                  </div>
                )}

                {/* Error state */}
                {optimizeError && (
                  <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
                    <span className="text-red-500 font-bold text-sm shrink-0">⚠</span>
                    <div className="flex-1">
                      <p className="text-[12px] font-bold text-red-700">{optimizeError}</p>
                      {originalSnapshot && (
                        <button
                          type="button"
                          onClick={restoreOriginal}
                          className="mt-2 text-[11px] font-bold text-red-600 underline hover:no-underline cursor-pointer"
                        >
                          Restore original resume
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => { setOptimizeError(''); setProposals([]); }}
                      className="text-[11px] font-bold text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* Engine note (rules fallback) */}
                {optimizeNote && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <TrendingUp className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[11.5px] text-amber-800">{optimizeNote}</p>
                  </div>
                )}

                {/* Proposals review */}
                {proposals.length > 0 && !approveSuccess && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-small font-bold text-ink">
                          {proposals.length} improvement{proposals.length !== 1 ? 's' : ''} proposed
                        </h3>
                        <p className="text-[12px] text-slate-500">
                          Accept, edit or reject each change. Only accepted changes are applied.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={acceptAll}
                          className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                        >
                          ✓ Accept all
                        </button>
                        <button
                          type="button"
                          onClick={rejectAll}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          ✕ Reject all
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[420px] overflow-y-auto space-y-3 pr-1">
                      {proposals.map((proposal) => {
                        const decision = decisions[proposal.id];
                        const action = decision?.action || 'accept';
                        const isEditing = action === 'edit';
                        const editText = decision?.text ?? proposal.proposed;

                        return (
                          <div
                            key={proposal.id}
                            className={cn(
                              'rounded-xl border p-4 transition-all',
                              action === 'accept' ? 'border-emerald-200 bg-emerald-50/50' :
                              action === 'reject' ? 'border-slate-200 bg-slate-50 opacity-60' :
                              'border-indigo-200 bg-indigo-50/50'
                            )}
                          >
                            {/* Field label */}
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10.5px] font-bold uppercase tracking-wide text-slate-500">
                                {proposal.field === 'summary' ? 'Professional Summary' :
                                 `${proposal.roleIndex !== undefined ? `Role ${proposal.roleIndex + 1}` : ''} Bullet`}
                              </span>
                              {/* Accept / Edit / Reject toggle */}
                              <div className="flex gap-1">
                                {['accept', 'edit', 'reject'].map((act) => (
                                  <button
                                    key={act}
                                    type="button"
                                    onClick={() => setDecision(
                                      proposal.id, act,
                                      act === 'edit' ? editText : undefined
                                    )}
                                    className={cn(
                                      'rounded px-2 py-0.5 text-[10.5px] font-bold transition-colors cursor-pointer',
                                      action === act
                                        ? act === 'accept' ? 'bg-emerald-600 text-white'
                                          : act === 'reject' ? 'bg-slate-500 text-white'
                                          : 'bg-indigo-600 text-white'
                                        : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
                                    )}
                                  >
                                    {act === 'accept' ? '✓ Accept' : act === 'edit' ? '✎ Edit' : '✕ Reject'}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Before */}
                            <div className="mb-2">
                              <p className="text-[10.5px] font-bold text-slate-400 mb-0.5">Original</p>
                              <p className={cn('text-[12px] leading-relaxed', action === 'reject' ? 'text-slate-600' : 'text-slate-500 line-through decoration-slate-300')}>
                                {proposal.original || '(empty)'}
                              </p>
                            </div>

                            {/* After */}
                            {action !== 'reject' && (
                              <div>
                                <p className="text-[10.5px] font-bold text-emerald-700 mb-0.5">
                                  {isEditing ? 'Your edited version' : 'AI rewrite'}
                                </p>
                                {isEditing ? (
                                  <textarea
                                    rows={proposal.field === 'summary' ? 4 : 2}
                                    value={editText}
                                    onChange={(e) => setDecision(proposal.id, 'edit', e.target.value)}
                                    className="w-full rounded-lg border border-indigo-300 bg-white p-2 text-[12px] text-ink focus:border-indigo-500 focus:outline-none leading-relaxed resize-none"
                                  />
                                ) : (
                                  <p className="text-[12px] text-ink leading-relaxed font-medium">
                                    {proposal.proposed}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Reason */}
                            {proposal.reason && action !== 'reject' && (
                              <p className="mt-2 text-[10.5px] text-indigo-600 italic">
                                💡 {proposal.reason}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom action bar */}
                    <div className="flex items-center justify-between border-t border-line pt-4">
                      <div className="flex gap-2">
                        {originalSnapshot && (
                          <button
                            type="button"
                            onClick={restoreOriginal}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            ↩ Restore original
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => { setProposals([]); setDecisions({}); setOptimizeError(''); }}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          ← Re-run
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={approveChanges}
                        disabled={approveLoading}
                        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-[13px] font-bold text-white shadow-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 transition-all duration-[250ms] hover:scale-[1.02] cursor-pointer"
                      >
                        {approveLoading ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Applying…</>
                        ) : (
                          <><CheckCircle2 className="h-4 w-4" /> Apply approved changes</>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}