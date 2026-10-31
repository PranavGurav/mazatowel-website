const fs = require('fs');
const adm = fs.readFileSync('react/src/admin.jsx', 'utf8');
const lines = adm.split('\n');
lines.forEach((l, i) => {
  if (l.includes("type === 'enquiries'") || l.includes('Export CSV')) {
    console.log(i + 1, l.trim());
  }
});

