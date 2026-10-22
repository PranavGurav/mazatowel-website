const fs = require('fs');

const code = fs.readFileSync('react/src/admin.jsx', 'utf8');
const lines = code.split('\n');

const stack = [];
for (let i = 3285; i < 3755; i++) {
  const line = lines[i];
  // find tags
  const tags = line.match(/<\/?([a-zA-Z0-9]+)[^>]*\/?>/g) || [];
  for (const tag of tags) {
    if (tag.endsWith('/>')) {
      // self closing
    } else if (tag.startsWith('</')) {
      const name = tag.slice(2, -1);
      const popped = stack.pop();
      if (popped !== name) {
        console.log(`Line ${i + 1}: Expected </${popped}> but found </${name}>: ${line.trim()}`);
      }
    } else {
      const name = tag.match(/<([a-zA-Z0-9]+)/)[1];
      stack.push(name);
    }
  }
}
console.log('Remaining open tags at line 3755:', stack);
