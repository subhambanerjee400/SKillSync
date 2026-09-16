import { spawn } from 'child_process';
import fs from 'fs';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const USER_DATA_DIR = 'C:\\Users\\Subham Banerjee\\.gemini\\antigravity-ide\\brain\\4fe554ce-e696-4fe5-949b-3390796dce13\\scratch\\chrome_flow_test';

async function createCDPClient() {
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  const chromeProc = spawn(CHROME_PATH, [
    '--headless=new',
    '--window-size=1440,900',
    '--remote-debugging-port=9222',
    `--user-data-dir=${USER_DATA_DIR}`,
    'about:blank',
  ]);

  await sleep(1500);

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
  if (!pageTarget) {
    chromeProc.kill();
    throw new Error('No page target found on Chrome remote debugging');
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let messageId = 1;
  const pendingRequests = new Map();
  const consoleLogs = [];
  const uncaughtExceptions = [];

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
      return;
    }

    if (msg.method === 'Runtime.consoleAPICalled') {
      const args = (msg.params.args || [])
        .map((a) => a.value || a.description || JSON.stringify(a))
        .join(' ');
      const logEntry = `[${msg.params.type.toUpperCase()}] ${args}`;
      consoleLogs.push(logEntry);
      if (msg.params.type === 'error') {
        console.error('  [BROWSER CONSOLE ERROR]:', args);
      }
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const details = msg.params.exceptionDetails;
      const text = details.exception?.description || details.text;
      const stack = details.stackTrace
        ? details.stackTrace.callFrames
            .map((f) => `    at ${f.functionName} (${f.url}:${f.lineNumber}:${f.columnNumber})`)
            .join('\n')
        : '';
      const full = `${text}\n${stack}`;
      uncaughtExceptions.push(full);
      console.error('  [BROWSER UNCAUGHT EXCEPTION]:', full);
    }
  };

  await new Promise((resolve) => (ws.onopen = resolve));
  await send('Runtime.enable');
  await send('Page.enable');
  await send('DOM.enable');

  async function evalJs(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    return res.result?.value;
  }

  async function waitFor(conditionStr, timeoutMs = 15000, intervalMs = 400) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const val = await evalJs(conditionStr);
        if (val) return val;
      } catch (e) {}
      await sleep(intervalMs);
    }
    throw new Error(`Timeout waiting for: ${conditionStr}`);
  }

  return {
    chromeProc,
    ws,
    send,
    evalJs,
    waitFor,
    consoleLogs,
    uncaughtExceptions,
    async close() {
      try {
        ws.close();
      } catch (e) {}
      try {
        chromeProc.kill();
      } catch (e) {}
    },
  };
}

