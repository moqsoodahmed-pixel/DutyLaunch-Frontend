const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Chandubg\\.gemini\\antigravity-ide\\brain\\ac43c9a6-e637-46a4-9f58-fc90b35c1ebf';

function runChrome(args, winSize = '1440,950') {
  return new Promise((resolve, reject) => {
    const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
      '--headless=new',
      '--disable-gpu',
      `--window-size=${winSize}`,
      ...args,
    ]);
    let out = '';
    let err = '';
    chrome.stdout.on('data', (d) => {
      out += d;
    });
    chrome.stderr.on('data', (d) => {
      err += d;
    });
    chrome.on('close', (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(`Exit code ${code}: ${err}`));
    });
  });
}

async function run() {
  console.log('1. Checking DOM content of /cv-builder?template=dl-professional...');
  const dom = await runChrome([
    '--virtual-time-budget=6000',
    '--dump-dom',
    'http://localhost:5173/cv-builder?template=dl-professional',
  ]);

  const hasAaravInInputs = dom.includes('value="Aarav N. Kapoor"') || dom.includes('value="Staff Software Architect');
  const hasRecommendedSkills = dom.includes('Recommended Skills');
  const hasAddAllRecommended = dom.includes('+ Add All Recommended');
  const hasRecommendedSummaryStarters = dom.includes('Executive Summary Starters');
  const hasHighImpactBullets = dom.includes('Recommended High-Impact Bullets');
  const hasDegreeStarters = dom.includes('Quick-Add Degree Starters');
  const hasYourFullNamePlaceholder = dom.includes('Your Full Name');
  const hasTargetProfessionalTitlePlaceholder = dom.includes('Target Professional Title');

  console.log('--- TEST RESULTS ---');
  console.log('Form inputs pre-filled with Aarav Kapoor? :', hasAaravInInputs, '(Should be false)');
  console.log('Recommended Skills panel present?          :', hasRecommendedSkills, '(Should be true)');
  console.log('+ Add All Recommended button present?      :', hasAddAllRecommended, '(Should be true)');
  console.log('Executive Summary Starters present?        :', hasRecommendedSummaryStarters, '(Should be true)');
  console.log('High-Impact Bullet Formulas present?       :', hasHighImpactBullets, '(Should be true)');
  console.log('Degree Starters present?                   :', hasDegreeStarters, '(Should be true)');
  console.log('Preview renders "Your Full Name" placeholder:', hasYourFullNamePlaceholder, '(Should be true)');
  console.log('Preview renders Title placeholder          :', hasTargetProfessionalTitlePlaceholder, '(Should be true)');

  console.log('\n2. Capturing screenshot qa_empty_recommended_builder.png...');
  const screenshotPath = path.join(ARTIFACT_DIR, 'qa_empty_recommended_builder.png');
  await runChrome([
    '--virtual-time-budget=6000',
    `--screenshot=${screenshotPath}`,
    'http://localhost:5173/cv-builder?template=dl-professional',
  ], '1440,950');

  console.log('Screenshot saved to:', screenshotPath);
}

run().catch(console.error);
