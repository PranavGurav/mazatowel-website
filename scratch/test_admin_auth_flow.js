const http = require('http');

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const postData = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const reqHeaders = { ...headers };
    if (postData) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(postData);
    }
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: reqHeaders
    }, res => {
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
    if (postData) req.write(postData);
    req.end();
  });
}

(async () => {
  console.log('--- Step 1: GET /admin page ---');
  const page = await request('GET', '/admin');
  console.log('Status:', page.statusCode, 'Body length:', page.data.length);
  if (!page.data.includes('admin.js')) throw new Error('Missing admin.js bundle');

  console.log('\n--- Step 2: GET /api/auth/status (unauthenticated) ---');
  const authStatus = await request('GET', '/api/auth/status');
  console.log('Status:', authStatus.statusCode, 'JSON:', authStatus.json);
  if (authStatus.json?.authenticated !== false) throw new Error('Expected authenticated: false');

  console.log('\n--- Step 3: GET /api/admin-data without cookie (should return 401) ---');
  const unauthData = await request('GET', '/api/admin-data');
  console.log('Status:', unauthData.statusCode, 'JSON:', unauthData.json);
  if (unauthData.statusCode !== 401) throw new Error('Expected 401 Unauthorized');

  console.log('\n--- Step 4: POST /api/login with admin credentials ---');
  const loginRes = await request('POST', '/api/login', {
    email: 'admin@mazatowel.in',
    password: 'MazaTowel123!'
  });
  console.log('Status:', loginRes.statusCode, 'JSON:', loginRes.json);
  const cookie = loginRes.headers['set-cookie']?.[0]?.split(';')?.[0];
  console.log('Session Cookie received:', cookie);
  if (!cookie) throw new Error('Expected session cookie');

  console.log('\n--- Step 5: GET /api/admin-data with session cookie ---');
  const adminData = await request('GET', '/api/admin-data', null, { Cookie: cookie });
  console.log('Status:', adminData.statusCode, 'Collections loaded:');
  const keys = Object.keys(adminData.json || {});
  console.log('Keys:', keys);
  console.log('Products count:', adminData.json?.products?.length);
  console.log('Enquiries count:', adminData.json?.enquiries?.length);
  if (!adminData.json?.products || !adminData.json?.settings) throw new Error('Failed to load admin collections');

  console.log('\n--- Step 6: POST /api/logout ---');
  const logoutRes = await request('POST', '/api/logout', null, { Cookie: cookie });
  console.log('Status:', logoutRes.statusCode, 'JSON:', logoutRes.json);

  console.log('\n--- Step 7: GET /api/admin-data after logout (should 401) ---');
  const postLogoutData = await request('GET', '/api/admin-data', null, { Cookie: cookie });
  console.log('Status:', postLogoutData.statusCode, 'JSON:', postLogoutData.json);
  if (postLogoutData.statusCode !== 401) throw new Error('Expected 401 after logout');

  console.log('\n✅ All admin authentication and data flows are functioning perfectly!');
})().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

