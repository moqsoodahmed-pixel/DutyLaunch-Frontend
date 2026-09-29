const { spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\Chandubg\\.gemini\\antigravity-ide\\brain\\ac43c9a6-e637-46a4-9f58-fc90b35c1ebf';
const PORT = 9222;

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
  console.log('1. Spawning Chrome with remote debugging on port ' + PORT + '...');
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    `--remote-debugging-port=${PORT}`,
    '--window-size=1440,1050',
    'http://localhost:5173/cv-builder?template=dl-tech',
  ]);

  chrome.on('error', console.error);

  // Wait for Chrome CDP to be ready
  let targets = null;
  for (let i = 0; i < 20; i++) {
    await sleep(400);
    try {
      targets = await getJson(`http://127.0.0.1:${PORT}/json`);
      if (targets && targets.length > 0) break;
    } catch (e) {
      // waiting
    }
  }

  if (!targets || targets.length === 0) {
    chrome.kill();
    throw new Error('Chrome target not found');
  }

  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  console.log('Connected to target:', pageTarget.title, pageTarget.webSocketDebuggerUrl);

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  await new Promise((resolve) => {
    ws.addEventListener('open', resolve);
  });

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

  console.log('2. Enabling Page and Runtime...');
  await send('Page.enable');
  await send('Runtime.enable');
  await sleep(1500);

  console.log('3. Interacting with left-side form inputs: typing "Chandu BG" and selecting options...');
  const evalResult = await send('Runtime.evaluate', {
    expression: `(async () => {
      // Find Full Legal Name input
      const inputs = Array.from(document.querySelectorAll('input'));
      const nameInput = inputs.find(i => i.placeholder && i.placeholder.includes('John Doe'));
      if (nameInput) {
        // Use React 16+ setter hack so React picks up the change
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(nameInput, 'Chandu BG');
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Find Target Title input
      const titleInput = inputs.find(i => i.placeholder && i.placeholder.includes('Senior Software Architect'));
      if (titleInput) {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        nativeInputValueSetter.call(titleInput, 'Staff AI & Systems Architect');
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
        titleInput.dispatchEvent(new Event('change', { bubbles: true }));
      }

      // Find 'Use Starter ->' button for summary
      const buttons = Array.from(document.querySelectorAll('button'));
      const starterBtn = buttons.find(b => b.textContent && b.textContent.includes('Use Starter'));
      if (starterBtn) {
        starterBtn.click();
      }

      // Find '+ Add All Recommended' button for skills
      const addSkillsBtn = buttons.find(b => b.textContent && b.textContent.includes('+ Add All Recommended'));
      if (addSkillsBtn) {
        addSkillsBtn.click();
      }

      return {
        typedName: nameInput ? nameInput.value : null,
        typedTitle: titleInput ? titleInput.value : null,
      };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });

  console.log('Interaction evaluation output:', evalResult.result.value);

  // Wait 1 second for live preview to update
  await sleep(1000);

  console.log('4. Checking Live Preview on right side...');
  const previewCheck = await send('Runtime.evaluate', {
    expression: `(() => {
      const html = document.body.innerText;
      return {
        hasChanduInPreview: html.includes('Chandu BG'),
        hasTitleInPreview: html.includes('Staff AI & Systems Architect'),
        hasStripeInPreview: html.includes('Stripe Inc.') || html.includes('Amazon Web Services'),
      };
    })()`,
    returnByValue: true,
  });

  console.log('Live Preview check result:', previewCheck.result.value);

  console.log('5. Capturing screenshot of live preview updated with user input...');
  const screenshotData = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = path.join(ARTIFACT_DIR, 'qa_user_typed_live_update_proof.png');
  fs.writeFileSync(outPath, Buffer.from(screenshotData.result.data, 'base64'));
  console.log('Screenshot saved to:', outPath);

  ws.close();
  chrome.kill();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
