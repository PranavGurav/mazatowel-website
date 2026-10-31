const fs = require('fs');
const content = fs.readFileSync('react/src/admin.jsx', 'utf8');

// Let's find everything from `<div className="content">` to `COLLECTIONS.includes`
const match = content.match(/<div className="content">([\s\S]*?)<\/div>\s*<\/main>/);
if (match) {
  console.log('Content block:');
  console.log(match[0]);
} else {
  console.log('Not matched');
}

