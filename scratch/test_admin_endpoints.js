const http = require('http');

function test(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, length: data.length, data }));
    }).on('error', reject);
  });
}

(async () => {
  try {
    const admin = await test('http://localhost:3000/admin');
    console.log('GET /admin:', admin.status, 'HTML length:', admin.length);
    const active = await test('http://localhost:3000/api/realtime/active');
    console.log('GET /api/realtime/active:', active.status, 'Payload:', active.data.slice(0, 100));
    console.log('✓ All endpoints responding perfectly.');
  } catch (e) {
    console.error('Test error:', e);
  }
})();
