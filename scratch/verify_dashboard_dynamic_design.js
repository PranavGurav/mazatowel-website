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
  console.log('   VERIFY DASHBOARD DYNAMIC DATA & EXECUTIVE REDESIGN ');
  console.log('======================================================\n');

  // 1. Verify CSS rules in public/assets/admin.css
  console.log('--- 1. Testing CSS Definitions for Luxury Dashboard ---');
  const cssPath = path.join(__dirname, '..', 'public', 'assets', 'admin.css');
  const cssContent = fs.readFileSync(cssPath, 'utf8');

  assert(cssContent.includes('.dash-command-header'), 'CSS contains .dash-command-header');
  assert(cssContent.includes('.dash-brand-badge'), 'CSS contains .dash-brand-badge');
  assert(cssContent.includes('.dash-live-beacon'), 'CSS contains .dash-live-beacon');
  assert(cssContent.includes('.slick-kpi-grid'), 'CSS contains .slick-kpi-grid');
  assert(cssContent.includes('.slick-kpi-card'), 'CSS contains .slick-kpi-card');
  assert(cssContent.includes('.slick-kpi-meter'), 'CSS contains .slick-kpi-meter');
  assert(cssContent.includes('.slick-kpi-meter-bar'), 'CSS contains .slick-kpi-meter-bar');
  assert(cssContent.includes('.slick-kpi-meter-fill'), 'CSS contains .slick-kpi-meter-fill');
  assert(cssContent.includes('.dash-telemetry-card'), 'CSS contains .dash-telemetry-card');
  assert(cssContent.includes('.dash-telemetry-grid'), 'CSS contains .dash-telemetry-grid');

  // 2. Verify Compiled Bundle in public/react-build/
  console.log('\n--- 2. Testing Compiled React Bundle Content ---');
  const adminJsPath = path.join(__dirname, '..', 'public', 'react-build', 'assets', 'admin.js');
  const adminJsContent = fs.readFileSync(adminJsPath, 'utf8');

  assert(adminJsContent.includes('topbar-eyebrow'), 'Compiled bundle includes topbar-eyebrow badge');
  assert(adminJsContent.includes('topbar-heading'), 'Compiled bundle includes topbar-heading');
  assert(adminJsContent.includes('topbar-live-pill'), 'Compiled bundle includes topbar-live-pill');
  assert(adminJsContent.includes('topbar-btn-store'), 'Compiled bundle includes topbar-btn-store');
  assert(adminJsContent.includes('slick-kpi-meter'), 'Compiled bundle includes slick-kpi-meter');
  assert(adminJsContent.includes('card-pipeline-funnel'), 'Compiled bundle includes card-pipeline-funnel');
  assert(adminJsContent.includes('card-workshop-inventory'), 'Compiled bundle includes card-workshop-inventory');
  assert(adminJsContent.includes('card-design-distribution'), 'Compiled bundle includes card-design-distribution');
  assert(adminJsContent.includes('card-customer-sentiment'), 'Compiled bundle includes card-customer-sentiment');
  assert(adminJsContent.includes('card-traffic-telemetry'), 'Compiled bundle includes card-traffic-telemetry');

  // Check that static mock fallbacks do NOT exist in the bundle
  assert(!adminJsContent.includes("'142'"), 'No static 142 visitor fallback in compiled bundle');
  assert(!adminJsContent.includes("'3,840'"), 'No static 3,840 visitor fallback in compiled bundle');

  // 3. Test HTTP Endpoints & Live Data
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
  
  const d = adminDataRes.json;
  console.log(`\n  Live Database Metrics:`);
  console.log(`  - Enquiries: ${d.enquiries ? d.enquiries.length : 0}`);
  console.log(`  - Products: ${d.products ? d.products.length : 0}`);
  console.log(`  - Towel Colors: ${d.colors ? d.colors.length : 0}`);
  console.log(`  - Motifs/Designs: ${d.designs ? d.designs.length : 0}`);
  console.log(`  - Customer Reviews: ${d.reviews ? d.reviews.length : 0}`);
  console.log(`  - Realtime Shoppers: ${d.visitors && d.visitors.realtime ? d.visitors.realtime.activeNow : 0}`);
  console.log(`  - Visitors Today: ${d.visitors && d.visitors.summary ? d.visitors.summary.today : 0}`);
  console.log(`  - Visitors This Month: ${d.visitors && d.visitors.summary ? d.visitors.summary.thisMonth : 0}`);

  assert(Array.isArray(d.enquiries), 'Admin data contains enquiries array');
  assert(Array.isArray(d.products), 'Admin data contains products array');
  assert(Array.isArray(d.colors), 'Admin data contains colors array');
  assert(Array.isArray(d.designs), 'Admin data contains designs array');
  assert(Array.isArray(d.reviews), 'Admin data contains reviews array');
  assert(typeof d.visitors === 'object', 'Admin data contains visitors object');

  console.log(`\n======================================================`);
  console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
