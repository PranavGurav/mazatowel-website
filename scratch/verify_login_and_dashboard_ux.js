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

async function run() {
  console.log('\n======================================================');
  console.log('   VERIFY LOGIN PAGE & DASHBOARD UX INTEGRATION       ');
  console.log('======================================================\n');

  // 1. Verify CSS for Login Page
  console.log('--- 1. Testing Login Page CSS ---');
  const cssPath = path.join(__dirname, '..', 'public', 'assets', 'admin.css');
  const css = fs.readFileSync(cssPath, 'utf8');

  assert(css.includes('.login {') || css.includes('.login{'), '.login container rule present');
  assert(css.includes('min-height: 100vh') || css.includes('min-height:100vh'), '.login has min-height: 100vh');
  assert(css.includes('display: flex') || css.includes('display:flex'), '.login has display: flex centering');
  assert(css.includes('.login-card {') || css.includes('.login-card{'), '.login-card container rule present');
  assert(css.includes('max-width: 430px') || css.includes('max-width:430px'), '.login-card has max-width: 430px');
  assert(css.includes('.login-kicker'), '.login-kicker badge rule present');
  assert(css.includes('.login-subtitle'), '.login-subtitle rule present');
  assert(css.includes('.login-footer-note'), '.login-footer-note demo credentials rule present');
  assert(css.includes('.login-demo-btn'), '.login-demo-btn rule present');
  assert(css.includes('.login-back-link'), '.login-back-link rule present');

  // 2. Verify Dashboard View Switcher CSS
  console.log('\n--- 2. Testing Dashboard View Switcher CSS ---');
  assert(css.includes('.dash-view-tabs-bar'), '.dash-view-tabs-bar present');
  assert(css.includes('.dash-view-tabs'), '.dash-view-tabs present');
  assert(css.includes('.dash-view-tab'), '.dash-view-tab present');
  assert(css.includes('.table-mini-pipeline-bar'), '.table-mini-pipeline-bar present');
  assert(css.includes('.table-pipeline-chip'), '.table-pipeline-chip present');

  // 3. Verify Compiled JS Bundle
  console.log('\n--- 3. Testing Compiled React Admin Bundle ---');
  const jsPath = path.join(__dirname, '..', 'public', 'react-build', 'assets', 'admin.js');
  const js = fs.readFileSync(jsPath, 'utf8');

  assert(js.includes('btn-view-orders-queue'), 'Compiled JS has btn-view-orders-queue');
  assert(js.includes('btn-view-graphical-insights'), 'Compiled JS has btn-view-graphical-insights');
  assert(js.includes('btn-view-combined'), 'Compiled JS has btn-view-combined');
  assert(js.includes('table-mini-pipeline-bar'), 'Compiled JS has table-mini-pipeline-bar');
  assert(js.includes('dash-graphs-section'), 'Compiled JS has dash-graphs-section');
  assert(js.includes('login-card'), 'Compiled JS has login-card');
  assert(js.includes('Private Admin Portal'), 'Compiled JS has Private Admin Portal');
  assert(js.includes('Welcome Back'), 'Compiled JS has Welcome Back');
  assert(js.includes('login-demo-btn'), 'Compiled JS has login-demo-btn');
  assert(js.includes('login-back-link'), 'Compiled JS has login-back-link');
  assert(js.includes('Return to Store Website'), 'Compiled JS has Return to Store Website');

  console.log(`\n======================================================`);
  console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
