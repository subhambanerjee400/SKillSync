import { spawn } from 'child_process';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\Subham Banerjee\\.gemini\\antigravity-ide\\brain\\chrome_debug_widths';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--window-size=375,812',
    '--remote-debugging-port=9225',
    `--user-data-dir=${USER_DATA_DIR}`,
    'about:blank',
  ]);

  await sleep(1500);
  const res = await fetch('http://localhost:9225/json');
  const targets = await res.json();
  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let msgId = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pending.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
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
  await send('DOM.enable');

  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true,
  });

  // Setup mock session
  const mockUser = {
    id: 'usr_debug_375',
    email: 'debug@skillsync.test',
    user_metadata: { full_name: 'Debug User', role: 'user' },
  };
  const mockProfile = {
    id: 'usr_debug_375',
    name: 'Debug User',
    email: 'debug@skillsync.test',
    role: 'Frontend Developer',
    segment: 'Software',
    location: 'San Francisco, CA',
  };
  const mockSkills = ['HTML', 'CSS', 'JavaScript'];

  await send('Page.navigate', { url: 'http://localhost:3000/login' });
  await sleep(1000);

  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('skillsync_user', JSON.stringify(${JSON.stringify(mockUser)}));
      localStorage.setItem('skillsync_profile_${mockUser.id}', JSON.stringify(${JSON.stringify(mockProfile)}));
      localStorage.setItem('skillsync_skills_${mockUser.id}', JSON.stringify(${JSON.stringify(mockSkills)}));
      localStorage.setItem('skillsync_accounts', JSON.stringify({ [${JSON.stringify(mockUser.id)}]: 'user' }));
    `,
  });

  await send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
  await sleep(3000);

  const debugInfo = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const root = document.documentElement;
        const body = document.body;

        // Check media query match
        const matches860 = window.matchMedia('(max-width: 860px)').matches;
        const matches768 = window.matchMedia('(max-width: 768px)').matches;
        const matches520 = window.matchMedia('(max-width: 520px)').matches;

        // Find all elements wider than 375px
        const wideElements = [];
        for (const el of document.querySelectorAll('*')) {
          const rect = el.getBoundingClientRect();
          const comp = window.getComputedStyle(el);
          if (rect.width > 375 || el.scrollWidth > 375 || el.offsetWidth > 375) {
            wideElements.push({
              tag: el.tagName.toLowerCase(),
              id: el.id,
              className: typeof el.className === 'string' ? el.className : '',
              rectWidth: Math.round(rect.width),
              offsetWidth: el.offsetWidth,
              scrollWidth: el.scrollWidth,
              display: comp.display,
              width: comp.width,
              minWidth: comp.minWidth,
              maxWidth: comp.maxWidth,
              flex: comp.flex,
              text: (el.innerText || '').slice(0, 40).replace(/\\n/g, ' ')
            });
          }
        }

        return {
          windowInnerWidth: vw,
          windowInnerHeight: vh,
          rootScrollWidth: root.scrollWidth,
          bodyScrollWidth: body.scrollWidth,
          mediaQuery: { matches860, matches768, matches520 },
          wideElementsCount: wideElements.length,
          wideElements: wideElements.slice(0, 30)
        };
      })()
    `,
    returnByValue: true,
  });

  console.log(JSON.stringify(debugInfo.result.value, null, 2));

  ws.close();
  chromeProc.kill();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
