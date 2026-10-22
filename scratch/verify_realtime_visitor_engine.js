const http = require('http');
const assert = require('assert');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: body ? JSON.parse(body) : {} });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(typeof data === 'string' ? data : JSON.stringify(data));
    req.end();
  });
}

async function run() {
  console.log('=== REAL-TIME VISITOR TRACKING ENGINE VERIFICATION ===\n');

  // Test 1: Query initial realtime status
  console.log('--- 1. Testing GET /api/realtime/active ---');
  const res1 = await request({ hostname: 'localhost', port: 3000, path: '/api/realtime/active', method: 'GET' });
  assert.strictEqual(res1.status, 200, 'GET /api/realtime/active returns 200');
  assert.strictEqual(res1.body.ok, true, 'ok: true');
  assert(typeof res1.body.activeNow === 'number', 'activeNow is a number');
  assert(res1.body.sections, 'sections map exists');
  assert(res1.body.devices, 'devices map exists');
  console.log('✓ Initial realtime active state:', res1.body.activeNow, 'visitors online');

  // Test 2: Simulate 3 concurrent live shoppers in different sections & devices
  console.log('\n--- 2. Simulating 3 Concurrent Real-Time Shoppers ---');
  const session1 = 'test_sess_towel_mobile_' + Date.now();
  const session2 = 'test_sess_b2b_desktop_' + Date.now();
  const session3 = 'test_sess_studio_tablet_' + Date.now();

  const ping1 = await request({
    hostname: 'localhost', port: 3000, path: '/api/realtime/ping', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { sessionId: session1, page: '/#shop-towels', section: 'Towels Collection', device: 'Mobile', action: 'Browsing Bath Towels' });

  const ping2 = await request({
    hostname: 'localhost', port: 3000, path: '/api/realtime/ping', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { sessionId: session2, page: '/#shop-commercial', section: 'Commercial B2B', device: 'Desktop', action: 'Opened Commercial Swatch Kit' });

  const ping3 = await request({
    hostname: 'localhost', port: 3000, path: '/api/realtime/ping', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { sessionId: session3, page: '/#shop-studio', section: 'Custom Studio Atelier', device: 'Tablet', action: 'Monogram Preview' });

  assert.strictEqual(ping3.status, 200, 'Ping 3 returned 200');
  console.log('✓ Sent pings for 3 shoppers (Mobile, Desktop, Tablet) across distinct store sections');

  // Test 3: Verify active state contains all 3 shoppers
  console.log('\n--- 3. Verifying Aggregated Real-Time Radar ---');
  const resActive = await request({ hostname: 'localhost', port: 3000, path: '/api/realtime/active', method: 'GET' });
  assert(resActive.body.activeNow >= 3, `activeNow is >= 3 (got ${resActive.body.activeNow})`);
  assert(resActive.body.sections['Towels Collection'] >= 1, 'Towels section hotspot active');
  assert(resActive.body.sections['Commercial B2B'] >= 1, 'Commercial B2B hotspot active');
  assert(resActive.body.devices.Mobile >= 1, 'Mobile device count tracked');
  assert(resActive.body.devices.Desktop >= 1, 'Desktop device count tracked');
  assert(resActive.body.recentActivity.length >= 3, 'Recent activity feed logged events');
  console.log('✓ Real-time active count:', resActive.body.activeNow);
  console.log('✓ Live section breakdown:', resActive.body.sections);
  console.log('✓ Live device breakdown:', resActive.body.devices);
  console.log('✓ Latest activity:', resActive.body.recentActivity[0].type, '-', resActive.body.recentActivity[0].section);

  // Test 4: Verify Session Leave (Tab Closed)
  console.log('\n--- 4. Testing Shopper Departure (POST /api/realtime/leave) ---');
  const leaveRes = await request({
    hostname: 'localhost', port: 3000, path: '/api/realtime/leave', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { sessionId: session3 });
  assert.strictEqual(leaveRes.status, 200, 'POST /api/realtime/leave returned 200');

  const afterLeave = await request({ hostname: 'localhost', port: 3000, path: '/api/realtime/active', method: 'GET' });
  assert.strictEqual(afterLeave.body.activeNow, resActive.body.activeNow - 1, 'activeNow decremented accurately after departure');
  console.log('✓ Shopper departure handled: active count dropped to', afterLeave.body.activeNow);

  // Test 5: Verify Admin Data integration
  console.log('\n--- 5. Verifying Admin Payload Real-Time Integration ---');
  const loginRes = await request({
    hostname: 'localhost', port: 3000, path: '/api/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@mazatowel.in', password: 'MazaTowel123!' });
  const cookie = loginRes.headers['set-cookie']?.[0]?.split(';')[0];
  const adminDataRes = await request({
    hostname: 'localhost', port: 3000, path: '/api/admin-data', method: 'GET',
    headers: { 'Cookie': cookie }
  });
  assert(adminDataRes.body.visitors.realtime, 'admin-data contains visitors.realtime payload');
  assert(adminDataRes.body.visitors.realtime.activeNow >= 2, 'admin dashboard receives live active count');
  console.log('✓ Admin dashboard payload contains full realtime state:', adminDataRes.body.visitors.realtime.activeNow, 'active shoppers');

  console.log('\n======================================================');
  console.log('ALL REAL-TIME VISITOR ENGINE VERIFICATIONS PASSED! 🚀');
  console.log('======================================================');
}

run().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
