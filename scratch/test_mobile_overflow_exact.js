import { spawn } from 'child_process';
import fs from 'fs';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\Subham Banerjee\\.gemini\\antigravity-ide\\brain\\chrome_mobile_test';

async function run() {
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--window-size=375,812',
    '--remote-debugging-port=9222',
    `--user-data-dir=${USER_DATA_DIR}`,
    'about:blank',
  ]);

  await sleep(1800);

  let targets;
  for (let i = 0; i < 5; i++) {
    try {
      const res = await fetch('http://localhost:9222/json');
      targets = await res.json();
      if (targets && targets.length > 0) break;
    } catch (e) {
      await sleep(1000);
    }
  }

  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let messageId = 1;
  const pendingRequests = new Map();

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = messageId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pendingRequests.has(msg.id)) {
      const { resolve, reject } = pendingRequests.get(msg.id);
      pendingRequests.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  await new Promise((r) => (ws.onopen = r));
  await send('Runtime.enable');
  await send('Page.enable');
  await send('DOM.enable');

  // Set device emulation to mobile: 375x812, deviceScaleFactor 2
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true,
  });

  async function evalJs(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  async function checkPageOverflow(pageName) {
    const data = await evalJs(`
      (() => {
        const vw = window.innerWidth;
        const rootScrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;
        const hasOverflow = rootScrollWidth > vw || bodyScrollWidth > vw;

        const all = Array.from(document.querySelectorAll('*'));
        const offending = [];

        for (const el of all) {
          const rect = el.getBoundingClientRect();
          if (rect.width <= 0 && rect.height <= 0) continue;
          // Check if right edge exceeds viewport or scrollWidth exceeds clientWidth
          const exceedsRight = rect.right > vw + 1;
          const overflowsSelf = el.scrollWidth > el.clientWidth && el.scrollWidth > vw + 1;

          if (exceedsRight || overflowsSelf) {
            offending.push({
              tag: el.tagName.toLowerCase(),
              id: el.id || undefined,
              className: (typeof el.className === 'string' ? el.className : '') || undefined,
              rectWidth: Math.round(rect.width),
              rectRight: Math.round(rect.right),
              scrollWidth: el.scrollWidth,
              clientWidth: el.clientWidth,
              offsetWidth: el.offsetWidth,
              textSnippet: (el.innerText || '').slice(0, 60).replace(/\\s+/g, ' '),
              inlineStyle: el.getAttribute('style') || undefined,
            });
          }
        }

        return {
          vw,
          rootScrollWidth,
          bodyScrollWidth,
          hasOverflow,
          offendingCount: offending.length,
          offending: offending.slice(0, 25)
        };
      })()
    `);

    console.log(`=== CHECKING ${pageName} at 375px ===`);
    console.log(`Viewport width: ${data.vw}px | root.scrollWidth: ${data.rootScrollWidth}px | body.scrollWidth: ${data.bodyScrollWidth}px`);
    console.log(`Has Horizontal Scroll: ${data.hasOverflow}`);
    if (data.offendingCount > 0) {
      console.log(`Found ${data.offendingCount} offending elements:`);
      data.offending.forEach((o, idx) => {
        console.log(` [${idx + 1}] <${o.tag}${o.id ? '#' + o.id : ''}${o.className ? '.' + o.className : ''}>: rectWidth=${o.rectWidth}px, rectRight=${o.rectRight}px, scrollWidth=${o.scrollWidth}px, text="${o.textSnippet}"`);
        if (o.inlineStyle) console.log(`     style="${o.inlineStyle.slice(0, 120)}"`);
      });
    } else {
      console.log('No elements exceeding 375px viewport.');
    }
    console.log('');
  }

  // 1. Check Login
  await send('Page.navigate', { url: 'http://localhost:3000/login' });
  await sleep(1500);
  await checkPageOverflow('/login');

  // 2. Setup mock authenticated user in localStorage and check /dashboard
  const mockUser = {
    id: 'usr_test_overflow_375',
    email: 'test.overflow@skillsync.test',
    user_metadata: { full_name: 'Test Mobile User', role: 'user' },
  };
  const mockProfile = {
    id: 'usr_test_overflow_375',
    name: 'Test Mobile User',
    email: 'test.overflow@skillsync.test',
    role: 'Frontend Developer',
    segment: 'Software',
    location: 'San Francisco, CA',
  };
  const mockSkills = ['HTML', 'CSS', 'JavaScript'];

  await evalJs(`
    localStorage.setItem('skillsync_user', JSON.stringify(${JSON.stringify(mockUser)}));
    localStorage.setItem('skillsync_profile_${mockUser.id}', JSON.stringify(${JSON.stringify(mockProfile)}));
    localStorage.setItem('skillsync_skills_${mockUser.id}', JSON.stringify(${JSON.stringify(mockSkills)}));
    localStorage.setItem('skillsync_accounts', JSON.stringify({ [${JSON.stringify(mockUser.id)}]: 'user' }));
  `);

  // 3. Check Dashboard
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send('Page.navigate', { url: 'http://localhost:3000/dashboard' });
  await sleep(1500);
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await sleep(2000);
  const currentDashUrl = await evalJs('window.location.href');
  const dashBodyText = await evalJs('document.body.innerText.slice(0, 300)');
  console.log('Current URL for Dashboard check:', currentDashUrl);
  console.log('Dashboard body text snippet:', dashBodyText.replace(/\n/g, ' '));
  const loadedDashboard = await evalJs(`
    !!document.querySelector('.dashboard-main-canvas') || !!document.querySelector('.skill-gap-grid')
  `);
  console.log('Dashboard fully loaded into workspace?', loadedDashboard);
  await checkPageOverflow('/dashboard');

  // 4. Check Edit Profile
  await send('Page.navigate', { url: 'http://localhost:3000/edit-profile' });
  await sleep(2500);
  const loadedEditProfile = await evalJs(`
    !!document.querySelector('form')
  `);
  console.log('EditProfile form fully loaded?', loadedEditProfile);
  await checkPageOverflow('/edit-profile');

  // 5. Check Onboarding
  await evalJs(`localStorage.removeItem('skillsync_profile_${mockUser.id}');`);
  await send('Page.navigate', { url: 'http://localhost:3000/onboarding' });
  await sleep(2500);
  const loadedOnboarding = await evalJs(`
    !!document.querySelector('form')
  `);
  console.log('Onboarding form fully loaded?', loadedOnboarding);
  await checkPageOverflow('/onboarding');

  ws.close();
  chromeProc.kill();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
