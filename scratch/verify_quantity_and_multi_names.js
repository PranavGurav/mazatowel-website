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

console.log('\n--- VERIFYING QUANTITY STEPPER & MULTI-TOWEL PERSONALIZATION ---');

// 1. Check styles.css
const stylesCssPath = path.join(__dirname, '..', 'public', 'assets', 'styles.css');
const stylesCss = fs.readFileSync(stylesCssPath, 'utf8');

assert(stylesCss.includes('.qty-stepper-box input::-webkit-outer-spin-button'), 'styles.css: Hides native WebKit number spin buttons');
assert(stylesCss.includes('-moz-appearance:textfield!important') || stylesCss.includes('appearance:textfield!important'), 'styles.css: Disables native Firefox/standard spin buttons');
assert(stylesCss.includes('.qty-pricing-row{display:grid;grid-template-columns:1fr 1fr'), 'styles.css: Defines aligned 2-column quantity and price row');
assert(stylesCss.includes('.personalization-mode-card'), 'styles.css: Defines personalization mode selector styles');
assert(stylesCss.includes('.multi-towel-names-wrap'), 'styles.css: Defines multi-towel name inputs wrapper');
assert(stylesCss.includes('.preview-towel-switcher'), 'styles.css: Defines live stitched preview towel tabs switcher');

// 2. Check public.jsx
const publicJsxPath = path.join(__dirname, '..', 'react', 'src', 'public.jsx');
const publicJsx = fs.readFileSync(publicJsxPath, 'utf8');

assert(publicJsx.includes('nameMode: \'different\''), 'public.jsx: OrderModal initializes nameMode');
assert(publicJsx.includes('embroideryNames: [\'\']'), 'public.jsx: OrderModal initializes embroideryNames array');
assert(publicJsx.includes('onSingleTowelNameChange'), 'public.jsx: Has handler for individual towel name changes');
assert(publicJsx.includes('previewTowelIndex'), 'public.jsx: Has active preview towel index tracker');
assert(publicJsx.includes('personalization-mode-card'), 'public.jsx: Renders personalization mode selector when quantity > 1');
assert(publicJsx.includes('multi-towel-names-wrap'), 'public.jsx: Renders individual towel name rows when mode is different');
assert(publicJsx.includes('preview-towel-switcher'), 'public.jsx: Renders preview tabs for individual towels above canvas');
assert(publicJsx.includes('className="qty-stepper-box"'), 'public.jsx: Renders single clean stepper box');

// 3. Check admin.jsx
const adminJsxPath = path.join(__dirname, '..', 'react', 'src', 'admin.jsx');
const adminJsx = fs.readFileSync(adminJsxPath, 'utf8');

assert(adminJsx.includes('enq.embroideryNames.length > 1'), 'admin.jsx: WhatsApp confirm link handles multiple towel names');
assert(adminJsx.includes('Array.isArray(item.embroideryNames) && item.embroideryNames.length > 1'), 'admin.jsx: Details and table support multiple towel names');

// 4. Test API POST /api/enquiries with multi-towel family order
const testPayload = JSON.stringify({
  customerName: 'Kapoor Family',
  phone: '9876543210',
  product: 'Luxury Bath Towel (30 × 60 inch)',
  size: '30 × 60 inch',
  quantity: 3,
  embroideryName: 'Rajesh, Sunita, Aarav',
  embroideryNames: ['Rajesh', 'Sunita', 'Aarav'],
  nameMode: 'different',
  thread: 'Antique Gold',
  towelColor: 'Milky White',
  notes: '3 towels for our family'
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
      assert(resp.ok === true, 'Server accepts multi-towel enquiry payload');
      assert(!!resp.enquiryId, 'Server returns enquiryId: ' + resp.enquiryId);
      
      const enquiriesData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'enquiries.json'), 'utf8'));
      const saved = enquiriesData.find(x => x.id === resp.enquiryId);
      assert(!!saved, 'Enquiry found in data/enquiries.json');
      if (saved) {
        assert(Array.isArray(saved.embroideryNames) && saved.embroideryNames.length === 3, 'Server preserves individual towel names array (length 3)');
        assert(saved.embroideryNames[0] === 'Rajesh' && saved.embroideryNames[1] === 'Sunita' && saved.embroideryNames[2] === 'Aarav', 'Individual names match exactly');
        assert(saved.nameMode === 'different', 'Server preserves nameMode attribute as "different"');
        assert(saved.embroideryName === 'Rajesh, Sunita, Aarav', 'Server preserves combined embroideryName string');
        
        // Clean up test entry
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
      console.log('All Quantity & Multi-Towel Personalization checks PASSED!\n');
    }
  });
});

req.on('error', (err) => {
  console.error('Server request error:', err.message);
  process.exit(1);
});

req.write(testPayload);
req.end();
