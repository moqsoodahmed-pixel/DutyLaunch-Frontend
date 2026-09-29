const { spawn } = require('child_process');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\Chandubg\\.gemini\\antigravity-ide\\brain\\ac43c9a6-e637-46a4-9f58-fc90b35c1ebf';

function runChrome(args, winSize = '1440,1100') {
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
  console.log('Capturing full vertical scroll down to Work Experience & Education...');
  
  const screenshotPath = path.join(ARTIFACT_DIR, 'qa_empty_rec_experience_education.png');
  await runChrome([
    '--virtual-time-budget=6000',
    `--screenshot=${screenshotPath}`,
    'http://localhost:5173/cv-builder?template=dl-professional',
  ], '1440,2400');

  console.log('Screenshot saved to:', screenshotPath);
}

run().catch(console.error);
