const fs = require('fs');
const adm = fs.readFileSync('react/src/admin.jsx', 'utf8');
const lines = adm.split('\n').slice(579, 1845);
lines.forEach((line, i) => {
  if (line.includes("type === '") || line.includes("type !== '")) {
    console.log(i + 580, line.trim());
  }
});

