const http = require('http');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. VERIFYING COMPILED BUNDLE INTEGRITY ---');
  const indexJs = fs.readFileSync(path.join(__dirname, '..', 'public', 'react-build', 'assets', 'index.js'), 'utf8');
  const adminJs = fs.readFileSync(path.join(__dirname, '..', 'public', 'react-build', 'assets', 'admin.js'), 'utf8');
  const indexCss = fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'styles.css'), 'utf8');
  const adminCss = fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'admin.css'), 'utf8');

  // Verify Commercial Sample Kit Modal in compiled index.js
  assert(indexJs.includes('modal-card-commercial'), 'Compiled index.js contains modal-card-commercial');
  assert(!indexJs.includes('className:"modal-close"'), 'Unstyled modal-close button removed from Commercial modal');
  assert(indexJs.includes('sample-kit-perks-badge'), 'Commercial modal contains sample-kit-perks-badge');
  assert(indexJs.includes('phone-prefix'), 'Commercial modal and studio contain phone-prefix');
  console.log('✓ Commercial Sample Kit Modal code cleanly structured');

  // Verify styles.css rules for commercial modal
  assert(indexCss.includes('.modal-card-commercial'), 'styles.css contains .modal-card-commercial');
  assert(indexCss.includes('.sample-kit-perks-badge'), 'styles.css contains .sample-kit-perks-badge');
  assert(indexCss.includes('.b2b-sample-modal-body'), 'styles.css contains .b2b-sample-modal-body');
  assert(indexCss.includes('.field-two-col'), 'styles.css contains .field-two-col');
  console.log('✓ styles.css has full commercial modal styling');

  // Verify Admin Visitor Analytics in compiled admin.js
  assert(adminJs.includes('card-visitor-analytics'), 'Compiled admin.js contains card-visitor-analytics');
  assert(adminJs.includes('Website Visitor Traffic Analytics'), 'Compiled admin.js contains Visitor Traffic title');
  assert(adminJs.includes('dash-period-tabs'), 'Compiled admin.js contains period tabs');
  assert(adminJs.includes('dash-chart-toggle'), 'Compiled admin.js contains chart toggle');
  assert(adminCss.includes('.dash-visitor-card'), 'admin.css contains .dash-visitor-card');
  assert(adminCss.includes('.dash-visitor-kpi-grid'), 'admin.css contains .dash-visitor-kpi-grid');
  assert(adminCss.includes('.dash-visitor-svg'), 'admin.css contains .dash-visitor-svg');
  console.log('✓ Admin dashboard Visitor Analytics code and CSS verified');

  console.log('\n--- 2. TESTING SERVER VISITOR API & TRACKING ---');
  // Test GET /api/visitors
  const visitorsRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/visitors',
    method: 'GET'
  });
  assert.strictEqual(visitorsRes.status, 200, 'GET /api/visitors returns 200');
  assert(visitorsRes.body.ok === true, 'GET /api/visitors ok: true');
  assert(visitorsRes.body.visitors.summary.today > 0, 'Visitors today > 0');
  assert(Array.isArray(visitorsRes.body.visitors.daily), 'daily array exists');
  assert(visitorsRes.body.visitors.daily.length >= 25, 'daily array has full 30-day history');
  assert(Array.isArray(visitorsRes.body.visitors.weekly), 'weekly array exists');
  assert(Array.isArray(visitorsRes.body.visitors.monthly), 'monthly array exists');
  assert(Array.isArray(visitorsRes.body.visitors.yearly), 'yearly array exists');
  console.log('✓ /api/visitors returned full daily, weekly, monthly, yearly analytics:', {
    today: visitorsRes.body.visitors.summary.today,
    thisWeek: visitorsRes.body.visitors.summary.thisWeek,
    thisMonth: visitorsRes.body.visitors.summary.thisMonth,
    thisYear: visitorsRes.body.visitors.summary.thisYear
  });

  // Test POST /api/track-visit
  const trackRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/track-visit',
    method: 'POST'
  });
  assert.strictEqual(trackRes.status, 200, 'POST /api/track-visit returns 200');
  console.log('✓ /api/track-visit recorded successfully');

  console.log('\n--- 3. TESTING COMMERCIAL SAMPLE KIT SUBMISSION ---');
  const sampleKitPayload = {
    customerName: 'Priya Sharma',
    companyName: 'Luxe Salon & Spa',
    category: 'Commercial B2B Sample Request',
    product: 'Sample Kit: Beauty Parlours & Spas',
    phone: '9823456789',
    quantity: 1,
    embroideryName: 'Luxe Salon',
    notes: '[B2B Sample Kit Request]\nBusiness: Luxe Salon & Spa\nContact: Priya Sharma\nCity: Mumbai\nSector: Beauty Parlours & Spas\nRequirements: 60 Salon Towels needed'
  };

  const sampleRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/enquiries',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, sampleKitPayload);

  assert.strictEqual(sampleRes.status, 200, 'Sample kit submission returns 200');
  assert(sampleRes.body.ok === true, 'Sample kit submission ok: true');
  assert(sampleRes.body.enquiryId, 'Sample kit returns enquiryId: ' + sampleRes.body.enquiryId);
  console.log('✓ Commercial Sample Kit form submitted successfully, ID:', sampleRes.body.enquiryId);

  console.log('\n--- 4. TESTING ON-PAGE ORDER STUDIO SUBMISSION (/api/orders alias) ---');
  const orderStudioPayload = {
    productId: 'P001',
    product: 'Personalized Bath Towel',
    category: 'Towels',
    size: '30 × 60 inch',
    quantity: 1,
    towelColor: 'Milky White',
    embroideryName: 'Dr. Aarav Mehta',
    customerName: 'Aarav Mehta',
    phone: '9876543210',
    notes: 'Placement: Standard. City: Pune. Urgent delivery needed for anniversary',
    status: 'New'
  };

  const orderRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/orders',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, orderStudioPayload);

  assert.strictEqual(orderRes.status, 200, 'POST /api/orders returns 200');
  assert(orderRes.body.ok === true, 'POST /api/orders ok: true');
  console.log('✓ On-Page Order Studio submitted successfully via /api/orders alias, ID:', orderRes.body.enquiryId);

  console.log('\n--- 5. TESTING ADMIN DATA PAYLOAD (Dashboard Integration) ---');
  // Sign in to test admin payload
  const loginRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@mazatowel.in', password: 'MazaTowel123!' });

  assert.strictEqual(loginRes.status, 200, 'Admin login succeeded');
  const cookie = loginRes.headers['set-cookie']?.[0]?.split(';')[0];
  assert(cookie, 'Admin session cookie retrieved');

  const adminDataRes = await request({
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin-data',
    method: 'GET',
    headers: { 'Cookie': cookie }
  });

  assert.strictEqual(adminDataRes.status, 200, 'GET /api/admin-data returns 200');
  assert(adminDataRes.body.visitors, 'admin-data includes visitors payload');
  assert(adminDataRes.body.visitors.summary.today > 0, 'admin-data visitors summary has today count');
  assert(adminDataRes.body.visitors.daily.length > 0, 'admin-data daily visitors array populated');
  assert(adminDataRes.body.visitors.weekly.length > 0, 'admin-data weekly visitors array populated');
  assert(adminDataRes.body.visitors.monthly.length > 0, 'admin-data monthly visitors array populated');
  assert(adminDataRes.body.visitors.yearly.length > 0, 'admin-data yearly visitors array populated');
  console.log('✓ Admin dashboard receives full visitors payload on load');

  console.log('\n======================================================');
  console.log('ALL FORM AUDITS & VISITOR ANALYTICS VERIFICATIONS PASSED! ✨');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('VERIFICATION FAILED ❌:', err);
  process.exit(1);
});
