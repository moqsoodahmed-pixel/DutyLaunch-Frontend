const { spawn } = require('child_process');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Chandubg\\.gemini\\antigravity-ide\\brain\\ac43c9a6-e637-46a4-9f58-fc90b35c1ebf';

function runChrome(args, winSize = '1440,900') {
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

async function capture() {
  console.log('1. Capturing Split-Layout Live Resume Builder (/cv-builder)...');
  await runChrome(
    [
      '--virtual-time-budget=6000',
      `--screenshot=${path.join(ARTIFACT_DIR, 'qa_split_layout_builder.png')}`,
      'http://localhost:5173/cv-builder',
    ],
    '1440,1100'
  );
  console.log('Saved: qa_split_layout_builder.png');

  console.log('2. Capturing AI Resume Builder Hero & Navbar (/ai-resume-builder)...');
  await runChrome(
    [
      '--virtual-time-budget=6000',
      `--screenshot=${path.join(ARTIFACT_DIR, 'qa_hero_navbar_glow.png')}`,
      'http://localhost:5173/ai-resume-builder',
    ],
    '1440,950'
  );
  console.log('Saved: qa_hero_navbar_glow.png');

  console.log('3. Capturing Templates Gallery (/cv-templates)...');
  await runChrome(
    [
      '--virtual-time-budget=6000',
      `--screenshot=${path.join(ARTIFACT_DIR, 'qa_cv_templates.png')}`,
      'http://localhost:5173/cv-templates',
    ],
    '1440,1200'
  );
  console.log('Saved: qa_cv_templates.png');
}

capture().catch(console.error);
