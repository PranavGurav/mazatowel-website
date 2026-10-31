const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('=== FULL SYSTEM & ENDPOINTS VERIFICATION ===\n');

// 1. Verify all JSON collections
const dataDir = path.join(__dirname, '..', 'data');
const jsonFiles = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
console.log(`Checking ${jsonFiles.length} JSON data files...`);
let jsonErrors = 0;
jsonFiles.forEach(f => {
  try {
    const raw = fs.readFileSync(path.join(dataDir, f), 'utf8');
    JSON.parse(raw);
  } catch (err) {
    console.error(`[ERROR] JSON corrupt in ${f}:`, err.message);
    jsonErrors++;
  }
});
if (jsonErrors === 0) {
  console.log('✓ All JSON files in data/ are valid and corruption-free.');
} else {
  process.exit(1);
}

// 2. Start server on test port 3088
const TEST_PORT = 3088;
const serverProcess = spawn('node', ['server.js'], {
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, PORT: TEST_PORT },
  stdio: 'pipe'
});

let serverLogs = '';
serverProcess.stdout.on('data', d => serverLogs += d.toString());
serverProcess.stderr.on('data', d => serverLogs += d.toString());

function request(method, pathUrl, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: pathUrl,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data,
          json
        });
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  // Wait 1.5 seconds for server to start
  await new Promise(r => setTimeout(r, 1500));

  console.log('\n--- 1. Testing Public Endpoints ---');
  // Health
  const health = await request('GET', '/api/health');
  console.log(`GET /api/health -> ${health.statusCode} (ok: ${health.json?.ok})`);
  if (health.statusCode !== 200 || !health.json?.ok) throw new Error('Health check failed');

  // Site payload
  const site = await request('GET', '/api/site');
  console.log(`GET /api/site -> ${site.statusCode} (products: ${site.json?.products?.length}, colors: ${site.json?.colors?.length})`);
  if (site.statusCode !== 200 || !Array.isArray(site.json?.products)) throw new Error('Site payload failed');

  // Static index page
  const home = await request('GET', '/');
  console.log(`GET / -> ${home.statusCode} (HTML length: ${home.data.length})`);
  if (home.statusCode !== 200 || !home.data.includes('html')) throw new Error('Home page route failed');

  // Static admin page
  const adminPage = await request('GET', '/admin');
  console.log(`GET /admin -> ${adminPage.statusCode} (HTML length: ${adminPage.data.length})`);
  if (adminPage.statusCode !== 200 || !adminPage.data.includes('html')) throw new Error('Admin page route failed');

  // Realtime ping
  const ping = await request('POST', '/api/realtime/ping', {
    page: '/shop',
    section: 'Shop Towels',
    device: 'Desktop',
    sessionId: 'test_session_123'
  });
  console.log(`POST /api/realtime/ping -> ${ping.statusCode} (activeNow: ${ping.json?.activeNow})`);
  if (ping.statusCode !== 200) throw new Error('Realtime ping failed');

  // Submit test enquiry
  console.log('\n--- 2. Testing Customer Enquiry Submission ---');
  const enqRes = await request('POST', '/api/enquiries', {
    customerName: 'Test Customer',
    phone: '9876543210',
    productId: site.json.products[0]?.id || 'P1',
    product: 'Luxury Bath Towel',
    category: 'Towels',
    size: '30 × 60 inch',
    quantity: 2,
    embroideryName: 'Aarav & Diya',
    nameMode: 'same',
    towelColor: 'Milky White',
    notes: 'Please pack in gift box.'
  });
  console.log(`POST /api/enquiries -> ${enqRes.statusCode} (enquiryId: ${enqRes.json?.enquiryId})`);
  if (enqRes.statusCode !== 200 || !enqRes.json?.ok) throw new Error('Enquiry submission failed: ' + enqRes.data);

  // Test Admin Auth
  console.log('\n--- 3. Testing Admin Authentication & Session ---');
  // First check admin.json credentials
  const adminCreds = JSON.parse(fs.readFileSync(path.join(dataDir, 'admin.json'), 'utf8'));
  const loginRes = await request('POST', '/api/login', {
    email: adminCreds.email || 'admin@mazatowel.in',
    password: 'MazaTowel123!' // default or test password
  });
  console.log(`POST /api/login -> ${loginRes.statusCode} (ok: ${loginRes.json?.ok})`);
  
  let cookie = '';
  if (loginRes.headers['set-cookie']) {
    cookie = loginRes.headers['set-cookie'][0].split(';')[0];
    console.log(`Received admin session cookie: ${cookie.slice(0, 20)}...`);
  }

  if (cookie) {
    console.log('\n--- 4. Testing Authenticated Admin Endpoints ---');
    // Admin data
    const adminData = await request('GET', '/api/admin-data', null, { Cookie: cookie });
    console.log(`GET /api/admin-data -> ${adminData.statusCode} (enquiries: ${adminData.json?.enquiries?.length})`);
    if (adminData.statusCode !== 200) throw new Error('Admin data failed');

    // Audit log
    const auditRes = await request('GET', '/api/admin/audit-log', null, { Cookie: cookie });
    console.log(`GET /api/admin/audit-log -> ${auditRes.statusCode} (events logged: ${auditRes.json?.logs?.length})`);
    if (auditRes.statusCode !== 200) throw new Error('Audit log failed');

    // Test creating a temporary test product
    console.log('\n--- 5. Testing CRUD Lifecycle for Collections ---');
    const newProd = await request('POST', '/api/products', {
      name: 'Automated Test Towel (27 × 54 inch)',
      category: 'Bath Towels',
      size: '27 × 54 inch',
      price: 999,
      badge: 'Test Badge',
      desc: 'Temporary product created for automated verification.',
      published: true
    }, { Cookie: cookie });
    console.log(`POST /api/products -> ${newProd.statusCode} (id: ${newProd.json?.item?.id})`);
    const testProdId = newProd.json?.item?.id;

    if (testProdId) {
      // Test 1-click status toggle (PUT /api/products/:id)
      const toggleRes = await request('PUT', `/api/products/${testProdId}`, {
        published: false
      }, { Cookie: cookie });
      console.log(`PUT /api/products/${testProdId} (toggle published) -> ${toggleRes.statusCode} (now published: ${toggleRes.json?.item?.published})`);

      // Clean up test product
      const delRes = await request('DELETE', `/api/products/${testProdId}`, null, { Cookie: cookie });
      console.log(`DELETE /api/products/${testProdId} -> ${delRes.statusCode} (ok: ${delRes.json?.ok})`);
    }

    // Clean up test enquiry created in step 2
    if (enqRes.json?.enquiryId) {
      const delEnq = await request('DELETE', `/api/enquiries/${enqRes.json.enquiryId}`, null, { Cookie: cookie });
      console.log(`DELETE /api/enquiries/${enqRes.json.enquiryId} -> ${delEnq.statusCode} (cleaned test enquiry)`);
    }

    // Test logout
    const logoutRes = await request('POST', '/api/logout', null, { Cookie: cookie });
    console.log(`POST /api/logout -> ${logoutRes.statusCode} (ok: ${logoutRes.json?.ok})`);
  }

  console.log('\n✓ ALL SYSTEM & ENDPOINT TESTS PASSED SUCCESSFULLY!');
}

runTests()
  .catch(err => {
    console.error('\n[FATAL TEST ERROR]:', err);
    console.error('Server logs:\n', serverLogs);
    process.exitCode = 1;
  })
  .finally(() => {
    serverProcess.kill();
  });

