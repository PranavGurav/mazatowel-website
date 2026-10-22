const fs = require('fs');
const assert = require('assert');

console.log('--- Verifying Threads Code is Cleanly Commented Out ---');

// 1. Check react/src/public.jsx
const publicJsx = fs.readFileSync('react/src/public.jsx', 'utf8');

assert(publicJsx.includes('/* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:\nconst DEFAULT_THREADS = ['), 'DEFAULT_THREADS should be commented out');
assert(publicJsx.includes('{/* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:\n                <div className="thread-selector-box">'), 'thread-selector-box should be commented out');
assert(publicJsx.includes('{/* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:\n          <div style={{ marginTop: 16 }}>'), 'OnPageOrderStudio thread selector should be commented out');
assert(publicJsx.includes('/* THREADS FEATURE PAUSED: thread:'), 'Thread payload submission should be commented out');
console.log('✓ react/src/public.jsx: Storefront thread components, states, and payloads are cleanly commented out.');

// 2. Check react/src/admin.jsx
const adminJsx = fs.readFileSync('react/src/admin.jsx', 'utf8');

assert(adminJsx.includes("/* 'threads', -- THREADS PAUSED */"), 'threads should be commented out from COLLECTIONS');
assert(adminJsx.includes("/* threads: 'Embroidery Threads', -- THREADS PAUSED */"), 'threads should be commented out from TITLES');
assert(adminJsx.includes('{/* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:\n              <div\n                className="dash-gauge-box"\n                onClick={() => onNavigate && onNavigate(\'threads\')}'), 'Silk Threads gauge should be commented out in Dashboard');
assert(adminJsx.includes('{/* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:\n              {type === \'threads\' && ('), 'ItemEditor threads form should be commented out');
console.log('✓ react/src/admin.jsx: Admin CMS collections, navigation, gauges, and editors are cleanly commented out.');

// 3. Check server.js
const serverJs = fs.readFileSync('server.js', 'utf8');

assert(serverJs.includes("/*, 'threads' -- THREADS PAUSED */"), 'server.js collections should have threads commented out');
assert(serverJs.includes("/*, threads: readData('threads') -- THREADS PAUSED */"), 'server.js sitePayload should have threads commented out');
assert(serverJs.includes("/* THREADS FEATURE PAUSED - UNCOMMENT WHEN REQUIRED:\n        thread: String(b.thread || '').trim().slice(0, 40),\n        */"), 'server.js enquiry thread field should be commented out');
assert(serverJs.includes("/* THREADS PAUSED: |threads */"), 'server.js regex should have threads commented out');
console.log('✓ server.js: Server collections, payloads, routes, and enquiry handlers are cleanly commented out.');

// 4. Check Vite Build Artifacts
assert(fs.existsSync('public/react-build/index.html'), 'Build index.html exists');
assert(fs.existsSync('public/react-build/admin.html'), 'Build admin.html exists');
assert(fs.existsSync('public/react-build/assets/index.js'), 'Build index.js exists');
assert(fs.existsSync('public/react-build/assets/admin.js'), 'Build admin.js exists');
console.log('✓ Vite build bundle: Production assets generated successfully in public/react-build/.');

// 5. Test Live Server Endpoints with updated server instance on PORT=3002
const { spawn } = require('child_process');

async function testEndpoints() {
  const srv = spawn('node', ['server.js'], { env: { ...process.env, PORT: '3002' }, cwd: process.cwd() });
  
  await new Promise((resolve, reject) => {
    srv.stdout.on('data', d => {
      if (d.toString().includes('3002')) resolve();
    });
    srv.stderr.on('data', () => {});
    srv.on('error', reject);
    setTimeout(resolve, 1500);
  });

  try {
    const siteRes = await fetch('http://localhost:3002/api/site');
    assert.strictEqual(siteRes.status, 200, 'Site data status 200');
    const siteData = await siteRes.json();
    assert.strictEqual(siteData.threads, undefined, 'threads key should not be present in siteData');
    console.log('✓ GET /api/site: 200 OK, threads successfully excluded from payload.');

    const htmlRes = await fetch('http://localhost:3002/');
    assert.strictEqual(htmlRes.status, 200, 'Home page status 200');
    console.log('✓ GET /: 200 OK, Homepage loads cleanly.');

    const adminRes = await fetch('http://localhost:3002/admin');
    assert.strictEqual(adminRes.status, 200, 'Admin page status 200');
    console.log('✓ GET /admin: 200 OK, Admin interface loads cleanly.');

    console.log('\nAll verification checks passed successfully!');
  } catch (err) {
    console.error('Endpoint verification error:', err.message);
    process.exit(1);
  } finally {
    srv.kill();
  }
}

testEndpoints();
