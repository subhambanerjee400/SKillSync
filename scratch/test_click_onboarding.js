import { spawn } from 'child_process';
import fs from 'fs';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\Subham Banerjee\\.gemini\\antigravity-ide\\brain\\4fe554ce-e696-4fe5-949b-3390796dce13\\scratch\\chrome_click_test';

async function run() {
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${USER_DATA_DIR}`,
    'about:blank',
  ]);

  await sleep(1500);

  const res = await fetch('http://localhost:9222/json');
  const targets = await res.json();
  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

  let id = 1;
  const pending = new Map();
  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const curId = id++;
      pending.set(curId, { resolve, reject });
      ws.send(JSON.stringify({ id: curId, method, params }));
    });
  }

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise((r) => (ws.onopen = r));
  await send('Runtime.enable');
  await send('Page.enable');

  async function evalJs(expr) {
    const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return r.result?.value;
  }

  // Set fake logged in user without profile so onboarding opens
  await send('Page.navigate', { url: 'http://localhost:3000/onboarding' });
  await sleep(1500);

  const testUser = { id: 'test_click_user_1', email: 'clicker@test.com' };
  await evalJs(`
    localStorage.clear();
    localStorage.setItem('skillsync_user', JSON.stringify(${JSON.stringify(testUser)}));
  `);

  await send('Page.navigate', { url: 'http://localhost:3000/onboarding' });

  // Wait for profile check to finish
  let formFound = false;
  for (let i = 0; i < 30; i++) {
    const ready = await evalJs(`!document.body.innerText.includes('Checking your profile') && !!document.querySelector('form')`);
    if (ready) {
      formFound = true;
      break;
    }
    await sleep(400);
  }
  console.log('Form found:', formFound);

  // Test clicking Trade button
  const tradeClick = await evalJs(`
    (() => {
      const tradeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Trade');
      if (tradeBtn) {
        tradeBtn.click();
        return 'Clicked Trade';
      }
      return 'Trade button not found';
    })()
  `);
  console.log('Trade click result:', tradeClick);
  await sleep(1000);

  // Test clicking Wiring & Cabling
  const wiringClick = await evalJs(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Wiring'));
      if (btn) {
        btn.click();
        return 'Clicked Wiring';
      }
      return 'Wiring not found';
    })()
  `);
  console.log('Wiring click result:', wiringClick);
  await sleep(1000);

  const spanState = await evalJs(`
    (() => {
      const spans = Array.from(document.querySelectorAll('span')).map(s => s.textContent.trim());
      return spans.filter(s => s.includes('selected') || s.includes('Wiring'));
    })()
  `);
  console.log('Span state after Wiring click:', spanState);

  // Find HTML button
  const clickResult = await evalJs(`
    (() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'HTML');
      if (!btn) return 'HTML button not found';
      btn.click();
      return 'Clicked HTML';
    })()
  `);
  // Set name and location
  await evalJs(`
    (() => {
      const nameInput = document.querySelector('input[placeholder*="Alex Morgan"]');
      if (nameInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(nameInput, 'Clicker Tester');
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        nameInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      const locInput = document.querySelector('input[placeholder*="San Francisco"]');
      if (locInput) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(locInput, 'Bengaluru, India');
        locInput.dispatchEvent(new Event('input', { bubbles: true }));
        locInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    })()
  `);
  await sleep(500);

  // Click submit
  const submitRes = await evalJs(`
    (() => {
      const form = document.querySelector('form');
      const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Continue to Dashboard'));
      if (form) {
        form.requestSubmit ? form.requestSubmit(submitBtn) : form.submit();
        return 'Requested Form Submit';
      }
      return 'No form';
    })()
  `);
  console.log('Submit result:', submitRes);
  await sleep(2500);

  const afterSubmitUrl = await evalJs('window.location.href');
  console.log('After submit URL:', afterSubmitUrl);
  const bodyTextSnippet = await evalJs('document.body.innerText.slice(0, 300)');
  console.log('Body snippet:', bodyTextSnippet);

  ws.close();
  chromeProc.kill();
}

run().catch(console.error);
