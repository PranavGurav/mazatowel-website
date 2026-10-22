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

async function runTests() {
  console.log('--- Starting Authentication & Security Hardening Verification ---');
  let sessionCookie = '';

  // 1. Check /api/auth/status unauthenticated
  const statusBefore = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/auth/status',
    method: 'GET'
  });
  console.log('1. Unauthenticated /api/auth/status:', statusBefore.json);
  if (statusBefore.json.authenticated !== false) throw new Error('Expected authenticated: false');
  if (statusBefore.json.showDemoCredentials !== true) throw new Error('Expected showDemoCredentials: true');

  // 2. Test successful login with scrypt hashed password
  const loginSuccess = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Security-Verification-Bot/1.0'
    }
  }, JSON.stringify({ email: 'admin@mazatowel.in', password: 'MazaTowel123!' }));

  console.log('2. Successful login status:', loginSuccess.statusCode, loginSuccess.json);
  if (loginSuccess.statusCode !== 200 || !loginSuccess.json.ok) throw new Error('Login failed with scrypt hash!');
  
  const setCookie = loginSuccess.headers['set-cookie'];
  if (!setCookie || !setCookie.some(c => c.includes('mt_session='))) throw new Error('Missing mt_session cookie');
  sessionCookie = setCookie.find(c => c.includes('mt_session=')).split(';')[0];
  console.log('   Received session cookie:', sessionCookie);

  // 3. Check /api/auth/status with session cookie
  const statusAuthed = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/auth/status',
    method: 'GET',
    headers: { 'Cookie': sessionCookie }
  });
  console.log('3. Authenticated /api/auth/status:', statusAuthed.json);
  if (!statusAuthed.json.authenticated) throw new Error('Expected authenticated: true');

  // 4. Fetch /api/admin/audit-log
  const auditRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/admin/audit-log',
    method: 'GET',
    headers: { 'Cookie': sessionCookie }
  });
  console.log('4. /api/admin/audit-log count:', auditRes.json.logs ? auditRes.json.logs.length : 0);
  if (!auditRes.json.ok || !Array.isArray(auditRes.json.logs)) throw new Error('Audit log API failed');
  const latestLogin = auditRes.json.logs.find(l => l.event === 'LOGIN_SUCCESS');
  if (!latestLogin) throw new Error('LOGIN_SUCCESS event not found in audit log');
  console.log('   Latest LOGIN_SUCCESS in audit log:', latestLogin);

  // 5. Test export audit event
  const exportRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/export',
    method: 'GET',
    headers: { 'Cookie': sessionCookie }
  });
  console.log('5. Store export status:', exportRes.statusCode);
  if (exportRes.statusCode !== 200) throw new Error('Export failed');

  // Verify BACKUP_EXPORTED logged
  const auditAfterExport = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/admin/audit-log',
    method: 'GET',
    headers: { 'Cookie': sessionCookie }
  });
  const exportEvent = auditAfterExport.json.logs.find(l => l.event === 'BACKUP_EXPORTED' || l.event === 'BACKUP_EXPORT');
  if (!exportEvent) throw new Error('BACKUP_EXPORTED not logged in audit log');
  console.log('   BACKUP_EXPORTED audit event confirmed:', exportEvent.id);

  // 6. Test Settings update audit event
  const settingsRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/settings',
    method: 'PUT',
    headers: {
      'Cookie': sessionCookie,
      'Content-Type': 'application/json'
    }
  }, JSON.stringify({ showDemoCredentials: true }));
  console.log('6. Settings PUT status:', settingsRes.statusCode, settingsRes.json);
  if (settingsRes.statusCode !== 200) throw new Error('Settings update failed');

  // Verify SETTINGS_UPDATED logged
  const auditAfterSettings = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/admin/audit-log',
    method: 'GET',
    headers: { 'Cookie': sessionCookie }
  });
  const settingsEvent = auditAfterSettings.json.logs.find(l => l.event === 'SETTINGS_UPDATED');
  if (!settingsEvent) throw new Error('SETTINGS_UPDATED not logged in audit log');
  console.log('   SETTINGS_UPDATED audit event confirmed:', settingsEvent.id);

  // 7. Test Logout and secure cookie clearing
  const logoutRes = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/logout',
    method: 'POST',
    headers: { 'Cookie': sessionCookie }
  });
  console.log('7. Logout status:', logoutRes.statusCode, logoutRes.json);
  if (logoutRes.statusCode !== 200) throw new Error('Logout failed');

  // Verify cookie is expired / cleared
  const clearCookie = logoutRes.headers['set-cookie'];
  console.log('   Logout Set-Cookie header:', clearCookie);
  if (!clearCookie || !clearCookie.some(c => c.includes('Max-Age=0') || c.includes('expires='))) {
    throw new Error('Logout did not clear cookie');
  }

  // 8. Test Failed Login from a simulated remote IP (X-Forwarded-For: 198.51.100.42)
  const failedLogin = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Forwarded-For': '198.51.100.42',
      'User-Agent': 'Attacker-Simulation-Bot/1.0'
    }
  }, JSON.stringify({ email: 'admin@mazatowel.in', password: 'WrongPassword123' }));
  console.log('8. Failed login test response:', failedLogin.statusCode, failedLogin.json);
  if (failedLogin.statusCode !== 401) throw new Error('Expected 401 for bad password');

  // Re-login to check audit log for LOGIN_FAILED
  const reLogin = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, JSON.stringify({ email: 'admin@mazatowel.in', password: 'MazaTowel123!' }));
  const reCookie = reLogin.headers['set-cookie'].find(c => c.includes('mt_session=')).split(';')[0];
  
  const auditAfterFailed = await request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/admin/audit-log',
    method: 'GET',
    headers: { 'Cookie': reCookie }
  });
  const failedEvent = auditAfterFailed.json.logs.find(l => l.event === 'LOGIN_FAILED' && l.ip === '198.51.100.42');
  if (!failedEvent) throw new Error('LOGIN_FAILED not logged for 198.51.100.42');
  console.log('   LOGIN_FAILED audit event confirmed for IP:', failedEvent.ip, 'Attempts remaining:', failedEvent.details?.remainingAttempts);

  console.log('\n--- ALL AUTHENTICATION, AUTHORIZATION & SECURITY LOGGING TESTS PASSED! ---');
}

runTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
