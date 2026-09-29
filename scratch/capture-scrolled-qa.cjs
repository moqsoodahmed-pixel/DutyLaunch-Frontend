const { spawn } = require('child_process');
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

async function capture() {
  console.log('Capturing Hero QA with updated micro-cards...');
  await runChrome([
    '--virtual-time-budget=6000',
    `--screenshot=${path.join(ARTIFACT_DIR, 'final_hero_qa_v2.png')}`,
    'http://localhost:5173/ai-resume-builder'
  ]);
  console.log('Hero captured: final_hero_qa_v2.png');

  console.log('Capturing full page of CV Builder Step 3...');
  await runChrome([
    '--virtual-time-budget=6000',
    `--screenshot=${path.join(ARTIFACT_DIR, 'final_cv_builder_step3_full.png')}`,
    'http://localhost:5173/cv-builder?path=new&band=entry'
  ], '1440,1600');
  console.log('Step 3 captured: final_cv_builder_step3_full.png');

  console.log('Capturing full page of CV Templates Gallery...');
  await runChrome([
    '--virtual-time-budget=6000',
    `--screenshot=${path.join(ARTIFACT_DIR, 'final_templates_full.png')}`,
    'http://localhost:5173/cv-templates'
  ], '1440,1600');
  console.log('Templates captured: final_templates_full.png');
}

capture().catch(console.error);
