const fs = require('fs');
const content = fs.readFileSync('react/src/admin.jsx', 'utf8');
const lines = content.split('\n');

lines.forEach((line, i) => {
  if (line.includes('className="content"')) {
    console.log(`Found at line ${i+1}:`);
    for (let j = Math.max(0, i - 15); j <= Math.min(lines.length - 1, i + 45); j++) {
      console.log(`${j+1}: ${lines[j]}`);
    }
  }
});

