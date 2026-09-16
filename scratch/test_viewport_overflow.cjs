const { spawn } = require('child_process');
const http = require('http');

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const port = 9223;
  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--window-size=375,812',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--user-data-dir=c:\\Skillsync\\scratch\\chrome-test-profile',
    'http://localhost:3001/dashboard'
  ]);

  // wait 2s for chrome to start
  await new Promise(r => setTimeout(r, 2500));

  // get ws url
  const listJson = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}/json/list`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const page = listJson.find(p => p.type === 'page');
  if (!page) {
    console.error('No page target found');
    chromeProc.kill();
    return;
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  let id = 1;

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      const handler = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id === msgId) {
          ws.removeEventListener('message', handler);
          resolve(msg.result);
        }
      };
      ws.addEventListener('message', handler);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  await new Promise(r => ws.onopen = r);

  // Set device emulation to 375x812 with mobile=true
  await send('Emulation.setDeviceMetricsOverride', {
    width: 375,
    height: 812,
    deviceScaleFactor: 2,
    mobile: true
  });

  // Navigate to /dashboard
  await send('Page.navigate', { url: 'http://localhost:3001/dashboard' });
  await new Promise(r => setTimeout(r, 3000));

  // Evaluate script to find overflowing elements
  const evalResult = await send('Runtime.evaluate', {
    expression: `
      (() => {
        const vw = window.innerWidth;
        const rootScrollWidth = document.documentElement.scrollWidth;
        const bodyScrollWidth = document.body.scrollWidth;

        const allElements = Array.from(document.querySelectorAll('*'));
        const overflowing = allElements.filter(el => {
          const rect = el.getBoundingClientRect();
          return (rect.right > vw + 1 || el.scrollWidth > vw + 1) && rect.width > 0;
        }).map(el => {
          const rect = el.getBoundingClientRect();
          return {
            tag: el.tagName.toLowerCase(),
            className: el.className ? (typeof el.className === 'string' ? el.className : el.className.baseVal) : '',
            id: el.id,
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            offsetWidth: el.offsetWidth,
            rectLeft: Math.round(rect.left),
            rectRight: Math.round(rect.right),
            rectWidth: Math.round(rect.width),
            textSnippet: (el.innerText || '').slice(0, 50).replace(/\\n/g, ' '),
            styleWidth: el.style.width,
            styleMinWidth: el.style.minWidth
          };
        });

        return {
          windowInnerWidth: vw,
          rootScrollWidth,
          bodyScrollWidth,
          hasHorizontalScroll: rootScrollWidth > vw || bodyScrollWidth > vw,
          overflowCount: overflowing.length,
          topOverflowing: overflowing.slice(0, 20)
        };
      })()
    `,
    returnByValue: true
  });

  console.log(JSON.stringify(evalResult.result.value, null, 2));

  ws.close();
  chromeProc.kill();
}

main().catch(err => console.error(err));
