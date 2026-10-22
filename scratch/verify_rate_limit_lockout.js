const http = require('http');

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(body); } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body,
          json
        });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function testLockout() {
  console.log('--- Testing Brute Force Rate Limiter & Lockout ---');
  const testIp = '203.0.113.99';

  for (let i = 1; i <= 5; i++) {
    const res = await request({
      hostname: '127.0.0.1',
      port: 3000,
      path: '/api/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': testIp
      }
    }, JSON.stringify({ email: 'admin@mazatowel.in', password: `WrongPass${i}` }));

    console.log(`Attempt ${i}: Status ${res.statusCode}, Error: ${res.json?.error}`);
    if (res.statusCode !== 401) throw new Error(`Expected 401 on attempt ${i}`);
  }

  // 6th attempt should be locked out (HTTP 429)
  const lockedRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': testIp
    }
  }, JSON.stringify({ email: 'admin@mazatowel.in', password: 'EvenWithCorrectPasswordNow!' }));

  console.log(`Attempt 6 (Lockout): Status ${lockedRes.statusCode}, Error: ${lockedRes.json?.error}`);
  if (lockedRes.statusCode !== 429) throw new Error('Expected 429 Too Many Requests on 6th attempt');
  if (!lockedRes.json.error.includes('Too many failed login attempts')) throw new Error('Expected lockout error message');

  console.log('--- Brute Force Lockout Test PASSED (HTTP 429 confirmed) ---');
}

testLockout().catch(err => {
  console.error('Lockout Test Failed:', err);
  process.exit(1);
});
