const http = require('http');

http.get('http://localhost:3000', res => {
  console.log('HTTP Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('HTML size:', data.length, 'bytes');
    console.log('Contains app container:', data.includes('id="app"'));
  });
}).on('error', err => {
  console.error('Error:', err.message);
});
