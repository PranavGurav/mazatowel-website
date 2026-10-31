const fs = require('fs');
const pub = fs.readFileSync('react/src/public.jsx', 'utf8');
const lines = pub.split('\n');

console.log('=== lines 1440-1475 ===');
for (let i = 1439; i < 1475; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}

console.log('=== lines 1760-1780 ===');
for (let i = 1759; i < 1780; i++) {
  console.log(`${i + 1}: ${lines[i]}`);
}

