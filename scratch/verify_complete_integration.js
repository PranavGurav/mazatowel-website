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
  console.log('   FULL END-TO-END VERIFICATION: QUANTITY & NAMES UX  ');
  console.log('======================================================\n');

  // 1. Static asset verification
  console.log('--- 1. Testing Route & Build Integrity ---');
  const homeRes = await makeRequest('GET', '/');
  assert(homeRes.status === 200, 'Public homepage returns HTTP 200');
  assert(homeRes.body.includes('id="root"'), 'Homepage contains React root mount point');

  const adminRes = await makeRequest('GET', '/admin');
  assert(adminRes.status === 200, 'Admin route returns HTTP 200');

  // 2. CSS rules verification
  console.log('\n--- 2. Testing Quantity & Stepper CSS Rules ---');
  const stylesCss = fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'styles.css'), 'utf8');
  assert(stylesCss.includes('-webkit-appearance:none!important'), 'CSS hides webkit inner/outer stepper arrows');
  assert(stylesCss.includes('appearance:textfield!important'), 'CSS sets appearance: textfield for Firefox');
  assert(stylesCss.includes('.qty-stepper-box'), 'CSS defines .qty-stepper-box container');
  assert(stylesCss.includes('.qty-pricing-row'), 'CSS defines .qty-pricing-row 2-col alignment');
  assert(stylesCss.includes('.personalization-mode-card'), 'CSS defines .personalization-mode-card for mode switching');
  assert(stylesCss.includes('.multi-towel-names-wrap'), 'CSS defines .multi-towel-names-wrap for individual rows');
  assert(stylesCss.includes('.preview-towel-switcher'), 'CSS defines .preview-towel-switcher tab pills');
  assert(stylesCss.includes('.mode-options-grid{grid-template-columns:1fr;gap:8px}'), 'CSS includes mobile responsive rule for mode-options-grid');
  assert(stylesCss.includes('.qty-pricing-row{grid-template-columns:1fr;gap:10px}'), 'CSS includes mobile responsive rule for qty-pricing-row');

  // 3. Test Single Towel Enquiry
  console.log('\n--- 3. Testing Single Towel Order (Quantity = 1) ---');
  const singlePayload = JSON.stringify({
    customerName: 'Test Single Customer',
    phone: '9876543210',
    product: 'Luxury Bath Towel (30 × 60 inch)',
    size: '30 × 60 inch',
    quantity: 1,
    embroideryName: 'Aarav',
    embroideryNames: ['Aarav'],
    nameMode: 'same',
    thread: 'Antique Gold',
    towelColor: 'Milky White',
    notes: 'Single order verification'
  });
  const singleRes = await makeRequest('POST', '/api/enquiries', {}, singlePayload);
  assert(singleRes.status === 200 && singleRes.json?.ok === true, 'Single towel order returns ok: true');
  const singleId = singleRes.json?.enquiryId;
  assert(!!singleId, `Single order received enquiryId: ${singleId}`);

  // 4. Test Multi-Towel Family Order (Quantity = 3, mode: 'different')
  console.log('\n--- 4. Testing Multi-Towel Family Order (Quantity = 3, Different Names) ---');
  const familyPayload = JSON.stringify({
    customerName: 'Sharma Family',
    phone: '9876543211',
    product: 'Luxury Bath Towel (30 × 60 inch)',
    size: '30 × 60 inch',
    quantity: 3,
    embroideryName: 'Pooja, Rohan, Vihaan',
    embroideryNames: ['Pooja', 'Rohan', 'Vihaan'],
    nameMode: 'different',
    thread: 'Sky Blue',
    towelColor: 'Milky White',
    notes: 'For family vacation'
  });
  const familyRes = await makeRequest('POST', '/api/enquiries', {}, familyPayload);
  assert(familyRes.status === 200 && familyRes.json?.ok === true, 'Multi-towel family order returns ok: true');
  const familyId = familyRes.json?.enquiryId;
  assert(!!familyId, `Family order received enquiryId: ${familyId}`);

  // 5. Test Multi-Towel Corporate Order (Quantity = 5, mode: 'same')
  console.log('\n--- 5. Testing Multi-Towel Corporate Order (Quantity = 5, Same Name) ---');
  const corpPayload = JSON.stringify({
    customerName: 'Grand Heritage Resort',
    phone: '9876543212',
    product: 'Luxury Bath Towel (30 × 60 inch)',
    size: '30 × 60 inch',
    quantity: 5,
    embroideryName: 'GRAND HERITAGE',
    embroideryNames: ['GRAND HERITAGE'],
    nameMode: 'same',
    thread: 'Metallic Gold',
    towelColor: 'Warm Champagne',
    notes: 'Bulk suite monogramming'
  });
  const corpRes = await makeRequest('POST', '/api/enquiries', {}, corpPayload);
  assert(corpRes.status === 200 && corpRes.json?.ok === true, 'Corporate bulk order returns ok: true');
  const corpId = corpRes.json?.enquiryId;
  assert(!!corpId, `Corporate order received enquiryId: ${corpId}`);

  // 6. Verify Database Persistence of all 3 orders
  console.log('\n--- 6. Verifying Database Integrity in data/enquiries.json ---');
  const enquiriesDb = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'enquiries.json'), 'utf8'));

  const savedSingle = enquiriesDb.find(x => x.id === singleId);
  assert(!!savedSingle, 'Single order found in database');
  if (savedSingle) {
    assert(savedSingle.quantity === 1, 'Single order quantity is 1');
    assert(savedSingle.embroideryName === 'Aarav', 'Single order embroideryName matches');
    assert(Array.isArray(savedSingle.embroideryNames) && savedSingle.embroideryNames[0] === 'Aarav', 'Single order embroideryNames array has [Aarav]');
  }

  const savedFamily = enquiriesDb.find(x => x.id === familyId);
  assert(!!savedFamily, 'Family order found in database');
  if (savedFamily) {
    assert(savedFamily.quantity === 3, 'Family order quantity is 3');
    assert(savedFamily.nameMode === 'different', 'Family order nameMode is "different"');
    assert(Array.isArray(savedFamily.embroideryNames) && savedFamily.embroideryNames.length === 3, 'Family order has 3 individual names');
    assert(savedFamily.embroideryNames[0] === 'Pooja' && savedFamily.embroideryNames[1] === 'Rohan' && savedFamily.embroideryNames[2] === 'Vihaan', 'Individual names match exactly');
    assert(savedFamily.embroideryName === 'Pooja, Rohan, Vihaan', 'Combined string summary matches');
  }

  const savedCorp = enquiriesDb.find(x => x.id === corpId);
  assert(!!savedCorp, 'Corporate order found in database');
  if (savedCorp) {
    assert(savedCorp.quantity === 5, 'Corporate order quantity is 5');
    assert(savedCorp.nameMode === 'same', 'Corporate order nameMode is "same"');
    assert(savedCorp.embroideryName === 'GRAND HERITAGE', 'Corporate order embroideryName matches');
  }

  // 7. Verify Validation Error Handling
  console.log('\n--- 7. Testing Validation & Edge Case Rejections ---');
  const invalidPhoneRes = await makeRequest('POST', '/api/enquiries', {}, JSON.stringify({
    customerName: 'Invalid Phone Tester',
    phone: '12345',
    product: 'Luxury Bath Towel (30 × 60 inch)',
    embroideryName: 'Test'
  }));
  assert(invalidPhoneRes.status === 400, 'Rejects invalid phone number with HTTP 400');

  const missingNameRes = await makeRequest('POST', '/api/enquiries', {}, JSON.stringify({
    customerName: 'Tester',
    phone: '9876543213',
    product: 'Luxury Bath Towel (30 × 60 inch)',
    embroideryName: ''
  }));
  assert(missingNameRes.status === 400, 'Rejects empty embroidery name with HTTP 400');

  // 8. Admin APIs & WhatsApp Link Verification
  console.log('\n--- 8. Testing Admin Flow & WhatsApp Formatting ---');
  const adminJsx = fs.readFileSync(path.join(__dirname, '..', 'react', 'src', 'admin.jsx'), 'utf8');
  assert(adminJsx.includes('Array.isArray(enq.embroideryNames) && enq.embroideryNames.length > 1'), 'Admin table renders multi-towel badge chips');
  assert(adminJsx.includes('• Names to Embroider ('), 'Admin WhatsApp generator formats numbered multi-towel list');

  // Clean up test items from data/enquiries.json
  const cleanedDb = enquiriesDb.filter(x => x.id !== singleId && x.id !== familyId && x.id !== corpId);
  fs.writeFileSync(path.join(__dirname, '..', 'data', 'enquiries.json'), JSON.stringify(cleanedDb, null, 2));
  console.log('  ✓ Cleaned up all 3 test enquiries from database');

  console.log('\n======================================================');
  console.log(`TOTAL CHECKS: ${passed + failed}`);
  console.log(`PASSED: ${passed}`);
  console.log(`FAILED: ${failed}`);
  console.log('======================================================\n');

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
