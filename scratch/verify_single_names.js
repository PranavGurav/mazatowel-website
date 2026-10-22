const fs = require('fs');

const src = fs.readFileSync('react/src/public.jsx', 'utf8');

const sellingMatch = src.match(/const sellingNavLinks = \[([\s\S]*?)\];/);
const infoMatch = src.match(/const infoNavLinks = \[([\s\S]*?)\];/);

console.log('--- Selling Nav Links ---');
if (sellingMatch) {
  const names = [...sellingMatch[1].matchAll(/name:\s*'([^']+)'/g)].map(m => m[1]);
  console.log(names);
}

console.log('--- Info Nav Links ---');
if (infoMatch) {
  const names = [...infoMatch[1].matchAll(/name:\s*'([^']+)'/g)].map(m => m[1]);
  console.log(names);
}

const masterBtns = [...src.matchAll(/className=\{`nav-master-btn[^`]*`\}[\s\S]*?<span>([^<]+)<\/span>/g)].map(m => m[1]);
console.log('--- Master Toggle Buttons ---', masterBtns);
