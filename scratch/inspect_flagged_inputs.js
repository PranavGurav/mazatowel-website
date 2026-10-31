const fs = require('fs');

function inspectLines(file, lineNums) {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lineNums.forEach(ln => {
    console.log(`=== ${file} around line ${ln} ===`);
    for (let i = Math.max(0, ln - 2); i <= Math.min(lines.length - 1, ln + 18); i++) {
      console.log(`${i + 1}: ${lines[i]}`);
      if (lines[i].includes('/>') || lines[i].includes('</input>')) break;
    }
    console.log('');
  });
}

inspectLines('react/src/public.jsx', [1056, 1522, 2055, 3972]);
inspectLines('react/src/admin.jsx', [751, 1459, 1512, 2028, 2066, 2601, 2621]);

