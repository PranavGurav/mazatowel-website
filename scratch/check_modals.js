const fs = require('fs');
const pub = fs.readFileSync('react/src/public.jsx', 'utf8');

console.log('--- Modals in react/src/public.jsx ---');
pub.split('\n').forEach((l, i) => {
  if (l.includes('modal') && (l.includes('role=') || l.includes('className=') || l.includes('function '))) {
    console.log(`L${i + 1}: ${l.trim()}`);
  }
});
