const http = require('http');

http.get('http://localhost:3000/admin', res => {
  console.log('HTTP Status /admin:', res.statusCode);
  console.log('Headers:', res.headers);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Body length:', data.length);
    console.log('Body preview:\n', data.slice(0, 1000));
  });
}).on('error', err => {
  console.error('Error fetching /admin:', err.message);
});