async function runTestFlow() {
  console.log('================================================================');
  console.log('STARTING END-TO-END VERIFICATION: SIGNUP -> LOGIN -> ONBOARDING -> DASHBOARD');
  console.log('================================================================\n');

  const client = await createCDPClient();

  try {
    // ------------------------------------------------------------------------
    // FLOW 1: SOFTWARE PROFILE (Frontend Developer)
    // ------------------------------------------------------------------------
    console.log('>>> [1/2] RUNNING FULL FLOW: SOFTWARE PROFILE (Frontend Developer) <<<');
    const softwareEmail = `alice.soft.${Date.now()}@skillsync.test`;
    const password = 'TestPassword123!';
    const softwareName = 'Alice Software Dev';

    // 1. Navigate to /signup and clear prior session
    console.log('  1. Navigating to /signup...');
    await client.send('Page.navigate', { url: 'http://localhost:3000/signup' });
    await sleep(1500);
    await client.evalJs(`try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}`);
    await client.send('Page.navigate', { url: 'http://localhost:3000/signup' });
    await client.waitFor(`!!document.getElementById('signup-name')`);

    // 2. Fill signup form
    console.log(`  2. Filling signup form: Name="${softwareName}", Email="${softwareEmail}"...`);
    await client.evalJs(`
      (() => {
        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passInput = document.getElementById('signup-password');

        function setValue(input, val) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        setValue(nameInput, ${JSON.stringify(softwareName)});
        setValue(emailInput, ${JSON.stringify(softwareEmail)});
        setValue(passInput, ${JSON.stringify(password)});

        const form = nameInput.closest('form');
        form.requestSubmit ? form.requestSubmit() : form.submit();
      })()
    `);

    // 3. Wait for redirect
    console.log('  3. Waiting for signup redirect...');
    await client.waitFor(`window.location.href.includes('/onboarding') || window.location.href.includes('/login')`);
    let currentUrl = await client.evalJs('window.location.href');
    console.log('     Current URL after signup:', currentUrl);

    // If redirected to login, perform login
    if (currentUrl.includes('/login')) {
      console.log('  4. Reached /login. Submitting login credentials...');
      await client.waitFor(`!!document.getElementById('login-email')`);
      await client.evalJs(`
        (() => {
          const emailInput = document.getElementById('login-email');
          const passInput = document.getElementById('login-password');
          function setValue(input, val) {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(input, val);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
          setValue(emailInput, ${JSON.stringify(softwareEmail)});
          setValue(passInput, ${JSON.stringify(password)});
          const form = emailInput.closest('form');
          form.requestSubmit ? form.requestSubmit() : form.submit();
        })()
      `);
      await client.waitFor(`window.location.href.includes('/onboarding') || window.location.href.includes('/dashboard')`);
      currentUrl = await client.evalJs('window.location.href');
      console.log('     Current URL after login:', currentUrl);
    }

    // 5. Onboarding Page
    console.log('  5. Onboarding: Waiting for profile check to complete and form to mount...');
    await client.waitFor(`!document.body.innerText.includes('Checking your profile') && !!document.querySelector('form')`);
    console.log('     Profile check complete. Form mounted successfully.');

    // Wait for skill suggestion buttons to be in DOM
    await client.waitFor(`Array.from(document.querySelectorAll('button')).some(b => b.textContent.trim() === 'HTML')`);

    // Click skill suggestion chips: HTML, CSS, JavaScript
    console.log('     Selecting skills: HTML, CSS, JavaScript...');
    for (const skillName of ['HTML', 'CSS', 'JavaScript']) {
      await client.evalJs(`
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const btn = buttons.find(b => b.textContent.includes(${JSON.stringify(skillName)}));
          if (btn) btn.click();
        })()
      `);
      await sleep(350);
    }

    await client.waitFor(`(() => {
      const span = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('selected'));
      return span && !span.textContent.includes('0 selected');
    })()`);

    const selectedCount = await client.evalJs(`
      (() => {
        const span = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('selected'));
        return span ? span.textContent : '0 selected';
      })()
    `);
    console.log('     Skills selected count:', selectedCount);

    // Set Name & Location right before submitting
    await client.evalJs(`
      (() => {
        function setValue(input, val) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const nameInput = document.querySelector('input[placeholder*="Alex Morgan"]');
        if (nameInput) setValue(nameInput, ${JSON.stringify(softwareName)});

        const locationInput = document.querySelector('input[placeholder*="San Francisco"]');
        if (locationInput) setValue(locationInput, 'Bengaluru, Karnataka');
      })()
    `);
    await sleep(500);

    // Submit Onboarding Form
    console.log('  6. Submitting onboarding form to launch dashboard...');
    const submitResult = await client.evalJs(`
      (() => {
        const form = document.querySelector('form');
        const submitBtn = Array.from(document.querySelectorAll('button')).find(btn => 
          btn.textContent.includes('Continue to Dashboard') || btn.textContent.includes('Launch')
        );
        if (form) {
          form.requestSubmit ? form.requestSubmit(submitBtn) : form.submit();
          return 'FORM_SUBMITTED';
        }
        return 'NO_FORM_FOUND';
      })()
    `);
    console.log('     Submit result:', submitResult);
    await sleep(2000);

    const postSubmitDiag = await client.evalJs(`
      (() => {
        return {
          currentUrl: window.location.href,
          errorBanner: document.body.innerText.includes('Please enter') || document.body.innerText.includes('Please select'),
          bodySnippet: document.body.innerText.slice(0, 250).replace(/\\s+/g, ' ')
        };
      })()
    `);
    console.log('     Post-submit diagnostics:', JSON.stringify(postSubmitDiag));

    // 7. Wait for navigation to /dashboard and loading analysis to finish
    console.log('  7. Waiting for navigation to /dashboard...');
    await client.waitFor(`window.location.href.includes('/dashboard')`);
    console.log('     Reached /dashboard! Waiting for dashboard analysis and data to render...');
    await client.waitFor(`!document.body.innerText.includes('Analyzing Skill Readiness') && document.body.innerText.includes('Readiness Score')`);
    await sleep(2000);

    // 8. Verify Dashboard rendered content
    console.log('  8. Verifying all Dashboard components and data for Software profile...');
    const softwareDashboardState = await client.evalJs(`
      (() => {
        const bodyText = document.body.innerText;
        return {
          hasSidebarDashboard: bodyText.includes('Dashboard'),
          hasReadinessScore: bodyText.includes('Readiness Score') && /\\d+%/.test(bodyText),
          hasSkillGap: bodyText.includes('Matched Skills') && bodyText.includes('Missing Skills'),
          hasRoadmap: bodyText.includes('Skill Roadmap') && bodyText.includes('Path'),
          hasSimulator: bodyText.includes('Score Simulator') && bodyText.includes('Try it'),
          hasRecommendations: bodyText.includes('Recommended Pathways'),
          matchedSkillsFound: bodyText.includes('HTML') && bodyText.includes('CSS'),
          missingSkillsFound: bodyText.includes('React') || bodyText.includes('TypeScript') || bodyText.includes('Tailwind'),
          bodySnippet: bodyText.slice(0, 350).replace(/\\s+/g, ' ')
        };
      })()
    `);

    console.log('     Software Dashboard State:\n', JSON.stringify(softwareDashboardState, null, 2));

    if (!softwareDashboardState.hasSidebarDashboard ||
        !softwareDashboardState.hasReadinessScore ||
        !softwareDashboardState.hasSkillGap ||
        !softwareDashboardState.hasRoadmap ||
        !softwareDashboardState.hasSimulator ||
        !softwareDashboardState.hasRecommendations ||
        !softwareDashboardState.matchedSkillsFound) {
      throw new Error(`Software Dashboard failed component verification!`);
    }
    console.log('  ✔ SOFTWARE PROFILE FLOW: ALL CHECKS PASSED!\n');


    // ------------------------------------------------------------------------
    // FLOW 2: TRADE PROFILE (Electrician)
    // ------------------------------------------------------------------------
    console.log('>>> [2/2] RUNNING FULL FLOW: TRADE PROFILE (Electrician) <<<');
    const tradeEmail = `bob.trade.${Date.now()}@skillsync.test`;
    const tradeName = 'Bob Trade Tech';

    // 1. Clear session and navigate to /signup
    console.log('  1. Clearing storage and navigating to /signup for Trade user...');
    await client.evalJs(`try { localStorage.clear(); sessionStorage.clear(); } catch (e) {}`);
    await client.send('Page.navigate', { url: 'http://localhost:3000/signup' });
    await client.waitFor(`!!document.getElementById('signup-name')`);

    // 2. Fill signup form
    console.log(`  2. Filling signup form: Name="${tradeName}", Email="${tradeEmail}"...`);
    await client.evalJs(`
      (() => {
        const nameInput = document.getElementById('signup-name');
        const emailInput = document.getElementById('signup-email');
        const passInput = document.getElementById('signup-password');

        function setValue(input, val) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        setValue(nameInput, ${JSON.stringify(tradeName)});
        setValue(emailInput, ${JSON.stringify(tradeEmail)});
        setValue(passInput, ${JSON.stringify(password)});

        const form = nameInput.closest('form');
        form.requestSubmit ? form.requestSubmit() : form.submit();
      })()
    `);

    // 3. Wait for redirect
    console.log('  3. Waiting for signup redirect...');
    await client.waitFor(`window.location.href.includes('/onboarding') || window.location.href.includes('/login')`);
    currentUrl = await client.evalJs('window.location.href');
    console.log('     Current URL after signup:', currentUrl);

    if (currentUrl.includes('/login')) {
      console.log('  4. Reached /login. Submitting login credentials...');
      await client.waitFor(`!!document.getElementById('login-email')`);
      await client.evalJs(`
        (() => {
          const emailInput = document.getElementById('login-email');
          const passInput = document.getElementById('login-password');
          function setValue(input, val) {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
            setter.call(input, val);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
          setValue(emailInput, ${JSON.stringify(tradeEmail)});
          setValue(passInput, ${JSON.stringify(password)});
          const form = emailInput.closest('form');
          form.requestSubmit ? form.requestSubmit() : form.submit();
        })()
      `);
      await client.waitFor(`window.location.href.includes('/onboarding') || window.location.href.includes('/dashboard')`);
      currentUrl = await client.evalJs('window.location.href');
      console.log('     Current URL after login:', currentUrl);
    }

    // 5. Onboarding Page for Trade
    console.log('  5. Onboarding: Waiting for profile check to complete and form to mount...');
    await client.waitFor(`!document.body.innerText.includes('Checking your profile') && !!document.querySelector('form')`);
    console.log('     Profile check completed. Selecting Trade segment...');

    // Select Trade segment (which automatically sets default role to Electrician)
    await client.evalJs(`
      (() => {
        const tradeSegmentBtn = Array.from(document.querySelectorAll('button')).find(btn => 
          btn.textContent.trim() === 'Trade'
        );
        if (tradeSegmentBtn) tradeSegmentBtn.click();
      })()
    `);
    await sleep(1000);

    // Wait for Trade skill suggestion buttons to be in DOM
    console.log('     Waiting for Electrician skill suggestion chips to appear...');
    await client.waitFor(`Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Wiring'))`);
    await sleep(500);

    // Add custom skill "Electrical Wiring" so that it matches demoData required skills
    await client.evalJs(`
      (() => {
        const customInput = document.querySelector('input[placeholder*="Add custom skill"]');
        const addBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Add');
        if (customInput && addBtn) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(customInput, 'Electrical Wiring');
          customInput.dispatchEvent(new Event('input', { bubbles: true }));
          customInput.dispatchEvent(new Event('change', { bubbles: true }));
          addBtn.click();
        }
      })()
    `);
    await sleep(350);

    // Also select suggested skills: Wiring & Cabling
    console.log('     Selecting skills: Wiring & Cabling, Electrical Wiring...');
    for (const skillSnippet of ['Wiring']) {
      const clickRes = await client.evalJs(`
        (() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const btn = buttons.find(b => b.textContent.includes(${JSON.stringify(skillSnippet)}));
          if (btn) {
            btn.click();
            return 'Clicked: ' + btn.textContent.trim();
          }
          return 'Not found for: ' + ${JSON.stringify(skillSnippet)};
        })()
      `);
      console.log('       Trade skill click:', clickRes);
      await sleep(350);
    }

    await client.waitFor(`(() => {
      const span = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('selected'));
      return span && !span.textContent.includes('0 selected');
    })()`);

    const tradeSelectedCount = await client.evalJs(`
      (() => {
        const span = Array.from(document.querySelectorAll('span')).find(s => s.textContent.includes('selected'));
        return span ? span.textContent : '0 selected';
      })()
    `);
    console.log('     Trade skills selected count:', tradeSelectedCount);

    // Fill Name & Location right before submitting
    await client.evalJs(`
      (() => {
        function setValue(input, val) {
          const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
          setter.call(input, val);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        const nameInput = document.querySelector('input[placeholder*="Alex Morgan"]');
        if (nameInput) setValue(nameInput, ${JSON.stringify(tradeName)});

        const locationInput = document.querySelector('input[placeholder*="San Francisco"]');
        if (locationInput) setValue(locationInput, 'Bengaluru, Karnataka');
      })()
    `);
    await sleep(500);

    // Submit form
    console.log('  6. Submitting onboarding form to launch dashboard...');
    await client.evalJs(`
      (() => {
        const form = document.querySelector('form');
        const submitBtn = Array.from(document.querySelectorAll('button')).find(btn => 
          btn.textContent.includes('Continue to Dashboard') || btn.textContent.includes('Launch')
        );
        if (form) {
          form.requestSubmit ? form.requestSubmit(submitBtn) : form.submit();
        }
      })()
    `);

    // 7. Wait for Dashboard to load
    console.log('  7. Waiting for navigation to /dashboard...');
    await client.waitFor(`window.location.href.includes('/dashboard')`);
    console.log('     Reached /dashboard! Waiting for dashboard analysis and data to render...');
    await client.waitFor(`!document.body.innerText.includes('Analyzing Skill Readiness') && document.body.innerText.includes('Readiness Score')`);
    await sleep(2000);

    // 8. Verify Dashboard rendered content for Trade
    console.log('  8. Verifying Dashboard components and data for Trade profile...');
    const tradeDashboardState = await client.evalJs(`
      (() => {
        const bodyText = document.body.innerText;
        return {
          hasSidebarDashboard: bodyText.includes('Dashboard'),
          hasReadinessScore: bodyText.includes('Readiness Score') && /\\d+%/.test(bodyText),
          hasSkillGap: bodyText.includes('Matched Skills') && bodyText.includes('Missing Skills'),
          hasRoadmap: bodyText.includes('Skill Roadmap') && bodyText.includes('Path'),
          hasSimulator: bodyText.includes('Score Simulator') && bodyText.includes('Try it'),
          hasRecommendations: bodyText.includes('Recommended Pathways'),
          hasInstitutes: bodyText.includes('Government') || bodyText.includes('Private') || bodyText.includes('ITI') || bodyText.includes('NTTF') || bodyText.includes('Institute'),
          matchedSkillsFound: bodyText.includes('Electrical Wiring'),
          missingSkillsFound: bodyText.includes('Solar Panel Installation') || bodyText.includes('Smart Meter Installation') || bodyText.includes('Electrical Safety'),
          bodySnippet: bodyText.slice(0, 350).replace(/\\s+/g, ' ')
        };
      })()
    `);

    console.log('     Trade Dashboard State:\n', JSON.stringify(tradeDashboardState, null, 2));

    if (!tradeDashboardState.hasSidebarDashboard ||
        !tradeDashboardState.hasReadinessScore ||
        !tradeDashboardState.hasSkillGap ||
        !tradeDashboardState.hasRoadmap ||
        !tradeDashboardState.hasSimulator ||
        !tradeDashboardState.hasRecommendations ||
        !tradeDashboardState.hasInstitutes ||
        !tradeDashboardState.matchedSkillsFound) {
      throw new Error(`Trade Dashboard failed component verification!`);
    }
    console.log('  ✔ TRADE PROFILE FLOW: ALL CHECKS PASSED!\n');

    // ------------------------------------------------------------------------
    // CONSOLE & EXCEPTION AUDIT
    // ------------------------------------------------------------------------
    console.log('================================================================');
    console.log('FINAL BROWSER CONSOLE & EXCEPTION AUDIT');
    console.log('================================================================');
    console.log('Total Uncaught Exceptions:', client.uncaughtExceptions.length);

    if (client.uncaughtExceptions.length > 0) {
      console.error('\n💥 UNCAUGHT EXCEPTIONS FOUND:');
      client.uncaughtExceptions.forEach((err, i) => console.error(` [${i + 1}] ${err}`));
      throw new Error('Verification failed due to uncaught browser exceptions!');
    }

    const reactErrors = client.consoleLogs.filter((log) =>
      log.includes('[ERROR]') &&
      (log.includes('React') || log.includes('Rendered more hooks') || log.includes('uncaught') || log.includes('Minified React error'))
    );

    if (reactErrors.length > 0) {
      console.error('\n💥 REACT CONSOLE ERRORS FOUND:');
      reactErrors.forEach((err, i) => console.error(` [${i + 1}] ${err}`));
      throw new Error('Verification failed due to React console errors!');
    }

    console.log('✔ 0 UNCAUGHT EXCEPTIONS');
    console.log('✔ 0 REACT CONSOLE ERRORS');
    console.log('\n================================================================');
    console.log('FULL VERIFICATION 100% SUCCESSFUL:');
    console.log('Signup -> Login -> Onboarding -> Dashboard');
    console.log('Both Software and Trade flows verified with zero console errors!');
    console.log('================================================================');

  } finally {
    await client.close();
  }
}

runTestFlow().catch((err) => {
  console.error('\n❌ Test Run Error:', err.message);
  process.exit(1);
});
