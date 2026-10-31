const http = require('http');

const assets = [
  '/react-build/assets/admin.js',
  '/react-build/assets/icons-a3t0Z9mJ.js',
  '/react-build/assets/admin-BlvvDIbB.css',
  '/api/auth/status',
  '/api/admin-data'
];

async function checkAsset(url) {
  return new Promise(resolve => {
    http.get(`http://localhost:3000${url}`, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log(`URL: ${url} -> Status: ${res.statusCode}, Length: ${data.length}, Content-Type: ${res.headers['content-type']}`);
        resolve({ url, status: res.statusCode, data });
      });
    }).on('error', err => {
      console.error(`URL: ${url} -> Error: ${err.message}`);
      resolve({ url, error: err.message });
    });
  });
}

(async () => {
  for (const a of assets) {
    await checkAsset(a);
  }
})();

