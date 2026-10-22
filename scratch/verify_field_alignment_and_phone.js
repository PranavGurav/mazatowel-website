const fs = require('fs');
const path = require('path');
const http = require('http');

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

console.log('\n--- VERIFYING FIELD ALIGNMENT & PHONE PLACEHOLDER FIXES ---');

// 1. Check styles.css
const stylesCss = fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'styles.css'), 'utf8');

assert(stylesCss.includes('.field{display:flex;flex-direction:column;justify-content:flex-start'), 'styles.css: .field uses flex column with top alignment');
assert(stylesCss.includes('.field label{font-size:12px;font-weight:800;color:#526467;display:flex;align-items:center;min-height:18px}'), 'styles.css: .field label has min-height: 18px for baseline synchronization');
assert(stylesCss.includes('.field-two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px;align-items:start}'), 'styles.css: .field-two-col uses align-items: start to prevent error stretching');
assert(stylesCss.includes('.phone-input-group{display:flex;align-items:stretch;width:100%;position:relative;border-radius:14px}'), 'styles.css: .phone-input-group stretches prefix and input uniformly');
assert(stylesCss.includes('.phone-input-group input{border-top-left-radius:0!important;border-bottom-left-radius:0!important;height:46px;flex:1;min-width:0}'), 'styles.css: phone input has flex: 1 and min-width: 0 to eliminate overflow');
assert(stylesCss.includes('.phone-input-group:focus-within .phone-prefix{border-color:#9BC7C7;background:#e8f4f4}'), 'styles.css: phone prefix reacts to focus');
assert(stylesCss.includes('.phone-input-group.has-error .phone-prefix') || stylesCss.includes(':has(.input-has-error) .phone-prefix'), 'styles.css: phone prefix reacts to input error state');

// 2. Check admin.css
const adminCss = fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'admin.css'), 'utf8');
assert(adminCss.includes('.form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:10px;align-items:start}'), 'admin.css: .form-row uses align-items: start');
assert(adminCss.includes('.form-row-3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:10px;align-items:start}'), 'admin.css: .form-row-3 uses align-items: start');
assert(adminCss.includes('.field label{font-size:13px;font-weight:700;display:flex;align-items:center;min-height:18px}'), 'admin.css: .field label has min-height: 18px');

// 3. Check public.jsx
const publicJsx = fs.readFileSync(path.join(__dirname, '..', 'react', 'src', 'public.jsx'), 'utf8');
assert(publicJsx.includes('placeholder="98765 43210"'), 'public.jsx: Phone input placeholder is concise "98765 43210" (no clipping)');
assert(publicJsx.includes('phone-input-group ${phoneError ? \'has-error\' : \'\'}'), 'public.jsx: Phone input group receives has-error class');
assert(publicJsx.includes('aria-label="10-digit Indian mobile number"'), 'public.jsx: Phone input has accessible aria-label');

// 4. Test live API submission with valid phone
const testPayload = JSON.stringify({
  customerName: 'Sanjay Kapoor',
  phone: '9822012345',
  product: 'Luxury Bath Towel (30 × 60 inch)',
  size: '30 × 60 inch',
  quantity: 1,
  embroideryName: 'Sanjay',
  embroideryNames: ['Sanjay'],
  nameMode: 'same'
});

const req = http.request('http://localhost:3000/api/enquiries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(testPayload)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    try {
      const resp = JSON.parse(body);
      assert(resp.ok === true, 'Server accepts enquiry with validated phone number');
      
      // Clean up test entry
      if (resp.enquiryId) {
        const enquiriesData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'enquiries.json'), 'utf8'));
        const cleaned = enquiriesData.filter(x => x.id !== resp.enquiryId);
        fs.writeFileSync(path.join(__dirname, '..', 'data', 'enquiries.json'), JSON.stringify(cleaned, null, 2));
        console.log('  ✓ Cleaned up test enquiry from database');
      }
    } catch (e) {
      assert(false, 'API response error: ' + e.message);
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed.`);
    if (failed > 0) {
      process.exit(1);
    } else {
      console.log('All Field Alignment & Phone Input fixes PASSED!\n');
    }
  });
});

req.on('error', (err) => {
  console.error('Server request error:', err.message);
  process.exit(1);
});

req.write(testPayload);
req.end();
