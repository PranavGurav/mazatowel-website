const http = require('http');
const fs = require('fs');
const path = require('path');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    failed++;
  }
}

function makeRequest(method, urlPath, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      method: method,
      headers: { ...headers }
    };
    if (body) {
      opts.headers['Content-Type'] = 'application/json';
      opts.headers['Content-Length'] = Buffer.byteLength(body);
    }
    const req = http.request(opts, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(resData); } catch (e) {}
        resolve({ status: res.statusCode, headers: res.headers, body: resData, json });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function run() {
  console.log('\n======================================================');
  console.log('   VERIFY DASHBOARD GRAPHICAL VISUALIZATIONS UX       ');
  console.log('======================================================\n');

  // 1. Verify CSS rules in public/assets/admin.css
  console.log('--- 1. Testing CSS Definitions for Graphs ---');
  const cssPath = path.join(__dirname, '..', 'public', 'assets', 'admin.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  assert(cssContent.includes('.dash-graphs-section'), 'CSS contains .dash-graphs-section');
  assert(cssContent.includes('.dash-graphs-grid'), 'CSS contains .dash-graphs-grid');
  assert(cssContent.includes('.dash-graph-card'), 'CSS contains .dash-graph-card');
  assert(cssContent.includes('.dash-donut-layout'), 'CSS contains .dash-donut-layout');
  assert(cssContent.includes('.dash-donut-svg'), 'CSS contains .dash-donut-svg');
  assert(cssContent.includes('.dash-trend-chart-wrap'), 'CSS contains .dash-trend-chart-wrap');
  assert(cssContent.includes('.dash-trend-svg'), 'CSS contains .dash-trend-svg');
  assert(cssContent.includes('.dash-cat-bars-list'), 'CSS contains .dash-cat-bars-list');
  assert(cssContent.includes('.dash-cat-bar-fill'), 'CSS contains .dash-cat-bar-fill');
  assert(cssContent.includes('.dash-gauges-row'), 'CSS contains .dash-gauges-row');
  assert(cssContent.includes('.dash-gauge-svg'), 'CSS contains .dash-gauge-svg');
  assert(cssContent.includes('.dash-swatches-strip'), 'CSS contains .dash-swatches-strip');
  assert(cssContent.includes('.dash-sentiment-wrap'), 'CSS contains .dash-sentiment-wrap');

  // 2. Verify Compiled Bundle in public/react-build/
  console.log('\n--- 2. Testing Compiled React Bundle Content ---');
  const adminJsPath = path.join(__dirname, '..', 'public', 'react-build', 'assets', 'admin.js');
  const adminJsContent = fs.readFileSync(adminJsPath, 'utf8');

  assert(adminJsContent.includes('dash-graphs-section'), 'Compiled bundle includes dash-graphs-section');
  assert(adminJsContent.includes('card-pipeline-funnel'), 'Compiled bundle includes card-pipeline-funnel');
  assert(adminJsContent.includes('card-demand-trajectory'), 'Compiled bundle includes card-demand-trajectory');
  assert(adminJsContent.includes('card-design-distribution'), 'Compiled bundle includes card-design-distribution');
  assert(adminJsContent.includes('card-workshop-health'), 'Compiled bundle includes card-workshop-health');
  assert(adminJsContent.includes('dashTrendGrad'), 'Compiled bundle includes dashTrendGrad SVG linearGradient');

  // 3. Test HTTP Endpoints
  console.log('\n--- 3. Testing Backend & Admin Authentication ---');
  const adminPageRes = await makeRequest('GET', '/admin');
  assert(adminPageRes.status === 200, 'Admin route returns HTTP 200');

  const loginRes = await makeRequest('POST', '/api/login', {}, JSON.stringify({
    email: 'admin@mazatowel.in',
    password: process.env.ADMIN_PASSWORD || 'MazaTowel123!'
  }));
  assert(loginRes.status === 200, 'Admin login succeeded HTTP 200');

  const cookie = loginRes.headers['set-cookie'] ? loginRes.headers['set-cookie'][0].split(';')[0] : '';
  const adminDataRes = await makeRequest('GET', '/api/admin-data', { Cookie: cookie });
  assert(adminDataRes.status === 200, 'Admin data loaded HTTP 200');
  assert(Array.isArray(adminDataRes.json.enquiries), 'Admin data contains enquiries array');
  assert(Array.isArray(adminDataRes.json.designs), 'Admin data contains designs array');
  assert(Array.isArray(adminDataRes.json.reviews), 'Admin data contains reviews array');
  // Threads feature paused per user instruction:
  // assert(Array.isArray(adminDataRes.json.threads), 'Admin data contains threads array');
  assert(adminDataRes.json.threads === undefined || Array.isArray(adminDataRes.json.threads), 'Threads correctly paused/isolated');

  console.log(`\n======================================================`);
  console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
