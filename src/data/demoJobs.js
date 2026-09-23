/**
 * Demo job listings — a frontend copy of `demoJobs` in
 * DutyLaunch-Backend/seed/data.js, with the same slugs the Job model
 * generates (slugify(`${title} ${company}`)).
 *
 * Used ONLY as a fallback by the job detail page when the API has no record
 * for a demo slug (the live database is seeded without --with-demo-jobs).
 * Every record is titled [DEMO] and flagged isDemo so the page labels it and
 * disables applying — there is no backend job to attach an application to.
 *
 * Regenerate from the seed rather than editing by hand if the seed changes.
 */
export const DEMO_JOBS = [
  {
    "_id": "demo-job-1",
    "slug": "demo-business-analyst-sample-employer-pvt-ltd",
    "title": "[DEMO] Business Analyst",
    "company": "Sample Employer Pvt Ltd",
    "location": "Bengaluru, Karnataka",
    "country": "India",
    "category": "Data & Analytics",
    "jobType": "Full-time",
    "workMode": "Hybrid",
    "experience": {
      "min": 2,
      "max": 5
    },
    "salary": {
      "min": 900000,
      "max": 1400000,
      "currency": "INR",
      "period": "year",
      "disclosed": true
    },
    "skills": [
      "SQL",
      "Excel",
      "Power BI",
      "Stakeholder management"
    ],
    "description": "DEMO RECORD — seeded for development only. Replace with real listings before launch. A business analyst role working with commercial teams to define reporting requirements and deliver analysis.",
    "responsibilities": [
      "Gather and document requirements",
      "Build and maintain reporting",
      "Present findings to commercial stakeholders"
    ],
    "requirements": [
      "2+ years in an analyst role",
      "Strong SQL",
      "Comfortable presenting to non-technical audiences"
    ],
    "status": "published",
    "isFeatured": true,
    "isDemo": true,
    "publishedAt": "2026-09-01T00:00:00.000Z"
  },
  {
    "_id": "demo-job-2",
    "slug": "demo-digital-marketing-executive-sample-employer-pvt-ltd",
    "title": "[DEMO] Digital Marketing Executive",
    "company": "Sample Employer Pvt Ltd",
    "location": "Dubai",
    "country": "United Arab Emirates",
    "category": "Digital Marketing",
    "jobType": "Full-time",
    "workMode": "On-site",
    "experience": {
      "min": 3,
      "max": 6
    },
    "salary": {
      "min": 12000,
      "max": 16000,
      "currency": "AED",
      "period": "month",
      "disclosed": true
    },
    "skills": [
      "Paid social",
      "Google Ads",
      "Analytics",
      "Copywriting"
    ],
    "description": "DEMO RECORD — seeded for development only. Replace with real listings before launch. Campaign planning and execution across paid and organic channels for a regional brand.",
    "responsibilities": [
      "Plan and run paid campaigns",
      "Own channel reporting",
      "Work with agency partners"
    ],
    "requirements": [
      "3+ years in performance marketing",
      "Hands-on with major ad platforms",
      "GCC market experience preferred"
    ],
    "status": "published",
    "isDemo": true,
    "publishedAt": "2026-09-01T00:00:00.000Z"
  },
  {
    "_id": "demo-job-3",
    "slug": "demo-registered-nurse-sample-healthcare-group",
    "title": "[DEMO] Registered Nurse",
    "company": "Sample Healthcare Group",
    "location": "Abu Dhabi",
    "country": "United Arab Emirates",
    "category": "Healthcare",
    "jobType": "Full-time",
    "workMode": "On-site",
    "experience": {
      "min": 2,
      "max": 8
    },
    "salary": {
      "disclosed": false,
      "currency": "AED",
      "period": "month"
    },
    "skills": [
      "Patient care",
      "Clinical documentation"
    ],
    "description": "DEMO RECORD — seeded for development only. Replace with real listings before launch. Ward-based nursing role with licensing support for overseas candidates.",
    "responsibilities": [
      "Deliver patient care to protocol",
      "Maintain clinical records"
    ],
    "requirements": [
      "Nursing degree",
      "Home-country registration",
      "Attested certificates"
    ],
    "status": "published",
    "isDemo": true,
    "publishedAt": "2026-09-01T00:00:00.000Z"
  },
  {
    "_id": "demo-job-4",
    "slug": "demo-software-engineer-backend-sample-tech-labs",
    "title": "[DEMO] Software Engineer (Backend)",
    "company": "Sample Tech Labs",
    "location": "Remote — India",
    "country": "India",
    "category": "Technology",
    "jobType": "Remote",
    "workMode": "Remote",
    "experience": {
      "min": 3,
      "max": 7
    },
    "salary": {
      "min": 1800000,
      "max": 2800000,
      "currency": "INR",
      "period": "year",
      "disclosed": true
    },
    "skills": [
      "Node.js",
      "MongoDB",
      "REST APIs",
      "AWS"
    ],
    "description": "DEMO RECORD — seeded for development only. Replace with real listings before launch. Backend engineering on a distributed services platform.",
    "responsibilities": [
      "Design and ship backend services",
      "Own reliability of your services",
      "Review peers' code"
    ],
    "requirements": [
      "3+ years backend experience",
      "Strong Node.js and database fundamentals"
    ],
    "status": "published",
    "isFeatured": true,
    "isDemo": true,
    "publishedAt": "2026-09-01T00:00:00.000Z"
  },
  {
    "_id": "demo-job-5",
    "slug": "demo-hr-business-partner-aurora-fintech-pvt-ltd",
    "title": "[DEMO] HR Business Partner",
    "company": "Aurora Fintech Pvt Ltd",
    "location": "Bengaluru, Karnataka",
    "country": "India",
    "category": "Human Resources",
    "jobType": "Full-time",
    "workMode": "Hybrid",
    "experience": {
      "min": 4,
      "max": 9
    },
    "salary": {
      "min": 1200000,
      "max": 1900000,
      "currency": "INR",
      "period": "year",
      "disclosed": true
    },
    "skills": [
      "HRBP",
      "Performance management",
      "Employee relations",
      "HRIS"
    ],
    "description": "DEMO RECORD — seeded for development only. Replace with real listings before launch. HRBP role partnering with engineering and product leadership on hiring, performance cycles and retention.",
    "responsibilities": [
      "Partner with department heads on people plans",
      "Run performance review cycles",
      "Own employee relations casework"
    ],
    "requirements": [
      "4+ years as an HRBP or generalist",
      "Comfortable advising senior stakeholders"
    ],
    "status": "published",
    "isDemo": true,
    "publishedAt": "2026-09-01T00:00:00.000Z"
  },
  {
    "_id": "demo-job-6",
    "slug": "demo-supply-chain-coordinator-bluepeak-logistics-fze",
    "title": "[DEMO] Supply Chain Coordinator",
    "company": "BluePeak Logistics FZE",
    "location": "Dubai",
    "country": "United Arab Emirates",
    "category": "Logistics & Supply Chain",
    "jobType": "Full-time",
    "workMode": "On-site",
    "experience": {
      "min": 1,
      "max": 4
    },
    "salary": {
      "min": 7000,
      "max": 10000,
      "currency": "AED",
      "period": "month",
      "disclosed": true
    },
    "skills": [
      "Freight coordination",
      "ERP systems",
      "Vendor management"
    ],
    "description": "DEMO RECORD — seeded for development only. Replace with real listings before launch. Coordinating inbound and outbound freight for a regional distribution business.",
    "responsibilities": [
      "Track shipments end to end",
      "Liaise with freight forwarders and customs agents",
      "Maintain inventory accuracy in the ERP"
    ],
    "requirements": [
      "1+ years in logistics or supply chain",
      "Working knowledge of an ERP system"
    ],
    "status": "published",
    "isDemo": true,
    "publishedAt": "2026-09-01T00:00:00.000Z"
  },
  {
    "_id": "demo-job-7",
    "slug": "demo-retail-store-manager-zenith-retail-group",
    "title": "[DEMO] Retail Store Manager",
    "company": "Zenith Retail Group",
    "location": "Chennai, Tamil Nadu",
    "country": "India",
    "category": "Retail",
    "jobType": "Full-time",
    "workMode": "On-site",
    "experience": {
      "min": 3,
      "max": 8
    },
    "salary": {
      "min": 600000,
      "max": 900000,
      "currency": "INR",
      "period": "year",
      "disclosed": true
    },
    "skills": [
      "Store operations",
      "Team leadership",
      "Inventory management",
      "P&L ownership"
    ],
    "description": "DEMO RECORD — seeded for development only. Replace with real listings before launch. Running day-to-day operations for a high-footfall retail location.",
    "responsibilities": [
      "Own store P&L and shrinkage targets",
      "Hire, train and roster store staff",
      "Drive footfall-to-conversion initiatives"
    ],
    "requirements": [
      "3+ years managing a retail team",
      "Comfortable owning store-level P&L"
    ],
    "status": "published",
    "isDemo": true,
    "publishedAt": "2026-09-01T00:00:00.000Z"
  },
  {
    "_id": "demo-job-8",
    "slug": "demo-management-consultant-meridian-consulting-group",
    "title": "[DEMO] Management Consultant",
    "company": "Meridian Consulting Group",
    "location": "Mumbai, Maharashtra",
    "country": "India",
    "category": "Consulting",
    "jobType": "Full-time",
    "workMode": "Hybrid",
    "experience": {
      "min": 2,
      "max": 6
    },
    "salary": {
      "min": 1400000,
      "max": 2200000,
      "currency": "INR",
      "period": "year",
      "disclosed": true
    },
    "skills": [
      "Market analysis",
      "Client presentations",
      "Financial modelling"
    ],
    "description": "DEMO RECORD — seeded for development only. Replace with real listings before launch. Client-facing consulting role across strategy and operations engagements.",
    "responsibilities": [
      "Build client-ready analysis and models",
      "Support engagement leads on delivery",
      "Present findings directly to client stakeholders"
    ],
    "requirements": [
      "2+ years in consulting or a related analytical role",
      "Strong Excel and presentation skills"
    ],
    "status": "published",
    "isFeatured": true,
    "isDemo": true,
    "publishedAt": "2026-09-01T00:00:00.000Z"
  },
  {
    "_id": "demo-job-9",
    "slug": "demo-front-office-manager-skyline-hospitality-fze",
    "title": "[DEMO] Front Office Manager",
    "company": "Skyline Hospitality FZE",
    "location": "Abu Dhabi",
    "country": "United Arab Emirates",
    "category": "Hospitality",
    "jobType": "Full-time",
    "workMode": "On-site",
    "experience": {
      "min": 3,
      "max": 7
    },
    "salary": {
      "min": 8000,
      "max": 11000,
      "currency": "AED",
      "period": "month",
      "disclosed": true
    },
    "skills": [
      "Guest relations",
      "PMS systems",
      "Team scheduling"
    ],
    "description": "DEMO RECORD — seeded for development only. Replace with real listings before launch. Leading the front-office team at a mid-size hotel property.",
    "responsibilities": [
      "Manage front-desk rostering and standards",
      "Resolve escalated guest issues",
      "Report occupancy and revenue metrics upward"
    ],
    "requirements": [
      "3+ years in hotel front-office operations",
      "Experience with a property management system"
    ],
    "status": "published",
    "isDemo": true,
    "publishedAt": "2026-09-01T00:00:00.000Z"
  },
  {
    "_id": "demo-job-10",
    "slug": "demo-qa-automation-engineer-novacore-systems",
    "title": "[DEMO] QA Automation Engineer",
    "company": "NovaCore Systems",
    "location": "Remote — India",
    "country": "India",
    "category": "Technology",
    "jobType": "Remote",
    "workMode": "Remote",
    "experience": {
      "min": 2,
      "max": 5
    },
    "salary": {
      "min": 1000000,
      "max": 1600000,
      "currency": "INR",
      "period": "year",
      "disclosed": true
    },
    "skills": [
      "Playwright",
      "CI/CD",
      "API testing",
      "JavaScript"
    ],
    "description": "DEMO RECORD — seeded for development only. Replace with real listings before launch. Building and maintaining automated test suites across a web platform.",
    "responsibilities": [
      "Write and maintain end-to-end test suites",
      "Wire tests into CI/CD",
      "Triage flaky tests and pipeline failures"
    ],
    "requirements": [
      "2+ years in test automation",
      "Comfortable in a CI/CD pipeline"
    ],
    "status": "published",
    "isDemo": true,
    "publishedAt": "2026-09-01T00:00:00.000Z"
  }
];

export function findDemoJob(idOrSlug) {
  return DEMO_JOBS.find((j) => j.slug === idOrSlug || j._id === idOrSlug) || null;
}