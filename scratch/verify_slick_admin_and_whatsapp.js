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

function fetchJson(urlPath) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: 'localhost', port: 3000, path: urlPath }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('\n======================================================');
  console.log('   VERIFY WHATSAPP 919922597666 & SLICK ADMIN PANEL   ');
  console.log('======================================================\n');

  // 1. WhatsApp Configuration Verification
  console.log('--- 1. Testing WhatsApp Number Configuration ---');
  const settingsJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'settings.json'), 'utf8'));
  assert(settingsJson.whatsapp === '919922597666', 'data/settings.json has whatsapp = "919922597666"');

  const apiSite = await fetchJson('/api/site');
  assert(apiSite.status === 200, '/api/site returned HTTP 200');
  assert(apiSite.json.settings && apiSite.json.settings.whatsapp === '919922597666', 'API /api/site serves settings.whatsapp = "919922597666"');

  const apiJs = fs.readFileSync(path.join(__dirname, '..', 'react', 'src', 'api.js'), 'utf8');
  assert(apiJs.includes('919922597666'), 'react/src/api.js has 919922597666 fallback');

  // 2. Slick Admin CSS Verification
  console.log('\n--- 2. Testing Slick Admin Panel CSS ---');
  const adminCss = fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'admin.css'), 'utf8');
  assert(adminCss.includes('.slick-kpi-grid'), 'admin.css contains .slick-kpi-grid');
  assert(adminCss.includes('.slick-kpi-card'), 'admin.css contains .slick-kpi-card');
  assert(adminCss.includes('.slick-status-ribbon'), 'admin.css contains .slick-status-ribbon');
  assert(adminCss.includes('.slick-ribbon-item'), 'admin.css contains .slick-ribbon-item');
  assert(adminCss.includes('.dash-view-tabs'), 'admin.css contains .dash-view-tabs segmented control');
  assert(adminCss.includes('--soft: #F8FAFC'), 'admin.css uses modern slate-50 backdrop (--soft: #F8FAFC)');
  assert(adminCss.includes('--line: #E2E8F0'), 'admin.css uses modern slate-200 hairline borders (--line: #E2E8F0)');
  assert(adminCss.includes('#0F172A'), 'admin.css uses deep obsidian slate for sidebar');

  // 3. Compiled Admin JS Bundle Verification
  console.log('\n--- 3. Testing Compiled Admin Bundle ---');
  const adminJs = fs.readFileSync(path.join(__dirname, '..', 'public', 'react-build', 'assets', 'admin.js'), 'utf8');
  assert(adminJs.includes('slick-kpi-grid'), 'Compiled admin bundle includes slick-kpi-grid');
  assert(adminJs.includes('slick-status-ribbon'), 'Compiled admin bundle includes slick-status-ribbon');
  assert(adminJs.includes('Shoppers Active Now'), 'Compiled admin bundle includes Shoppers Active Now hero card');
  assert(adminJs.includes('btn-view-orders-queue'), 'Compiled admin bundle retains btn-view-orders-queue');
  assert(adminJs.includes('btn-view-graphical-insights'), 'Compiled admin bundle retains btn-view-graphical-insights');
  assert(adminJs.includes('btn-view-combined'), 'Compiled admin bundle retains btn-view-combined');

  console.log(`\n======================================================`);
  console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
