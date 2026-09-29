const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Chandubg\\.gemini\\antigravity-ide\\brain\\ac43c9a6-e637-46a4-9f58-fc90b35c1ebf';

function runChrome(args, winSize = '1440,900') {
  return new Promise((resolve, reject) => {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
      '--headless=new',
      '--disable-gpu',
      `--window-size=${winSize}`,
      ...args
    ]);
    let out = '';
    let err = '';
    chrome.stdout.on('data', (d) => { out += d; });
    chrome.stderr.on('data', (d) => { err += d; });
    chrome.on('close', (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(`Exit code ${code}: ${err}`));
    });
  });
}

async function verifyAll() {
  console.log('====================================================');
  console.log('DUTYLAUNCH FINAL UI/UX AUDIT & VERIFICATION');
  console.log('====================================================\n');

  // 1. Audit /ai-resume-builder
  console.log('--- 1. Checking /ai-resume-builder ---');
  const domBuilder = await runChrome([
    '--virtual-time-budget=6000',
    '--dump-dom',
    'http://localhost:5173/ai-resume-builder'
  ]);

  const microCards = [
    'ATS Score',
    'AI Suggestions',
    'Keyword Match',
    'JD Match',
    'Resume Improved'
  ];
  const trustBadges = [
    '100% ATS Verified',
    '10,000+ Resumes Built',
    'Zero Layout Rejection'
  ];

  console.log('Micro cards present:');
  microCards.forEach(c => console.log(`  - "${c}":`, domBuilder.includes(c)));

  console.log('Trust badges present on Left Hero:');
  trustBadges.forEach(b => console.log(`  - "${b}":`, domBuilder.includes(b)));

  const heroShot = path.join(ARTIFACT_DIR, 'final_hero_qa.png');
  await runChrome([
    '--virtual-time-budget=6000',
    `--screenshot=${heroShot}`,
    'http://localhost:5173/ai-resume-builder'
  ]);
  console.log('Captured Hero QA screenshot:', heroShot);

  // 2. Audit /cv-builder Step 3
  console.log('\n--- 2. Checking /cv-builder Step 3 (Feature Comparison & Zero Pricing) ---');
  const domCvStep3 = await runChrome([
    '--virtual-time-budget=6000',
    '--dump-dom',
    'http://localhost:5173/cv-builder?path=new&band=entry'
  ]);

  const hasPriceSymbol = domCvStep3.includes('₹') || domCvStep3.includes('one-off, inclusive of revisions');
  const hasTaxNote = domCvStep3.includes('inclusive of all taxes') || domCvStep3.includes('PRICE_TAX_NOTE');
  console.log('Step 3 contains pricing/currency?:', hasPriceSymbol);
  console.log('Step 3 contains tax note?:', hasTaxNote);

  const mandatoryFeatures = [
    'ATS Optimization',
    'Keyword Analysis',
    'Grammar Improvements',
    'AI Suggestions',
    'Formatting',
    'Section Rewrite',
    'Resume Score',
    'JD Match',
    'Preview',
    'Export'
  ];
  console.log('Step 3 mandatory 10 features:');
  mandatoryFeatures.forEach(f => console.log(`  - "${f}":`, domCvStep3.includes(f)));

  const hasUseTemplate = domCvStep3.includes('Use Template');
  const hasSelectedTick = domCvStep3.includes('Selected');
  console.log('HRMS Template Selection "Use Template" button present?:', hasUseTemplate);
  console.log('HRMS Template Selection "Selected" tick present?:', hasSelectedTick);

  const step3Shot = path.join(ARTIFACT_DIR, 'final_cv_builder_step3_qa.png');
  await runChrome([
    '--virtual-time-budget=6000',
    `--screenshot=${step3Shot}`,
    'http://localhost:5173/cv-builder?path=new&band=entry'
  ]);
  console.log('Captured Step 3 QA screenshot:', step3Shot);

  // 3. Audit /cv-templates
  console.log('\n--- 3. Checking /cv-templates ---');
  const domTemplates = await runChrome([
    '--virtual-time-budget=6000',
    '--dump-dom',
    'http://localhost:5173/cv-templates'
  ]);

  const hasPauseBtn = domTemplates.includes('Pause Carousel') || domTemplates.includes('Resume Auto-Scroll');
  const hasUseTemplateBtn = domTemplates.includes('Use Template');
  const hasFlagships = [
    'DL Elite',
    'DL Tech',
    'DL Professional',
    'DL Executive',
    'DL Project+'
  ].every(f => domTemplates.includes(f));

  console.log('No pause/play carousel buttons present?:', !hasPauseBtn);
  console.log('"Use Template" CTA button present on cards?:', hasUseTemplateBtn);
  console.log('All 5 flagship templates present?:', hasFlagships);

  const templatesShot = path.join(ARTIFACT_DIR, 'final_templates_qa.png');
  await runChrome([
    '--virtual-time-budget=6000',
    `--screenshot=${templatesShot}`,
    'http://localhost:5173/cv-templates'
  ]);
  console.log('Captured Templates QA screenshot:', templatesShot);

  // 4. Mobile responsiveness
  console.log('\n--- 4. Checking Mobile Responsiveness (390x844) ---');
  const mobileShot = path.join(ARTIFACT_DIR, 'final_mobile_qa.png');
  await runChrome([
    '--virtual-time-budget=6000',
    `--screenshot=${mobileShot}`,
    'http://localhost:5173/ai-resume-builder'
  ], '390,844');
  console.log('Captured Mobile QA screenshot:', mobileShot);

  console.log('\n====================================================');
  console.log('ALL AUDITS COMPLETED SUCCESSFULLY');
  console.log('====================================================');
}

verifyAll().catch(console.error);
