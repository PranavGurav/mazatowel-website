const fs = require('fs');
const esbuild = require('esbuild');

try {
  const code = fs.readFileSync('react/src/admin.jsx', 'utf8');
  esbuild.transformSync(code, { loader: 'jsx' });
  console.log('JSX transform successful! No syntax errors.');
} catch (e) {
  console.error('Transform error:', e.message);
  if (e.errors) {
    console.error(JSON.stringify(e.errors, null, 2));
  }
}
