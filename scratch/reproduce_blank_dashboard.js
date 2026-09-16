import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('--- Spawning Headless Chrome with Remote Debugging ---');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = 'C:\\Users\\Subham Banerjee\\.gemini\\antigravity-ide\\brain\\4fe554ce-e696-4fe5-949b-3390796dce13\\scratch\\chrome_profile';

  // Clean or ensure dir
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    'about:blank',
  ]);

  chromeProc.on('error', (err) => {
    console.error('Failed to spawn Chrome:', err);
  });

  await sleep(1500);

  console.log('--- Fetching Target Page from Chrome ---');
  let targets;
  try {
    const res = await fetch('http://localhost:9222/json');
    targets = await res.json();
  } catch (e) {
    console.error('Could not connect to Chrome port 9222:', e.message);
    chromeProc.kill();
    return;
  }

  const pageTarget = targets.find((t) => t.type === 'page') || targets[0];
  if (!pageTarget) {
    console.error('No page target found');
    chromeProc.kill();
    return;
  }

  console.log('Connecting to WebSocket:', pageTarget.webSocketDebuggerUrl);
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

  const caughtExceptions = [];
  const consoleLogs = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pendingRequests.has(msg.id)) {
      const { resolve, reject } = pendingRequests.get(msg.id);
      pendingRequests.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
      return;
    }

    // Capture events
    if (msg.method === 'Runtime.consoleAPICalled') {
      const args = (msg.params.args || []).map((a) => a.value || a.description || JSON.stringify(a)).join(' ');
      consoleLogs.push(`[CONSOLE ${msg.params.type.toUpperCase()}] ${args}`);
      console.log(`[BROWSER CONSOLE] ${msg.params.type}:`, args);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      const details = msg.params.exceptionDetails;
      const text = details.exception?.description || details.text;
      const stack = details.stackTrace ? details.stackTrace.callFrames.map(f => `    at ${f.functionName} (${f.url}:${f.lineNumber}:${f.columnNumber})`).join('\n') : '';
      const full = `${text}\n${stack}`;
      caughtExceptions.push(full);
      console.error('\n💥 [BROWSER UNCAUGHT EXCEPTION]:', full, '\n');
    }
  };

  await new Promise((resolve) => (ws.onopen = resolve));
  console.log('WebSocket connected. Enabling Runtime & Page domains...');

  await send('Runtime.enable');
  await send('Page.enable');
  await send('DOM.enable');

  // Step 1: Navigate to http://localhost:3000 to set localStorage
  console.log('Navigating to http://localhost:3000 to set auth & profile state...');
  await send('Page.navigate', { url: 'http://localhost:3000/login' });
  await sleep(1500);

  // Setup user and completed onboarding profile in localStorage
  const testUserId = 'test-user-id-' + Date.now();
  const testUser = {
    id: testUserId,
    email: 'testuser@example.com',
    user_metadata: { full_name: 'Test Onboarded User' },
  };

  // Test with a role: e.g. Frontend Developer or Electrician or Data Analyst
  const testProfile = {
    id: testUserId,
    name: 'Test Onboarded User',
    segment: 'Software',
    role: 'Frontend Developer',
    experience: 'Junior (1-2 yrs)',
    location: 'Bengaluru, India',
  };

  const testSkills = ['HTML', 'CSS', 'JavaScript'];

  console.log('Injecting localStorage for onboarded user...');
  await send('Runtime.evaluate', {
    expression: `
      localStorage.setItem('skillsync_user', ${JSON.stringify(JSON.stringify(testUser))});
      localStorage.setItem('skillsync_profile_${testUserId}', ${JSON.stringify(JSON.stringify(testProfile))});
      localStorage.setItem('skillsync_skills_${testUserId}', ${JSON.stringify(JSON.stringify(testSkills))});
    `,
  });

  // Step 2: Navigate to http://localhost:3000/dashboard
  console.log('Navigating to /dashboard as onboarded user...');
  await send('Page.navigate', { url: 'http://localhost:3000/dashboard' });

  // Wait for React to render and any effects to run
  await sleep(3000);

  // Step 3: Inspect the rendered HTML inside #root
  console.log('Inspecting DOM of #root...');
  const rootEval = await send('Runtime.evaluate', {
    expression: `document.getElementById('root') ? document.getElementById('root').innerHTML : 'NO ROOT ELEMENT'`,
  });
  console.log('\n--- ROOT INNER HTML ---');
  console.log(rootEval.result.value);
  console.log('-----------------------\n');

  console.log('Total Console Messages Captured:', consoleLogs.length);
  console.log('Total Uncaught Exceptions Captured:', caughtExceptions.length);

  ws.close();
  chromeProc.kill();
}

run().catch(console.error);
