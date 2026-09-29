const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Chandubg\\.gemini\\antigravity-ide\\brain\\ac43c9a6-e637-46a4-9f58-fc90b35c1ebf';
const PORT = 9223;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('1. Launching Chrome headless on port ' + PORT + '...');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--window-size=1440,1100',
    'http://localhost:5173/cv-builder?template=dl-tech',
  ]);

  let targets = null;
  for (let i = 0; i < 25; i++) {
    await sleep(350);
    try {
      targets = await getJson(`http://127.0.0.1:${PORT}/json`);
      if (targets && targets.length > 0) break;
    } catch (e) {}
  }

  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve) => ws.addEventListener('open', resolve));

  let msgId = 1;
  const pending = new Map();
  ws.addEventListener('message', (event) => {
    const res = JSON.parse(event.data);
    if (res.id && pending.has(res.id)) {
      pending.get(res.id)(res);
      pending.delete(res.id);
    }
  });

  function send(method, params = {}) {
    const id = msgId++;
    return new Promise((resolve) => {
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  await send('Page.enable');
  await send('Runtime.enable');
  await sleep(1500);

  console.log('2. Verifying initial state: inputs are empty, right preview has full sample...');
  const initialDomCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const inputs = Array.from(document.querySelectorAll('input')).map(i => ({ placeholder: i.placeholder, value: i.value }));
      const hasVikramInPreview = document.body.innerText.includes('Vikramaditya Singhania');
      return {
        inputsCount: inputs.length,
        emptyInputsCount: inputs.filter(i => !i.value).length,
        hasVikramInPreview
      };
    })()`,
    returnByValue: true,
  });
  console.log('Initial state check:', initialDomCheck.result.value);

  console.log('3. Simulating user typing and clicking on left side...');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      const inputs = Array.from(document.querySelectorAll('input'));

      // 1. Type Full Legal Name
      const nameInput = inputs.find(i => i.placeholder && i.placeholder.includes('John Doe'));
      if (nameInput) {
        nativeSetter.call(nameInput, 'Chandu BG');
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // 2. Type Title
      const titleInput = inputs.find(i => i.placeholder && i.placeholder.includes('Senior Software Architect'));
      if (titleInput) {
        nativeSetter.call(titleInput, 'Staff Distributed Systems Architect');
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        titleInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // 3. Type Email
      const emailInput = inputs.find(i => i.placeholder && i.placeholder.includes('candidate@example.com'));
      if (emailInput) {
        nativeSetter.call(emailInput, 'chandu.bg@dutylaunch.com');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // 4. Click 'Use Starter ->' in Executive Summary
      const buttons = Array.from(document.querySelectorAll('button'));
      const starterBtn = buttons.find(b => b.textContent && b.textContent.includes('Use Starter'));
      if (starterBtn) starterBtn.click();

      // 5. Click '+ Add All Recommended' in Skills
      const addSkillsBtn = buttons.find(b => b.textContent && b.textContent.includes('+ Add All Recommended'));
      if (addSkillsBtn) addSkillsBtn.click();

      // 6. Scroll window back to top so header is clean and visible
      window.scrollTo(0, 0);
    })()`,
    returnByValue: true,
  });

  await sleep(1200);

  console.log('4. Checking live preview content after user input...');
  const afterInputCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const text = document.body.innerText;
      return {
        hasChandu: text.includes('Chandu BG'),
        hasTitle: text.includes('Staff Distributed Systems Architect'),
        hasEmail: text.includes('chandu.bg@dutylaunch.com'),
        hasSkillsAdded: text.includes('React.js') || text.includes('Kubernetes'),
        stillHasExperience: text.includes('Stripe Inc.') || text.includes('Staff Infrastructure Architect'),
      };
    })()`,
    returnByValue: true,
  });
  console.log('After input check:', afterInputCheck.result.value);

  console.log('5. Capturing proof screenshot qa_proof_user_typing_and_full_preview.png...');
  const shot = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = path.join(ARTIFACT_DIR, 'qa_proof_user_typing_and_full_preview.png');
  fs.writeFileSync(outPath, Buffer.from(shot.result.data, 'base64'));
  console.log('Proof screenshot saved to:', outPath);

  ws.close();
  chrome.kill();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
