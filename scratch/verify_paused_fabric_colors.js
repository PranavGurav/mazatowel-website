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

function makePost(urlPath, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('\n======================================================');
  console.log('   VERIFY PAUSED FABRIC COLOR OPTIONS ON WEBSITE      ');
  console.log('======================================================\n');

  // 1. Verify in public.jsx that fabric color sections are safely commented out
  console.log('--- 1. Testing public.jsx Source Comments ---');
  const publicJsx = fs.readFileSync(path.join(__dirname, '..', 'react', 'src', 'public.jsx'), 'utf8');

  assert(publicJsx.includes('FABRIC COLOR FEATURE PAUSED - UNCOMMENT WHEN REQUIRED'), 'public.jsx contains pause marker for fabric color');
  assert(!publicJsx.includes('Click a fabric swatch below to preview high-res photo for') || publicJsx.includes('/* FABRIC COLOR FEATURE PAUSED'), 'Fabric color slider is commented out');

  // 2. Verify Compiled index.js Bundle
  console.log('\n--- 2. Testing Compiled React Public Bundle ---');
  const indexJs = fs.readFileSync(path.join(__dirname, '..', 'public', 'react-build', 'assets', 'index.js'), 'utf8');

  // Verify swatches and fabric color picker are omitted from rendered DOM in compiled JS
  assert(!indexJs.includes('Click a fabric swatch below to preview high-res photo for'), 'Compiled JS does not render swatch picker prompt');
  assert(!indexJs.includes('Towel Fabric Colour'), 'Compiled JS does not render "Towel Fabric Colour"');
  assert(!indexJs.includes('Apparel Fabric Colour'), 'Compiled JS does not render "Apparel Fabric Colour"');

  // 3. Test Order Submissions (Ensure orders succeed cleanly without requiring fabric color)
  console.log('\n--- 3. Testing Order Creation with Paused Fabric Color ---');
  const orderRes = await makePost('/api/enquiries', {
    customerName: 'Priya Sharma',
    productId: 'PR001',
    product: 'Ultra Plush Bath Towel',
    size: '30x60 inch',
    category: 'Towels',
    quantity: 1,
    embroideryName: 'Priya',
    phone: '9876543210',
    notes: 'Testing order with paused fabric colors'
  });

  assert(orderRes.status === 201 || orderRes.status === 200, `Order created successfully (HTTP ${orderRes.status})`);
  assert(orderRes.json && orderRes.json.ok, 'Order response has ok: true');

  console.log(`\n======================================================`);
  console.log(`  SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
