const { spawn } = require('child_process');
const path = require('path');

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
  console.log('--- 1. Testing /cv-builder?template=dl-tech ---');
  const domTech = await runChrome([
    '--virtual-time-budget=6000',
    '--dump-dom',
    'http://localhost:5173/cv-builder?template=dl-tech',
  ]);

  // Check left-side inputs: Must NOT have prefilled values
  const hasPrefilledNameInInput = domTech.includes('value="Vikramaditya Singhania"') || domTech.includes('value="Aarav N. Kapoor"');
  const hasPrefilledSummaryInTextarea = domTech.includes('Staff Software Architect with 9+ years') && domTech.includes('<textarea');

  // Check right-side preview: Must NOT be empty! Must show template sample persona!
  const hasTechPersonaInPreview = domTech.includes('Vikramaditya Singhania');
  const hasTechExperienceInPreview = domTech.includes('Apex Global Cloud Solutions') || domTech.includes('Principal Systems Architect');
  const hasEmptyDashedBox = domTech.includes('+ Add your work experience roles using the left configuration panel');

  console.log('Left side input has prefilled name? :', hasPrefilledNameInInput, '(Should be false)');
  console.log('Right side preview has template persona (Vikramaditya)? :', hasTechPersonaInPreview, '(Should be true)');
  console.log('Right side preview has experience? :', hasTechExperienceInPreview, '(Should be true)');
  console.log('Right side preview has dashed empty box? :', hasEmptyDashedBox, '(Should be false)');

  // Capture screenshot of initial clean state
  const initialShot = path.join(ARTIFACT_DIR, 'qa_builder_initial_empty_inputs_full_preview.png');
  await runChrome([
    '--virtual-time-budget=6000',
    `--screenshot=${initialShot}`,
    'http://localhost:5173/cv-builder?template=dl-tech',
  ], '1440,950');
  console.log('Saved initial state screenshot:', initialShot);

  console.log('\n--- 2. Testing /cv-builder?template=dl-professional ---');
  const domPro = await runChrome([
    '--virtual-time-budget=6000',
    '--dump-dom',
    'http://localhost:5173/cv-builder?template=dl-professional',
  ]);

  const hasProNameInPreview = domPro.includes('Priya S. Sundaram');
  const hasProNameInInput = domPro.includes('value="Priya S. Sundaram"');
  console.log('Pro: Left side input has prefilled name? :', hasProNameInInput, '(Should be false)');
  console.log('Pro: Right side preview has Priya S. Sundaram? :', hasProNameInPreview, '(Should be true)');

  const proShot = path.join(ARTIFACT_DIR, 'qa_builder_pro_empty_inputs_full_preview.png');
  await runChrome([
    '--virtual-time-budget=6000',
    `--screenshot=${proShot}`,
    'http://localhost:5173/cv-builder?template=dl-professional',
  ], '1440,950');
  console.log('Saved pro state screenshot:', proShot);
}

run().catch(console.error);
